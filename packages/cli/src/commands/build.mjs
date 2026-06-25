// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build command — the page-building assistant.
 *
 * Two modes:
 *   astryx build                  → the PLAYBOOK: how to build a page with Astryx
 *   astryx build "<what>"         → a COMPOSITION KIT for what you're building:
 *                                   the closest page template (scaffold or layout
 *                                   reference), the blocks that cover parts, and
 *                                   the components to fill gaps, plus a one-line
 *                                   "Compose:" suggestion.
 *
 * `build` is the opinionated "assemble a page" verb. For a neutral lookup across
 * the whole CLI, use `astryx search <query>` instead.
 */

import {getRunPrefix} from '../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {search as searchApi} from '../api/search.mjs';

/** A page scoring at/above this is confident enough to call a direct match. */
const PAGE_DIRECT = 95;
/** Below this a page is too weak to even offer as a layout reference. */
const PAGE_FLOOR = 50;
/** Below this a block/domain-component match is incidental noise, not surfaced. */
const DOMAIN_FLOOR = 55;

/**
 * Always-surfaced primitives. Every page needs a shell + layout/typography/
 * action atoms, but these never keyword-match an idea ("dashboard" != "Stack"),
 * so search alone never returns them. We list them unconditionally so an agent
 * composing from scratch has the whole kit (esp. off-template).
 */
const FRAME = ['AppShell', 'TopNav', 'SideNav', 'Layout'];
const FOUNDATION = [
  'VStack', 'HStack', 'Grid', 'StackItem', 'Card', 'Section',
  'Text', 'Heading', 'Button', 'Icon', 'Badge', 'Divider',
];
const ALWAYS = new Set([...FRAME, ...FOUNDATION]);

/** Print the build playbook (shown when `build` is run with no query). */
function printPlaybook(run) {
  const lines = [
    '',
    'How to build a page with Astryx',
    '',
    "1. Find a starting point for what you're building:",
    `     ${run} astryx build "<what you're building>"`,
    '   → returns the closest [page] template, the [block]s that cover parts,',
    '     and the [component]s to fill the gaps, with a "Compose:" suggestion.',
    '',
    '2. If a [page] template matches → scaffold it and adapt:',
    `     ${run} astryx template <name> [path]`,
    '',
    '3. If nothing matches exactly → compose:',
    `     ${run} astryx template <name> --skeleton   # study a close page's layout`,
    `     ${run} astryx template <BlockName>         # drop in each block from the kit`,
    `     ${run} astryx component <Name>             # fill remaining gaps (read props)`,
    '',
    '4. Rules (keep it on-system):',
    '   - No <div>/raw HTML for layout — use VStack/HStack/Grid/Stack/Card etc.',
    '   - No style={{}} — use component props; design tokens via `astryx docs tokens`.',
    '   - Wrap the app in <Theme theme={...}> and import core reset.css + astryx.css.',
    '',
    `Tip: \`${run} astryx build "<idea>"\` is the fastest way in. For a neutral`,
    `lookup of any component/doc/template, use \`${run} astryx search <query>\`.`,
    '',
  ];
  for (const l of lines) humanLog(l);
}

