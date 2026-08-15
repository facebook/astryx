// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the discover command — dispatcher + barrel.
 *
 * `discover()` keeps the exact same signature and response union it always had,
 * so `api/index.mjs` and the CLI consumer are untouched. Its only job now is to
 * discover the external packages (via ./_adapter) and route to the leaf that
 * owns each response shape:
 *
 *   discover.list        -> ./list/list.mjs
 *   discover.detail      -> ./detail/detail.mjs
 *   discover.detail.doc  -> ./detail/doc/doc.mjs
 *   discover.search      -> ./search/search.mjs
 *
 * @position api/discover — thin router over ./_adapter + the discover leaves.
 */

import {discoverPackages} from './_adapter.mjs';
import {list} from './list/list.mjs';
import {detail} from './detail/detail.mjs';
import {doc} from './detail/doc/doc.mjs';
import {search} from './search/search.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/**
 * @param {string} [query]
 * @param {object} [options]
 * @param {boolean} [options.components]
 * @param {string} [options.lang]
 * @param {boolean} [options.zh]
 * @returns {Promise<
 *   import('./discover.type.mjs').DiscoverListResponse |
 *   import('./discover.type.mjs').DiscoverDetailResponse |
 *   import('./discover.type.mjs').DiscoverDetailDocResponse |
 *   import('./discover.type.mjs').DiscoverSearchResponse
 * >}
 */
export async function discover(query, options = {}) {
  const {lang = null, zh = false} = options;
  const {packages, configured} = await discoverPackages();

  // No discoverable packages — either nothing configured, or configured but
  // empty. The list leaf owns the empty envelope + `configured` flag. This
  // short-circuits before query parsing, exactly as the flat command did.
  if (packages.length === 0) return list(packages, {configured});

  // No query: the full package list.
  if (!query) return list(packages, {configured});

  // A non-string (truthy) query would crash `.startsWith`/`.indexOf` below
  // with a raw TypeError (no ERR_* code → downgrades to ERR_UNKNOWN). The CLI
  // only ever passes a string, but the public API must fail with a code.
  if (typeof query !== 'string') {
    throw new AstryxError(
      `Invalid query "${String(query)}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }

  // Scoped package query: @scope/name or @scope/name/Component
  if (query.startsWith('@')) {
    const slashIdx = query.indexOf('/', query.indexOf('/') + 1);
    if (slashIdx > 0) {
      const pkgName = query.slice(0, slashIdx);
      const compName = query.slice(slashIdx + 1);
      return await doc(packages, pkgName, compName, {lang, zh});
    }
    return detail(packages, query);
  }

  // Free-text search across all packages.
  return await search(packages, query, {lang, zh});
}
