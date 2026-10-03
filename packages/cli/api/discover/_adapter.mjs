// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared adapter for the discover leaves: the one place discover reaches
 * the environment.
 *
 * Every `discover.*` leaf projects already-resolved data into a typed response;
 * none of them touch the integration system, the filesystem, or a source. This
 * adapter does: it resolves the project's installed integrations and what each
 * one adds, calls every discover source and keeps a saved copy of each answer,
 * locates and loads a component's doc, and names the package manager's add
 * command. Keeping that I/O here (INV21) is what lets `list`, `detail`,
 * `detail/doc`, `detail/item`, and `search` stay pure projections.
 *
 * @position api/discover — orchestration over foundation/config/project,
 *   foundation/integrations, the discovery loaders, and discover sources.
 */

import {createHash} from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {Project} from '../../foundation/config/project.mjs';
import {scanAllPackages, findComponentInPackages} from './_package-scanner.mjs';
import {loadDocs} from '../../foundation/discovery/component-loader.mjs';
import {collectIdentities} from '../../foundation/integrations/contribution-inventory.mjs';
import {detectPackageManager} from '../../foundation/env/package-manager.mjs';
import {assertWithin} from '../../foundation/fs/path-safety.mjs';
import {parseDiscoverCatalog} from '../../authoring/discover/parse.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

const SOURCE_TIMEOUT_MS = 30_000;

const DEPENDENCY_FIELDS = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

/**
 * @typedef {import('./_package-scanner.mjs').ScannedPackage} ScannedPackage
 * @typedef {import('../../authoring/discover/type').DiscoverPackage} DiscoverPackage
 * @typedef {import('../../authoring/discover/type').DiscoverSource} DiscoverSource
 */

/**
 * An installed integration with what it adds, per kind. `components` is the
 * scanned component list the discover leaves have always used.
 * @typedef {ScannedPackage & {
 *   templates?: string[],
 *   docs?: string[],
 *   themes?: string[],
 *   codemods?: string[],
 * }} InstalledPackage
 */

/**
 * What one source did on this run.
 * @typedef {object} SourceState
 * @property {string} name the source's own name, or where it came from when it
 *   gave none
 * @property {string} from `astryx.config`, or the integration that exports it
 * @property {'fresh' | 'saved' | 'failed'} status
 * @property {string} [generatedAt]
 * @property {boolean} [complete]
 * @property {string} [savedAt] when the saved copy in use was written
 * @property {string} [error] why the live call failed
 */

/**
 * Everything every source returned, merged. When two sources list the same
 * package, the earlier source's entry is kept.
 * @typedef {{sources: SourceState[], packages: Array<DiscoverPackage & {source: string}>}} CatalogResult
 */

/**
 * A located component doc within a scanned package — the shape returned by
 * {@link findComponent}, consumed by {@link loadValidatedDoc}.
 * @typedef {{pkg: ScannedPackage, docPath: string, componentName: string}} ComponentResolution
 */

/**
 * Validate the loose shape of a loaded docs object. Returns an error string
 * describing the first problem, or `null` when the docs are usable.
 * @param {unknown} docs
 * @returns {string | null}
 */
function validateDocs(docs) {
  if (!docs || typeof docs !== 'object')
    return 'docs export is missing or not an object';
  const d = /** @type {Record<string, any>} */ (docs);
  if (typeof d.name !== 'string' || !d.name)
    return 'docs.name is missing or not a string';
  if (!d.usage || typeof d.usage.description !== 'string')
    return 'docs.usage.description is missing or not a string';
  if (d.props && !Array.isArray(d.props)) return 'docs.props must be an array';
  if (d.components && !Array.isArray(d.components))
    return 'docs.components must be an array';
  if (d.usage?.bestPractices && !Array.isArray(d.usage.bestPractices))
    return 'docs.usage.bestPractices must be an array';
  return null;
}

