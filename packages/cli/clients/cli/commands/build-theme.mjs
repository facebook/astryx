// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme command — Commander wiring for `astryx theme` (build/list/add).
 *
 * Thin CLI wrapper. The `build` compiler lives in the programmatic API
 * (../../api/theme/build/build.mjs); `list`/`add` delegate to the
 * ../../api/theme/list/list.mjs and ../../api/theme/add/add.mjs leaves. This
 * file only parses options, injects a logger, renders human output, and maps
 * AstryxError → cliError. Watch mode (a human-interactive, long-running loop)
 * stays here because it re-invokes `theme build` as a child process.
 *
 * Usage:
 *   astryx theme build ./src/themes/ocean.ts
 *   astryx theme build ./src/themes/ocean.ts --out ./dist/ocean.css
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, list, code} from '../formatters/index.mjs';
import {logger} from '../../../api/logger.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {themeAdd} from '../../../api/theme/add/add.mjs';
import {themeList} from '../../../api/theme/list/list.mjs';
import {themeBuild, importSpecifier} from '../../../api/theme/build/build.mjs';

/**
 * Path to this CLI's real entry (clients/cli/bin/astryx.mjs), resolved from
 * this module's location (clients/cli/commands/build-theme.mjs → ../bin/
 * astryx.mjs). Used to re-invoke `theme build` as a child process in watch mode.
 */
function resolveCliBin() {
  const commandsDir = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(commandsDir, '../bin/astryx.mjs');
}

/**
 * Run a single `theme build` as a child process, reusing the exact
 * single-build code path (and its error handling) rather than duplicating it.
 * Resolves with the child's exit code; never rejects.
 *
 * @param {string} file - The theme file argument, as the user passed it.
 * @param {{out?: string}} options - Parsed command options (only `out` is forwarded).
 * @returns {Promise<number>}
 */
