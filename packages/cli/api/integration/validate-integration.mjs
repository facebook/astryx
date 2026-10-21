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
import {assertWithin} from '../../foundation/fs/path-safety.mjs';
import {normalizeProviderId} from '../../foundation/identity/provider-identity.mjs';
import {integrationDocTypes} from '../docs/_adapter.mjs';
import {integrationDocConsistency} from '../../foundation/discovery/doc-consistency.mjs';
import {discoverIntegrationDocs} from '../../foundation/discovery/docs-discovery.mjs';
import {findRunnerCommands} from '../../foundation/discovery/runner-commands.mjs';
import {
  THEME_SLUG_RE,
  unreadThemeFolders,
} from '../../foundation/discovery/theme-discovery.mjs';
import {
  createFixContext,
  DOC_CANDIDATE_RE,
  pathIsInside,
  stampOf,
  TEMPLATE_CANDIDATE_RE,
  unreachableFix,
} from '../../foundation/integrations/contribution-fixes.mjs';
import {
  findManifestPaths,
  loadManifest,
  resolvePackageDir,
} from '../../foundation/integrations/integrations.mjs';
// The on-disk contribution validators live in foundation: Project and
// integration-warnings need them too, and foundation must not depend on api.
import {
  INVALID_CLI_COMMAND,
  validateLoadedIntegration,
  issueError as error,
  issueWarning as warning,
  rootProblem,
} from '../../foundation/integrations/validate-contributions.mjs';
import {formatCliCommand} from '../../foundation/env/package-manager.mjs';

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
 * @property {'no_package_json'} [reason] Why nothing was validated (internal).
 * @property {Issue[]} issues
 * @property {Array<{code: string, message: string}>} [notes] Information that
 *   fails nothing, such as `invalid_cli_command` (a malformed `cliCommand`).
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

const ROOT_KINDS = /** @type {const} */ ([
  'components',
  'templates',
  'codemods',
  'docs',
  'themes',
]);

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
/**
 * A warning for each folder under the themes root that holds modules but is
 * not read as a theme. Either branch of its fix leaves nothing to warn about:
 * the folder becomes a theme, or a dot-folder discovery skips.
 * @param {string} packageDir
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration} loaded
 * @returns {Issue[]}
 */
function unreadThemeFolderIssues(packageDir, loaded) {
  const themes = /** @type {string} */ (loaded.themes);
  return unreadThemeFolders(themes, {
    packageDir,
    packageName: loaded.name,
  }).map(folder => {
    const name = path.basename(folder);
    const shown = `${path.relative(packageDir, folder).split(path.sep).join('/')}/`;
    const hide = `rename it to .${name} so Astryx skips it`;
    let fix;
    if (THEME_SLUG_RE.test(name)) {
      const stem = `${name.replace(/-([a-z0-9])/gu, (_, character) => character.toUpperCase())}Theme`;
      fix = `if it is a theme, add ${stem}.ts and ${stem}.doc.mjs to it (\`${formatCliCommand(`integration add theme ${name}`, packageDir)}\` writes both) and move its code into ${stem}.ts; if not, ${hide}.`;
    } else {
      fix = `${hide}; a theme folder needs a lower-kebab name.`;
    }
    return warning(
      'unread_theme_folder',
      `Folder "${shown}" holds modules but no <name>Theme source or .doc.mjs descriptor, so Astryx does not read it as a theme. Fix: ${fix}`,
    );
  });
}

/**
 * Find real contribution metadata that sits outside every declared root. The
 * scan is local-authoring-only, skips dependency/build output, never follows
 * symlinks, and parses candidates before reporting them so ordinary JS files do
 * not become noise.
 *
 * @param {string} packageDir
 * @param {import('../../foundation/integrations/integrations.mjs').LoadedIntegration} loaded
 * @param {string[]} [reported] folders whose files another issue already covers
 * @returns {Promise<Issue[]>}
 */
