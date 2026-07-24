// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for `astryx validate-integration`.
 *
 * Validates exactly ONE integration package at a time and reports findings
 * using the AstryxIntegrationIssue model
 * ({ code, severity: 'warning'|'error', message }; see
 * types/integration.d.ts). Two entry points:
 *
 *   - validateLocalIntegration(cwd)  — the package rooted at `cwd` (nearest
 *     package.json + sibling astryx.integration.{ts,mjs,js}).
 *   - validateInstalledIntegration(spec, cwd) — an installed package resolved
 *     from `cwd`/node_modules.
 *
 * Both return a { found, name, version, manifestFile, issues } result. `found`
 * is false only for the no-manifest local case, which is guidance (not an
 * error) so `validate-integration` can stay exit-0 in a non-integration dir.
 *
 * Validators are intentionally small and independent so more checks can be
 * appended without reshaping the result. Issue `code`s are stable public
 * strings.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  findManifestPaths,
  loadManifestObject,
  resolvePackageDir,
} from '../../lib/integrations.mjs';
import {discoverIntegrationCodemods} from '../../codemods/integration-discovery.mjs';
import {discoverIntegrationTemplatesForOne} from '../template/template.mjs';
import * as componentDiscovery from '../../lib/component-discovery.mjs';

/**
 * @typedef {import('../../types/integration').AstryxIntegrationIssue} Issue
 */

/**
 * @typedef {Object} ValidateResult
 * @property {boolean} found Whether an integration manifest was located.
 * @property {string} [name] Integration package name (from package.json).
 * @property {string} [version] Integration package version.
 * @property {string} [manifestFile] Absolute path to the loaded manifest.
 * @property {Issue[]} issues
 */

/**
 * Find the nearest package.json starting from `cwd` and walking up.
 * @param {string} cwd
 * @returns {string | null} absolute path to the package.json, or null.
 */
function findNearestPackageJson(cwd) {
  let dir = path.resolve(cwd);
  for (;;) {
    const candidate = path.join(dir, 'package.json');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** @param {string} code @param {string} message @returns {Issue} */
function error(code, message) {
  return {code, severity: 'error', message};
}

/**
 * Verify each declared contribution root exists on disk. A declared-but-missing
 * root is a `missing_root` error.
 * @param {{components?: string, templates?: string, codemods?: string}} resolved
 *   absolute resolved roots (undefined when not declared)
 * @param {Issue[]} issues
 */
function checkRoots(resolved, issues) {
  const kinds = /** @type {const} */ (['components', 'templates', 'codemods']);
  for (const kind of kinds) {
    const root = resolved[kind];
    if (root == null) continue;
    if (!fs.existsSync(root)) {
      issues.push(
        error(
          'missing_root',
          `Declared ${kind} root does not exist on disk: ${root}`,
        ),
      );
    }
  }
}

/**
 * Validate the integration's codemods via the landed discovery. Discovery is
 * strict (throws on bad export / duplicate id); we convert any throw into an
 * `invalid_codemod` error.
 * @param {import('../../lib/integrations.mjs').LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkCodemods(integration, issues) {
  if (!integration.codemods || !fs.existsSync(integration.codemods)) return;
  try {
    await discoverIntegrationCodemods([integration]);
  } catch (err) {
    issues.push(error('invalid_codemod', /** @type {any} */ (err).message));
  }
}

/**
 * Validate the integration's templates via the landed discovery. Per-template
 * problems are reported as `invalid_template` errors.
 * @param {import('../../lib/integrations.mjs').LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkTemplates(integration, issues) {
  if (!integration.templates || !fs.existsSync(integration.templates)) return;
  try {
    const {errors} = await discoverIntegrationTemplatesForOne(integration);
    for (const e of errors) {
      issues.push(error('invalid_template', e.message));
    }
  } catch (err) {
    issues.push(error('invalid_template', /** @type {any} */ (err).message));
  }
}

/**
 * Validate the integration's components via the landed ownership discovery.
 * Feature-detected: if the component-ownership export isn't present in this
 * build (sibling PR not yet merged), component validation is skipped rather
 * than hard-failing.
 *
 * `discoverIntegrationComponents` returns ownership records and does not throw
 * on a missing same-stem source — it records `sourcePath: null`. We surface
 * each such record as an `invalid_component` error.
 * @param {import('../../lib/integrations.mjs').LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkComponents(integration, issues) {
  if (!integration.components || !fs.existsSync(integration.components)) return;
  const discover = componentDiscovery.discoverIntegrationComponents;
  if (typeof discover !== 'function') return; // feature not present yet
  try {
    const records = (await discover(integration)) ?? [];
    for (const record of records) {
      if (record?.sourcePath == null) {
        issues.push(
          error(
            'invalid_component',
            `Component "${record?.name}" is missing its same-stem source file ${record?.name}.tsx.`,
          ),
        );
      }
    }
  } catch (err) {
    issues.push(error('invalid_component', /** @type {any} */ (err).message));
  }
}

/**
 * Run every contribution validator against a loaded-integration-shaped object.
 * @param {import('../../lib/integrations.mjs').LoadedIntegration} integration
 * @param {Issue[]} issues
 */
async function runContributionChecks(integration, issues) {
  await checkCodemods(integration, issues);
  await checkTemplates(integration, issues);
  await checkComponents(integration, issues);
}