function runThemeBuildOnceChild(file, options) {
  const cliBin = resolveCliBin();
  const args = [cliBin, 'theme', 'build', file];
  if (options.out) args.push('--out', options.out);
  return new Promise((/** @type {(code: number) => void} */ resolve) => {
    const child = spawn(process.execPath, args, {
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', code => resolve(code ?? 0));
    child.on('error', () => resolve(1));
  });
}

/**
 * Watch a theme file and rebuild on change. Runs an initial build, then
 * rebuilds (debounced) whenever the file changes, until interrupted with
 * Ctrl-C. Each rebuild runs in a child process so a build error (which the
 * single-build path reports via a hard exit) is contained and the watcher
 * keeps running.
 *
 * @param {string} file - The theme file argument, as the user passed it.
 * @param {string} filePath - Absolute path to the theme file.
 * @param {{out?: string}} options - Parsed command options.
 * @returns {Promise<void>} Resolves when the watcher is stopped (Ctrl-C).
 */
async function runThemeBuildWatch(file, filePath, options) {
  const rel = path.relative(process.cwd(), filePath);

  // Initial build.
  await runThemeBuildOnceChild(file, options);

  let building = false;
  let queued = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounce;

  const rebuild = async () => {
    if (building) {
      // Coalesce changes that land mid-build into a single follow-up run.
      queued = true;
      return;
    }
    building = true;
    emit(text(`\nChange detected — rebuilding ${rel}...`));
    await runThemeBuildOnceChild(file, options);
    building = false;
    emit(text(`\nWatching ${rel} for changes — press Ctrl-C to stop.`));
    if (queued) {
      queued = false;
      rebuild();
    }
  };

  // Some editors replace the file (rename) rather than writing in place, which
  // can drop the watch. Watch the containing directory and filter to our file
  // so edits survive atomic-save/rename.
  const watchDir = path.dirname(filePath);
  const baseName = path.basename(filePath);
  const watcher = fs.watch(watchDir, (_eventType, changed) => {
    if (changed && changed !== baseName) return;
    clearTimeout(debounce);
    // Debounce: editors often emit several events per save.
    debounce = setTimeout(rebuild, 100);
  });

  // Announce readiness only AFTER fs.watch is armed — the log is the "safe to
  // edit" signal (tests and humans rely on it), so printing it before the watch
  // is registered would race: a change in that gap is silently missed.
  emit(text(`\nWatching ${rel} for changes — press Ctrl-C to stop.`));

  await new Promise((/** @type {(value?: void) => void} */ resolve) => {
    const stop = () => {
      clearTimeout(debounce);
      watcher.close();
      emit(text('\nStopped watching.'));
      resolve();
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
  });
}

/**
 * Emit the bundled themes as a bulleted list plus the `theme add` usage hint —
 * the human projection of a `theme.list` envelope. Shared by `theme list` and
 * the list affordance of `theme add` (bare `theme add` / `--list`).
 * @param {import('../../../api/theme/theme.type.mjs').ThemeListEntry[]} themes
 */
function printThemeList(themes) {
  if (themes.length === 0) {
    emit(text('No themes are bundled with this CLI build.'));
    return;
  }
  const run = getCliInvocation();
  emit(
    section('Themes'),
    list(
      themes.map(t => {
        const head = t.maintained ? `${t.slug} (maintained)` : t.slug;
        return t.description ? [head, t.description] : head;
      }),
    ),
    text(
      `Usage:\n  ${run} theme add <slug> [target-path]   Scaffold a theme file you own`,
    ),
  );
}

/**
 * @param {import('commander').Command} program
 */
export function registerTheme(program) {
  const theme = program
    .command('theme')
    .description('Theme tools — build, export, and manage themes')
    .action(
      (
        /** @type {unknown} */ options,
        /** @type {import('commander').Command} */ cmd,
      ) => {
        // Parent group has no default behaviour. If the user passed an
        // unknown subcommand (e.g. `astryx theme bogus`), Commander hands it to
        // us as a positional in cmd.args — exit 1 with a clear error.
        const extras = (cmd && cmd.args) || [];
        if (extras.length > 0) {
          const unknown = String(extras[0]);
          const known = (theme.commands || []).map(c => c.name());
          const suggestions = known.map(name => ({
            name,
            reason: 'available subcommand',
          }));
          cliError(`unknown subcommand 'theme ${unknown}'`, {
            suggestions,
            code: ERROR_CODES.ERR_UNKNOWN_SUBCOMMAND,
          });
          return;
        }
        // Bare `astryx theme` — show the subcommand list. Exit 0 (help is success).
        theme.help();
      },
    );

  theme
    .command('build <file>')
    .description('Compile a defineTheme file to CSS + JS')
    .option('-o, --out <path>', 'Output CSS file path')
    .option(
      '-w, --watch',
      'Rebuild automatically when the theme file changes (Ctrl-C to stop)',
    )
    .option(
      '-c, --check',
      'Verify the committed outputs match the source without writing; exit non-zero if stale',
    )
    .action(
      async (
        /** @type {string} */ file,
        /** @type {{out?: string, watch?: boolean, check?: boolean}} */ options,
      ) => {
        const filePath = path.resolve(process.cwd(), file);
        const json = program.opts().json || false;

        if (!fs.existsSync(filePath)) {
          cliError(`File not found: ${filePath}`, {
            code: ERROR_CODES.ERR_FILE_NOT_FOUND,
          });
          return;
        }

        // --check and --watch are mutually exclusive: check is a one-shot,
        // exit-coded verification; watch is a long-running rebuild loop.
        if (options.check && options.watch) {
          cliError('--check cannot be combined with --watch', {
            code: ERROR_CODES.ERR_THEME_INVALID,
          });
          return;
        }

        // Watch mode: run an initial build, then rebuild on every change to the
        // theme file. Watch is a human-interactive, long-running mode — it is not
        // supported in --json (machine) mode, which expects a single envelope.
        if (options.watch) {
          if (json) {
            cliError('--watch is not supported with --json', {
              code: ERROR_CODES.ERR_THEME_INVALID,
            });
            return;
          }
          await runThemeBuildWatch(file, filePath, options);
          return;
        }

        // Non-watch: delegate to the API compiler. Enable human output unless in
        // --json mode (log → stdout via humanLog, warn/error → stderr). The
        // "Building theme from" line, the ✓/warning lines, and the install
        // instructions are all emitted from inside themeBuild via the shared logger.
        logger.setSilent(json);
        try {
          const result = await themeBuild(
            file,
            {out: options.out, check: options.check},
            {cwd: process.cwd()},
          );
          if (json && result) jsonOut(result);
          // In --check mode a stale/missing output is a failure: exit non-zero
          // (after emitting the receipt) so CI can gate on it. The receipt is
          // already printed above (shared logger or --json envelope).
          if (
            options.check &&
            result &&
            result.type === 'theme.build.check' &&
            !result.data.upToDate
          ) {
            process.exitCode = 1;
          }
        } catch (e) {
          const err =
            /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
          cliError(err.message, {suggestions: err.suggestions, code: err.code});
        }
      },
    );

  theme
    .command('list')
    .description('List themes available to add')
    .action(async () => {
      const json = program.opts().json || false;
      /** @type {import('../../../api/theme/theme.type.mjs').ThemeListResponse} */
      let result;
      try {
        result = themeList();
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

      printThemeList(result.data);
    });

  theme
    .command('add [slug] [path]')
    .description('Scaffold a theme into your project as editable source')
    .option('-f, --overwrite', 'Overwrite existing files without prompting')
    .option('--list', 'List available themes')
    .action(
      async (
        /** @type {string | undefined} */ slug,
        /** @type {string | undefined} */ targetPath,
        /** @type {{list?: boolean, overwrite?: boolean}} */ options,
      ) => {
        const json = program.opts().json || false;

        // The CLI is non-interactive: never prompt to confirm an overwrite.
        // Existing files require an explicit --overwrite; otherwise themeAdd's
        // ERR_FILE_EXISTS guard rejects the write. `--list` (or a bare `theme add`
        // with no slug) is the list affordance — route it to the list leaf.
        /** @type {import('../../../api/theme/theme.type.mjs').ThemeListResponse | import('../../../api/theme/theme.type.mjs').ThemeAddResponse} */
        let result;
        try {
          result =
            options.list || !slug
              ? themeList()
              : await themeAdd(slug, {
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

        if (result.type === 'theme.list') {
          printThemeList(result.data);
          return;
        }

        // theme.add — print where files landed + how to use the theme.
        const {displayName, outputDir, entry, exportName, files} = result.data;
        const entryModule = importSpecifier(
          outputDir,
          entry.replace(/\.tsx?$/, ''),
        );
        emit(
          text(`[ok] Added ${displayName} theme to ${outputDir}/`),
          list(files.map(f => `${outputDir}/${f}`)),
          text(
            'Use it in your app (import path is relative to a file in src/ — adjust if yours lives elsewhere):',
          ),
          code(
            `import { ${exportName} } from '${entryModule}';\n\n` +
              `<Theme theme={${exportName}}>\n  <App />\n</Theme>`,
          ),
          text(
            `This is your copy of the ${displayName} theme — edit ${entry} to make it your own.`,
          ),
        );
      },
    );
}
