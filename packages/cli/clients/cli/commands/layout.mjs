// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layout command — thin CLI wrapper around api/layout.mjs.
 *
 * Subcommands:
 *   astryx layout expand "<expr>" [path]   compressed expression → validated TSX
 *   astryx layout check "<expr>"           validate + echo both canonical surfaces
 *   astryx layout grammar                  agent cheatsheet (alias table is branch-generated)
 *
 * The expression argument may also come from --file or stdin (`-`),
 * which is how multi-line outline (XLO) input usually arrives.
 *
 * The command surface (group + subcommand descriptions, args, flags) is sourced
 * from the colocated CommandDocs via `defineCommand`; this file supplies only the
 * actions.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, list, record, code, WARN} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {layoutExpand, layoutCheck, layoutGrammar} from '../../../api/layout/layout.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as layoutGroup} from './layout.doc.mjs';
import {doc as layoutExpandCommand} from './layout-expand.doc.mjs';
import {doc as layoutCheckCommand} from './layout-check.doc.mjs';
import {doc as layoutGrammarCommand} from './layout-grammar.doc.mjs';
import {doc as layoutExpandFn} from '../../../api/layout/layoutExpand.doc.mjs';
import {doc as layoutCheckFn} from '../../../api/layout/layoutCheck.doc.mjs';
import {doc as layoutGrammarFn} from '../../../api/layout/layoutGrammar.doc.mjs';

/**
 * The api layer's @returns for these functions widen the `type` discriminator
 * to `string`, so annotate the command-local result with the precise response
 * shapes from the colocated api/layout/layout.type.mjs so narrowing + jsonOut
 * typecheck.
 *
 * @typedef {import('../../../api/layout/layout.type.mjs').LayoutExpandResponse} LayoutExpandResponse
 * @typedef {import('../../../api/layout/layout.type.mjs').LayoutCheckResponse} LayoutCheckResponse
 * @typedef {import('../../../api/layout/layout.type.mjs').LayoutGrammarResponse} LayoutGrammarResponse
 */

/**
 * @typedef {object} LayoutExpandOptions
 * @property {string} [file]
 * @property {'compact'|'outline'|'auto'} [form]
 * @property {string} [name]
 * @property {boolean} [loose]
 */

/**
 * @typedef {object} LayoutCheckOptions
 * @property {string} [file]
 * @property {'compact'|'outline'|'auto'} [form]
 * @property {boolean} [loose]
 */

/**
 * Resolve the expression from arg, --file, or stdin ('-').
 * @param {string} [expr]
 * @param {{file?: string}} [options]
 * @returns {Promise<string>}
 */
async function readExpression(expr, options = {}) {
  if (options.file) {
    // Validate the file exists + is a regular file + is reasonably sized.
    // We intentionally do NOT confine the read path (the user running the CLI
    // controls --file; this is a read, not a write). The size cap prevents OOM
    // from infinite streams like /dev/zero.
    const filePath = path.resolve(process.cwd(), options.file);
    const stat = fs.statSync(filePath, {throwIfNoEntry: false});
    if (!stat || !stat.isFile()) {
      cliError(`File not found: ${options.file}`, {
        code: ERROR_CODES.ERR_FILE_NOT_FOUND,
      });
    }
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (stat.size > MAX_FILE_SIZE) {
      cliError(
        `File "${options.file}" is too large (${(stat.size / 1024 / 1024).toFixed(1)} MB, max 5 MB)`,
        {code: ERROR_CODES.ERR_FILE_NOT_FOUND},
      );
    }
    try {
      return fs.readFileSync(filePath, 'utf-8');
    } catch (e) {
      const errno = /** @type {NodeJS.ErrnoException} */ (e);
      if (errno && errno.code === 'ENOENT') {
        // A --file pointing at a missing file is foreseeable — surface a
        // stable code, not the raw ENOENT errno (and no stack in human mode).
        cliError(`File not found: ${options.file}`, {
          code: ERROR_CODES.ERR_FILE_NOT_FOUND,
        });
      }
      throw e;
    }
  }
  if (expr === '-') {
    /** @type {Buffer[]} */
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(/** @type {Buffer} */ (chunk));
    return Buffer.concat(chunks).toString('utf-8');
  }
  return expr ?? '';
}

/**
 * @param {import('commander').Command} program
 */
