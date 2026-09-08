// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Integration manifest loading for Astryx config.
 *
 * Integrations are PACKAGE NAMES listed in astryx.config.{ts,mjs,js}. Each
 * package declares a single conventional root manifest sibling to its
 * package.json — astryx.integration.{ts,mjs,js} — which contributes
 * components/templates/codemods/docs roots and an optional issuesUrl. Identity
 * (name, version) comes from the package's package.json, not the manifest.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {assertWithin} from '../fs/path-safety.mjs';
import {parseIntegration} from '../../authoring/integration/parse.mjs';
// The key census is internal to the schema module on purpose: it is derived
// from the schema so it cannot drift, and it is not public API.
import {unknownIntegrationKeys} from '../../authoring/integration/schema.mjs';
import {importUserModule, findPresentFiles} from '../fs/module-loader.mjs';

/**
 * A fully-resolved, loaded integration. Identity (`name`, `version`) comes from
 * the package's package.json; the `components`/`templates`/`codemods`/`docs`
 * roots are absolute paths resolved from the manifest. The `__`-prefixed fields
 * are internal bookkeeping used by validate-integration and Project.
 * @typedef {object} LoadedIntegration
 * @property {string} name
 * @property {string} [version]
 * @property {string} [components]
 * @property {string} [templates]
 * @property {string} [codemods]
 * @property {string} [docs]
 * @property {string} [issuesUrl]
 * @property {string} __spec
 * @property {string} __packageDir
 * @property {string} __manifestFile
 * @property {string} [__loadError] set when the manifest failed to load/validate;
 *   such an integration contributes nothing and is surfaced via Project.issues()
 * @property {string[]} [__unknownKeys] manifest keys this CLI does not know —
 *   surfaced as a warning; the rest of the manifest still contributes
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
 * callers (e.g. validate-integration) decide how to treat zero / multiple.
 * @param {string} dir
 * @returns {string[]} absolute manifest paths
 */
export function findManifestPaths(dir) {
  return findPresentFiles(dir, MANIFEST_BASENAMES);
}

/**
 * Load and validate a manifest module's default export against the integration
 * schema, and report the keys this CLI does not know. Default export only —
 * `.ts` is loaded via jiti; `.mjs`/`.js` via dynamic import. Throws if the
 * default export is missing or invalid.
 *
 * The raw default export is inspected before it is parsed, because parsing
 * strips the unknown keys: after `parseIntegration` there is nothing left to
 * report. Exposed for validate-integration.
 *
 * `debug` comes back separately because it is a NAMED export, not a manifest
 * key. A key would have to survive the manifest schema of every CLI version
 * already installed against this integration, and older ones reject an unknown
 * key outright — losing that integration's components, templates and codemods
 * with it (#5119). A named export is simply not read by a CLI that does not
 * know about it, so an integration can start contributing one without a
 * coordinated upgrade.
 *
 * @param {string} file absolute manifest path
 * @param {string} [label] used in error messages
 * @returns {Promise<{manifest: import('../../authoring/integration/type').AstryxIntegration, unknownKeys: string[], debug?: import('../../authoring/debug/type').DebugEventHandler}>}
 */
export async function loadManifest(file, label = 'integration manifest') {
  const mod = await importUserModule(file);
  const raw = mod?.default;
  return {
    manifest: parseIntegration(raw, label),
    unknownKeys: unknownIntegrationKeys(raw),
    debug:
      typeof mod?.debug === 'function'
        ? /** @type {import('../../authoring/debug/type').DebugEventHandler} */ (
            mod.debug
          )
        : undefined,
  };
}

/**
 * Load and validate a manifest module's default export against the integration
 * schema. Throws if the default export is missing or invalid. Exposed for
 * validate-integration.
 * @param {string} file absolute manifest path
 * @param {string} [label] used in error messages
 * @returns {Promise<import('../../authoring/integration/type').AstryxIntegration>}
 */
export async function loadManifestObject(file, label = 'integration manifest') {
  return (await loadManifest(file, label)).manifest;
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
    throw new Error(`Integration "${packageName}" resolves outside node_modules.`);
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
 * @param {{cwd?: string}} [options]
 * @returns {Promise<LoadedIntegration[]>}
 */
export async function loadIntegrations(specs = [], {cwd = process.cwd()} = {}) {
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
    try {
      ({
        manifest,
        unknownKeys,
        debug: debugHandler,
      } = await loadManifest(manifestFile, `Integration ${spec}`));
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
        // Root escapes the package — skip silently (logged by validate-integration).
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
      issuesUrl: manifest.issuesUrl,
      __unknownKeys: unknownKeys,
      __debug: debugHandler,
      __spec: spec,
      __packageDir: packageDir,
      __manifestFile: manifestFile,
    });
  }

  return integrations;
}
