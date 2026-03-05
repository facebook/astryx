/**
 * @file XDS CLI — Commander program setup
 *
 * Registers all commands: init, swizzle, agent-docs, component, docs, template, theme.
 */

import {Command} from 'commander';
import {registerInit} from './commands/init.mjs';
import {registerSwizzle} from './commands/swizzle.mjs';
import {registerAgentDocs} from './commands/agent-docs.mjs';
import {registerComponent} from './commands/component.mjs';
import {registerDocs} from './commands/docs.mjs';
import {registerTemplate} from './commands/template.mjs';
import {registerTheme} from './commands/theme.mjs';
import {registerGapReport} from './commands/gap-report.mjs';

export const program = new Command();

program
  .name('xds')
  .description('XDS design system CLI — components, themes, and tooling')
  .version('0.0.1')
  .addHelpCommand('help', 'Show all commands')
  .action(() => {
    program.help();
  });

registerInit(program);
registerComponent(program);
registerDocs(program);
registerSwizzle(program);
registerAgentDocs(program);
registerTemplate(program);
registerTheme(program);
registerGapReport(program);

// Hidden command used by package.json postinstall scripts
program
  .command('postinstall', {hidden: true})
  .action(() => {
    console.log(`
  ╭───────────────────────────────────────────────────╮
  │                                                   │
  │   XDS design system installed!                    │
  │                                                   │
  │   Get started:                                    │
  │     npx xds init          Interactive setup       │
  │     npx xds --help        See all commands        │
  │                                                   │
  │   Or run directly:                                │
  │     npx xds agent-docs    Install AI agent docs   │
  │     npx xds component     Browse component docs   │
  │     npx xds docs          Design system reference │
  │     npx xds theme         Apply a theme           │
  │     npx xds swizzle       Customize a component   │
  │     npx xds template      Add a page template     │
  │                                                   │
  ╰───────────────────────────────────────────────────╯
`);
  });