/**
 * Validate an already-LOADED integration (as produced by
 * `loadIntegrations` in lib/integrations.mjs — absolute contribution roots
 * plus identity) and return its issues. This is the reuse seam for everyday
 * commands that have already loaded the configured integrations and want the
 * SAME validators that `validate-integration` runs, without re-resolving the
 * manifest from disk.
 *
 * The manifest schema is intentionally NOT re-validated here: `loadIntegrations`
 * already validated it (and throws otherwise), so by the time a command holds a
 * loaded integration the manifest is known-good. We re-run the on-disk
 * contribution checks (roots + codemods/templates/components) because those can
 * regress independently of the manifest (a deleted directory, a broken template).
 *
 * @param {import('../../lib/integrations.mjs').LoadedIntegration} loaded loaded-integration-shaped object
 * @returns {Promise<Issue[]>}
 */
export async function validateLoadedIntegration(loaded) {
  /** @type {Issue[]} */
  const issues = [];
  if (!loaded || typeof loaded !== 'object') return issues;
  checkRoots(
    {
      components: loaded.components,
      templates: loaded.templates,
      codemods: loaded.codemods,
    },
    issues,
  );
  await runContributionChecks(loaded, issues);
  return issues;
}

/**
 * Validate a single integration given its package directory and identity.
 * Shared core for the local and installed entry points.
 * @param {string} packageDir
 * @param {{name: string, version?: string}} identity
 * @returns {Promise<ValidateResult>}
 */
async function validateAtPackageDir(packageDir, identity) {
  /** @type {Issue[]} */
  const issues = [];
  /** @type {ValidateResult} */
  const result = {
    found: true,
    name: identity.name,
    version: identity.version,
    manifestFile: undefined,
    issues,
  };

  const manifests = findManifestPaths(packageDir);
  if (manifests.length === 0) {
    issues.push(
      error(
        'missing_manifest',
        `No astryx.integration.{ts,mjs,js} found next to package.json in ${packageDir}.`,
      ),
    );
    return result;
  }
  if (manifests.length > 1) {
    issues.push(
      error(
        'multiple_manifests',
        `Multiple root manifests present (${manifests
          .map(m => path.basename(m))
          .join(', ')}). Keep exactly one.`,
      ),
    );
    return result;
  }

  const manifestFile = manifests[0];
  result.manifestFile = manifestFile;

  // loadManifestObject loads the default export and validates it against the
  // integration schema (the shared load boundary). A missing default export or
  // a schema failure throws; we convert either into a single invalid_manifest
  // error issue so validate-integration stays exit-1-but-not-crash.
  let manifest;
  try {
    manifest = await loadManifestObject(
      manifestFile,
      `Integration manifest (${path.basename(manifestFile)})`,
    );
  } catch (err) {
    issues.push(error('invalid_manifest', /** @type {any} */ (err).message));
    return result;
  }

  /** @param {string | null | undefined} value */
  const resolveRoot = value =>
    value == null ? undefined : path.resolve(packageDir, value);

  const loaded = {
    name: identity.name,
    version: identity.version,
    components: resolveRoot(manifest.components),
    templates: resolveRoot(manifest.templates),
    codemods: resolveRoot(manifest.codemods),
    issuesUrl: manifest.issuesUrl,
    __spec: identity.name,
    __packageDir: packageDir,
    __manifestFile: manifestFile,
  };

  // Roots + contribution checks are shared with validateLoadedIntegration so
  // the everyday-command nudge runs the exact same validators.
  issues.push(...(await validateLoadedIntegration(loaded)));

  return result;
}

/**
 * Validate the LOCAL integration package rooted at `cwd`: nearest package.json
 * + a single sibling astryx.integration.{ts,mjs,js}. A missing manifest yields
 * `found: false` (guidance, not an error) so callers stay exit-0.
 * @param {string} [cwd]
 * @returns {Promise<ValidateResult>}
 */
export async function validateLocalIntegration(cwd = process.cwd()) {
  const pkgJsonPath = findNearestPackageJson(cwd);
  if (!pkgJsonPath) {
    return {found: false, issues: []};
  }
  const packageDir = path.dirname(pkgJsonPath);

  const manifests = findManifestPaths(packageDir);
  if (manifests.length === 0) {
    // No manifest next to package.json — guidance, not an error.
    return {found: false, issues: []};
  }

  /** @type {{name?: string, version?: string}} */
  let pkg = {};
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  } catch {
    // Identity falls back to undefined; the manifest checks still run.
  }

  return validateAtPackageDir(packageDir, {
    name: pkg.name ?? '(local package)',
    version: pkg.version,
  });
}

/**
 * Validate an INSTALLED integration package resolved from `cwd`/node_modules.
 * @param {string} spec package name
 * @param {string} [cwd]
 * @returns {Promise<ValidateResult>}
 */
export async function validateInstalledIntegration(spec, cwd = process.cwd()) {
  const packageDir = resolvePackageDir(spec, cwd);
  const pkgJsonPath = path.join(packageDir, 'package.json');

  /** @type {{name?: string, version?: string}} */
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  } catch {
    return {
      found: true,
      name: spec,
      version: undefined,
      issues: [
        error(
          'package_not_found',
          `Could not find installed integration package "${spec}" at ${pkgJsonPath}. Install it first.`,
        ),
      ],
    };
  }

  return validateAtPackageDir(packageDir, {
    name: pkg.name ?? spec,
    version: pkg.version,
  });
}

/**
 * Summarize issues by severity.
 * @param {Issue[]} issues
 * @returns {{errors: number, warnings: number}}
 */
export function summarizeIssues(issues) {
  let errors = 0;
  let warnings = 0;
  for (const issue of issues) {
    if (issue.severity === 'error') errors += 1;
    else if (issue.severity === 'warning') warnings += 1;
  }
  return {errors, warnings};
}
