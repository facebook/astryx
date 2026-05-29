// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file XDS CLI — Commander program setup
 *
 * Registers all commands via lazy loading. If one command fails to load
 * (bad import, syntax error), the other commands still work.
 */

import {Command} from 'commander';
import {fileURLToPath} from 'node:url';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {checkForUpdate} from './utils/update-check.mjs';
import {getRunPrefix} from './utils/package-manager.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read version from package.json so it stays in sync
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

export const program = new Command();

program
  .name('xds')
  .description('XDS design system CLI — components, themes, and tooling')
  .version(pkg.version)
  .option('--zh', 'Output docs in Chinese Simplified')
  .option('--dense', 'Output docs in compressed dense format (token-efficient)')
  .option('--lang <locale>', 'Output docs in specified language/format (en, zh, dense)')
  .option('--detail <level>', 'Output detail level (full, compact, brief)', 'full')
  .option('--json', 'Output as typed JSON (envelope: { type, data })')
  .addHelpCommand('help', 'Show all commands')
  .showHelpAfterError(true)
  .action(function () {
    // If positional args were passed, they didn't match any subcommand —
    // commander otherwise silently runs this default action. Reject with
    // a clear error and non-zero exit code instead of printing help with
    // exit 0.
    const args = this.args || [];
    if (args.length > 0) {
      console.error(`error: unknown command '${args[0]}'`);
      console.error(`Run \`xds --help\` to see available commands.`);
      process.exit(1);
    }
    program.help();
  });

// Backstop: also wire up a `command:*` listener for the case where no
// default action would run (e.g. if the default is removed in the future).
program.on('command:*', (operands) => {
  const unknown = operands[0];
  console.error(`error: unknown command '${unknown}'`);
  console.error(`Run \`xds --help\` to see available commands.`);
  process.exit(1);
});

/**
 * Fallback hook: if --json was requested but the command didn't call
 * jsonOut/jsonError, return a structured "not supported" error.
 * Registered BEFORE the update-check hook so it fires first.
 */
program.hook('postAction', (thisCommand, actionCommand) => {
  if (program.opts().json && !process.__xdsJsonHandled) {
    const parts = [];
    let cmd = actionCommand;
    while (cmd && cmd !== program) {
      parts.unshift(cmd.name());
      cmd = cmd.parent;
    }
    const fullName = parts.join(' ');
    console.log(JSON.stringify({
      error: `JSON output is not supported for the '${fullName}' command`,
    }, null, 2));
    process.exit(1);
  }
});

/**
 * Post-action hook: print update hint after any command output.
 * Only fires for commands that produce output agents read (component, docs, etc.).
 * Suppressed when --json is active to avoid contaminating stdout.
 */
const UPDATE_HINT_COMMANDS = new Set(['component', 'docs', 'doctor']);
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

    // Build all body lines first, then compute width from the longest.
    // The previous hard-coded W=49 broke with `pnpm exec`, `bunx`, and
    // `yarn` prefixes whose lines exceeded the inner width and pushed
    // the right border out of alignment.
    const body = [
      '',
      '  XDS design system installed!',
      '',
      '  Get started:',
      `    ${r} init          Interactive setup`,
      `    ${r} --help        See all commands`,
      '',
      '  Or run directly:',
      `    ${r} init           Setup + AI agent docs`,
      `    ${r} component     Browse component docs`,
      `    ${r} hook          Browse hook docs`,
      `    ${r} docs          Design system reference`,
      `    ${r} swizzle       Customize a component`,
      `    ${r} template      Add a page template`,
      '',
    ];

    // Inner width = longest line, with a sane minimum so the box
    // doesn't collapse for an empty `r`.
    const W = Math.max(49, ...body.map(s => s.length));
    // Body line: `│ ` + content padded to W + ` │`. Border: `╭` + `─` × (W+2) + `╮`.
    // Total visible width matches across body and border.
    const line = (s) => `  │ ${pad(s, W)} │`;

    console.log(`
  ╭${'─'.repeat(W + 2)}╮
${body.map(line).join('\n')}
  ╰${'─'.repeat(W + 2)}╯
`);
  });
