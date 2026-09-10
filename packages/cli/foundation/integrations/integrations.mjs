// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration manifest loading for Astryx config.
 *
 * Integrations are PACKAGE NAMES listed in astryx.config.{ts,mjs,js}. Each
 * package declares a single conventional root manifest sibling to its
 * package.json — astryx.integration.{ts,mjs,js} — which contributes
 * components/templates/codemods/docs/themes roots and an optional issuesUrl. Identity
 * (name, version) comes from the package's package.json, not the manifest.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {assertWithin} from '../fs/path-safety.mjs';
// The key census and contribution parsers are internal to the schema module on
// purpose: the public parser still validates the complete authored type, while
// the loader can isolate an invalid optional contribution from valid roots.
import {
  parseAgentDocsField,
  parseIntegrationBase,
  unknownIntegrationKeys,
} from '../../authoring/integration/schema.mjs';
import {importUserModule, findPresentFiles} from '../fs/module-loader.mjs';

/**
 * A fully-resolved, loaded integration. Identity (`name`, `version`) comes from
 * the package's package.json; the `components`/`templates`/`codemods`/`docs`/
 * `themes` roots are absolute paths resolved from the manifest. The `__`-prefixed fields
 * are internal bookkeeping used by Doctor integration validation and Project.
 * @typedef {object} LoadedIntegration
 * @property {string} name
 * @property {string} [version]
 * @property {string} [components]
 * @property {string} [templates]
 * @property {string} [codemods]
 * @property {string} [docs]
 * @property {string} [themes]
 * @property {string} [issuesUrl]
 * @property {{append?: readonly string[]}} [agentDocs]
 * @property {string} [__agentDocsError] contribution-specific validation
 *   failure; other manifest contributions remain available
 * @property {string} __spec
 * @property {string} __packageDir
 * @property {Record<string, unknown>|null} [__packageExports] the owning
 *   package's `exports` map, kept from the package.json this loader already
 *   parsed so import resolution does not read it a second time
 * @property {string} __manifestFile
 * @property {string} [__loadError] set when the manifest failed to load/validate;
 *   such an integration contributes nothing and is surfaced via Project.issues()
 * @property {string[]} [__unknownKeys] manifest keys this CLI does not know —
 *   surfaced as a warning; the rest of the manifest still contributes
 * @property {boolean} [__autolinked] loaded because the project declares the
 *   package as a dependency and it ships a manifest, with no astryx.config
 *   entry naming it — see foundation/integrations/autolink.mjs
 * @property {string} [__dependencyField] for an autolinked integration, the
 *   package.json field that declared it (`dependencies`, `devDependencies`,
 *   `optionalDependencies`)
 * @property {import('../../authoring/debug/type').DebugEventHandler} [__debug]
 *   the manifest module's `debug` NAMED export, when it exported a function.
 *   Not a manifest key — see {@link loadManifest}.
 */

/** Conventional manifest basenames, in load-precedence order. */
export const MANIFEST_BASENAMES = [
  'astryx.integration.ts',
  'astryx.integration.mjs',
  'astryx.integration.js',
];

/**
 * Return the conventional root manifest paths present in `dir`, in
 * load-precedence order. Unlike {@link resolveManifestPath} this never throws —
 * callers (for example Doctor integration validation) decide how to treat zero / multiple.
 * @param {string} dir
 * @returns {string[]} absolute manifest paths
 */
export function findManifestPaths(dir) {
  return findPresentFiles(dir, MANIFEST_BASENAMES);
}

/**
 * Load and validate a manifest module's default export, while isolating the
 * optional `agentDocs` contribution from the manifest's other fields.
 *
 * The base manifest still fails as one unit when a root or `issuesUrl` is
 * invalid. `agentDocs` is parsed separately: a bad contribution is returned as
 * `agentDocsError`, while valid components/templates/docs/codemods stay loaded.
 * The raw object is also inspected before parsing so unknown-key warnings retain
 * forward compatibility.
 *
 * `debug` comes back separately because it is a named export, not a manifest
 * key. A CLI that does not know it simply does not read it.
 *
 * @param {string} file absolute manifest path
 * @param {string} [label] used in error messages
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<{manifest: import('../../authoring/integration/type').AstryxIntegration, unknownKeys: string[], debug?: import('../../authoring/debug/type').DebugEventHandler, agentDocsError?: string}>}
 */
export async function loadManifest(
  file,
  label = 'integration manifest',
  {fresh = false} = {},
) {
  const mod = await importUserModule(file, {fresh});
  const raw = mod?.default;
  const baseManifest = parseIntegrationBase(raw, label);
  const hasAgentDocs =
    raw != null &&
    typeof raw === 'object' &&
    !Array.isArray(raw) &&
    Object.prototype.hasOwnProperty.call(raw, 'agentDocs');
  const rawAgentDocs = hasAgentDocs
    ? /** @type {{agentDocs?: unknown}} */ (raw).agentDocs
    : undefined;
  /** @type {import('../../authoring/integration/type').AstryxIntegration['agentDocs']} */
  let agentDocs;
  /** @type {string | undefined} */
  let agentDocsError;
  if (hasAgentDocs && rawAgentDocs !== undefined) {
    try {
      agentDocs = parseAgentDocsField(
        rawAgentDocs,
        `${label} field "agentDocs"`,
      );
    } catch (err) {
      agentDocsError = err instanceof Error ? err.message : String(err);
    }
  }

  return {
    manifest: agentDocs == null ? baseManifest : {...baseManifest, agentDocs},
    unknownKeys: unknownIntegrationKeys(raw),
    debug:
      typeof mod?.debug === 'function'
        ? /** @type {import('../../authoring/debug/type').DebugEventHandler} */ (
            mod.debug
          )
        : undefined,
    agentDocsError,
  };
}

