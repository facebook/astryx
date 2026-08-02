// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discover.detail leaf — browse one external package (@scope/name).
 *
 * @position api/discover/detail — pure projection over the packages resolved by
 *   ../_adapter; throws AstryxError (ERR_UNKNOWN_PACKAGE) for an unknown scope.
 */

import {toEntry} from '../_adapter.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

/**
 * Build the discover.detail response for a scoped package name. Throws
 * AstryxError (ERR_UNKNOWN_PACKAGE) — with the available packages as
 * suggestions — when no package matches.
 *
 * @param {import('../_package-scanner.mjs').ScannedPackage[]} packages
 * @param {string} query scoped package name, e.g. `@scope/name`
 * @returns {import('../discover.type.mjs').DiscoverDetailResponse}
 */
export function detail(packages, query) {
  const pkg = packages.find(p => p.name === query);
  if (!pkg) {
    throw new AstryxError(
      `Package "${query}" not found`,
      packages.map(p => ({name: p.name, reason: 'available package'})),
      ERROR_CODES.ERR_UNKNOWN_PACKAGE,
    );
  }
  return {type: 'discover.detail', data: toEntry(pkg)};
}
