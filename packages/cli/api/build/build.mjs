// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build API — the "assemble a page" assistant, as data.
 *
 * `build()` with no query signals the workflow playbook (`build.help`). With a
 * query it runs the unified search and groups the results into a composition
 * KIT (`build.kit`): the closest page templates, the blocks that cover parts,
 * and the domain components to fill gaps, plus the always-on frame + foundation.
 *
 * The kit carries RAW `SearchResultEntry` objects and static name arrays only —
 * never pre-formatted command strings. All CLI prefixing (formatCliCommand /
 * getCliInvocation) and the section prose live in the command renderer, so the
 * JSON shape stays package-manager-agnostic and stable across environments.
 */

import {search} from '../search/search.mjs';

/** A page at/above this score is a confident direct match. */
const PAGE_DIRECT = 95;
/** Below this a page is too weak to offer even as a layout reference. */
const PAGE_FLOOR = 50;
/** Below this a block/domain-component match is incidental noise. */
const DOMAIN_FLOOR = 55;

/**
 * Always-surfaced primitives. Every page needs a shell + layout/typography/
 * action atoms, but these never keyword-match an idea ("dashboard" != "Stack"),
 * so search alone never returns them. Kept here (not the renderer) because they
 * are ALSO used to exclude these names from the idea-specific `domain` group.
 */
const FRAME = ['AppShell', 'TopNav', 'SideNav', 'Layout'];
const FOUNDATION = [
  'VStack', 'HStack', 'Grid', 'StackItem', 'Card', 'Section',
  'Text', 'Heading', 'Button', 'Icon', 'Badge', 'Divider',
];
const ALWAYS = new Set([...FRAME, ...FOUNDATION]);

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
    return {type: 'build.help', data: {playbook: true}};
  }

  const {cwd = process.cwd(), type, limit = 60} = options;
  // search()'s JSDoc @returns widens results to object[]; the SearchResponse
  // shape is the contract (api.d.ts). Cast locally rather than tightening the
  // search @returns (a separate follow-up).
  const result = /** @type {import('../../types/search').SearchResponse} */ (
    await search(query, {cwd, type, limit})
  );
  const results = result.data.results;

  const pages = results
    .filter(r => r.domain === 'template' && r.kind !== 'block' && r.score >= PAGE_FLOOR)
    .slice(0, 3);
  const blocks = results
    .filter(r => r.domain === 'template' && r.kind === 'block' && r.score >= DOMAIN_FLOOR)
    .slice(0, 5);
  const domain = results
    .filter(
      r =>
        (r.domain === 'component' || r.domain === 'hook') &&
        r.score >= DOMAIN_FLOOR &&
        !ALWAYS.has(r.name),
    )
    .slice(0, 6);
  const directMatch = pages.length > 0 && pages[0].score >= PAGE_DIRECT;

  return {
    type: 'build.kit',
    data: {
      query: result.data.query,
      // Distinguishes "search found nothing" (renderer shows "No matches")
      // from a weak-but-non-empty result set (renderer still shows the kit).
      hasResults: results.length > 0,
      directMatch,
      pages,
      blocks,
      domain,
      frame: FRAME,
      foundation: FOUNDATION,
    },
  };
}
