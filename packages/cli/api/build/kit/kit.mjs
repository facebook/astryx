// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build.kit leaf — the page template to start from, and the kit around it.
 *
 * Every kit names a page template to START from: the page the page ranker
 * (rank.mjs) puts first when it has the evidence to lead, else the app shell.
 * The ranker is the only thing that picks the start, so one noisy signal —
 * search matching "site" to a gallery's "side" — cannot choose the page. A
 * template carries the page frame, the spacing, and the section rhythm; a page
 * composed from components carries none of that, so the kit never recommends
 * composing from scratch while a template exists. Next to the start it names
 * the ranker's next two templates, then groups the unified search into the
 * blocks that cover parts and the domain components to fill gaps, plus the
 * always-on frame + foundation names. `pages` and `directMatch` keep search's
 * own view for callers that read them.
 *
 * The kit carries RAW `SearchResultEntry` objects and static name arrays only —
 * never pre-formatted command strings. All CLI prefixing (formatCliCommand /
 * getCliInvocation) and the section prose live in the command renderer, so the
 * JSON shape stays package-manager-agnostic and stable across environments.
 *
 * Two commands are the kit's own: `start.command`, the scaffold (`astryx
 * template <id> --type page <path>`, with `<path>` a placeholder), and the `--skeleton`
 * a page entry carries when it is not a direct match, so a loose page reads
 * as a layout preview rather than the thing to build. Neither is prefixing —
 * the invocation stays the renderer's job.
 */

import {search, searchedComponents} from '../../search/search.mjs';
import {findCoreDir} from '../../../foundation/fs/paths.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {getResultCoverage} from '../../search/coverage.mjs';
import {loadComponents, loadPageTemplates, loadWeights} from '../_adapter.mjs';
import {
  asksForNewPage,
  ideaKind,
  pickAlternatives,
  pickStart,
  rankPages,
} from './rank.mjs';
import {weighStart} from './weights.mjs';

/** A page at/above this score is a confident direct match. */
const PAGE_DIRECT = 95;
/** Below this a page is too weak to offer at all. */
const PAGE_FLOOR = 50;
/**
 * Below this a block/domain-component match is incidental noise. A single
 * description word in a multi-word idea scores 50 plus at most 7.5 of coverage
 * garnish, so it stays below; a name or keyword hit clears it. `build "weekly
 * brief"` used to offer Toast, Popover and TextInput because their
 * descriptions say "brief".
 */
const DOMAIN_FLOOR = 60;
/**
 * How much of a multi-word query a page must cover to be offered on breadth.
 *
 * Score alone cannot carry this. A page's derived keywords include every
 * component its source renders, so `build "actionable warning banner"` once
 * scored `login`, `contact-form` and `documentation-design` at 95 apiece — an
 * exact hit on "banner" alone, plus the coverage garnish. Matching one of
 * three concepts is not the same claim as matching three.
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
 * Where a page starts when no page template matched: the first of these the
 * project can scaffold. A top nav over empty, full-width content is the least
 * opinionated frame that still has navigation; `blank` is the floor, with no
 * chrome at all. Either one still hands the reader a page frame and its
 * padding, which composing from components does not.
 */
const FALLBACK_STARTS = ['shell-top-nav', 'blank'];

/**
 * Always-surfaced primitives. Every page needs a shell + layout/typography/
 * action atoms, but these never keyword-match an idea ("dashboard" != "Stack"),
 * so search alone never returns them. Kept here (not the renderer) because they
 * are ALSO used to exclude these names from the idea-specific `domain` group.
 * Every page template already uses them.
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
 * @typedef {import('../../search/search.type.mjs').SearchResultEntry} SearchResultEntry
 * @typedef {import('../build.type.mjs').BuildStart} BuildStart
 * @typedef {import('../_adapter.mjs').PageTemplate} PageTemplate
 */

/**
 * A page template as the kit names it: the command that selects exactly that
 * template, scaffolding into `<path>`, a placeholder for the file or folder to
 * write it to.
 * @param {PageTemplate} t
 */
const asTemplate = t => ({
  name: t.name,
  displayName: t.displayName,
  description: t.description,
  command: `${t.command} <path>`,
});

/**
 * Why a part of a page, or a change to a page the builder already has, starts
 * where it does (spec:AST-048/FR3, FR9): the rest of the start's reason, or
 * null for a whole page.
 * @param {import('./rank.mjs').IdeaKind} kind
 * @param {boolean} inPage whether the start is the page the idea names
 * @returns {string | null}
 */
