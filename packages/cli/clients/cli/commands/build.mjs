// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build command — thin wrapper with a stable result summary.
 *
 *   astryx build                  → the PLAYBOOK (how to build a page)
 *   astryx build "<what>"         → a COMPOSITION KIT (closest page template,
 *                                   blocks, components) with a recommended START.
 *
 * All grouping/scoring lives in api/build; this file only parses flags and
 * renders. Command strings are prefixed for the caller's package manager here
 * (never in the API payload) via formatCliCommand/getCliInvocation.
 */

import {
  getCliInvocation,
  formatCliCommand,
} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {resultSet, resultSetOf} from '../../../foundation/debug/index.mjs';
import {
  emit,
  section,
  text,
  list,
  record,
  records,
} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {build as buildApi} from '../../../api/build/build.mjs';
import {doc as buildCommand} from './build.doc.mjs';
import {doc as buildFn} from '../../../api/build/build.doc.mjs';

/**
 * Playbook commands as records whose field names are the JSON keys, so a
 * reader can grep `^command:`. The command is run with the caller's invocation.
 * @type {import('../formatters/index.mjs').RecordOptions}
 */
const COMMAND_RECORDS = {
  fields: ['command', 'purpose'],
  format: {command: command => formatCliCommand(command)},
};

/**
 * Emit the build playbook (shown when `build` is run with no query) — a
 * projection of the `build.help` data, so text and JSON carry the same steps.
 * @param {import('../../../api/build/build.type.mjs').BuildHelpResponse['data']} playbook
 */
function printPlaybook(playbook) {
  emit(
    section(playbook.title),
    ...playbook.steps.flatMap((step, i) => [
      section(`${i + 1}. ${step.title}`),
      records(step.commands, COMMAND_RECORDS),
      step.returns ? record({returns: step.returns}) : null,
    ]),
    section(`${playbook.steps.length + 1}. Rules (keep it on-system)`),
    list(playbook.rules),
    ...(playbook.related.length > 0
      ? [section('Related'), records(playbook.related, COMMAND_RECORDS)]
      : []),
  );
}

/**
 * @param {import('commander').Command} program
 */
export function registerBuild(program) {
  defineCommand(program, buildCommand, {
    fn: buildFn,
    action: async (
      /** @type {string | undefined} */ query,
      /** @type {{type?: import('../../../api/search/search.type.mjs').SearchDomain, limit?: string, verbose?: boolean}} */ options,
    ) => {
      const run = getCliInvocation();
      const json = program.opts().json || false;

      // No query → the playbook. Still routed through the API for the envelope.
      if (!query || !String(query).trim()) {
        const result =
          /** @type {import('../../../api/build/build.type.mjs').BuildHelpResponse} */ (
            await buildApi(undefined, {cwd: process.cwd()})
          );
        // The playbook is a document, not a lookup: one doc, always the same
        // one. Counting it as a result keeps "what did this run answer with"
        // true for the no-argument form too.
        const playbook = resultSet({count: 1, resultKind: 'doc'});
        if (json) {
          jsonOut(result);
          return playbook;
        }
        printPlaybook(result.data);
        return playbook;
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
        result =
          /** @type {import('../../../api/build/build.type.mjs').BuildKitResponse} */ (
            await buildApi(query, {
              cwd: process.cwd(),
              type: options.type,
              limit,
            })
          );
      } catch (e) {
        const err =
          /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        return cliError(err.message, {
          suggestions: err.suggestions,
          code: err.code,
        });
      }

      const {
        query: q,
        hasResults,
        matchCount,
        directMatch,
        pages,
        blocks,
        domain,
        frame,
        foundation,
        hint,
      } = result.data;
      // The kit spans domains, so its kind comes from the pieces themselves.
      // `frame` and `foundation` are always-on and deliberately excluded: they
      // are not what the query matched.
      const answered = resultSetOf([...pages, ...blocks, ...domain], {
        count: matchCount,
        empty: !hasResults,
        directMatch,
        fallbackKind: options.type ?? 'mixed',
      });

      if (json) {
        jsonOut(result);
        return answered;
      }

      if (!hasResults) {
        emit(
          text(`No matches for "${q}".`),
          text(`Try a broader term, or browse: ${run} component --list`),
        );
        return answered;
      }

      // Same JSON->text projection as search, but leaner: the section header
      // already says the kind, so drop `domain`/`import` by default (they're in
      // --json and under --verbose). Keeps each item to name/displayName/desc/cmd.
      const fields = options.verbose
        ? [
            'name',
            'domain',
            'displayName',
            'score',
            'reason',
            'import',
            'description',
            'command',
          ]
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
      // The legend promises the complete order, so a section emitted after it
      // has to be in it.
      if (hint) sectionsOrder.push('FEW MATCHES');

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
        section(
          'FRAME + FOUNDATION',
          'Always-available shell + layout/text/action primitives.',
        ),
        record({
          frame,
          foundation,
          setup:
            'import "@astryxdesign/core/reset.css" + "astryx.css"; no <div>/style for layout — use Stack/Grid + tokens',
        }),
      );

      // Last, so it is the line the reader leaves with — and only when the kit
      // was thin enough that "the package has nothing" is the wrong conclusion.
      // The commands arrive bare and are rendered through the project's own
      // invocation, so they are runnable as printed.
      if (hint) {
        out.push(
          section(
            'FEW MATCHES',
            `${hint.reason}\nBrowse instead:\n${hint.commands
              .map(c => formatCliCommand(c))
              .join('\n')}`,
          ),
        );
      }

      emit(...out);
      return answered;
    },
  });
}
