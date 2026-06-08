// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDS CLI — Commander program setup
 *
 * Registers all commands via lazy loading. If one command fails to load
 * (bad import, syntax error), the other commands still work.
 */

import {Command, Option} from 'commander';
import {fileURLToPath} from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {checkForUpdate} from './utils/update-check.mjs';
import {getRunPrefix} from './utils/package-manager.mjs';
import {API_VERSION, setJsonMode} from './lib/json.mjs';
import {cliError} from './lib/cli-error.mjs';
import {ERROR_CODES} from './lib/error-codes.mjs';
import {levenshteinDistance} from './lib/string-utils.mjs';
import {installJsonShim} from './lib/json-shim.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read version from package.json so it stays in sync
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

// Intercept `xds --version --json` (or `-V --json`) before Commander processes
// the version flag and exits. Commander's built-in version handler prints the
// raw version string and calls process.exit, bypassing our hooks — so the
// only correct place to JSON-ify it is here.
const _argv = process.argv.slice(2);
if (
  (_argv.includes('--version') || _argv.includes('-V')) &&
  _argv.includes('--json')
) {
  process.__xdsJsonHandled = true;
  console.log(JSON.stringify({apiVersion: API_VERSION, type: 'version', data: {version: pkg.version}}, null, 2));
  process.exit(0);
}

export const program = new Command();

/**
 * Allowlist of fully-qualified command names that natively support --json.
 * Subcommands are listed by their full path (parent + leaf), e.g. "theme build".
 *
 * Commands NOT in this set will be rejected by the preAction hook below
 * BEFORE any side effects can run. This protects users from partial state
 * (e.g. files written, then --json error printed) on commands that don't
 * yet support structured output.
 */
export const JSON_SUPPORTED = new Set([
  'component',
  'docs',
  'discover',
  'search',
  'swizzle',
  'template',
  'hook',
  'theme build',
  'gap-report',
  'upgrade',
]);

program
  .name('xds')
  .description('Design system CLI — components, themes, and tooling')
  .version(pkg.version)
  .option('--zh', 'Output docs in Chinese Simplified')
  .option('--dense', 'Output docs in compressed dense format (token-efficient)')
  .addOption(
    new Option(
      '--lang <locale>',
      'Output docs in specified language/format (en, zh, dense)',
    ).choices(['en', 'zh', 'dense']),
  )
  .addOption(
    new Option('--detail <level>', 'Output detail level (full, compact, brief)')
      .choices(['full', 'compact', 'brief'])
      .default('full'),
  )
  .option(
    '--json',
    'Output as typed JSON. Success envelope: { type, data }. Error envelope: { error, suggestions? }.',
  )
  .addHelpCommand('help', 'Show all commands')
  .action((options, cmd) => {
    // If Commander handed us a positional that didn't match any subcommand,
    // treat it as "unknown command" — exit 1 with a helpful suggestion.
    // This is the bare-invocation handler; if cmd.args has content here,
    // none of the registered subcommands matched.
    const extras = (cmd && cmd.args) || [];
    if (extras.length > 0) {
      const unknown = String(extras[0]);
      const known = (program.commands || [])
        .filter((c) => !c._hidden && c.name() !== 'help')
        .map((c) => c.name());
      const close = known
        .map((name) => ({name, distance: levenshteinDistance(unknown.toLowerCase(), name.toLowerCase())}))
        .filter((s) => s.distance <= 3)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3)
        .map((s) => ({name: s.name, reason: 'did you mean this?'}));
      // If we have close matches, surface those. Otherwise list all known commands
      // so callers (including AI agents) can see what's available.
      const suggestions = close.length > 0
        ? close
        : known.map((name) => ({name, reason: 'available command'}));
      cliError(`unknown command '${unknown}'`, {suggestions, code: ERROR_CODES.ERR_UNKNOWN_COMMAND});
      return;
    }

    // `xds` (no subcommand) — print help, or emit a JSON envelope when --json.
    if (program.opts().json) {
      // Emit a JSON help envelope. Treat the bare invocation as supported.
      process.__xdsJsonHandled = true;
      console.log(JSON.stringify({
        apiVersion: API_VERSION,
        type: 'help',
        data: {
          name: 'xds',
          version: pkg.version,
          commands: [
            'component', 'docs', 'discover', 'search', 'swizzle', 'template',
            'hook', 'theme', 'gap-report', 'upgrade', 'init',
          ],
          jsonSupported: [...JSON_SUPPORTED].sort(),
        },
      }, null, 2));
      return;
    }
    program.help();
  });

/**
 * Compute the fully qualified command name, e.g. "theme build" or "gap-report".
 * @param {import('commander').Command} actionCommand
 * @returns {string}
 */
function fullCommandName(actionCommand) {
  const parts = [];
  let cmd = actionCommand;
  while (cmd && cmd !== program) {
    parts.unshift(cmd.name());
    cmd = cmd.parent;
  }
  return parts.join(' ');
}

/**
 * Pre-action hook: gate --json BEFORE any command body runs.
 *
 * If --json is set on a command that is not on the JSON_SUPPORTED allowlist,
 * emit a structured error envelope and exit 1 — without running the command's
 * action (so no filesystem mutations, no clack prompts, no spawned processes).
 *
 * This is the single source of truth for "command does not support --json".
 * Individual commands should NOT re-check this; they may assume that if their
 * action runs with --json, they are responsible for emitting an envelope on
 * every code path.
 */