function placement(kind, inPage) {
  if (kind === 'edit')
    return 'the idea changes a page you already have, so keep it and add blocks to it; a new page starts from the app shell.';
  if (kind === 'part')
    return inPage
      ? 'the idea is a part of a page, so it starts from the page it names.'
      : 'the idea is a part of a page and names no page, so it starts from the app shell.';
  return null;
}

/**
 * The template to start from: the ready page the ranker puts first when it
 * has the evidence to lead, else the first fallback shell the project can
 * scaffold. Null only when the project has no page template to offer at all.
 *
 * `direct` means two independent signals agree: the ranker's pick is also
 * search's direct match. The ranker sees only ready templates, so a template
 * still marked not ready is never the start; when search matched one directly
 * the reason names it, so the reader knows why the kit starts elsewhere.
 *
 * @param {import('./rank.mjs').RankedPage[]} ranked
 * @param {import('./rank.mjs').IdeaKind} kind
 * @param {SearchResultEntry[]} pages
 * @param {boolean} directMatch
 * @param {PageTemplate[]} catalog
 * @param {string} idea
 * @returns {Omit<BuildStart, 'alternatives'> | null}
 */
function chooseStart(ranked, kind, pages, directMatch, catalog, idea) {
  const direct = directMatch ? pages[0].name : null;
  const unready =
    direct && !catalog.some(t => t.name === direct) ? direct : null;
  // The reason never denies a match the same response reports: a direct
  // match the ranker outweighed is named, and so are the loose page matches
  // search listed when the kit falls back to the shell.
  const loose = pages.map(p => `\`${p.name}\``).join(', ');
  /**
   * A part's or an edit's reason, naming a direct match that is not the start.
   * @param {string} place
   * @param {string} startName
   */
  const placed = (place, startName) =>
    direct && direct !== startName
      ? `Search matched \`${direct}\` by name, but ${place}`
      : place[0].toUpperCase() + place.slice(1);
  // The ranker proposes a start; the checked-in word weights, blended with the
  // ranker's scores, decide it (weights.mjs). Without weights the ranker's
  // pick stands; a shell start keeps the shell the ranker named, if any, and
  // never replaces a template the ranker chose when search matched one by name.
  const proposed = pickStart(ranked, kind);
  const weighed = weighStart(idea, ranked, proposed, catalog, {
    weights: loadWeights(),
    newPage: asksForNewPage(idea, catalog),
  });
  const pick =
    weighed === undefined
      ? proposed
      : weighed === null
        ? proposed?.family === 'Shell' || (proposed && direct && !unready)
          ? proposed
          : null
        : (ranked.find(r => r.name === weighed) ?? proposed);
  const closest = pick && catalog.find(t => t.name === pick.name);
  if (pick && closest) {
    const agrees = closest.name === direct;
    const place = placement(kind, pick.base && pick.familyNamed);
    return {
      ...asTemplate(closest),
      basis: agrees ? 'direct' : 'closest',
      reason: unready
        ? `\`${unready}\` matches but is not ready yet; this is the closest ready template.`
        : place
          ? placed(place, closest.name)
          : agrees
            ? 'Matches the idea.'
            : direct
              ? `Search matched \`${direct}\` by name, but this template fits more of the idea.`
              : 'The closest template; none is exactly this page.',
    };
  }
  for (const id of FALLBACK_STARTS) {
    const shell = catalog.find(t => t.name === id);
    if (shell) {
      // The shell can also be the ranker's best guess without the evidence to
      // lead ("horizontal site navigation"); say so rather than "no match".
      const nearest = ranked[0]?.name === shell.name && ranked[0].hits > 0;
      const place = placement(kind, false);
      return {
        ...asTemplate(shell),
        basis: 'fallback',
        reason: unready
          ? `\`${unready}\` matches but is not ready yet, so start from the app shell.`
          : place
            ? placed(place, shell.name)
            : direct
              ? `Search matched \`${direct}\` by name, but too little of the idea fits it, so start from the app shell.`
              : nearest
                ? 'No template is a clear match; the app shell is the closest.'
                : loose
                  ? `Search matched ${loose} only loosely, so start from the app shell.`
                  : 'No template matched, so start from the app shell.',
      };
    }
  }
  return null;
}

/**
 * The page template to start from, and the kit around it.
 *
 * @param {string} query what you're building (e.g. "analytics dashboard")
 * @param {{cwd?: string, type?: import('../../search/search.type.mjs').SearchDomain, limit?: number}} [options]
 * @returns {Promise<import('../build.type.mjs').BuildKitResponse>}
 */
