// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discover.list leaf — list the discovered external packages.
 *
 * @position api/discover/list — pure projection of the packages resolved by
 *   ../_adapter into the discover.list envelope.
 */

import {toEntry} from '../_adapter.mjs';

/**
 * Build the discover.list response. An empty `packages` set produces the empty
 * envelope carrying `meta.configured`, so callers can distinguish "nothing
 * configured" from "configured but nothing discovered".
 *
 * @param {import('../../../lib/package-scanner.mjs').ScannedPackage[]} packages
 * @param {{configured: boolean}} meta
 * @returns {import('../../../types/discover').DiscoverListResponse}
 */
export function list(packages, {configured}) {
  if (packages.length === 0) {
    return {type: 'discover.list', data: [], meta: {configured}};
  }
  return {type: 'discover.list', data: packages.map(toEntry)};
}
