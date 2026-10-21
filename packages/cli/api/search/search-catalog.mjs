// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Search on a catalog that was gathered ahead of time: the browser
 * entry of `search`, exported as `@astryxdesign/cli/search`.
 *
 * `search()` gathers its candidates from disk (_adapter.mjs) and then ranks
 * them here, with `rankCatalog`. A site that cannot read the disk receives
 * the same candidates as JSON (`gatherSearchCatalog()`, built when
 * the site builds) and calls `searchCatalog()`, which runs the same ranking
 * code. Both answer with the same results, so the site never keeps a second
 * ranker. This module and everything it imports read no files and no
 * environment, so it bundles for the browser.
 *
 * @input  a query, search options, and a catalog from gatherSearchCatalog()
 * @output the same SearchResponse `search()` returns
 * @position packages/cli/api/search — exported as `@astryxdesign/cli/search`
 */

import {runTree} from '../../foundation/route/route.mjs';
import {AstryxError} from '../../foundation/response/astryx-error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {checkSearchArgs} from './_result.mjs';
import {SEARCH_TREE} from './tree.mjs';

/**
 * The shape version of a gathered catalog. It changes when the catalog's
 * fields change, so an old catalog is refused instead of misread.
 */
export const SEARCH_CATALOG_FORMAT = 1;

/**
 * @typedef {import('./_adapter.mjs').SearchCatalog} GatheredCatalog
 * @typedef {import('./search.type.mjs').SearchResponse} SearchResponse
 * @typedef {import('./search.type.mjs').SearchOptions} SearchOptions
 * @typedef {import('./search.type.mjs').SearchResultEntry} SearchResultEntry
 */

/**
 * A gathered catalog as plain JSON (see `gatherSearchCatalog()`). `type` is
 * the one domain it was gathered for, or null for every domain: a search on
 * it asks for the same `type`, since search gathers only the domain a typed
 * search names. `components` holds positions in `all`. `linked` maps
 * linkKey(package, description) to a component description whose doc links
 * are resolved, as `search()` resolves them.
 * @typedef {object} GatheredSearchCatalog
 * @property {number} format - SEARCH_CATALOG_FORMAT of the CLI that wrote it.
 * @property {string} version - The version of the CLI that wrote it.
 * @property {import('./_lexical.mjs').Candidate[]} all - Every candidate.
 * @property {number[]} components - Positions in `all` of the component candidates.
 * @property {boolean} searchedComponents - Whether components were gathered.
 * @property {boolean} outside - Whether it was gathered outside a project.
 * @property {string | null} coreSkipped - Why Core was skipped, when it was.
 * @property {import('./_adapter.mjs').SearchData} data - The tree's cards and weights.
 * @property {Record<string, string>} linked - Resolved component descriptions.
 * @property {import('./search.type.mjs').SearchDomain | null} type - The domain it was gathered for.
 */

/**
 * The key of one resolved description in a catalog's `linked` map.
 * @param {string | undefined} pkg
 * @param {string} description
 * @returns {string}
 */
export const linkKey = (pkg, description) => `${pkg ?? ''}\n${description}`;

/**
 * Ranks a gathered catalog: search's tree on the candidates. `search()` and
 * `searchCatalog()` both answer from this.
 * @param {string} query
 * @param {SearchOptions} options
 * @param {GatheredCatalog} catalog
 * @returns {Promise<SearchResponse>}
 */
export async function rankCatalog(query, options, catalog) {
  return /** @type {SearchResponse} */ (
    await runTree(SEARCH_TREE, {query, options}, catalog)
  );
}

/** @type {WeakMap<object, GatheredCatalog>} */
const hydrated = new WeakMap();

/**
 * The in-memory catalog a gathered JSON one holds. Read once per catalog object,
 * so the entry index search builds on its first query is reused.
 * @param {GatheredSearchCatalog} catalog
 * @returns {GatheredCatalog}
 */
function hydrate(catalog) {
  const hit = hydrated.get(catalog);
  if (hit) return hit;
  if (!catalog || catalog.format !== SEARCH_CATALOG_FORMAT) {
    throw new Error(
      `search catalog format ${catalog?.format} is not ${SEARCH_CATALOG_FORMAT}: gather it with the same CLI that searches it`,
    );
  }
  const {all} = catalog;
  const gathered = {
    all,
    components: catalog.components.map(i => all[i]),
    searchedComponents: catalog.searchedComponents,
    outside: catalog.outside,
    coreSkipped: catalog.coreSkipped,
    data: catalog.data,
  };
  hydrated.set(catalog, gathered);
  return gathered;
}

/**
 * Search on a gathered catalog, with no disk or network: the same ranking
 * and the same results `search()` returns for the project the catalog was
 * gathered from.
 *
 * @param {string} query - Free-text search term.
 * @param {Omit<SearchOptions, 'cwd'>} options - `limit`, and `type` when the catalog was gathered for that type, as `search()` takes them.
 * @param {GatheredSearchCatalog} catalog - From gatherSearchCatalog(), as parsed JSON.
 * @returns {Promise<SearchResponse>}
 */
export async function searchCatalog(query, options, catalog) {
  checkSearchArgs(query, options);
  if ((options.type ?? null) !== (catalog?.type ?? null)) {
    throw new AstryxError(
      `this search catalog was gathered for ${catalog?.type ? `type "${catalog.type}"` : 'every type'}; search it with the same type, or gather one for type "${options.type ?? 'every'}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const response = await rankCatalog(query, options, hydrate(catalog));
  const {linked} = catalog;
  const results = response.data.results.map(result =>
    result?.domain === 'component' &&
    typeof result.description === 'string' &&
    result.description.includes('{@link') &&
    Object.hasOwn(linked, linkKey(result.package, result.description))
      ? {
          ...result,
          description: linked[linkKey(result.package, result.description)],
        }
      : result,
  );
  response.data = {...response.data, results};
  return response;
}
