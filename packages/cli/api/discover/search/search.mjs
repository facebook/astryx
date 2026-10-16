// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discover.search leaf — free-text search across installed packages and,
 * when the project has discover sources, everything it could add.
 *
 * A free-text query always answers with a list, so its response type depends
 * on the form of the query and never on what the project has:
 *   1. any matches                -> discover.search
 *   2. fuzzy hits (distance <= 3) -> throw ERR_NOT_FOUND with suggestions
 *   3. otherwise                  -> throw ERR_NOT_FOUND
 * Matches are installed components, the project's other installed items,
 * packages, and every item a source lists for a package the project could add.
 * A caller opens one item by its package path, which ../detail answers.
 *
 * @position api/discover/search — pure ranking over the installed component
 *   names and ../_catalog-view's search items.
 */

import {levenshteinDistance} from '../../../foundation/text/string-utils.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {DISCOVER_KINDS} from '../../../authoring/discover/parse.mjs';

/**
 * @typedef {import('../_package-scanner.mjs').ScannedPackage} ScannedPackage
 * @typedef {import('../_catalog-view.mjs').SearchItem} SearchItem
 */

const KIND_ORDER = ['package', ...DISCOVER_KINDS];

/**
 * How well an item matches: 0 exact name, 1 name prefix, 2 name substring,
 * 3 title, summary, keyword, or description; null for no match.
 * @param {SearchItem} item
 * @param {string} lower
 * @returns {number | null}
 */
function rank(item, lower) {
  const name = item.name.toLowerCase();
  if (name === lower) return 0;
  if (name.startsWith(lower)) return 1;
  if (name.includes(lower)) return 2;
  const text = [
    item.title,
    item.summary,
    item.description,
    ...(item.keywords ?? []),
  ]
    .filter(Boolean)
    .join('\n')
    .toLowerCase();
  if (text.includes(lower)) return 3;
  // Typo tolerance: same minimum-length guards as search (api/search/search.mjs).
  // A one-edit miss is a typo only on words long enough that one edit rarely
  // makes a different real word.
  const dist = levenshteinDistance(lower, name);
  if (dist >= 1 && dist <= 3) {
    /** @type {Record<number, number>} */
    const MIN_LENGTHS = {1: 5, 2: 8, 3: 11};
    if (Math.min(lower.length, name.length) >= MIN_LENGTHS[dist]) return 4;
  }
  return null;
}

/**
 * Search all packages for `query` (a free-text term that never starts with
 * `@`). Resolves to a search response when anything matches, even a single
 * item or an exact component name, or throws AstryxError (ERR_NOT_FOUND) —
 * with fuzzy suggestions when any exist.
 *
 * @param {ScannedPackage[]} packages installed packages
 * @param {string} query
 * @param {{
 *   items?: SearchItem[],
 *   type?: import('../../../authoring/discover/type').DiscoverKind,
 *   only?: 'installed' | 'available',
 *   limit?: number,
 * }} opts
 * @returns {Promise<import('../discover.type.mjs').DiscoverSearchResponse>}
 */
export async function search(packages, query, opts) {
  const {items = [], type, only, limit} = opts;
  // An empty query must error, not match every component via `.includes('')`
  // (parity with the api/search leaf). The discover() dispatcher already routes
  // an empty query to list, but the leaf must be safe on its own.
  if (!query || !String(query).trim()) {
    throw new AstryxError(
      'A search query is required',
      [{name: 'astryx discover button', reason: 'example'}],
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const lower = query.toLowerCase();

  /** @type {SearchItem[]} */
  const installedComponents = packages.flatMap(pkg =>
    pkg.components.map(name => ({
      package: pkg.name,
      kind: /** @type {const} */ ('component'),
      name,
      installed: true,
    })),
  );

  const ranked = [...installedComponents, ...items]
    .filter(item => (type == null ? true : item.kind === type))
    .filter(item =>
      only === 'installed'
        ? item.installed
        : only === 'available'
          ? !item.installed
          : true,
    )
    .map(item => ({item, score: rank(item, lower)}))
    .filter(
      /** @returns {m is {item: SearchItem, score: number}} */
      m => m.score != null,
    )
    .sort(
      (a, b) =>
        a.score - b.score ||
        Number(b.item.installed) - Number(a.item.installed) ||
        KIND_ORDER.indexOf(a.item.kind) - KIND_ORDER.indexOf(b.item.kind) ||
        a.item.package.localeCompare(b.item.package) ||
        a.item.name.localeCompare(b.item.name),
    );

  if (ranked.length > 0) {
    const matches = ranked.map(({item}) => ({
      package: item.package,
      component: item.name,
      kind: item.kind,
      installed: item.installed,
      ...(item.title ? {title: item.title} : {}),
      ...(item.summary ? {summary: item.summary} : {}),
    }));
    const shown = limit == null ? matches : matches.slice(0, limit);
    return {
      type: 'discover.search',
      data: {
        query,
        matches: shown,
        ...(shown.length < matches.length ? {total: matches.length} : {}),
      },
    };
  }

  // Fuzzy fallback over installed components.
  const fuzzyMatches = installedComponents
    .map(entry => ({
      ...entry,
      distance: levenshteinDistance(lower, entry.name.toLowerCase()),
    }))
    .filter(m => m.distance <= 3)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (fuzzyMatches.length > 0) {
    throw new AstryxError(
      `"${query}" not found`,
      fuzzyMatches.map(m => ({
        name: m.package + '/' + m.name,
        reason: 'similar name',
      })),
      ERROR_CODES.ERR_NOT_FOUND,
    );
  }

  throw new AstryxError(
    `"${query}" not found in any package`,
    undefined,
    ERROR_CODES.ERR_NOT_FOUND,
  );
}