/**
 * Load and validate a manifest module's default export against the integration
 * schema. Throws if the default export is missing or invalid. Exposed for
 * Doctor integration validation.
 * @param {string} file absolute manifest path
 * @param {string} [label] used in error messages
 * @param {{fresh?: boolean}} [options]
 * @returns {Promise<import('../../authoring/integration/type').AstryxIntegration>}
 */
export async function loadManifestObject(
  file,
  label = 'integration manifest',
  options,
) {
  return (await loadManifest(file, label, options)).manifest;
}

/**
 * Resolve the directory of an installed integration package from the consumer's
 * node_modules.
 * @param {string} packageName
 * @param {string} [cwd]
 */
export function resolvePackageDir(packageName, cwd = process.cwd()) {
  // An integration spec is a bare npm package name — never a path. Reject `..`,
  // `.`, and absolute specs so a config can't point the loader (which then
  // dynamically imports the manifest) at an arbitrary module outside
  // node_modules.
  if (
    typeof packageName !== 'string' ||
    packageName.length === 0 ||
    path.isAbsolute(packageName) ||
    packageName.split('/').some(seg => seg === '..' || seg === '.')
  ) {
    throw new Error(
      `Invalid integration package name "${packageName}". Use a bare package name (no path segments).`,
    );
  }
  const nodeModules = path.resolve(cwd, 'node_modules');
  const dir = path.resolve(nodeModules, ...packageName.split('/'));
  if (dir !== nodeModules && !dir.startsWith(nodeModules + path.sep)) {
    throw new Error(
      `Integration "${packageName}" resolves outside node_modules.`,
    );
  }
  return dir;
}

/**
 * Find the single conventional root manifest sibling of the package's
 * package.json. Multiple present is a hard error; missing is a hard error.
 * @param {string} packageDir
 * @param {string} spec
 * @returns {string} absolute manifest path
 */
function resolveManifestPath(packageDir, spec) {
  const present = findPresentFiles(packageDir, MANIFEST_BASENAMES);
  if (present.length === 0) {
    throw new Error(
      `Integration package "${spec}" has no conventional root manifest. Add one of: ${MANIFEST_BASENAMES.join(', ')} next to its package.json.`,
    );
  }
  if (present.length > 1) {
    throw new Error(
      `Integration package "${spec}" has multiple root manifests (${present
        .map(file => path.basename(file))
        .join(', ')}). Keep exactly one.`,
    );
  }
  return present[0];
}

/**
 * Load configured integrations.
 *
 * @param {string[]} [specs] package names
 * @param {{cwd?: string, fresh?: boolean}} [options]
 * @returns {Promise<LoadedIntegration[]>}
 */
export async function loadIntegrations(
  specs = [],
  {cwd = process.cwd(), fresh = false} = {},
) {
  /** @type {LoadedIntegration[]} */
  const integrations = [];
  const seen = new Set();

  for (const spec of specs) {
    if (!spec || seen.has(spec)) continue;
    seen.add(spec);

    const packageDir = resolvePackageDir(spec, cwd);
    const pkgPath = path.join(packageDir, 'package.json');
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    } catch {
      throw new Error(
        `Could not find installed integration package "${spec}" at ${pkgPath}. Install it first.`,
      );
    }

    const manifestFile = resolveManifestPath(packageDir, spec);
    let manifest;
    /** @type {string[]} */
    let unknownKeys;
    /** @type {import('../../authoring/debug/type').DebugEventHandler | undefined} */
    let debugHandler;
    /** @type {string | undefined} */
    let agentDocsError;
    try {
      ({
        manifest,
        unknownKeys,
        debug: debugHandler,
        agentDocsError,
      } = await loadManifest(manifestFile, `Integration ${spec}`, {fresh}));
    } catch (err) {
      // A manifest that throws on import or fails schema validation must NOT take
      // down every command (component/docs/theme don't need this integration).
      // Record a load-error marker; Project surfaces it via issues() and the
      // discovery loops naturally skip it (no components/templates/codemods).
      integrations.push({
        name: pkg.name ?? spec,
        version: pkg.version,
        __spec: spec,
        __packageDir: packageDir,
        __manifestFile: manifestFile,
        __loadError: err instanceof Error ? err.message : String(err),
      });
      continue;
    }

    /** @param {string | null | undefined} value */
    const resolveRoot = value => {
      if (value == null) return undefined;
      try {
        return assertWithin(value, packageDir, {label: 'contribution root'});
      } catch {
        // Root escapes the package — skip silently (reported by Doctor validation).
        return undefined;
      }
    };

    integrations.push({
      name: pkg.name ?? spec,
      version: pkg.version,
      components: resolveRoot(manifest.components),
      templates: resolveRoot(manifest.templates),
      codemods: resolveRoot(manifest.codemods),
      docs: resolveRoot(manifest.docs),
      themes: resolveRoot(manifest.themes),
      issuesUrl: manifest.issuesUrl,
      agentDocs: manifest.agentDocs,
      __agentDocsError: agentDocsError,
      __unknownKeys: unknownKeys,
      __debug: debugHandler,
      __spec: spec,
      __packageDir: packageDir,
      __packageExports: pkg.exports ?? null,
      __manifestFile: manifestFile,
    });
  }

  return integrations;
}
