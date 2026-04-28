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
  .action(() => {
    program.help();
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
    const W = 49; // inner width of the box
    const line = (s) => `  │ ${pad(s, W)}│`;
    console.log(`
  ╭${'─'.repeat(W + 2)}╮
${line('')}
${line('  XDS design system installed!')}
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
