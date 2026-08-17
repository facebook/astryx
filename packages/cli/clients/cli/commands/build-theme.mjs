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
 * The command surface (group + subcommand descriptions, args, flags) is sourced
 * from the colocated CommandDocs via `defineCommand`; this file supplies only
 * the actions (and the group's unknown-subcommand guard).
 *
 * Usage:
 *   astryx theme build ./src/themes/ocean.ts
 *   astryx theme build ./src/themes/ocean.ts --out ./dist/ocean.css
 *   astryx theme build ./src/themes/*.ts
 *
 * `build` takes one or more theme files. Each is compiled by the same
 * single-file API call, in argument order, in one process — so the outputs are
 * byte-identical to running the CLI once per theme, and the first failure stops
 * the run exactly as a shell loop under `set -e` would.
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
import {themeTemplate} from '../../../api/theme/template/template.mjs';
import {themeList} from '../../../api/theme/list/list.mjs';
import {themeBuild, importSpecifier} from '../../../api/theme/build/build.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as themeGroup} from './theme.doc.mjs';
import {doc as themeBuildCommand} from './theme-build.doc.mjs';
import {doc as themeListCommand} from './theme-list.doc.mjs';
import {doc as themeAddCommand} from './theme-add.doc.mjs';
import {doc as themeTemplateCommand} from './theme-template.doc.mjs';
import {doc as themeBuildFn} from '../../../api/theme/themeBuild.doc.mjs';
import {doc as themeListFn} from '../../../api/theme/themeList.doc.mjs';
import {doc as themeAddFn} from '../../../api/theme/themeAdd.doc.mjs';
import {doc as themeTemplateFn} from '../../../api/theme/themeTemplate.doc.mjs';

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
 * @param {{out?: string, iconsSpecifier?: string}} options - Parsed command
 *   options that affect generated output.
 * @returns {Promise<number>}
 */
function runThemeBuildOnceChild(file, options) {
  const cliBin = resolveCliBin();
  const args = [cliBin, 'theme', 'build', file];
  if (options.out) args.push('--out', options.out);
  if (options.iconsSpecifier) args.push('--icons-specifier', options.iconsSpecifier);
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
 * Watch theme files and rebuild on change. Runs an initial build of each, then
 * rebuilds (debounced) the file that changed, until interrupted with Ctrl-C.
 * Rebuilds are serialized: one at a time, in the order the changes arrived, so
 * the log stays readable. Each rebuild runs in a child process so a build error
 * (which the single-build path reports via a hard exit) is contained and the
 * watcher keeps running.
 *
 * @param {Array<{file: string, filePath: string}>} entries - The theme file
 *   arguments as the user passed them, with their resolved absolute paths.
 * @param {{out?: string, iconsSpecifier?: string}} options - Parsed command options.
 * @returns {Promise<void>} Resolves when the watcher is stopped (Ctrl-C).
 */
async function runThemeBuildWatch(entries, options) {
  const rel = (/** @type {string} */ filePath) =>
    path.relative(process.cwd(), filePath);
  const watchingLine = `\nWatching ${entries
    .map(e => rel(e.filePath))
    .join(', ')} for changes — press Ctrl-C to stop.`;

  // Initial build.
  for (const entry of entries) {
    await runThemeBuildOnceChild(entry.file, options);
  }

  let building = false;
  /** @type {Set<{file: string, filePath: string}>} */
  const queued = new Set();
  /** @type {Map<string, ReturnType<typeof setTimeout>>} */
  const debounces = new Map();

  /** @param {{file: string, filePath: string}} entry */
  const rebuild = async entry => {
    if (building) {
      // Coalesce changes that land mid-build into a single follow-up run.
      queued.add(entry);
      return;
    }
    building = true;
    emit(text(`\nChange detected — rebuilding ${rel(entry.filePath)}...`));
    await runThemeBuildOnceChild(entry.file, options);
    building = false;
    emit(text(watchingLine));
    const next = queued.values().next();
    if (!next.done) {
      queued.delete(next.value);
      rebuild(next.value);
    }
  };

  // Some editors replace the file (rename) rather than writing in place, which
  // can drop the watch. Watch the containing directory and filter to our file
  // so edits survive atomic-save/rename.
  const watchers = entries.map(entry => {
    const baseName = path.basename(entry.filePath);
    return fs.watch(path.dirname(entry.filePath), (_eventType, changed) => {
      if (changed && changed !== baseName) return;
      clearTimeout(debounces.get(entry.filePath));
      // Debounce: editors often emit several events per save.
      debounces.set(
        entry.filePath,
        setTimeout(() => rebuild(entry), 100),
      );
    });
  });

  // Announce readiness only AFTER fs.watch is armed — the log is the "safe to
  // edit" signal (tests and humans rely on it), so printing it before the watch
  // is registered would race: a change in that gap is silently missed.
  emit(text(watchingLine));

  await new Promise((/** @type {(value?: void) => void} */ resolve) => {
    const stop = () => {
      for (const d of debounces.values()) clearTimeout(d);
      for (const w of watchers) w.close();
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
  const theme = defineCommand(program, themeGroup, {
    action: (
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
  });

  defineCommand(theme, themeBuildCommand, {
    fn: themeBuildFn,
    action: async (
      /** @type {string[]} */ files,
      /** @type {{out?: string, watch?: boolean, check?: boolean, iconsSpecifier?: string}} */ options,
    ) => {
      const json = program.opts().json || false;
      const entries = files.map(file => ({
        file,
        filePath: path.resolve(process.cwd(), file),
      }));

      for (const entry of entries) {
        if (fs.existsSync(entry.filePath)) continue;
        // A quoted glob reaches us unexpanded: say so rather than reporting a
        // literal `themes/*.ts` as a missing file.
        const looksGlobby = /[*?[\]{}]/.test(entry.file);
        cliError(`File not found: ${entry.filePath}`, {
          code: ERROR_CODES.ERR_FILE_NOT_FOUND,
          suggestions: looksGlobby
            ? [
                {
                  name: `astryx theme build ${entry.file.replace(/['"]/g, '')}`,
                  reason:
                    'globs are expanded by your shell — pass the pattern unquoted, or list the files',
                },
              ]
            : undefined,
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

      // --out names one output file, so it cannot describe N themes. Without
      // it each theme writes `<theme name>.css` beside its source, which is
      // what a multi-theme build wants anyway.
      if (options.out && entries.length > 1) {
        cliError(
          `--out takes a single output path and ${entries.length} theme files were given. ` +
            'Build them without --out (each theme writes <name>.css next to its source), ' +
            'or run one invocation per theme.',
          {code: ERROR_CODES.ERR_THEME_INVALID},
        );
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
        await runThemeBuildWatch(entries, options);
        return;
      }

      // Non-watch: delegate to the API compiler, once per theme, in argument
      // order. Enable human output unless in --json mode (log → stdout via
      // humanLog, warn/error → stderr). The "Building theme from" line, the
      // ✓/warning lines, and the install instructions are all emitted from
      // inside themeBuild via the shared logger.
      logger.setSilent(json);
      /** @type {Array<{file: string, receipt: import('../../../api/theme/theme.type.mjs').ThemeBuildResponse | import('../../../api/theme/theme.type.mjs').ThemeBuildCheckResponse | null}>} */
      const results = [];
      let stale = false;
      for (const entry of entries) {
        try {
          const result = await themeBuild(
            entry.file,
            {
              out: options.out,
              check: options.check,
              iconsSpecifier: options.iconsSpecifier,
            },
            {cwd: process.cwd()},
          );
          results.push({file: entry.file, receipt: result ?? null});
          if (
            options.check &&
            result &&
            result.type === 'theme.build.check' &&
            !result.data.upToDate
          ) {
            stale = true;
          }
        } catch (e) {
          const err =
            /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
          // Stop at the first failure, as a shell loop under `set -e` does.
          // With several themes in flight the message alone rarely says which
          // one broke, so name it.
          cliError(
            entries.length > 1 ? `${entry.file}: ${err.message}` : err.message,
            {suggestions: err.suggestions, code: err.code},
          );
          return;
        }
      }

      if (json) {
        // One theme keeps the single-envelope contract it has always had; a
        // batch gets its own discriminant rather than N envelopes on stdout.
        if (entries.length === 1) {
          if (results[0].receipt) jsonOut(results[0].receipt);
        } else {
          /** @type {import('../../../api/theme/theme.type.mjs').ThemeBuildBatchResponse} */
          const batch = {
            type: 'theme.build.batch',
            data: {count: results.length, results},
          };
          jsonOut(batch);
        }
      } else if (entries.length > 1) {
        emit(
          text(
            options.check
              ? `\n${stale ? '✗' : '✓'} Checked ${entries.length} themes.`
              : `\n✓ Built ${entries.length} themes.`,
          ),
        );
      }

      // In --check mode a stale/missing output is a failure: exit non-zero
      // (after emitting the receipt) so CI can gate on it. The receipt is
      // already printed above (shared logger or --json envelope).
      if (options.check && stale) {
        process.exitCode = 1;
      }
    },
  });

  defineCommand(theme, themeListCommand, {
    fn: themeListFn,
    action: async () => {
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
    },
  });

  defineCommand(theme, themeAddCommand, {
    fn: themeAddFn,
    action: async (
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
  });

  defineCommand(theme, themeTemplateCommand, {
    fn: themeTemplateFn,
    action: (
      /** @type {string | undefined} */ targetPath,
      /** @type {{overwrite?: boolean}} */ options,
    ) => {
      const json = program.opts().json || false;

      /** @type {import('../../../api/theme/theme.type.mjs').ThemeTemplateResponse} */
      let result;
      try {
        result = themeTemplate({
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

      const invocation = getCliInvocation(process.cwd());
      if (!result.data.written) {
        emit(
          text(`[skip] ${result.data.path} already exists — left as is.`),
          text(`Pass --overwrite to replace it with a fresh copy.`),
        );
        return;
      }
      emit(
        text(`[ok] Wrote ${result.data.path}`),
        text(
          'It documents every defineTheme field, the token families, and the component override syntax. ' +
            'Copy what you need into your own theme file, then delete it.',
        ),
        code(`${invocation} theme build ${result.data.path}`),
      );
    },
  });
}
