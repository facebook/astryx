// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Environment adapter for search: locating the Core a search reads,
 * including the network install and npm subprocess that fetch a release's
 * own Core outside a project (spec AST-081 FR3; architecture:cli-surface
 * INV21).
 *
 * @input  the folder a search runs in
 * @output the Core folder a search reads
 * @position packages/cli/api/search — imported by search.mjs only
 */

import {requireCoreDir} from '../../foundation/fs/paths.mjs';

/**
 * The Core a typed search reads: the project's, else the release's own,
 * installed into the per-user cache first when needed. Throws as
 * requireCoreDir does.
 * @param {string} cwd
 * @returns {string}
 */
export function requireSearchCoreDir(cwd) {
  return requireCoreDir(cwd);
}
