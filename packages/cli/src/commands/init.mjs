/**
 * @file init command — Interactive initialization wizard + feature installer
 *
 * Interactive: `xds init` walks through all features
 * Non-interactive: `xds init --features agents,theme,template`
 * Re-runnable: safe to run multiple times, idempotent
 *
 * Features:
 *   agents   — Install AGENTS.md/CLAUDE.md cheat sheet for AI coding agents
 *   theme    — Scaffold a custom theme file
 *   template — Copy a starter page template
 */

import * as p from '@clack/prompts';
import * as path from 'node:path';
import * as fs from 'node:fs';
import {CLI_ROOT} from '../utils/paths.mjs';
import {installAgentDocs, removeAgentDocs} from './agent-docs.mjs';
import {listTemplates} from './template.mjs';

const VALID_FEATURES = ['agents', 'theme', 'template'];

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  return value;
}

// ─── Feature: agents ─────────────────────────────────────────────────────────

function runAgents(targetDir, {interactive = true} = {}) {
  try {
    installAgentDocs(targetDir);
    if (interactive) {
      p.log.success('AI agent docs installed');
    } else {
      console.log('✓ AI agent docs installed');
    }
  } catch {
    const msg = 'Could not install agent docs. Try again with `npx xds init --features agents`.';
    if (interactive) {
      p.log.warning(msg);
    } else {
      console.error(msg);
    }
  }
}

// ─── Feature: theme ──────────────────────────────────────────────────────────

async function runTheme({interactive = true} = {}) {
  if (!interactive) {
    console.log('✓ Theme scaffolding requires interactive mode. Run `npx xds theme` instead.');
    return;
  }

  p.note(
    'Create a custom theme with your brand colors.\n' +
    'Run `npx xds theme` for the full theme wizard.\n' +
    'Run `npx xds theme --list` to see existing themes.',
    'Themes',
  );
}

// ─── Feature: template ───────────────────────────────────────────────────────

async function runTemplate(targetDir, {interactive = true, templateName} = {}) {
  const templates = listTemplates();
  if (templates.length === 0) return;

  if (!interactive) {
    if (!templateName) {
      console.log(`✓ Available templates: ${templates.join(', ')}. Use npx xds template <name> [path].`);
      return;
    }

    if (!templates.includes(templateName)) {
      console.error(`Error: Unknown template "${templateName}". Available: ${templates.join(', ')}`);
      return;
    }

    const outputDir = path.resolve(targetDir, `./src/pages/${templateName}`);
    const templateDir = path.join(CLI_ROOT, 'templates', templateName);
    fs.mkdirSync(outputDir, {recursive: true});

    const files = fs.readdirSync(templateDir);
    for (const file of files) {
      const srcPath = path.join(templateDir, file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, path.join(outputDir, file));
      }
    }
    console.log(`✓ Template created at ${path.relative(targetDir, outputDir)}/`);
    return;
  }

  const TEMPLATE_OPTIONS = [
    {value: 'skip', label: 'Skip — No template'},
    {value: 'blank', label: 'Blank Page — Minimal scaffold'},
    {value: 'table', label: 'Table Page — Data table with actions'},
    {value: 'login', label: 'Login Page — Auth form with inputs'},
  ];

  const templateChoice = isCancel(
    await p.select({
      message: 'Start with a page template?',
      options: TEMPLATE_OPTIONS,
    }),
  );

  if (templateChoice === 'skip') return;

  const targetPath = isCancel(
    await p.text({
      message: 'Where should the template be created?',
      initialValue: `./src/pages/${templateChoice}`,
      placeholder: `./src/pages/${templateChoice}`,
    }),
  );

  const outputDir = path.resolve(targetDir, targetPath);
  const templateDir = path.join(CLI_ROOT, 'templates', templateChoice);

  fs.mkdirSync(outputDir, {recursive: true});

  const files = fs.readdirSync(templateDir);
  for (const file of files) {
    const srcPath = path.join(templateDir, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, path.join(outputDir, file));
    }
  }

  p.log.success(`Template created at ${path.relative(targetDir, outputDir)}/`);
}

// ─── Command ─────────────────────────────────────────────────────────────────

export function registerInit(program) {
  program
    .command('init')
    .description('Initialize XDS in your project')
    .option('--features <list>', 'Comma-separated features to install (agents, theme, template)')
    .option('--all', 'Install all features, no prompts')
    .option('--remove-agents', 'Remove AI agent docs from AGENTS.md/CLAUDE.md')
    .action(async (options) => {
      const targetDir = process.cwd();

      // Remove mode
      if (options.removeAgents) {
        removeAgentDocs(targetDir);
        console.log('✓ AI agent docs removed.');
        return;
      }

      // Non-interactive: --features or --all
      if (options.features || options.all) {
        const features = options.all
          ? VALID_FEATURES
          : options.features.split(',').map(f => f.trim().toLowerCase());

        const invalid = features.filter(f => !VALID_FEATURES.includes(f));
        if (invalid.length > 0) {
          console.error(`Error: Unknown features: ${invalid.join(', ')}`);
          console.error(`Valid features: ${VALID_FEATURES.join(', ')}`);
          process.exit(1);
        }

        for (const feature of features) {
          if (feature === 'agents') runAgents(targetDir, {interactive: false});
          if (feature === 'theme') await runTheme({interactive: false});
          if (feature === 'template') await runTemplate(targetDir, {interactive: false});
        }
        return;
      }

      // Interactive wizard
      p.intro('Welcome to XDS');

      p.note(
        'XDS is a design system for building internal tools\nwith 300+ React components.',
        'About',
      );

      // Feature: agents
      const shouldInstallAgents = isCancel(
        await p.confirm({
          message: 'Install AI agent support? (adds XDS cheat sheet to AGENTS.md)',
          initialValue: true,
        }),
      );

      if (shouldInstallAgents) {
        const s = p.spinner();
        s.start('Installing agent docs');
        runAgents(targetDir);
        s.stop('Done');
      }

      // Feature: swizzle awareness
      p.note(
        'You can customize any component with:\n  npx xds swizzle XDSButton\n  npx xds swizzle --list',
        'Component Customization',
      );

      // Feature: template
      await runTemplate(targetDir);

      // Feature: theme awareness
      await runTheme();

      // Outro
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