export function registerLayout(program) {
  const layoutCmd = defineCommand(program, layoutGroup);

  defineCommand(layoutCmd, layoutExpandCommand, {
    fn: layoutExpandFn,
    action: async (/** @type {string} */ expression, /** @type {string} */ targetPath, /** @type {LayoutExpandOptions} */ options) => {
      const json = program.opts().json || false;
      const source = await readExpression(expression, options);
      if (!source || source.trim() === '') {
        cliError(
          'No layout expression given — pass it as an argument, via --file, or on stdin',
          {code: ERROR_CODES.ERR_MISSING_ARGUMENT},
        );
        return;
      }
      /** @type {LayoutExpandResponse} */
      let result;
      try {
        result = /** @type {LayoutExpandResponse} */ (await layoutExpand(source, {
          targetPath,
          form: options.form,
          loose: options.loose || false,
          name: options.name,
          cwd: process.cwd(),
        }));
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }
      if (json) return jsonOut(result);

      /** @type {import('../formatters/index.mjs').Block[]} */
      const out = [];
      if (result.data.warnings.length > 0) {
        out.push(text(result.data.warnings.map(w => `${WARN} ${w}`).join('\n')));
      }
      if (result.data.written) {
        out.push(
          text(`[ok] Expanded to ${result.data.written}`),
          record(
            {
              components: result.data.componentsUsed,
              todos:
                result.data.todos.length > 0
                  ? `${result.data.todos.length} (search for "TODO(xle)")`
                  : '',
            },
            {labels: {components: 'Components', todos: 'TODOs'}},
          ),
        );
      } else {
        // Raw expanded TSX (no target path) — preformatted, emitted verbatim.
        out.push(code(result.data.code));
      }
      emit(...out);
    },
  });

  defineCommand(layoutCmd, layoutCheckCommand, {
    fn: layoutCheckFn,
    action: async (/** @type {string} */ expression, /** @type {LayoutCheckOptions} */ options) => {
      const json = program.opts().json || false;
      const source = await readExpression(expression, options);
      if (!source || source.trim() === '') {
        cliError(
          'No layout expression given — pass it as an argument, via --file, or on stdin',
          {code: ERROR_CODES.ERR_MISSING_ARGUMENT},
        );
        return;
      }
      /** @type {LayoutCheckResponse} */
      let result;
      try {
        result = /** @type {LayoutCheckResponse} */ (await layoutCheck(source, {
          form: options.form,
          loose: options.loose || false,
          cwd: process.cwd(),
        }));
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }
      // Exit code is the contract and must NOT depend on --json vs human: an
      // invalid (but parseable) layout exits 1 in BOTH modes so `layout check`
      // works as a CI gate / agent check without parsing stdout. Decide it
      // before the JSON return (parity with doctor / validate-integration).
      if (!result.data.valid) process.exitCode = 1;

      if (json) return jsonOut(result);

      const {valid, form, errors, warnings, compact, outline} = result.data;
      if (!valid) {
        // Each error: the formatted issue, with a hanging "did you mean" line.
        const items = errors.map(e =>
          e.suggestions && e.suggestions.length > 0
            ? [e.formatted, `did you mean: ${e.suggestions.join(', ')}?`]
            : [e.formatted],
        );
        emit(
          text(`[fail] Invalid (${errors.length} error${errors.length === 1 ? '' : 's'}):`),
          list(items),
        );
        return;
      }

      /** @type {import('../formatters/index.mjs').Block[]} */
      const out = [text(`[ok] Valid (parsed as ${form})`)];
      if (warnings.length > 0) {
        out.push(text(warnings.map(w => `${WARN} ${w}`).join('\n')));
      }
      // The canonical compact/outline surfaces are preformatted — emit verbatim.
      out.push(section('compact'), code(compact), section('outline'), code(outline));
      emit(...out);
    },
  });

  defineCommand(layoutCmd, layoutGrammarCommand, {
    fn: layoutGrammarFn,
    action: async () => {
      const json = program.opts().json || false;
      /** @type {LayoutGrammarResponse} */
      let result;
      try {
        result = /** @type {LayoutGrammarResponse} */ (await layoutGrammar({cwd: process.cwd()}));
      } catch (e) {
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }
      if (json) return jsonOut(result);
      // The cheatsheet is a preformatted document — emit verbatim.
      emit(code(result.data.text));
    },
  });
}
