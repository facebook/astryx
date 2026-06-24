// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init command — Interactive initialization wizard + feature installer
 *
 * Interactive: `astryx init` walks through all features
 * Non-interactive: `astryx init --features agents,theme,template`
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
import {PathSafetyError} from '../utils/path-safety.mjs';
import {getRunPrefix} from '../utils/package-manager.mjs';
import {installAgentDocs, removeAgentDocs} from './agent-docs.mjs';
import {listTemplates} from './template.mjs';
import {humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';
import {requireInteractive} from '../utils/interactive.mjs';

const VALID_FEATURES = ['agents', 'theme', 'template'];
const run = getRunPrefix();

function isCancel(value) {
  if (p.isCancel(value)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }
  return value;
}

// ─── Feature: agents ─────────────────────────────────────────────────────────

function runAgents(targetDir, {interactive = true, agent, agentDocsPath} = {}) {
  try {
    const paths = agentDocsPath
      ? Array.isArray(agentDocsPath)
        ? agentDocsPath
        : [agentDocsPath]
      : undefined;
    const written = installAgentDocs(targetDir, {agent, paths});
    const summary = written.join(', ');
    if (interactive) {
      p.log.success(`AI agent docs installed → ${summary}`);
    } else {
      humanLog(`✓ AI agent docs installed → ${summary}`);
    }
  } catch (err) {
    // PathSafetyError carries a precise, user-actionable message —
    // surface it instead of the generic "could not install" warning so
    // misconfigured --agent-docs-path values aren't silently swallowed.
    if (err instanceof PathSafetyError) {
      const msg = `Error: ${err.message}`;
      if (interactive) {
        p.log.error(msg);
      } else {
        console.error(msg);
      }
      process.exitCode = 1;
      return;
    }
    const msg = `Could not install agent docs. Try again with \`${run} astryx init --features agents\`.`;
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
    humanLog(`✓ Theme scaffolding requires interactive mode. Run \`${run} astryx theme\` instead.`);
    return;
  }

  p.note(
    'Create a custom theme with your brand colors.\n' +
    `Run \`${run} astryx theme\` for the full theme wizard.\n` +
    `Run \`${run} astryx theme --list\` to see existing themes.`,
    'Themes',
  );
}

// ─── Feature: template ───────────────────────────────────────────────────────

async function runTemplate(targetDir, {interactive = true, templateName} = {}) {
  const templates = listTemplates();
  if (templates.length === 0) return;

  if (!interactive) {
    if (!templateName) {
      humanLog(`✓ Available templates: ${templates.join(', ')}. Use ${run} astryx template <name> [path].`);
      return;
    }

    if (!templates.includes(templateName)) {
      cliError(`Unknown template "${templateName}". Available: ${templates.join(', ')}`, {code: ERROR_CODES.ERR_UNKNOWN_TEMPLATE});
      return;
    }

    const outputDir = path.resolve(targetDir, `./src/pages/${templateName}`);
    const srcPath = path.join(CLI_ROOT, 'templates', 'pages', templateName, 'page.tsx');
    fs.mkdirSync(outputDir, {recursive: true});
    fs.copyFileSync(srcPath, path.join(outputDir, 'page.tsx'));
    humanLog(`✓ Template created at ${path.relative(targetDir, outputDir)}/page.tsx`);
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
  const srcPath = path.join(CLI_ROOT, 'templates', 'pages', templateChoice, 'page.tsx');

  fs.mkdirSync(outputDir, {recursive: true});
  fs.copyFileSync(srcPath, path.join(outputDir, 'page.tsx'));

  p.log.success(`Template created at ${path.relative(targetDir, outputDir)}/page.tsx`);
}

// ─── Command ─────────────────────────────────────────────────────────────────

export function registerInit(program) {
  program
    .command('init')
    .description('Initialize the design system in your project')
    .option('--features <list>', 'Comma-separated features to install (agents, theme, template)')
    .option('--all', 'Install all features, no prompts')
    .option('--remove-agents', 'Remove AI agent docs from all agent doc files')
    .option('--agent <tool>', 'Target AI tool for agent docs: claude, cursor, codex, all')
    .option('--agent-docs-path <path...>', 'Explicit file path(s) for agent docs')
    .action(async (options) => {
      const targetDir = process.cwd();

      // Remove mode
      if (options.removeAgents) {
        removeAgentDocs(targetDir);
        humanLog('✓ AI agent docs removed.');
        return;
      }

      // Non-interactive: --features or --all
      if (options.features || options.all) {
        const features = options.all
          ? VALID_FEATURES
          : options.features.split(',').map(f => f.trim().toLowerCase());

        const invalid = features.filter(f => !VALID_FEATURES.includes(f));
        if (invalid.length > 0) {
          cliError(`Unknown features: ${invalid.join(', ')}. Valid features: ${VALID_FEATURES.join(', ')}`, {code: ERROR_CODES.ERR_UNKNOWN_FEATURE});
          return;
        }

        for (const feature of features) {
          if (feature === 'agents') runAgents(targetDir, {
            interactive: false,
            agent: options.agent,
            agentDocsPath: options.agentDocsPath,
          });
          if (feature === 'theme') await runTheme({interactive: false});
          if (feature === 'template') await runTemplate(targetDir, {interactive: false});
        }
        return;
      }

      // Interactive wizard
      //
      // Guard: this wizard blocks on prompts. In a non-interactive context
      // (CI, piped stdin/stdout, no TTY) it would hang forever. Fail fast
      // with actionable guidance via the shared interactivity contract.
      requireInteractive({
        command: 'init',
        hint: `\`${run} astryx init --all\` or \`--features agents,theme,template\``,
      });

      p.intro('Welcome to the design system');

      p.note(
        'A design system for building internal tools\nwith 300+ React components.',
        'About',
      );

      // Feature: agents
      const shouldInstallAgents = isCancel(
        await p.confirm({
          message: 'Install AI agent support? (adds a design system cheat sheet to AGENTS.md)',
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
        `You can customize any component with:\n  ${run} astryx swizzle Button\n  ${run} astryx swizzle --list`,
        'Component Customization',
      );

      // Feature: template
      await runTemplate(targetDir);

      // Feature: theme awareness
      await runTheme();

      // Outro
      p.outro('Design system initialized!');

      humanLog('');
      humanLog('  Next steps:');
      humanLog("    1. Import components: import { Button } from '@astryxdesign/core'");
      humanLog('    2. Optionally add a theme:');
      humanLog("       import { defaultTheme } from '@astryxdesign/theme-default'");
      humanLog('       <Theme theme={defaultTheme}>...</Theme>');
      humanLog(`    3. ${run} xds --help for all commands`);
      humanLog('');
    });
}
