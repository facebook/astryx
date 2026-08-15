// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file cdn command — Commander wiring for `astryx cdn` (template).
 *
 * Thin CLI wrapper, the same shape as `theme template`: the leaf lives in
 * ../../../api/cdn/template/template.mjs and this file only renders the receipt
 * and maps AstryxError → cliError. The command surface (descriptions, args,
 * flags) is sourced from the colocated CommandDocs via `defineCommand`.
 *
 * Usage:
 *   astryx cdn template
 *   astryx cdn template public/demo.html --overwrite
 */

import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, text} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {cdnTemplate} from '../../../api/cdn/template/template.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as cdnGroup} from './cdn.doc.mjs';
import {doc as cdnTemplateCommand} from './cdn-template.doc.mjs';
import {doc as cdnTemplateFn} from '../../../api/cdn/cdnTemplate.doc.mjs';

/**
 * @param {import('commander').Command} program
 */
export function registerCdn(program) {
  const cdn = defineCommand(program, cdnGroup, {
    action: (
      /** @type {unknown} */ options,
      /** @type {import('commander').Command} */ cmd,
    ) => {
      // Parent group has no default behaviour. An unknown subcommand (e.g.
      // `astryx cdn bogus`) arrives as a positional in cmd.args — exit 1 with
      // the list of real ones.
      const extras = (cmd && cmd.args) || [];
      if (extras.length > 0) {
        const unknown = String(extras[0]);
        const known = (cdn.commands || []).map(c => c.name());
        cliError(`unknown subcommand 'cdn ${unknown}'`, {
          suggestions: known.map(name => ({
            name,
            reason: 'available subcommand',
          })),
          code: ERROR_CODES.ERR_UNKNOWN_SUBCOMMAND,
        });
        return;
      }
      // Bare `astryx cdn` — show the subcommand list. Exit 0 (help is success).
      cdn.help();
    },
  });

  defineCommand(cdn, cdnTemplateCommand, {
    fn: cdnTemplateFn,
    action: (
      /** @type {string | undefined} */ targetPath,
      /** @type {{overwrite?: boolean}} */ options,
    ) => {
      const json = program.opts().json || false;

      /** @type {import('../../../api/cdn/cdn.type.mjs').CdnTemplateResponse} */
      let result;
      try {
        result = cdnTemplate({
          targetPath,
          overwrite: options.overwrite,
          cwd: process.cwd(),
        });
      } catch (e) {
        const err =
          /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {
          suggestions: err.suggestions || [],
          code: err.code,
        });
        return;
      }

      if (json) return jsonOut(result);

      if (!result.data.written) {
        emit(
          text(`[skip] ${result.data.path} already exists — left as is.`),
          text('Pass --overwrite to replace it with a fresh copy.'),
        );
        return;
      }
      emit(
        text(`[ok] Wrote ${result.data.path}`),
        text(
          `Open it in a browser — no bundler, no install, no build step. Every CDN URL is pinned to ${result.data.version}, and the annotations mark the parts that are load-bearing.`,
        ),
      );
    },
  });
}
