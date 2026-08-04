// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discover.search leaf — free-text search across external packages.
 *
 * Resolution order (matching the flat command exactly):
 *   1. exact component name  -> discover.detail.doc
 *   2. single substring hit  -> discover.detail.doc
 *   3. multiple substring hits -> discover.search
 *   4. fuzzy hits (distance <= 3) -> throw ERR_NOT_FOUND with suggestions
 *   5. otherwise             -> throw ERR_NOT_FOUND
 *
 * @position api/discover/search — projection over ../_adapter's resolver;
 *   delegates the single-component cases to ../detail/doc.
 */

import {findComponent} from '../_adapter.mjs';
import {docFromResult} from '../detail/doc/doc.mjs';
import {levenshteinDistance} from '../../../foundation/text/string-utils.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

/**
 * @typedef {import('../_package-scanner.mjs').ScannedPackage} ScannedPackage
 */

/**
 * Search all packages for `query` (a free-text term that never starts with
 * `@`). Resolves to a single component's docs when unambiguous, a search
 * response when several match, or throws AstryxError (ERR_NOT_FOUND) — with
 * fuzzy suggestions when any exist.
 *
 * @param {ScannedPackage[]} packages
 * @param {string} query
 * @param {{lang?: string | null, zh?: boolean}} opts
 * @returns {Promise<
 *   import('../discover.type.mjs').DiscoverDetailDocResponse |
 *   import('../discover.type.mjs').DiscoverSearchResponse
 * >}
 */
export async function search(packages, query, {lang, zh}) {
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

  const exact = findComponent(packages, query);
  if (exact) return await docFromResult(exact, {lang, zh});

  const substringMatches =
    /** @type {Array<{pkg: ScannedPackage, comp: string}>} */ ([]);
  for (const pkg of packages) {
    for (const comp of pkg.components) {
      if (comp.toLowerCase().includes(lower)) {
        substringMatches.push({pkg, comp});
      }
    }
  }

  if (substringMatches.length === 1) {
    const match = substringMatches[0];
    const result = findComponent([match.pkg], match.comp);
    if (result) return await docFromResult(result, {lang, zh});
  }

  if (substringMatches.length > 1) {
    return {
      type: 'discover.search',
      data: {
        query,
        matches: substringMatches.map(m => ({
          package: m.pkg.name,
          component: m.comp,
        })),
      },
    };
  }

  // Fuzzy fallback
  const allComponents =
    /** @type {Array<{pkg: ScannedPackage, comp: string}>} */ ([]);
  for (const pkg of packages) {
    for (const comp of pkg.components) {
      allComponents.push({pkg, comp});
    }
  }
  const fuzzyMatches = allComponents
    .map(item => ({
      ...item,
      distance: levenshteinDistance(lower, item.comp.toLowerCase()),
    }))
    .filter(m => m.distance <= 3)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  if (fuzzyMatches.length > 0) {
    throw new AstryxError(
      `"${query}" not found`,
      fuzzyMatches.map(m => ({
        name: m.pkg.name + '/' + m.comp,
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