/**
 * Discover the configured external packages for the current project.
 *
 * External packages come from configured integrations that declare a components
 * root; each becomes a scannable package keyed by its docsDir. `configured`
 * reports whether the project configured ANY integration — including one whose
 * manifest failed to load, which contributes nothing but is emphatically not
 * "nothing configured". It lets an empty result distinguish "nothing
 * configured" (`false`) from "configured but nothing discovered" (`true`),
 * which the list leaf surfaces as `meta`.
 *
 * @returns {Promise<{packages: ScannedPackage[], configured: boolean, project: Project}>}
 */
export async function discoverPackages() {
  const project = await Project.load();
  const loadedIntegrations =
    /** @type {import('../../foundation/integrations/integrations.mjs').LoadedIntegration[]} */ (
      project.loadedIntegrations
    );

  const explicitPackages = loadedIntegrations
    .filter(integration => integration.components)
    .map(integration => ({
      name: integration.name,
      version: integration.version,
      category: integration.name,
      docsDir: integration.components,
    }));
  if (explicitPackages.length === 0) {
    return {packages: [], configured: loadedIntegrations.length > 0, project};
  }

  const packages = scanAllPackages(
    [],
    /** @type {ScannedPackage[]} */ (/** @type {unknown} */ (explicitPackages)),
  );
  return {packages, configured: true, project};
}

/**
 * Every integration the project loads, with what it adds. An integration with
 * no components root is included with `components: []`; one that failed to
 * load is left out (the integration-issues nudge and Doctor report it).
 *
 * @param {Project | undefined} project
 * @param {ScannedPackage[]} scanned the packages {@link discoverPackages} found
 * @returns {Promise<InstalledPackage[]>}
 */
export async function describeInstalled(project, scanned) {
  if (project == null) return scanned;
  const byName = new Map(scanned.map(pkg => [pkg.name, pkg]));
  /** @type {InstalledPackage[]} */
  const installed = [];
  for (const integration of project.loadedIntegrations) {
    if (integration.__loadError) continue;
    const base =
      byName.get(integration.name) ??
      /** @type {ScannedPackage} */ (
        /** @type {unknown} */ ({
          name: integration.name,
          category: integration.name,
          version: integration.version,
          components: [],
        })
      );
    // Components come from the scan above; loading every component doc again
    // here would only slow the list down.
    const {identities} = await collectIdentities({
      ...integration,
      components: undefined,
    });
    installed.push({
      ...base,
      templates: identities.templates.map(t => t.id),
      docs: identities.docs,
      themes: identities.themes.map(t => t.slug),
      codemods: identities.codemods.map(c => `${c.version}/${c.id}`),
    });
  }
  return installed;
}

/**
 * Whether the project has any discover source: its own `discover` config field,
 * or an integration's `discover` named export (valid or not).
 * @param {Project | undefined} project
 * @returns {boolean}
 */
export function hasSources(project) {
  if (project == null) return false;
  if (typeof project.config?.discover === 'function') return true;
  return project.loadedIntegrations.some(
    i => i.__discover != null || i.__discoverError != null,
  );
}

/**
 * Package names the project's package.json declares in any dependency field.
 * @param {Project | undefined} project
 * @returns {Set<string>}
 */
export function declaredDependencies(project) {
  /** @type {Set<string>} */
  const names = new Set();
  if (project == null) return names;
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(project.cwd, 'package.json'), 'utf8'),
    );
    for (const field of DEPENDENCY_FIELDS) {
      for (const name of Object.keys(pkg?.[field] ?? {})) names.add(name);
    }
  } catch {
    // No readable package.json: nothing is declared.
  }
  return names;
}

/**
 * The command that adds a package with the project's package manager. Discover
 * only prints it; it never runs it.
 * @param {Project | undefined} project
 * @returns {(name: string, version?: string) => string}
 */
export function addCommand(project) {
  const pm = detectPackageManager(project?.cwd ?? process.cwd());
  const verb =
    pm === 'pnpm'
      ? 'pnpm add'
      : pm === 'yarn'
        ? 'yarn add'
        : pm === 'bun'
          ? 'bun add'
          : 'npm install';
  return (name, version) => `${verb} ${version ? `${name}@${version}` : name}`;
}

