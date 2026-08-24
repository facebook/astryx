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
 * The on-disk contribution validators themselves (roots + codemods/templates/
 * components/docs, behind `validateLoadedIntegration`) live in
 * `foundation/integrations/validate-contributions.mjs`, because foundation also
 * runs them: `Project` collects integration issues and `integration-warnings`
 * nudges about them on ordinary commands. This file re-exports
 * `validateLoadedIntegration` so existing importers are unaffected, and keeps
 * the command-level entry points that resolve a manifest from disk.
 *
 * Validators are intentionally small and independent so more checks can be
 * appended without reshaping the result. Issue `code`s are stable public
 * strings.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {assertWithin} from '../../foundation/fs/path-safety.mjs';
import {
  findManifestPaths,
  loadManifestObject,
  resolvePackageDir,
} from '../../foundation/integrations/integrations.mjs';
// The on-disk contribution validators live in foundation: Project and
// integration-warnings need them too, and foundation must not depend on api.
import {
  validateLoadedIntegration,
  issueError as error,
} from '../../foundation/integrations/validate-contributions.mjs';

export {validateLoadedIntegration};

/**
 * @typedef {import('../../foundation/integrations/issue').AstryxIntegrationIssue} Issue
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
  const resolveRoot = (value, kind = 'contribution root') => {
    if (value == null) return undefined;
    try {
      return assertWithin(value, packageDir, {label: kind});
    } catch {
      // If the root escapes the package, report an issue instead of crashing.
      result.issues.push({
        code: 'root_outside_package',
        severity: 'error',
        message: `The ${kind} "${value}" resolves outside the integration package directory. Contribution roots must stay within the package.`,
      });
      return undefined;
    }
  };

  const loaded = {
    name: identity.name,
    version: identity.version,
    components: resolveRoot(manifest.components),
    templates: resolveRoot(manifest.templates),
    codemods: resolveRoot(manifest.codemods),
    docs: resolveRoot(manifest.docs),
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
  // resolvePackageDir throws (path-safety guard) on a spec with path segments,
  // `..`, or an absolute path. Every other malformed input to this command
  // degrades into a diagnostic — so catch it here and return an issue instead
  // of letting the throw escape to a raw stack (human) / generic ERR_UNKNOWN
  // (--json).
  let packageDir;
  try {
    packageDir = resolvePackageDir(spec, cwd);
  } catch (err) {
    return {
      found: true,
      name: spec,
      version: undefined,
      issues: [error('invalid_package_spec', /** @type {any} */ (err).message)],
    };
  }
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
 * Unified entry: validate the LOCAL integration (no `pkg`) or an INSTALLED one
 * (`pkg` given) and return the `integration.validate` envelope. The no-manifest
 * local case is guidance, not an error — it comes back with `name: null` and no
 * issues so the CLI can print a hint and stay exit-0.
 *
 * This is the seam that keeps the CLI a thin wrapper: the command handler calls
 * this and only chooses how to render (human vs --json) + the exit code.
 *
 * @param {string} [pkg] installed package name; omit to validate the cwd package
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('./validate-integration.type.mjs').ValidateIntegrationResponse>}
 */
export async function validateIntegration(pkg, options = {}) {
  const {cwd = process.cwd()} = options;
  const result = pkg
    ? await validateInstalledIntegration(pkg, cwd)
    : await validateLocalIntegration(cwd);
  return {
    type: 'integration.validate',
    data: {
      name: result.found ? result.name ?? null : null,
      version: result.found ? result.version ?? null : null,
      issues: result.issues,
    },
  };
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
