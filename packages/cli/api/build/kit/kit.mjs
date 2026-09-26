// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build.kit leaf — the grouped composition kit and raw match count.
 *
 * Runs the unified search for the query and groups the results into a
 * composition KIT: the closest page templates, the blocks that cover parts,
 * and the domain components to fill gaps, plus the always-on frame + foundation.
 *
 * The kit carries RAW `SearchResultEntry` objects and static name arrays only —
 * never pre-formatted command strings. All CLI prefixing (formatCliCommand /
 * getCliInvocation) and the section prose live in the command renderer, so the
 * JSON shape stays package-manager-agnostic and stable across environments.
 *
 * The one adjustment it makes is on a page's `command`: when the top page is
 * not a direct match the kit appends `--skeleton`, so the field agrees with
 * the recommendation the kit itself computed. That is still not prefixing —
 * the invocation stays the renderer's job.
 */

import {search} from '../../search/search.mjs';
import {getResultCoverage} from '../../search/coverage.mjs';

/** A page at/above this score is a confident direct match. */
const PAGE_DIRECT = 95;
/** Below this a page is too weak to offer even as a layout reference. */
const PAGE_FLOOR = 50;
/** Below this a block/domain-component match is incidental noise. */
const DOMAIN_FLOOR = 55;
/**
 * How much of a multi-word query a result must cover to be offered as a PAGE.
 *
 * Score alone cannot carry this. A page's keywords include every component its
 * source renders, so `build "actionable warning banner"` scored `login`,
 * `contact-form` and `documentation-design` at 95 apiece — an exact keyword hit
 * (90) on "banner" alone, plus the coverage garnish, lands exactly on
 * PAGE_DIRECT. Three pages that are not warnings, presented as a direct match,
 * because each happens to render a Banner somewhere.
 *
 * Coverage has to gate rather than garnish: matching one of three concepts is
 * not the same claim as matching three.
 */
const PAGE_COVERAGE = 0.5;
/**
 * Fewer offerable results than this and the kit says how to look further.
 *
 * Three is the point below which a kit stops being a starting point. An agent
 * that reads a near-empty kit does not conclude "my wording was wrong" — it
 * concludes the package has nothing and falls back on its own memory of what
 * Astryx contains, which is exactly the failure `build` exists to prevent.
 */
const THIN_KIT = 3;

/**
 * Always-surfaced primitives. Every page needs a shell + layout/typography/
 * action atoms, but these never keyword-match an idea ("dashboard" != "Stack"),
 * so search alone never returns them. Kept here (not the renderer) because they
 * are ALSO used to exclude these names from the idea-specific `domain` group.
 */
const FRAME = ['AppShell', 'TopNav', 'SideNav', 'Layout'];
const FOUNDATION = [
  'VStack',
  'HStack',
  'Grid',
  'StackItem',
  'Card',
  'Section',
  'Text',
  'Heading',
  'Button',
  'Icon',
  'Badge',
  'Divider',
];
const ALWAYS = new Set([...FRAME, ...FOUNDATION]);

/**
 * The grouped composition kit for what you're building.
 *
 * @param {string} query what you're building (e.g. "analytics dashboard")
 * @param {{cwd?: string, type?: import('../../search/search.type.mjs').SearchDomain, limit?: number}} [options]
 * @returns {Promise<import('../build.type.mjs').BuildKitResponse>}
 */
export async function buildKit(query, options = {}) {
  const {cwd = process.cwd(), type, limit = 60} = options;
  // search()'s JSDoc @returns widens results to object[]; the SearchResponse
  // shape is the contract (api/search/search.type.mjs). Cast locally rather than
  // tightening the search @returns (a separate follow-up).
  const result =
    /** @type {import('../../search/search.type.mjs').SearchResponse} */ (
      await search(query, {cwd, type, limit})
    );
  const results = result.data.results;
  // The TOTAL number of matches, not the number that survived `limit`. The kit
  // below is deliberately small (≤3 pages, ≤5 blocks, ≤6 components) and
  // `results` is itself capped, so every other count here is a cap; this is the
  // one field that says how much the query actually matched.
  const matchCount = result.data.matchCount;

  /**
   * Did this result answer enough of the query to stand as a page?
   * Single-concept queries have nothing to cover, so they always pass. Coverage
   * stays in a module-private WeakMap and never enters public search/build JSON.
   * @param {object} r
   */
  const covers = r => {
    const coverage = getResultCoverage(r);
    const total = coverage?.total ?? 1;
    if (total <= 1) return true;
    return (coverage?.matched ?? 0) / total >= PAGE_COVERAGE;
  };

  const pages = results
    .filter(
      r =>
        r.domain === 'template' &&
        r.kind !== 'block' &&
        r.score >= PAGE_FLOOR &&
        covers(r),
    )
    .slice(0, 3);
  const blocks = results
    .filter(
      r =>
        r.domain === 'template' &&
        r.kind === 'block' &&
        r.score >= DOMAIN_FLOOR,
    )
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

  /**
   * On a loose match, recommend reading the layout rather than scaffolding it.
   *
   * A page entry's `command` is what a caller runs next, and it was always the
   * scaffold command — `template <name>` — even when the kit had just decided
   * the top page was NOT a direct match. The renderer already says the right
   * thing to a human in that case: RECOMMENDED START prints
   * `template <name> --skeleton` and the PAGE TEMPLATES heading reads "use as
   * a layout reference". But prose is not what a program reads. A JSON caller
   * takes `command` and gets the scaffold, so the two audiences were given
   * opposite advice from the same kit.
   *
   * That matters most for the caller least able to notice. `template <name>`
   * emits the whole page, and an agent handed a full template it did not quite
   * ask for tends to adapt it anyway — which is how a request for one thing
   * comes back as a competent version of another. `--skeleton` gives the
   * layout without the invitation.
   *
   * Copied rather than mutated: these entries come from `search()` and are not
   * this function's to modify.
   */
  const recommendedPages = directMatch
    ? pages
    : pages.map(page => ({...page, command: `${page.command} --skeleton`}));

  // What to try when the kit comes back thin. Keyword search over a design
  // system misses in a predictable way — the reader's words and the package's
  // often do not overlap — so name the two commands that browse rather than
  // search, and say plainly that this is not semantic matching.
  //
  // STRUCTURED, not prose: `commands` are bare subcommands, because the API
  // cannot know how the caller invokes the CLI. Baking `astryx component
  // --list` into the text hands a pnpm-workspace reader a command that does
  // not resolve — the same defect `getCliInvocation` exists to prevent, and
  // the renderer applies it. A JSON caller gets the parts, not a sentence.
  const hint =
    pages.length + blocks.length + domain.length < THIN_KIT
      ? {
          reason:
            'Few matches. This is keyword search, not semantic — try other wordings.',
          commands: ['component --list', 'template --list'],
        }
      : undefined;

  return {
    type: 'build.kit',
    data: {
      query: result.data.query,
      // Distinguishes "search found nothing" (renderer shows "No matches")
      // from a weak-but-non-empty result set (renderer still shows the kit).
      hasResults: matchCount > 0,
      matchCount,
      directMatch,
      pages: recommendedPages,
      blocks,
      domain,
      frame: FRAME,
      foundation: FOUNDATION,
      hint,
    },
  };
}