/**
 * The per-user cache directory the saved copies live in, never inside a
 * project. Standard platform locations only.
 * @returns {string}
 */
export function defaultCacheDir() {
  const home = os.homedir();
  if (process.platform === 'win32') {
    return path.join(
      process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'),
      'astryx',
      'Cache',
    );
  }
  if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Caches', 'astryx');
  }
  return path.join(
    process.env.XDG_CACHE_HOME || path.join(home, '.cache'),
    'astryx',
  );
}

/**
 * @param {string} cacheDir
 * @param {string} from
 * @param {{package?: string, version?: string}} request
 */
function savedCopyPath(cacheDir, from, request) {
  const key = createHash('sha256')
    .update(`${from}\n${request.package ?? ''}\n${request.version ?? ''}`)
    .digest('hex')
    .slice(0, 32);
  const dir = path.join(cacheDir, 'discover');
  return assertWithin(`${key}.json`, dir, {label: 'discover saved copy'});
}

/**
 * @param {string} file
 * @param {string} label
 */
function readSavedCopy(file, label) {
  try {
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    return {
      savedAt: String(saved.savedAt),
      catalog: parseDiscoverCatalog(saved.catalog, label),
    };
  } catch {
    return null;
  }
}

/**
 * @param {string} file
 * @param {import('../../authoring/discover/type').DiscoverCatalog} catalog
 */
function writeSavedCopy(file, catalog) {
  try {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    const tmp = `${file}.${process.pid}.tmp`;
    fs.writeFileSync(
      tmp,
      JSON.stringify({savedAt: new Date().toISOString(), catalog}),
    );
    fs.renameSync(tmp, file);
  } catch {
    // An unwritable cache only costs the offline copy.
  }
}

/**
 * @param {DiscoverSource} source
 * @param {{package?: string, version?: string}} request
 * @param {string} label
 * @param {number} timeoutMs
 */
