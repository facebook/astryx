// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the discover command — dispatcher + barrel.
 *
 * `discover()` browses the integrations a project has and, through discover
 * sources, the ones it could add. It only reads: the package manager installs.
 * Its job is to resolve the project and its sources (via ./_adapter) and route
 * to the leaf that owns each response shape:
 *
 *   discover                         -> ./list/list.mjs        discover.list
 *   discover <package>[@<version>]   -> ./detail/detail.mjs    discover.detail
 *   discover <package>/<Component>   -> ./detail/doc/doc.mjs   discover.detail.doc
 *   discover <package>/<item>        -> ./detail/item/item.mjs discover.item
 *   discover <words>                 -> ./search/search.mjs    discover.search (always a list)
 *
 * Source results are additive: they ride in `meta.available`/`meta.sources`,
 * in extra fields, or as extra search matches, so every existing field keeps
 * its meaning.
 *
 * @position api/discover — thin router over ./_adapter, ./_catalog-view, and
 *   the discover leaves.
 */

import {
  addCommand,
  callSources,
  declaredDependencies,
  describeInstalled,
  discoverPackages,
  findComponent,
  hasSources,
} from './_adapter.mjs';
import {
  availableEntries,
  catalogState,
  searchItems,
  withLatest,
} from './_catalog-view.mjs';
import {list} from './list/list.mjs';
import {detail} from './detail/detail.mjs';
import {doc, docFromResult} from './detail/doc/doc.mjs';
import {item} from './detail/item/item.mjs';
import {search} from './search/search.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {DISCOVER_KINDS} from '../../authoring/discover/parse.mjs';

const DEFAULT_LIMIT = 20;

/** @type {import('./_adapter.mjs').CatalogResult} */
const NO_CATALOG = {sources: [], packages: []};

/**
 * Split a package-shaped query: `name`, `name@version`, or `name/item`, with an
 * optional `@scope/` prefix on the name.
 * @param {string} query
 * @returns {{scoped: boolean, name: string, version?: string, item?: string}}
 */
function splitTarget(query) {
  const scoped = query.startsWith('@');
  const firstSlash = query.indexOf('/');
  let head = query;
  /** @type {string | undefined} */
  let rest;
  const split = scoped
    ? firstSlash < 0
      ? -1
      : query.indexOf('/', firstSlash + 1)
    : firstSlash;
  if (split > 0) {
    head = query.slice(0, split);
    rest = query.slice(split + 1) || undefined;
  }
  const at = head.indexOf('@', 1);
  return {
    scoped,
    name: at > 0 ? head.slice(0, at) : head,
    ...(at > 0 && head.slice(at + 1) ? {version: head.slice(at + 1)} : {}),
    ...(rest ? {item: rest} : {}),
  };
}

/**
 * @param {{type?: unknown, installed?: boolean, available?: boolean, limit?: unknown}} options
 */
function checkOptions({type, installed, available, limit}) {
  if (
    type != null &&
    !(/** @type {readonly unknown[]} */ (DISCOVER_KINDS).includes(type))
  ) {
    throw new AstryxError(
      `Unknown --type "${String(type)}"`,
      DISCOVER_KINDS.map(kind => ({name: kind, reason: 'item kind'})),
      ERROR_CODES.ERR_INVALID_OPTION,
    );
  }
  if (installed && available) {
    throw new AstryxError(
      '--installed and --available cannot be used together',
      undefined,
      ERROR_CODES.ERR_INVALID_OPTION,
    );
  }
  if (
    limit != null &&
    !(typeof limit === 'number' && Number.isInteger(limit) && limit > 0)
  ) {
    throw new AstryxError(
      `--limit must be a positive integer, not "${String(limit)}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_OPTION,
    );
  }
}

/**
 * @param {string} [query]
 * @param {import('./discover.type.mjs').DiscoverOptions} [options]
 * @returns {Promise<
 *   import('./discover.type.mjs').DiscoverListResponse |
 *   import('./discover.type.mjs').DiscoverDetailResponse |
 *   import('./discover.type.mjs').DiscoverDetailDocResponse |
 *   import('./discover.type.mjs').DiscoverItemResponse |
 *   import('./discover.type.mjs').DiscoverSearchResponse
 * >}
 */
export async function discover(query, options = {}) {
  const {lang = null, zh = false, type, limit} = options;
  checkOptions(options);
  const only = options.installed
    ? /** @type {const} */ ('installed')
    : options.available
      ? /** @type {const} */ ('available')
      : undefined;

  const {packages: scanned, configured, project} = await discoverPackages();
  const withSources = hasSources(project);
  const packages = await describeInstalled(project, scanned);
  const declared = declaredDependencies(project);
  const add = addCommand(project);

  /** @param {{package?: string, version?: string}} [request] */
  const catalogFor = async request =>
    withSources ? await callSources(project, request) : NO_CATALOG;

  // No query, or nothing to look through: the list.
  if (!query || (packages.length === 0 && !withSources)) {
    if (!withSources) return list(packages, {configured, type, only});
    const catalog = await catalogFor();
    return list(withLatest(packages, catalog), {
      configured,
      type,
      only,
      available: availableEntries(catalog, packages, declared),
      sources: catalog.sources,
    });
  }

  // A non-string (truthy) query would crash the parsing below with a raw
  // TypeError (no ERR_* code → downgrades to ERR_UNKNOWN). The CLI only ever
  // passes a string, but the public API must fail with a code.
  if (typeof query !== 'string') {
    throw new AstryxError(
      `Invalid query "${String(query)}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  const target = splitTarget(query);
  const installedNames = new Set(packages.map(p => p.name));

  /**
   * One package, one version, or one item, once `target.name` is known to be
   * a package the project or a source has.
   * @param {import('./_adapter.mjs').CatalogResult} catalog
   */
  const packageView = async catalog => {
    const entry = catalog.packages.find(p => p.package === target.name);
    const installedAs = entry
      ? catalogState(entry, installedNames, declared).installedAs
      : undefined;
    const context = {catalog: entry, version: target.version, add, installedAs};
    if (!target.item) return detail(packages, target.name, context);
    const found = item(packages, target.name, target.item, context);
    if (found) return found;
    return await doc(packages, target.name, target.item, {lang, zh});
  };

  // An installed component keeps resolving to its full doc, before any source
  // is asked anything.
  const installedPkg = packages.find(p => p.name === target.name);
  if (installedPkg && target.item && !target.version) {
    const resolved = findComponent([installedPkg], target.item);
    if (resolved) return await docFromResult(resolved, {lang, zh});
  }

  if (target.scoped) {
    return await packageView(
      await catalogFor({package: target.name, version: target.version}),
    );
  }

  const listing = await catalogFor();
  const isPackage =
    installedPkg != null ||
    listing.packages.some(p => p.package === target.name);
  if (isPackage && (target.version || target.item || target.name === query)) {
    return await packageView(
      await catalogFor({package: target.name, version: target.version}),
    );
  }

  return await search(packages, query, {
    items: searchItems(packages, listing, declared),
    type,
    only,
    limit: limit ?? DEFAULT_LIMIT,
  });
}
