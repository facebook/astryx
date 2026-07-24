// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init command — non-interactive setup + feature installer
 *
 * `astryx init` is non-interactive by default: it installs the AGENTS.md/
 * CLAUDE.md cheat sheet with NO prompts, so it behaves identically for humans,
 * AI agents, CI, and piped I/O — it never hangs or errors on a missing TTY.
 * Non-interactive feature install: `astryx init --features agents,theme,template`
 * Re-runnable: safe to run multiple times, idempotent
 *
 * Features:
 *   agents   — Install AGENTS.md/CLAUDE.md cheat sheet for AI coding agents
 *   theme    — Point to the theme workflow (`astryx theme`)
 *   template — Copy a starter page template
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import {CLI_ROOT} from '../../utils/paths.mjs';
import {PathSafetyError} from '../../utils/path-safety.mjs';
import {getCliInvocation} from '../../utils/package-manager.mjs';
import {installAgentDocs, removeAgentDocs} from './agent-docs.mjs';
import {listTemplates} from './template.mjs';
import {humanLog} from '../../lib/json.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';

const VALID_FEATURES = ['agents', 'theme', 'template'];
const run = getCliInvocation();

/**
 * Build the "Next steps" lines printed at the end of `astryx init`.
 *
 * Theme guidance must match the runtime recommendation emitted by core's
 * <Theme> component (packages/core/src/theme/Theme.tsx): the pre-built theme
 * path (`/built` import + `theme.css`) plus the base CSS import, so users
 * don't end up with an unstyled app or the slower runtime style-injection
 * path. See https://github.com/facebook/astryx/issues/3080.
 *
 * Exported for testing.
 *
 * @param {string} invocation install-aware CLI invocation stem (e.g. `npx astryx`, `pnpm exec astryx`, or `npx @astryxdesign/cli` for one-off runs)
 * @returns {string[]} ordered list of human-facing lines
 */
export function getNextSteps(invocation) {
  return [
    '',
    '  Next steps:',
    "    1. Import base styles: import '@astryxdesign/core/reset.css'",
    "       and import '@astryxdesign/core/astryx.css'",
    "    2. Import components: import { Button } from '@astryxdesign/core'",
    '    3. Optionally add a theme (use the pre-built path for performance):',
    "       import { neutralTheme } from '@astryxdesign/theme-neutral/built'",
    "       import '@astryxdesign/theme-neutral/theme.css'",
    '       <Theme theme={neutralTheme}>...</Theme>',
    `       For custom themes, run \`${invocation} theme build <file>\` to generate the built artifacts.`,
    `    4. ${invocation} --help for all commands`,
    '',
  ];
}

// ─── Feature: agents ─────────────────────────────────────────────────────────

/**
 * @param {string} targetDir
 * @param {{agent?: string, agentDocsPath?: string | string[]}} [opts]
 */
function runAgents(targetDir, {agent, agentDocsPath} = {}) {
  try {
    const paths = agentDocsPath
      ? Array.isArray(agentDocsPath)
        ? agentDocsPath
        : [agentDocsPath]
      : undefined;
    const written = installAgentDocs(targetDir, {agent, paths});
    const summary = written.join(', ');
    humanLog(`✓ AI agent docs installed → ${summary}`);
  } catch (err) {
    // PathSafetyError carries a precise, user-actionable message —
    // surface it instead of the generic "could not install" warning so
    // misconfigured --agent-docs-path values aren't silently swallowed.
    if (err instanceof PathSafetyError) {
      console.error(`Error: ${err.message}`);
      process.exitCode = 1;
      return;
    }
    console.error(`Could not install agent docs. Try again with \`${run} init --features agents\`.`);
  }
}

// ─── Feature: theme ──────────────────────────────────────────────────────────

function runTheme() {
  humanLog(`✓ For a custom theme, run \`${run} theme\` (browse) or \`${run} theme add <slug>\` (scaffold).`);
}

// ─── Feature: template ───────────────────────────────────────────────────────

/**
 * @param {string} targetDir
 * @param {{templateName?: string}} [opts]
 */
function runTemplate(targetDir, {templateName} = {}) {
  const templates = listTemplates();
  if (templates.length === 0) return;

  if (!templateName) {
    // Point agents at the build workflow rather than dumping page-template
    // names — `build` surfaces pages AND blocks AND components for an idea,
    // and `build` with no args is the full how-to-build playbook.
    humanLog('✓ To build UI, use these commands:');
    humanLog('');
    humanLog(`    ${run} build "<what you're building>"   build a page — kit: closest template + blocks + components`);
    humanLog(`    ${run} build                            the how-to-build workflow (read this first)`);
    humanLog(`    ${run} search <query>                   find anything — components, docs, templates, blocks`);
    humanLog('');
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
}

// ─── Command ─────────────────────────────────────────────────────────────────

/**
 * @param {import('commander').Command} program
 */
export function registerInit(program) {
  program
    .command('init')
    .description('Initialize the design system in your project')
    .option('--features <list>', 'Comma-separated features to install (agents, theme, template)')
    .option('--all', 'Install all features, no prompts')
    .option('--remove-agents', 'Remove AI agent docs from all agent doc files')
    .option('--agent <tool>', 'Target AI tool for agent docs: claude, cursor, codex, hermes, all')
    .option('--agent-docs-path <path...>', 'Explicit file path(s) for agent docs')
    .action((/** @type {{features?: string, all?: boolean, removeAgents?: boolean, agent?: string, agentDocsPath?: string | string[]}} */ options) => {
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
          : /** @type {string} */ (options.features).split(',').map(f => f.trim().toLowerCase());

        const invalid = features.filter(f => !VALID_FEATURES.includes(f));
        if (invalid.length > 0) {
          cliError(`Unknown features: ${invalid.join(', ')}. Valid features: ${VALID_FEATURES.join(', ')}`, {code: ERROR_CODES.ERR_UNKNOWN_FEATURE});
          return;
        }

        for (const feature of features) {
          if (feature === 'agents') runAgents(targetDir, {
            agent: options.agent,
            agentDocsPath: options.agentDocsPath,
          });
          if (feature === 'theme') runTheme();
          if (feature === 'template') runTemplate(targetDir, {});
        }
        return;
      }

      // No flags: TTY-free default. `astryx init` installs the AI agent cheat
      // sheet with NO prompts, so it behaves identically for humans, agents, CI,
      // and piped I/O — it never hangs or errors on a missing TTY. (A guided
      // `--interactive` setup may return later as an explicit opt-in.)
      runAgents(targetDir, {
        agent: options.agent,
        agentDocsPath: options.agentDocsPath,
      });
      humanLog('');
      humanLog(`  Tip: \`${run} init --all\` also points you to the theme and page-building workflows.`);

      for (const line of getNextSteps(run)) {
        humanLog(line);
      }
    });
}
