// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration structure validation for
 * `astryx doctor integration validate`.
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
 * error) so the Doctor check stays exit-0 in a non-integration dir.
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
import jscodeshift from 'jscodeshift';
import {assertWithin} from '../../foundation/fs/path-safety.mjs';
import {
  findManifestPaths,
  loadManifest,
  resolvePackageDir,
} from '../../foundation/integrations/integrations.mjs';
// The on-disk contribution validators live in foundation: Project and
// integration-warnings need them too, and foundation must not depend on api.
import {
  validateLoadedIntegration,
  issueError as error,
  issueWarning as warning,
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
 * @property {import('../../foundation/integrations/integrations.mjs').LoadedIntegration} [integration]
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

const UNREACHABLE_SCAN_LIMIT = 5_000;
const UNREACHABLE_SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  'out',
]);
const DOC_CANDIDATE_RE = /\.doc\.(?:ts|mjs|js)$/u;
const TEMPLATE_CANDIDATE_RE = /\.template\.(?:ts|mjs|js)$/u;
const STATIC_DOC_TYPES = new Set(['component', 'generic', 'page', 'block']);
const STATIC_TEMPLATE_TYPES = new Set(['page', 'block']);
const j = jscodeshift.withParser('tsx');

/** @param {any} node @returns {any} */
function unwrapStaticExpression(node) {
  let current = node;
  while (
    current &&
    [
      'TSSatisfiesExpression',
      'TSAsExpression',
      'TypeCastExpression',
      'ParenthesizedExpression',
    ].includes(current.type)
  ) {
    current = current.expression;
  }
  if (current?.type === 'CallExpression' && current.arguments.length > 0) {
    current = unwrapStaticExpression(current.arguments[0]);
  }
  return current;
}

/** @param {any} property @param {string} name */
function staticPropertyNamed(property, name) {
  if (
    !property ||
    !['ObjectProperty', 'Property'].includes(property.type) ||
    property.computed
  ) {
    return false;
  }
  return (
    (property.key?.type === 'Identifier' && property.key.name === name) ||
    (['Literal', 'StringLiteral'].includes(property.key?.type) &&
      property.key.value === name)
  );
}

/**
 * Identify contribution metadata without importing it. Doctor scans files that
 * the manifest does not declare, so executing those files would run code the
 * package never asked Astryx to load.
 *
 * @param {string} file
 * @param {boolean} templateOnly
 */
function isStaticContributionMetadata(file, templateOnly) {
  let ast;
  try {
    ast = j(fs.readFileSync(file, 'utf-8'));
  } catch {
    return false;
  }
  /** @type {any[]} */
  const candidates = [];
  ast
    .find(j.ExportDefaultDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      candidates.push(exportPath.value.declaration);
    });
  ast
    .find(j.ExportNamedDeclaration)
    .forEach((/** @type {any} */ exportPath) => {
      const declaration = exportPath.value.declaration;
      if (declaration?.type !== 'VariableDeclaration') return;
      for (const declarator of declaration.declarations) {
        if (
          declarator.id?.type === 'Identifier' &&
          declarator.id.name === 'docs'
        ) {
          candidates.push(declarator.init);
        }
      }
    });

  const allowedTypes = templateOnly ? STATIC_TEMPLATE_TYPES : STATIC_DOC_TYPES;
  for (const candidate of candidates) {
    const object = unwrapStaticExpression(candidate);
    if (object?.type !== 'ObjectExpression') continue;
    const typeProperty = object.properties.find((/** @type {any} */ property) =>
      staticPropertyNamed(property, 'type'),
    );
    const value = unwrapStaticExpression(typeProperty?.value);
    if (
      ['Literal', 'StringLiteral'].includes(value?.type) &&
      allowedTypes.has(value.value)
    ) {
      return true;
    }
  }
  return false;
}

