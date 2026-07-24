// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build command — thin wrapper around api/build.
 *
 *   astryx build                  → the PLAYBOOK (how to build a page)
 *   astryx build "<what>"         → a COMPOSITION KIT (closest page template,
 *                                   blocks, components) with a recommended START.
 *
 * All grouping/scoring lives in api/build; this file only parses flags and
 * renders. Command strings are prefixed for the caller's package manager here
 * (never in the API payload) via formatCliCommand/getCliInvocation.
 */

import {getCliInvocation, formatCliCommand} from '../../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {build as buildApi} from '../../api/build/build.mjs';

/**
 * Print the build playbook (shown when `build` is run with no query).
 * @param {string} run - The CLI invocation prefix (e.g. `npx astryx`).
 */
function printPlaybook(run) {
  const lines = [
    '',
    'How to build a page with Astryx',
    '',
    "1. Find a starting point for what you're building:",
    `     ${run} build "<what you're building>"`,
    '   → returns the closest [page] template, the [block]s that cover parts,',
    '     and the [component]s to fill the gaps, with a "Compose:" suggestion.',
    '',
    '2. If a [page] template matches → scaffold it and adapt:',
    `     ${run} template <name> [path]`,
    '',
    '3. If nothing matches exactly → compose:',
    `     ${run} template <name> --skeleton   # study a close page's layout`,
    `     ${run} template <BlockName>         # drop in each block from the kit`,
    `     ${run} component <Name>             # fill remaining gaps (read props)`,
    '',
    '4. Rules (keep it on-system):',
    '   - No <div>/raw HTML for layout — use VStack/HStack/Grid/Stack/Card etc.',
    `   - No style={{}} — use component props; design tokens via \`${run} docs tokens\`.`,
    '   - Wrap the app in <Theme theme={...}> and import core reset.css + astryx.css.',
    '',
    `Tip: \`${run} build "<idea>"\` is the fastest way in. For a neutral`,
    `lookup of any component/doc/template, use \`${run} search <query>\`.`,
    '',
  ];
  for (const l of lines) humanLog(l);
}

/**
 * @param {import('commander').Command} program
 */
export function registerBuild(program) {
  program
    .command('build [query]')
    .description('Build a page: composition kit for an idea, or the workflow playbook (no args)')
    .option('--type <domain>', 'Filter the kit to one domain (component|hook|template)')
    .option('--limit <n>', 'Max candidates to draw from (default 60)')
    .option('--detail', 'Verbose output (include import paths and match reason)')
    .action(async (/** @type {string | undefined} */ query, /** @type {{type?: import('../../types/search').SearchDomain, limit?: string, detail?: boolean}} */ options) => {
      const run = getCliInvocation();
      const json = program.opts().json || false;

      // No query → the playbook. Still routed through the API for the envelope.
      if (!query || !String(query).trim()) {
        const result = await buildApi(undefined, {cwd: process.cwd()});
        if (json) return jsonOut(result.type, result.data);
        printPlaybook(run);
        return;
      }

      // Arg validation stays in the CLI.
      let limit = 60;
      if (options.limit != null) {
        const parsed = Number.parseInt(options.limit, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          cliError(`Invalid --limit value "${options.limit}". Must be a positive integer.`);
          return;
        }
        limit = parsed;
      }

      /** @type {import('../../types/build').BuildKitResponse} */
      let result;
      try {
        result = /** @type {import('../../types/build').BuildKitResponse} */ (
          await buildApi(query, {cwd: process.cwd(), type: options.type, limit})
        );
      } catch (e) {
        const err = /** @type {import('../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      const {query: q, hasResults, directMatch, pages, blocks, domain, frame, foundation} =
        result.data;

      if (!hasResults) {
        humanLog('');
        humanLog(`No matches for "${q}".`);
        humanLog(`Try a broader term, or browse: ${run} component --list`);
        humanLog('');
        return;
      }

      const printItem = (/** @type {import('../../types/search').SearchResultEntry} */ r, /** @type {string} */ label) => {
        const display = r.domain === 'template' && r.displayName ? r.displayName : r.name;
        humanLog('');
        humanLog(`  [${label}] ${display}`);
        if (r.description) humanLog(`          ${r.description}`);
        humanLog(`          → ${formatCliCommand(r.command)}`);
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
        humanLog(`START → Scaffold the \`${pages[0].name}\` page template, then adapt: ${run} template ${pages[0].name} ./src/App.tsx`);
      } else if (pages.length) {
        humanLog(`START → No exact page template. Use \`${pages[0].name}\` as a layout reference (${run} template ${pages[0].name} --skeleton) and compose the pieces below.`);
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
      humanLog(`FRAME — page shell (always): ${frame.join(', ')}`);
      humanLog(`          full-page → AppShell; or Layout + SideNav/TopNav. ${run} component AppShell`);

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
      humanLog(`FOUNDATION — always available (layout/text/actions): ${foundation.join(' ')}`);

      // SETUP — so it renders / stays on-system.
      humanLog('');
      humanLog('SETUP — import "@astryxdesign/core/reset.css" + "astryx.css". No <div>/style for layout — use Stack/Grid + tokens.');
      humanLog('');
    });
}
