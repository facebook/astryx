// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build API — dispatcher + barrel for the "assemble a page" assistant.
 *
 * `build()` with no query signals the workflow playbook (`build.help`). With a
 * query it runs the unified search and groups the results into a composition
 * KIT (`build.kit`). Each shape is projected by its own leaf; this file only
 * routes to the leaves and re-exports them, keeping the SAME `build` export so
 * api/index.mjs and the CLI consumer stay unchanged.
 *
 *   no query  → build.help  (api/build/help/help.mjs)
 *   a query   → build.kit   (api/build/kit/kit.mjs)
 */

import {buildHelp} from './help/help.mjs';
import {buildKit} from './kit/kit.mjs';

// Barrel: surface the leaves alongside the dispatcher for the fractal shape.
export {buildHelp, buildKit};

/**
 * The page-building assistant. No query → the playbook signal; a query → the
 * grouped composition kit.
 *
 * @param {string} [query] what you're building (e.g. "analytics dashboard")
 * @param {{cwd?: string, type?: import('../../types/search').SearchDomain, limit?: number}} [options]
 * @returns {Promise<import('../../types/build').BuildHelpResponse | import('../../types/build').BuildKitResponse>}
 */
export async function build(query, options = {}) {
  if (!query || !String(query).trim()) {
    return buildHelp();
  }
  return buildKit(query, options);
}