/** @param {string} candidate @param {string} root */
function pathIsInside(candidate, root) {
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

/**
 * Find real contribution metadata that sits outside every declared root. The
 * scan is local-authoring-only, skips dependency/build output, never follows
 * symlinks, and parses candidates before reporting them so ordinary JS files do
 * not become noise.
 *
 * @param {string} packageDir
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration} loaded
 * @returns {Promise<Issue[]>}
 */
async function findUnreachableContributionIssues(packageDir, loaded) {
  const roots = /** @type {string[]} */ (
    [
      loaded.components,
      loaded.templates,
      loaded.codemods,
      loaded.docs,
      loaded.themes,
    ].filter(Boolean)
  );
  /** @type {Issue[]} */
  const issues = [];
  let scanned = 0;
  let truncated = false;

  /** @param {string} dir */
  async function walk(dir) {
    if (roots.some(root => pathIsInside(dir, root))) return;
    const entries = fs
      .readdirSync(dir, {withFileTypes: true})
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (truncated) return;
      if (UNREACHABLE_SKIP_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile()) continue;
      scanned += 1;
      if (scanned > UNREACHABLE_SCAN_LIMIT) {
        truncated = true;
        return;
      }
      const isTemplate = TEMPLATE_CANDIDATE_RE.test(entry.name);
      if (!isTemplate && !DOC_CANDIDATE_RE.test(entry.name)) continue;
      if (!isStaticContributionMetadata(full, isTemplate)) continue;
      issues.push(
        warning(
          'unreachable_contribution',
          `Found contribution metadata "${path.relative(packageDir, full)}" outside every declared integration root, so it contributes nothing. Move it under the matching root or update the manifest root.`,
        ),
      );
    }
  }

  await walk(packageDir);
  if (truncated) {
    issues.push(
      warning(
        'unreachable_scan_truncated',
        `Stopped unreachable-contribution scanning after ${UNREACHABLE_SCAN_LIMIT} files. Narrow the package or move generated output under dist/build.`,
      ),
    );
  }
  return issues;
}

/**
 * Validate a single integration given its package directory and identity.
 * Shared core for the local and installed entry points.
 * @param {string} packageDir
 * @param {{name: string, version?: string}} identity
 * @param {{scanUnreachable?: boolean}} [options]
 * @returns {Promise<ValidateResult>}
 */
async function validateAtPackageDir(
  packageDir,
  identity,
  {scanUnreachable = false} = {},
) {
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

  // loadManifest validates the base manifest and isolates optional agent-doc
  // validation. A missing default export or invalid base field throws and
  // becomes invalid_manifest; invalid agentDocs is carried to the shared
  // contribution validator so other valid roots remain available.
  let manifest;
  /** @type {string[]} */
  let unknownKeys;
  /** @type {string | undefined} */
  let agentDocsError;
  try {
    ({manifest, unknownKeys, agentDocsError} = await loadManifest(
      manifestFile,
      `Integration manifest (${path.basename(manifestFile)})`,
    ));
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
    templateReplacements: manifest.templateReplacements,
    codemods: resolveRoot(manifest.codemods),
    docs: resolveRoot(manifest.docs),
    themes: resolveRoot(manifest.themes),
    issuesUrl: manifest.issuesUrl,
    agentDocs: manifest.agentDocs,
    __agentDocsError: agentDocsError,
    __unknownKeys: unknownKeys,
    __spec: identity.name,
    __packageDir: packageDir,
    __manifestFile: manifestFile,
  };
  result.integration = loaded;

  // Roots + contribution checks are shared with validateLoadedIntegration so
  // the everyday-command nudge runs the exact same validators.
  issues.push(...(await validateLoadedIntegration(loaded)));
  if (scanUnreachable) {
    issues.push(
      ...(await findUnreachableContributionIssues(packageDir, loaded)),
    );
  }

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
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  } catch (err) {
    return {
      found: true,
      manifestFile: manifests[0],
      issues: [
        error(
          'invalid_package_json',
          `Could not parse ${pkgJsonPath}: ${err instanceof Error ? err.message : String(err)}`,
        ),
      ],
    };
  }

  return validateAtPackageDir(
    packageDir,
    {
      name: pkg.name ?? '(local package)',
      version: pkg.version,
    },
    {scanUnreachable: true},
  );
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
  } catch (err) {
    const exists = fs.existsSync(pkgJsonPath);
    return {
      found: true,
      name: spec,
      version: undefined,
      issues: [
        error(
          exists ? 'invalid_package_json' : 'package_not_found',
          exists
            ? `Could not parse ${pkgJsonPath}: ${err instanceof Error ? err.message : String(err)}`
            : `Could not find installed integration package "${spec}" at ${pkgJsonPath}. Install it first.`,
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
      name: result.found ? (result.name ?? null) : null,
      version: result.found ? (result.version ?? null) : null,
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