export function registerBuild(program) {
  program
    .command('build [query]')
    .description('Build a page: composition kit for an idea, or the workflow playbook (no args)')
    .option('--type <domain>', 'Filter the kit to one domain (component|hook|template)')
    .option('--limit <n>', 'Max candidates to draw from (default 60)')
    .option('--detail', 'Verbose output (include import paths and match reason)')
    .action(async (query, options) => {
      const run = getRunPrefix();
      const json = program.opts().json || false;

      // No query → print the playbook (the "how to build" skill).
      if (!query || !String(query).trim()) {
        if (json) return jsonOut('build.help', {playbook: true});
        printPlaybook(run);
        return;
      }

      // Default to a deep pool so each role section has candidates after grouping.
      let limit = 60;
      if (options.limit != null) {
        const parsed = Number.parseInt(options.limit, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          cliError(`Invalid --limit value "${options.limit}". Must be a positive integer.`);
          return;
        }
        limit = parsed;
      }

      let result;
      try {
        result = await searchApi(query, {cwd: process.cwd(), type: options.type, limit});
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      const {query: q, results} = result.data;

      if (results.length === 0) {
        humanLog('');
        humanLog(`No matches for "${q}".`);
        humanLog(`Try a broader term, or browse: ${run} astryx component --list`);
        humanLog('');
        return;
      }

      // ── Group results by role (the build kit) ──────────────────────
      const pages = results
        .filter(r => r.domain === 'template' && r.kind !== 'block' && r.score >= PAGE_FLOOR)
        .slice(0, 3);
      const blocks = results
        .filter(r => r.domain === 'template' && r.kind === 'block' && r.score >= DOMAIN_FLOOR)
        .slice(0, 5);
      // Idea-specific atoms = matched components/hooks MINUS the always-on kit.
      const domain = results
        .filter(r => (r.domain === 'component' || r.domain === 'hook') && r.score >= DOMAIN_FLOOR && !ALWAYS.has(r.name))
        .slice(0, 6);
      const directMatch = pages.length > 0 && pages[0].score >= PAGE_DIRECT;

      const printItem = (r, label) => {
        const display = r.domain === 'template' && r.displayName ? r.displayName : r.name;
        humanLog('');
        humanLog(`  [${label}] ${display}`);
        if (r.description) humanLog(`          ${r.description}`);
        humanLog(`          → ${run} ${r.command}`);
        if (options.detail) {
          if (r.import) humanLog(`          import: ${r.import}`);
          humanLog(`          match: ${r.reason} (score ${r.score})`);
        }
      };

      humanLog('');
      humanLog(`Building "${q}":`);

      // START — the single recommended path.
      humanLog('');
      if (directMatch) {
        humanLog(`START → Scaffold the \`${pages[0].name}\` page template, then adapt: ${run} astryx template ${pages[0].name} ./src/App.tsx`);
      } else if (pages.length) {
        humanLog(`START → No exact page template. Use \`${pages[0].name}\` as a layout reference (${run} astryx template ${pages[0].name} --skeleton) and compose the pieces below.`);
      } else {
        humanLog(`START → No page template fits. Frame with AppShell and compose the blocks + components below.`);
      }

      // PAGE
      if (pages.length) {
        humanLog('');
        humanLog(directMatch ? 'PAGE TEMPLATE — direct match:' : 'CLOSEST PAGE TEMPLATES — layout reference:');
        pages.forEach(p => printItem(p, directMatch ? 'page' : 'closest'));
      }

      // FRAME — always (the page shell).
      humanLog('');
      humanLog(`FRAME — page shell (always): ${FRAME.join(', ')}`);
      humanLog(`          full-page → AppShell; or Layout + SideNav/TopNav. ${run} astryx component AppShell`);

      // BLOCKS — idea-specific composed patterns.
      if (blocks.length) {
        humanLog('');
        humanLog('BLOCKS — drop-in patterns that cover parts of it:');
        blocks.forEach(b => printItem(b, 'block'));
      }

      // DOMAIN COMPONENTS — idea-specific atoms.
      if (domain.length) {
        humanLog('');
        humanLog('DOMAIN COMPONENTS — specific to this idea:');
        domain.forEach(c => printItem(c, c.domain === 'hook' ? 'hook' : 'component'));
      }

      // FOUNDATION — always (layout/typography/actions).
      humanLog('');
      humanLog(`FOUNDATION — always available (layout/text/actions): ${FOUNDATION.join(' ')}`);

      // SETUP — so it renders / stays on-system.
      humanLog('');
      humanLog('SETUP — import "@astryxdesign/core/reset.css" + "astryx.css". No <div>/style for layout — use Stack/Grid + tokens.');
      humanLog('');
    });
}
