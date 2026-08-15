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

import {getCliInvocation, formatCliCommand} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, record, records, ARROW} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {build as buildApi} from '../../../api/build/build.mjs';
import {doc as buildCommand} from './build.doc.mjs';
import {doc as buildFn} from '../../../api/build/build.doc.mjs';

/**
 * Emit the build playbook (shown when `build` is run with no query).
 * @param {string} run - The CLI invocation prefix (e.g. `npx astryx`).
 */
function printPlaybook(run) {
  emit(
    section('How to build a page with Astryx'),
    text(
      [
        "1. Find a starting point for what you're building:",
        `     ${run} build "<what you're building>"`,
        `   ${ARROW} returns the closest [page] template, the [block]s that cover parts,`,
        '     and the [component]s to fill the gaps, with a "Compose:" suggestion.',
      ].join('\n'),
    ),
    text(
      [
        `2. If a [page] template matches ${ARROW} scaffold it and adapt:`,
        `     ${run} template <name> [path]`,
      ].join('\n'),
    ),
    text(
      [
        `3. If nothing matches exactly ${ARROW} compose:`,
        `     ${run} template <name> --skeleton   # study a close page's layout`,
        `     ${run} template <BlockName>         # drop in each block from the kit`,
        `     ${run} component <Name>             # fill remaining gaps (read props)`,
      ].join('\n'),
    ),
    text(
      [
        '4. Rules (keep it on-system):',
        '   - No <div>/raw HTML for layout — use VStack/HStack/Grid/Stack/Card etc.',
        `   - No style={{}} — use component props; design tokens via \`${run} docs tokens\`.`,
        '   - Wrap the app in <Theme theme={...}> and import core reset.css + astryx.css.',
      ].join('\n'),
    ),
    text(
      `Tip: \`${run} build "<idea>"\` is the fastest way in. For a neutral ` +
        `lookup of any component/doc/template, use \`${run} search <query>\`.`,
    ),
  );
}

/**
 * @param {import('commander').Command} program
 */
export function registerBuild(program) {
  defineCommand(program, buildCommand, {
    fn: buildFn,
    action: async (/** @type {string | undefined} */ query, /** @type {{type?: import('../../../api/search/search.type.mjs').SearchDomain, limit?: string, verbose?: boolean}} */ options) => {
      const run = getCliInvocation();
      const json = program.opts().json || false;

      // No query → the playbook. Still routed through the API for the envelope.
      if (!query || !String(query).trim()) {
        const result = await buildApi(undefined, {cwd: process.cwd()});
        if (json) return jsonOut(result);
        printPlaybook(run);
        return;
      }

      // Arg validation stays in the CLI.
      // Parse --limit to a number; the API validates it (positive integer) and
      // throws ERR_INVALID_ARGUMENT, so we pass NaN through rather than
      // pre-rejecting with a generic code here (parity with `search`).
      const limit =
        options.limit != null ? Number.parseInt(options.limit, 10) : 60;

      /** @type {import('../../../api/build/build.type.mjs').BuildKitResponse} */
      let result;
      try {
        result = /** @type {import('../../../api/build/build.type.mjs').BuildKitResponse} */ (
          await buildApi(query, {cwd: process.cwd(), type: options.type, limit})
        );
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions, code: err.code});
        return;
      }

      if (json) return jsonOut(result);

      const {query: q, hasResults, directMatch, pages, blocks, domain, frame, foundation} =
        result.data;

      if (!hasResults) {
        emit(
          text(`No matches for "${q}".`),
          text(`Try a broader term, or browse: ${run} component --list`),
        );
        return;
      }

      // Same JSON->text projection as search, but leaner: the section header
      // already says the kind, so drop `domain`/`import` by default (they're in
      // --json and under --verbose). Keeps each item to name/displayName/desc/cmd.
      const fields = options.verbose
        ? ['name', 'domain', 'displayName', 'score', 'reason', 'import', 'description', 'command']
        : ['name', 'displayName', 'description', 'command'];
      /** @type {import('../formatters/index.mjs').RecordOptions} */
      const recordOpts = {fields, format: {command: formatCliCommand}};

      // `template <name> <path>` scaffolds into your project; <path> is the file
      // (or folder) to write it to — a placeholder, since we can't know your
      // layout. `--skeleton` and `component <Name>` just print, so no path.
      const startCmd = directMatch
        ? `${run} template ${pages[0].name} <path>`
        : pages.length
          ? `${run} template ${pages[0].name} --skeleton`
          : `${run} component AppShell`;
      const startNote = directMatch
        ? `This \`${pages[0].name}\` page template appears to be the closest to what you want, so we recommend scaffolding it into your project — replace \`<path>\` with the file (or folder) to write it to — then adapting. Otherwise, browse PAGE TEMPLATES first, then BLOCKS and DOMAIN COMPONENTS below.`
        : pages.length
          ? `No exact match, but \`${pages[0].name}\` is the closest page template — run the above to print its layout as a reference, then compose. Otherwise, browse PAGE TEMPLATES first, then BLOCKS and DOMAIN COMPONENTS below.`
          : 'No page template fits — frame with AppShell, then compose from BLOCKS and DOMAIN COMPONENTS below.';

      // A short legend up top: what this output is, how to use it, and the exact
      // order of the sections below (only the ones actually present) so it reads
      // clearly and parses predictably.
      const sectionsOrder = ['RECOMMENDED START'];
      if (pages.length) sectionsOrder.push('PAGE TEMPLATES');
      if (blocks.length) sectionsOrder.push('BLOCKS');
      if (domain.length) sectionsOrder.push('DOMAIN COMPONENTS');
      sectionsOrder.push('FRAME + FOUNDATION');

      /** @type {import('../formatters/index.mjs').Block[]} */
      const out = [
        section(`Build kit for "${q}"`),
        text(
          'A recommended set of pieces to assemble this page, in the order to use them. ' +
            'Begin with RECOMMENDED START, then pull from the sections below — each ' +
            'recommended item includes a `command:` to run next.\n' +
            `Sections in order: ${sectionsOrder.join(', ')}.`,
        ),
        section('RECOMMENDED START', `${startNote}\n${startCmd}`),
      ];

      if (pages.length) {
        out.push(
          section(
            'PAGE TEMPLATES',
            directMatch
              ? 'Closest full-page templates — scaffold one, then adapt it.'
              : 'Closest full-page templates — use as a layout reference.',
          ),
          records(pages, recordOpts),
        );
      }
      if (blocks.length) {
        out.push(
          section('BLOCKS', 'Drop-in patterns that cover parts of the page.'),
          records(blocks, recordOpts),
        );
      }
      if (domain.length) {
        out.push(
          section('DOMAIN COMPONENTS', 'Components specific to this idea.'),
          records(domain, recordOpts),
        );
      }

      out.push(
        section('FRAME + FOUNDATION', 'Always-available shell + layout/text/action primitives.'),
        record({
          frame,
          foundation,
          setup:
            'import "@astryxdesign/core/reset.css" + "astryx.css"; no <div>/style for layout — use Stack/Grid + tokens',
        }),
      );

      emit(...out);
    },
  });
}