async function findUnreachableContributionIssues(
  packageDir,
  loaded,
  reported = [],
) {
  // A root that is not a readable folder holds nothing: a fix must never
  // send a file into it.
  const usable = {...loaded};
  for (const kind of ROOT_KINDS) {
    const root = usable[kind];
    if (root != null && rootProblem(root)) usable[kind] = undefined;
  }
  // Every declared root is skipped, readable or not: one that cannot be read
  // has its own issue.
  const roots = /** @type {string[]} */ (
    ROOT_KINDS.map(kind => loaded[kind]).filter(Boolean)
  );
  // A folder a symlinked root points at is read through that root.
  const realRoots = roots.map(root => {
    try {
      return fs.realpathSync(root);
    } catch {
      return root;
    }
  });
  /** @type {Issue[]} */
  const issues = [];
  const context = createFixContext(packageDir, usable);
  let scanned = 0;
  let truncated = false;

  /** @param {string} dir */
  async function walk(dir) {
    if (roots.some(root => pathIsInside(dir, root))) return;
    if (reported.some(folder => pathIsInside(dir, folder))) return;
    let realDir = dir;
    try {
      realDir = fs.realpathSync(dir);
    } catch {
      // Unreadable: reported below.
    }
    if (realRoots.some(root => pathIsInside(realDir, root))) return;
    let entries;
    try {
      entries = fs
        .readdirSync(dir, {withFileTypes: true})
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      // One folder the user running astryx cannot read must not end the whole
      // validation: name it and keep checking the rest of the package.
      const shown = `${path.relative(packageDir, dir).split(path.sep).join('/') || '.'}/`;
      const reason = /** @type {any} */ (err)?.code ?? String(err);
      issues.push(
        warning(
          'unreadable_folder',
          `Could not read "${shown}" (${reason}), so it was not checked for contributions outside a declared root. Fix: make it readable by the user running astryx, or remove it if it does not belong in the package.`,
        ),
      );
      return;
    }
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
      if (
        !TEMPLATE_CANDIDATE_RE.test(entry.name) &&
        !DOC_CANDIDATE_RE.test(entry.name)
      ) {
        continue;
      }
      const stamp = stampOf(context, full);
      if (stamp == null) continue;
      issues.push(
        warning(
          'unreachable_contribution',
          `Found contribution metadata "${path.relative(packageDir, full)}" outside every declared integration root, so it contributes nothing. ${unreachableFix(context, full, stamp)}`,
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
  /** @type {string | undefined} */
  let cliCommandError;
  try {
    ({manifest, unknownKeys, agentDocsError, cliCommandError} =
      await loadManifest(
        manifestFile,
        `Integration manifest (${path.basename(manifestFile)})`,
      ));
  } catch (err) {
    issues.push(error('invalid_manifest', /** @type {any} */ (err).message));
    return result;
  }

  /** @type {string[]} absolute roots inside the package */
  const absoluteRoots = [];
  /**
   * @param {string | null | undefined} value
   * @param {string} key the manifest key that declares it
   */
  const resolveRoot = (value, key, kind = 'contribution root') => {
    if (value == null) return undefined;
    if (path.isAbsolute(value)) {
      // An absolute root names this machine's disk, which no install shares,
      // even when it happens to point inside the package.
      const inside = path.relative(packageDir, value);
      const relative =
        inside === '' || (!inside.startsWith('..') && !path.isAbsolute(inside))
          ? `./${inside.split(path.sep).join('/')}`.replace(/\/$/u, '')
          : null;
      // The code an absolute root has always carried, reworded.
      result.issues.push(
        error(
          'root_outside_package',
          `The ${key} root "${value}" is an absolute path, so Astryx reads nothing from it: a root is relative to the package, so it resolves the same wherever the package is installed.` +
            (relative
              ? ` Fix: set \`${key}: '${relative === './' ? '.' : relative}'\` in ${path.basename(manifestFile)}.`
              : ` It also points outside the package. Fix: move the files into the package and set \`${key}\` to their folder relative to package.json, such as './${key}'.`),
        ),
      );
      // Its files are reported through this issue, not one by one.
      if (relative) absoluteRoots.push(path.resolve(value));
      return undefined;
    }
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
    components: resolveRoot(manifest.components, 'components'),
    templates: resolveRoot(manifest.templates, 'templates'),
    codemods: resolveRoot(manifest.codemods, 'codemods'),
    docs: resolveRoot(manifest.docs, 'docs'),
    themes: resolveRoot(manifest.themes, 'themes'),
    issuesUrl: manifest.issuesUrl,
    agentDocs: manifest.agentDocs,
    cliCommand: manifest.cliCommand,
    __cliCommandError: cliCommandError,
    __agentDocsError: agentDocsError,
    __unknownKeys: unknownKeys,
    __spec: identity.name,
    __declaredProviderId: manifest.providerId,
    __packageDir: packageDir,
    __manifestFile: manifestFile,
  };
  result.integration = loaded;

  // Roots + contribution checks are shared with validateLoadedIntegration so
  // the everyday-command nudge runs the exact same validators.
  // A malformed `cliCommand` is an info note beside the issues, not an issue:
  // `integration check --strict` fails on any warning, and a new failure code
  // joins only in a minor release (architecture:cli-surface INV35). Doctor's
  // project check still warns about it.
  for (const issue of await validateLoadedIntegration(loaded)) {
    if (issue.code === INVALID_CLI_COMMAND) {
      (result.notes ??= []).push({code: issue.code, message: issue.message});
    } else {
      issues.push(issue);
    }
  }
  if (loaded.themes && !rootProblem(loaded.themes))
    issues.push(...unreadThemeFolderIssues(packageDir, loaded));
  // What the docs say that no reader serves: a prop listed twice, an
  // overlay's text for a prop the doc lacks, an empty or unreachable section,
  // and an overlay of no topic.
  issues.push(
    ...(await integrationDocConsistency(
      {
        components:
          loaded.components && !rootProblem(loaded.components)
            ? loaded.components
            : undefined,
        docs:
          loaded.docs && !rootProblem(loaded.docs) ? loaded.docs : undefined,
      },
      packageDir,
    )),
  );
  if (scanUnreachable) {
    issues.push(
      ...(await findUnreachableContributionIssues(
        packageDir,
        loaded,
        absoluteRoots,
      )),
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
    return {found: false, reason: 'no_package_json', issues: []};
  }
  const packageDir = path.dirname(pkgJsonPath);

  const manifests = findManifestPaths(packageDir);
  if (manifests.length === 0) {
    // No manifest next to package.json — guidance, not an error.
    return {found: false, issues: []};
  }

  /** @type {{name?: string, version?: string, private?: boolean}} */
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
  } catch (err) {
    // A null name means "no manifest here"; this package has one.
    return {
      found: true,
      name: '(local package)',
      manifestFile: manifests[0],
      issues: [
        error(
          'invalid_package_json',
          `Could not parse ${pkgJsonPath}: ${err instanceof Error ? err.message : String(err)}`,
        ),
      ],
    };
  }

  // npm publishes nothing without a name and a version, and the name is the
  // provider ID every reader keys the package's contributions on.
  // A package without one is still checked, under a placeholder name.
  const fields = packageJsonFieldIssues(pkg, pkgJsonPath);
  const name =
    typeof pkg.name === 'string' && pkg.name !== ''
      ? pkg.name
      : '(local package)';
  const result = await validateAtPackageDir(
    packageDir,
    {name, version: pkg.version},
    {scanUnreachable: true},
  );
  result.issues.unshift(
    ...fields,
    // Only a manifest that loaded says whether it declares a providerId; one
    // that did not is reported as invalid_manifest.
    ...(result.integration
      ? providerIdIssues(
          pkg.name,
          result.integration.__declaredProviderId,
          result.integration.__manifestFile,
        )
      : []),
  );
  return result;
}

/**
 * Whether `name` is a bare npm package name, the form a provider ID takes.
 * @param {string} name
 */
function isPackageName(name) {
  try {
    normalizeProviderId(name);
    return true;
  } catch {
    return false;
  }
}

/**
 * A warning when no provider ID can be derived for the package: its
 * package.json `name` is not a bare package name and its manifest declares
 * no `providerId` that is one. Readers key the package's contributions on
 * that ID; a missing name is its own warning.
 * @param {unknown} name package.json `name`
 * @param {unknown} declared the manifest's `providerId`
 * @param {string} manifestFile
 * @returns {Issue[]}
 */
function providerIdIssues(name, declared, manifestFile) {
  if (typeof name !== 'string' || name === '') return [];
  if (isPackageName(name)) return [];
  if (typeof declared === 'string' && isPackageName(declared)) return [];
  const manifest = path.basename(manifestFile);
  return [
    warning(
      'no_provider_id',
      `No provider ID can be derived for this package: package.json "name" ${JSON.stringify(name)} is not a bare package name (an optional @scope/ and a name, each starting with a lowercase letter or digit and holding only lowercase letters, digits, "-", ".", "_" and "~"), and ${manifest} declares no providerId that is one. Astryx files the package's components, templates and docs under that ID, so links to them and selecting the package cannot work. Fix: rename the package, such as "@your-scope/your-package", or set \`providerId: '@your-scope/your-package'\` in ${manifest}.`,
    ),
  ];
}

/**
 * A warning for each field npm needs that package.json lacks.
 * @param {{name?: unknown, version?: unknown, private?: unknown}} pkg
 * @param {string} pkgJsonPath
 * @returns {Issue[]}
 */
function packageJsonFieldIssues(pkg, pkgJsonPath) {
  /** @type {Issue[]} */
  const issues = [];
  const shown = path.basename(pkgJsonPath);
  // Warnings, so validate keeps the exit code it had for these packages;
  // `integration verify`, which packs, reports them as errors.
  if (typeof pkg.name !== 'string' || pkg.name === '') {
    issues.push(
      warning(
        'invalid_package_json',
        `${shown} has no "name", so npm cannot pack or publish the package, and a project that installs it has no name to select it by. Fix: add "name": "@your-scope/your-package" to ${shown}.`,
      ),
    );
  }
  // A private package is never published, so it needs no version.
  if (
    pkg.private !== true &&
    (typeof pkg.version !== 'string' || pkg.version === '')
  ) {
    issues.push(
      warning(
        'invalid_package_json',
        `${shown} has no "version", so npm cannot pack or publish the package. Fix: add "version": "0.1.0" to ${shown}.`,
      ),
    );
  }
  return issues;
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
 * The runner-command notes for a package's topics: each Astryx command a topic
 * writes with a package runner, where the doc file is, and the bare command to
 * write. A topic that does not load is reported by the other checks.
 * @param {any} integration a loaded integration
 * @returns {Promise<Array<{code: string, message: string}>>}
 */
async function runnerCommandNotes(integration) {
  let discovered;
  try {
    discovered = await discoverIntegrationDocs(integration);
  } catch {
    return [];
  }
  const packageDir = integration.__packageDir;
  return (await findRunnerCommands(discovered)).map(each => ({
    code: 'runner_command',
    message:
      typeof packageDir === 'string'
        ? `${path.relative(packageDir, each.file).split(path.sep).join('/')}: ${each.message}`
        : each.message,
  }));
}

/**
 * Unified entry: validate the LOCAL integration (no `pkg`) or an INSTALLED one
 * (`pkg` given) and return the `integration.validate` envelope. The no-manifest
 * local case is guidance, not an error — it comes back with `validated: false`,
 * `name: null` and no issues so the CLI can print a hint and stay exit-0.
 * `validated` is what tells a machine consumer that empty `issues` means
 * "nothing was checked" rather than "checked and healthy".
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
  // Each doc the package ships, against the published authoring type for its
  // kind, read with the project's own compiler. Findings are warnings only.
  const integration = result.found ? result.integration : undefined;
  const docTypes = integration
    ? await integrationDocTypes(integration, cwd)
    : undefined;
  const notes = result.found ? [...(result.notes ?? [])] : [];
  // Each Astryx command a topic writes with a package runner, as a
  // `runner_command` note with its fix: information that fails nothing, as
  // `invalid_cli_command` is, until a minor release names it.
  if (integration?.docs) {
    notes.push(...(await runnerCommandNotes(integration)));
  }
  return {
    type: 'integration.validate',
    data: {
      // The one bit that separates "checked and clean" from "never checked":
      // with no manifest there is nothing to validate, and issues stays [].
      validated: result.found,
      name: result.found ? (result.name ?? null) : null,
      version: result.found ? (result.version ?? null) : null,
      issues:
        result.reason === 'no_package_json'
          ? [
              {
                code: 'no_package',
                severity: 'error',
                message:
                  'No package.json found. Run this command inside a package directory.',
              },
            ]
          : result.issues,
      ...(notes.length > 0 ? {notes} : {}),
      ...(docTypes ? {docTypes} : {}),
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