export async function buildKit(query, options = {}) {
  const {cwd = process.cwd(), type, limit = 60} = options;
  // A kit is built from Core's components, hooks, and templates. An open
  // search without core covers the docs alone, so the kit asks for core here.
  if (type !== 'doc' && !findCoreDir(cwd)) {
    throw new AstryxError(
      'Could not find @astryxdesign/core package',
      undefined,
      ERROR_CODES.ERR_CORE_NOT_FOUND,
    );
  }
  // search()'s JSDoc @returns widens results to object[]; the SearchResponse
  // shape is the contract (api/search/search.type.mjs). Cast locally rather than
  // tightening the search @returns (a separate follow-up).
  const result =
    /** @type {import('../../search/search.type.mjs').SearchResponse} */ (
      await search(query, {
        cwd,
        type,
        // Search wider than the surfaced kit so a flood of doc matches cannot
        // bury the page templates past the cutoff; the caller's `limit` still
        // caps the kit below. A non-positive or non-integer limit is passed
        // through unchanged so search rejects it (ERR_INVALID_ARGUMENT).
        limit:
          Number.isInteger(limit) && limit > 0 ? Math.max(limit, 200) : limit,
      })
    );
  const results = result.data.results;
  // The TOTAL number of matches, not the number that survived `limit`. The kit
  // below is deliberately small (≤3 pages, ≤5 blocks, ≤6 components) and
  // `results` is itself capped, so every other count here is a cap; this is the
  // one field that says how much the query actually matched.
  const matchCount = result.data.matchCount;

  /**
   * Did this result answer enough of the query to stand as a page on breadth?
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

  const matchedPages = results
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
  const directMatch =
    matchedPages.length > 0 && matchedPages[0].score >= PAGE_DIRECT;

  /**
   * On a loose match, a page entry's `command` previews the layout rather
   * than printing the whole template: `--skeleton` gives the shape without
   * presenting the page as the thing to build. The recommendation itself is
   * `start`, which always scaffolds. Copied rather than mutated: these entries
   * come from `search()` and are not this function's to modify.
   */
  const pages = directMatch
    ? matchedPages
    : matchedPages.map(page => ({
        ...page,
        command: `${page.command} --skeleton`,
      }));

  // The caller's `limit` caps the surfaced kit, even though the search above
  // ran wider to find templates that a flood of doc matches would otherwise
  // bury past the cutoff. Keep pages first, then blocks, then components.
  let budget = limit;
  /**
   * @template T
   * @param {T[]} arr
   * @returns {T[]}
   */
  const toLimit = arr => {
    const out = arr.slice(0, Math.max(0, budget));
    budget -= out.length;
    return out;
  };
  const pagesKept = toLimit(pages);
  const blocksKept = toLimit(blocks);
  const domainKept = toLimit(domain);

  // A kit narrowed to components or hooks has no page to start from; every
  // other kit does, so the reader is never left to compose a page from scratch.
  const wantsPages = !type || type === 'template';
  const catalog = wantsPages ? await loadPageTemplates(cwd) : [];
  const ranked = wantsPages ? rankPages(query, catalog) : [];
  // A part of a page starts where it lives (spec:AST-048/FR3); the project's
  // own components say what a part is. The search above already gathered them
  // unless it was narrowed to templates.
  const kind = wantsPages
    ? ideaKind(
        query,
        catalog,
        searchedComponents(result) ?? (await loadComponents(cwd)),
      )
    : 'page';
  const chosen = wantsPages
    ? chooseStart(ranked, kind, matchedPages, directMatch, catalog, query)
    : null;
  // Name the ranker's next two templates beside the start: the reader judges
  // meaning better than keywords do, and an acceptable template is in these
  // three far more often than it is the start alone.
  /** @type {BuildStart | null} */
  const start = chosen && {
    ...chosen,
    alternatives: pickAlternatives(ranked, chosen.name).flatMap(r => {
      const t = catalog.find(c => c.name === r.name);
      return t ? [asTemplate(t)] : [];
    }),
  };

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
    pagesKept.length + blocksKept.length + domainKept.length < THIN_KIT
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
      // Distinguishes "search found nothing" from a weak-but-non-empty result
      // set. Either way the kit still names a template to start from.
      hasResults: matchCount > 0,
      matchCount,
      directMatch,
      start,
      pages: pagesKept,
      blocks: blocksKept,
      domain: domainKept,
      frame: FRAME,
      foundation: FOUNDATION,
      hint,
    },
  };
}
