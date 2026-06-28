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
 */

import * as fs from 'node:fs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {layoutExpand, layoutCheck, layoutGrammar} from '../api/layout.mjs';

/** Resolve the expression from arg, --file, or stdin ('-'). */
async function readExpression(expr, options) {
  if (options.file) return fs.readFileSync(options.file, 'utf-8');
  if (expr === '-' || (!expr && !process.stdin.isTTY)) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    return Buffer.concat(chunks).toString('utf-8');
  }
  return expr;
}

export function registerLayout(program) {
  const layoutCmd = program
    .command('layout')
    .description('Generate XDS layouts from compressed expressions (XLE/XLO)');

  layoutCmd
    .command('expand [expression] [path]')
    .description('Expand a layout expression into validated XDS TSX')
    .option('--file <file>', 'Read the expression from a file')
    .option('--form <form>', 'Input surface: compact, outline, or auto', 'auto')
    .option('--name <name>', 'Generated component name (PascalCase)', 'GeneratedLayout')
    .option('--loose', 'Downgrade unknown {block} hints to TODO placeholders')
    .action(async (expression, targetPath, options) => {
      const json = program.opts().json || false;
      const source = await readExpression(expression, options);
      if (!source || source.trim() === '') {
        cliError('No layout expression given — pass it as an argument, via --file, or on stdin');
        return;
      }
      let result;
      try {
        result = await layoutExpand(source, {
          targetPath,
          form: options.form,
          loose: options.loose || false,
          name: options.name,
          cwd: process.cwd(),
        });
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions || [], code: e.code});
        return;
      }
      if (json) return jsonOut(result.type, result.data);

      for (const warning of result.data.warnings) humanLog(`⚠ ${warning}`);
      if (result.data.written) {
        humanLog(`\n✓ Expanded to ${result.data.written}`);
        humanLog(`  Components: ${result.data.componentsUsed.join(', ')}`);
        if (result.data.todos.length > 0) {
          humanLog(`  TODOs: ${result.data.todos.length} (search for "TODO(xle)")`);
        }
        humanLog('');
      } else {
        humanLog(result.data.code);
      }
    });

  layoutCmd
    .command('check [expression]')
    .description('Validate a layout expression and echo canonical compact/outline forms')
    .option('--file <file>', 'Read the expression from a file')
    .option('--form <form>', 'Input surface: compact, outline, or auto', 'auto')
    .option('--loose', 'Downgrade unknown {block} hints to TODO placeholders')
    .action(async (expression, options) => {
      const json = program.opts().json || false;
      const source = await readExpression(expression, options);
      if (!source || source.trim() === '') {
        cliError('No layout expression given — pass it as an argument, via --file, or on stdin');
        return;
      }
      let result;
      try {
        result = await layoutCheck(source, {
          form: options.form,
          loose: options.loose || false,
          cwd: process.cwd(),
        });
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions || [], code: e.code});
        return;
      }
      if (json) return jsonOut(result.type, result.data);

      const {valid, form, errors, warnings, compact, outline} = result.data;
      if (!valid) {
        humanLog(`\n✗ Invalid (${errors.length} error${errors.length === 1 ? '' : 's'}):`);
        for (const e of errors) {
          humanLog(`  - ${e.formatted}`);
          if (e.suggestions?.length > 0) humanLog(`    did you mean: ${e.suggestions.join(', ')}?`);
        }
        humanLog('');
        process.exitCode = 1;
        return;
      }
      humanLog(`\n✓ Valid (parsed as ${form})`);
      for (const warning of warnings) humanLog(`⚠ ${warning}`);
      humanLog('\ncompact:');
      humanLog(`  ${compact}`);
      humanLog('\noutline:');
      humanLog(outline.split('\n').map(l => `  ${l}`).join('\n'));
      humanLog('');
    });

  layoutCmd
    .command('grammar')
    .description('Print the XLE/XLO cheatsheet (alias table generated from this branch)')
    .action(async () => {
      const json = program.opts().json || false;
      let result;
      try {
        result = await layoutGrammar({cwd: process.cwd()});
      } catch (e) {
        cliError(e.message, {suggestions: e.suggestions || [], code: e.code});
        return;
      }
      if (json) return jsonOut(result.type, result.data);
      humanLog(result.data.text);
    });
}