program.hook('preAction', (thisCommand, actionCommand) => {
  if (!program.opts().json) return;
  // Engage global JSON mode so humanLog()/humanWarn() across commands become
  // no-ops — stdout now carries only the JSON envelope.
  setJsonMode(true);
  // The root program's own action (no subcommand) is handled directly in
  // its action handler — let it through. fullCommandName is '' there.
  if (actionCommand === program) return;
  const fullName = fullCommandName(actionCommand);
  if (JSON_SUPPORTED.has(fullName)) return;
  process.__xdsJsonHandled = true;
  console.log(JSON.stringify({
    apiVersion: API_VERSION,
    error: `JSON output is not supported for the '${fullName}' command`,
    code: ERROR_CODES.ERR_INVALID_OPTION,
  }, null, 2));
  process.exit(1);
});

/**
 * Belt-and-suspenders postAction: if a "supported" command somehow forgot
 * to emit a JSON envelope on a code path, surface that as a structured error
 * rather than silent stdout corruption. This should never fire in practice;
 * if it does, it's a bug in the command implementation.
 */
program.hook('postAction', (thisCommand, actionCommand) => {
  if (!program.opts().json) return;
  if (process.__xdsJsonHandled) return;
  const fullName = fullCommandName(actionCommand);
  console.log(JSON.stringify({
    apiVersion: API_VERSION,
    error: `Internal: '${fullName}' completed without emitting a JSON envelope`,
  }, null, 2));
  process.exit(1);
});

/**
 * Post-action hook: print update hint after any command output.
 * Only fires for commands that produce output agents read (component, docs, etc.).
 * Suppressed when --json is active to avoid contaminating stdout.
 */
const UPDATE_HINT_COMMANDS = new Set(['component', 'docs']);
program.hook('postAction', (thisCommand, actionCommand) => {
  if (program.opts().json) return;
  try {
    if (UPDATE_HINT_COMMANDS.has(actionCommand.name())) {
      const hint = checkForUpdate();
      if (hint) {
        console.error(`\n${hint}`);
      }
    }
  } catch {
    // Never let update check break the CLI
  }
});

/**
 * Command registry — each command is lazy-loaded so a broken command
 * doesn't take down the entire CLI.
 */
const commands = [
  {name: 'init', path: './commands/init.mjs', register: 'registerInit'},
  {name: 'component', path: './commands/component/index.mjs', register: 'registerComponent'},
  {name: 'docs', path: './commands/docs.mjs', register: 'registerDocs'},
  {name: 'swizzle', path: './commands/swizzle.mjs', register: 'registerSwizzle'},
  // agent-docs folded into init — functions still importable from agent-docs.mjs
  {name: 'template', path: './commands/template.mjs', register: 'registerTemplate'},
  {name: 'gap-report', path: './commands/gap-report.mjs', register: 'registerGapReport'},
  {name: 'upgrade', path: './commands/upgrade.mjs', register: 'registerUpgrade'},
  {name: 'theme', path: './commands/build-theme.mjs', register: 'registerTheme'},
  {name: 'hook', path: './commands/hook/index.mjs', register: 'registerHook'},
  {name: 'discover', path: './commands/discover.mjs', register: 'registerDiscover'},
  {name: 'search', path: './commands/search.mjs', register: 'registerSearch'},
];

for (const cmd of commands) {
  try {
    const mod = await import(cmd.path);
    mod[cmd.register](program);
  } catch (e) {
    // Command fails to load but CLI still works
    program
      .command(cmd.name)
      .description(`(failed to load: ${e.message})`)
      .action(() => {
        console.error(`Command "${cmd.name}" failed to load:`);
        console.error(e.message);
        process.exit(1);
      });
  }
}

// Hidden command used by package.json postinstall scripts
program
  .command('postinstall', {hidden: true})
  .action(() => {
    const run = getRunPrefix();
    const r = `${run} xds`;
    const pad = (s, len) => s + ' '.repeat(Math.max(0, len - s.length));
    const W = 49; // inner width of the box
    const line = (s) => `  │ ${pad(s, W)}│`;
    console.log(`
  ╭${'─'.repeat(W + 2)}╮
${line('')}
${line('  Design system installed!')}
${line('')}
${line('  Get started:')}
${line(`    ${r} init          Interactive setup`)}
${line(`    ${r} --help        See all commands`)}
${line('')}
${line('  Or run directly:')}
${line(`    ${r} init           Setup + AI agent docs`)}
${line(`    ${r} component     Browse component docs`)}
${line(`    ${r} hook          Browse hook docs`)}
${line(`    ${r} docs          Design system reference`)}
${line(`    ${r} swizzle       Customize a component`)}
${line(`    ${r} template      Add a page template`)}
${line('')}
  ╰${'─'.repeat(W + 2)}╯
`);
  });

// Install the JSON shim AFTER all commands are registered so we can
// patch outputHelp on every command (root + subcommands). The shim
// extends the --json contract to cover Commander's parse-time short
// circuits (parse errors, unknown options, --help, unknown commands).
// See packages/cli/src/lib/json-shim.mjs for the rationale.
installJsonShim(program);