async function callSource(source, request, label, timeoutMs) {
  const controller = new AbortController();
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;
  const timedOut = new Promise((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(
        new Error(`${label} did not answer within ${timeoutMs / 1000} seconds`),
      );
    }, timeoutMs);
  });
  try {
    const answer = await Promise.race([
      Promise.resolve().then(() =>
        source({signal: controller.signal, ...request}),
      ),
      timedOut,
    ]);
    return parseDiscoverCatalog(answer, label);
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call every discover source — the project's `discover` first, then each
 * integration's in load order — once per distinct function. A source that
 * throws, times out, or returns an invalid catalog falls back to its saved copy;
 * with none, it is reported and adds nothing. The others always count.
 *
 * @param {Project | undefined} project
 * @param {{package?: string, version?: string}} [request] ask for one package,
 *   and optionally one version's contributions
 * @param {{cacheDir?: string, timeoutMs?: number}} [options]
 * @returns {Promise<CatalogResult>}
 */
export async function callSources(project, request = {}, options = {}) {
  const {cacheDir = defaultCacheDir(), timeoutMs = SOURCE_TIMEOUT_MS} = options;
  /** @type {CatalogResult} */
  const result = {sources: [], packages: []};
  if (project == null) return result;

  /** @type {Array<{from: string, source?: DiscoverSource, error?: string}>} */
  const origins = [];
  if (typeof project.config?.discover === 'function') {
    origins.push({from: 'astryx.config', source: project.config.discover});
  }
  for (const integration of project.loadedIntegrations) {
    if (integration.__discoverError) {
      origins.push({
        from: integration.name,
        error: integration.__discoverError,
      });
    } else if (integration.__discover) {
      origins.push({from: integration.name, source: integration.__discover});
    }
  }

  /** @type {Set<unknown>} */
  const called = new Set();
  /** @type {Set<string>} */
  const seen = new Set();
  const ask = request.package
    ? {
        package: request.package,
        ...(request.version ? {version: request.version} : {}),
      }
    : {};
  for (const {from, source, error} of origins) {
    if (source == null) {
      result.sources.push({name: from, from, status: 'failed', error});
      continue;
    }
    if (called.has(source)) continue;
    called.add(source);

    const label = `the discover source from ${from}`;
    const file = savedCopyPath(cacheDir, from, ask);
    /** @type {import('../../authoring/discover/type').DiscoverCatalog} */
    let catalog;
    try {
      catalog = await callSource(source, ask, label, timeoutMs);
      writeSavedCopy(file, catalog);
      result.sources.push({
        name: catalog.source.name,
        from,
        status: 'fresh',
        generatedAt: catalog.source.generatedAt,
        complete: catalog.source.complete,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const saved = readSavedCopy(file, label);
      if (saved == null) {
        result.sources.push({
          name: from,
          from,
          status: 'failed',
          error: message,
        });
        continue;
      }
      catalog = saved.catalog;
      result.sources.push({
        name: catalog.source.name,
        from,
        status: 'saved',
        generatedAt: catalog.source.generatedAt,
        complete: catalog.source.complete,
        savedAt: saved.savedAt,
        error: message,
      });
    }
    for (const pkg of catalog.packages) {
      if (seen.has(pkg.package)) continue;
      seen.add(pkg.package);
      result.packages.push({...pkg, source: catalog.source.name});
    }
  }
  return result;
}

/** The list and detail entry fields for each item kind, in display order. */
export const KIND_FIELDS = /** @type {const} */ ([
  ['component', 'components'],
  ['template', 'templates'],
  ['doc', 'docs'],
  ['theme', 'themes'],
  ['codemod', 'codemods'],
  ['agent-doc', 'agentDocs'],
]);

/**
 * Project a scanned or installed package into the discover list/detail entry
 * shape. Shared by the list and detail leaves so the entry keys (and their
 * order) stay in one place. A kind list appears only when it is not empty.
 * @param {InstalledPackage & {latest?: string}} pkg
 * @returns {import('./discover.type.mjs').DiscoverListEntry}
 */
export function toEntry(pkg) {
  /** @type {Record<string, unknown>} */
  const entry = {
    name: pkg.name,
    category: pkg.category,
    components: pkg.components,
    version: pkg.version,
    description: pkg.description,
    displayName: pkg.displayName,
  };
  for (const [, field] of KIND_FIELDS) {
    if (field === 'components') continue;
    const values = /** @type {Record<string, unknown>} */ (pkg)[field];
    if (Array.isArray(values) && values.length > 0) entry[field] = values;
  }
  if (pkg.latest) entry.latest = pkg.latest;
  return /** @type {import('./discover.type.mjs').DiscoverListEntry} */ (entry);
}

/**
 * Locate a component's doc file within the given packages (case-insensitive).
 * @param {ScannedPackage[]} packages
 * @param {string} name
 * @returns {ComponentResolution | null}
 */
export function findComponent(packages, name) {
  return findComponentInPackages(packages, name);
}

/**
 * Load and validate a resolved component's docs. Throws AstryxError
 * (ERR_INVALID_DOC) when the file fails to load or the docs are malformed.
 * Returns the (optionally translated) docs object itself; leaves wrap it in the
 * `discover.detail.doc` envelope.
 * @param {ComponentResolution} result
 * @param {{lang?: string | null, zh?: boolean}} opts
 * @returns {Promise<import('./discover.type.mjs').DiscoverDetailDocResponse['data']>}
 */
export async function loadValidatedDoc(result, {lang, zh}) {
  let docs;
  try {
    docs = await loadDocs(
      result.docPath,
      /** @type {{zh?: boolean, dense?: boolean, lang?: string}} */ ({
        zh,
        lang,
      }),
    );
  } catch (e) {
    throw new AstryxError(
      `Failed to load docs for ${result.componentName}: ${/** @type {any} */ (e).message}`,
      undefined,
      ERROR_CODES.ERR_INVALID_DOC,
    );
  }
  const err = validateDocs(docs);
  if (err)
    throw new AstryxError(
      `Invalid docs for ${result.componentName}: ${err}`,
      undefined,
      ERROR_CODES.ERR_INVALID_DOC,
    );
  return docs;
}
