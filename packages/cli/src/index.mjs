/**
 * @file XDS CLI — Commander program setup
 *
 * Registers all commands: init, swizzle, agent-docs, template, theme.
 */

import {Command} from 'commander';
import {registerInit} from './commands/init.mjs';
import {registerSwizzle} from './commands/swizzle.mjs';
import {registerAgentDocs} from './commands/agent-docs.mjs';
import {registerTemplate} from './commands/template.mjs';
import {registerTheme} from './commands/theme.mjs';

export const program = new Command();

program
  .name('xds')
  .description('XDS design system CLI — components, themes, and tooling')
  .version('0.0.1')
  .addHelpCommand('help', 'Show all commands');

registerInit(program);
registerSwizzle(program);
registerAgentDocs(program);
registerTemplate(program);
registerTheme(program);

// Hidden command used by package.json postinstall scripts
program
  .command('postinstall', {hidden: true})
  .action(() => {
    console.log(`
  ╭───────────────────────────────────────────────╮
  │                                               │
  │   XDS design system installed!                │
  │                                               │
  │   Get started:                                │
  │     xds init          Interactive setup        │
  │     xds --help        See all commands         │
  │                                               │
  │   Or run directly:                            │
  │     xds agent-docs    Install AI agent docs    │
  │     xds theme         Apply a theme            │
  │     xds swizzle       Customize a component    │
  │     xds template      Add a page template      │
  │                                               │
  ╰───────────────────────────────────────────────╯
`);
  });
