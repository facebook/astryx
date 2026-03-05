/**
 * @file init command — Interactive initialization wizard
 *
 * Orchestrates the full XDS setup flow using @clack/prompts:
 *   1. Intro
 *   2. Agent docs installation
 *   3. Swizzle awareness
 *   4. Template selection
 *   5. Success outro
 */

import * as p from '@clack/prompts';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {CLI_ROOT} from '../utils/paths.mjs';
import {installAgentDocs} from './agent-docs.mjs';
import {listTemplates} from './template.mjs';

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  return value;
}

export function registerInit(program) {
  program
    .command('init')
    .description('Interactive XDS initialization wizard')
    .action(async () => {
      // Step 1: Intro
      p.intro('Welcome to XDS');

      p.note(
        'XDS is a design system for building internal tools\nwith 300+ React components.',
        'About',
      );

      // Step 2: Agent Docs
      const shouldInstallAgentDocs = isCancel(
        await p.confirm({
          message: 'Install AGENTS.md for AI coding agent support?',
          initialValue: true,
        }),
      );

      if (shouldInstallAgentDocs) {
        const s = p.spinner();
        s.start('Installing agent docs');
        try {
          installAgentDocs(process.cwd());
          s.stop('Agent docs installed');
        } catch {
          s.stop('Agent docs installation failed');
          p.log.warning(
            'Could not install agent docs. Run `npx xds agent-docs` later to retry.',
          );
        }
      }

      // Step 3: Swizzle Awareness
      p.note(
        'You can customize any component with:\n  npx xds swizzle XDSButton\n  npx xds swizzle --list',
        'Component Customization',
      );

      // Step 4: Template Selection
      const templates = listTemplates();

      if (templates.length > 0) {
        const templateOptions = [
          {value: 'skip', label: 'Skip — No template'},
          {value: 'blank', label: 'Blank Page — Minimal scaffold'},
          {value: 'table', label: 'Table Page — Data table with actions'},
          {value: 'login', label: 'Login Page — Auth form with inputs'},
        ];

        const templateChoice = isCancel(
          await p.select({
            message: 'Start with a page template?',
            options: templateOptions,
          }),
        );

        if (templateChoice !== 'skip') {
          const targetPath = isCancel(
            await p.text({
              message: 'Where should the template be created?',
              initialValue: `./src/pages/${templateChoice}`,
              placeholder: `./src/pages/${templateChoice}`,
            }),
          );

          const outputDir = path.resolve(process.cwd(), targetPath);
          const templateDir = path.join(CLI_ROOT, 'templates', templateChoice);

          fs.mkdirSync(outputDir, {recursive: true});

          const files = fs.readdirSync(templateDir);
          for (const file of files) {
            const srcPath = path.join(templateDir, file);
            if (fs.statSync(srcPath).isFile()) {
              fs.copyFileSync(srcPath, path.join(outputDir, file));
            }
          }

          p.log.success(
            `Template created at ${path.relative(process.cwd(), outputDir)}/`,
          );
        }
      }

      // Step 5: Success
      p.outro('XDS initialized!');

      console.log('');
      console.log('  Next steps:');
      console.log("    1. Import components: import { XDSButton } from '@xds/core'");
      console.log('    2. Optionally add a theme:');
      console.log("       import { defaultTheme } from '@xds/theme/default'");
      console.log('       <XDSTheme theme={defaultTheme}>...</XDSTheme>');
      console.log('    3. npx xds --help for all commands');
      console.log('');
    });
}
