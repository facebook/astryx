/**
 * @file init command — Interactive initialization wizard
 *
 * Orchestrates the full XDS setup flow using @clack/prompts:
 *   1. Intro
 *   2. Agent docs installation
 *   3. Theme selection
 *   4. Swizzle awareness
 *   5. Template selection
 *   6. Success outro
 */

import * as p from '@clack/prompts';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {findCoreDir, CLI_ROOT} from '../utils/paths.mjs';
import {installAgentDocs} from './agent-docs.mjs';
import {discoverThemes, writeThemeConfig} from './theme.mjs';
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

      // Step 3: Theme Selection
      const coreDir = findCoreDir(process.cwd());

      if (coreDir) {
        const themes = discoverThemes(coreDir);

        if (themes.length > 0) {
          const themeOptions = [
            ...themes.map(t => ({
              value: t.exportName,
              label:
                t.name === 'default'
                  ? 'Default — Blue accent, system fonts'
                  : t.name === 'neutral'
                    ? 'Neutral — Grayscale, shadcn-inspired'
                    : t.name,
            })),
            {value: 'skip', label: 'Skip — Configure later'},
          ];

          const themeChoice = isCancel(
            await p.select({
              message: 'Choose a theme:',
              options: themeOptions,
            }),
          );

          if (themeChoice !== 'skip') {
            writeThemeConfig(process.cwd(), themeChoice);
            p.log.success(`Theme set to ${themeChoice}`);
            p.note(
              `import { XDSTheme, ${themeChoice} } from '@xds/core/theme';\n\n<XDSTheme theme={${themeChoice}}>\n  {children}\n</XDSTheme>`,
              'Add to your root layout',
            );
          }
        }
      }

      // Step 4: Swizzle Awareness
      p.note(
        'You can customize any component with:\n  npx xds swizzle XDSButton\n  npx xds swizzle --list',
        'Component Customization',
      );

      // Step 5: Template Selection
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

      // Step 6: Success
      p.outro('XDS initialized!');

      console.log('');
      console.log('  Next steps:');
      console.log('    1. Wrap your app with <XDSTheme theme={defaultTheme}>');
      console.log("    2. Import components: import { XDSButton } from '@xds/core'");
      console.log('    3. npx xds --help for all commands');
      console.log('');
      console.log('  LLM prompt: "Help me initialize this xds project with npx xds init"');
      console.log('');
    });
}
