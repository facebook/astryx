// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file init.run leaf — non-interactive project setup + feature installer.
 *
 * `run(options, ctx)` is the default / `--features` / `--all` path behind
 * `astryx init`. It installs the AGENTS.md/CLAUDE.md agent-docs cheat sheet,
 * points at the theme + page-building workflows, and (optionally) scaffolds a
 * starter template — with NO prompts, so it behaves identically for humans,
 * agents, CI, and piped I/O. It performs the side effects and returns an
 * `init.run` receipt. Hard errors (unknown feature/template) throw AstryxError
 * with a stable code. Human output is emitted through the injected `logger`
 * (silent by default) so the CLI keeps its exact plain output and a
 * programmatic caller stays quiet.
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import {CLI_ROOT} from '../../../utils/paths.mjs';
import {PathSafetyError} from '../../../utils/path-safety.mjs';
import {getCliInvocation} from '../../../utils/package-manager.mjs';
import {installAgentDocs} from '../../../lib/agent-docs/agent-docs.mjs';
import {listTemplates} from '../../template/template.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../lib/error-codes.mjs';
import {noopInitLogger} from '../_adapter.mjs';

const VALID_FEATURES = ['agents', 'theme', 'template'];

/**
 * Build the "Next steps" lines printed at the end of `astryx init`.
 *
 * Theme guidance must match the runtime recommendation emitted by core's
 * <Theme> component (packages/core/src/theme/Theme.tsx): the pre-built theme
 * path (`/built` import + `theme.css`) plus the base CSS import, so users
 * don't end up with an unstyled app or the slower runtime style-injection
 * path. See https://github.com/facebook/astryx/issues/3080.
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

/**
 * Install the agent-docs block; records the outcome (or soft error) on `data`.
 * Mirrors the CLI's historical soft-error policy: a PathSafetyError surfaces its
 * precise message and flags a non-zero exit; any other failure prints the
 * generic retry hint and continues without changing the exit code.
 *
 * @param {string} cwd
 * @param {import('../../../types/api').InitOptions} options
 * @param {string} invocation
 * @param {import('../_adapter.mjs').InitLogger} logger
 * @param {import('../../../types/init').InitRunData} data
 */
function applyAgents(cwd, options, invocation, logger, data) {
  try {
    const paths = options.agentDocsPath
      ? Array.isArray(options.agentDocsPath)
        ? options.agentDocsPath
        : [options.agentDocsPath]
      : undefined;
    const written = installAgentDocs(cwd, {agent: options.agent, paths});
    data.docsWritten = written;
    logger.log(`✓ AI agent docs installed → ${written.join(', ')}`);
  } catch (err) {
    // PathSafetyError carries a precise, user-actionable message — surface it
    // (and flag exit 1) instead of the generic "could not install" warning so
    // misconfigured --agent-docs-path values aren't silently swallowed.
    if (err instanceof PathSafetyError) {
      logger.error(`Error: ${err.message}`);
      data.docsError = {kind: 'path-safety', message: err.message};
      return;
    }
    logger.error(
      `Could not install agent docs. Try again with \`${invocation} init --features agents\`.`,
    );
    data.docsError = {kind: 'install-failed'};
  }
}

/**
 * Emit the template guidance, or (programmatic-only) scaffold a named template.
 * The CLI never passes `templateName`, so from the CLI this always emits the
 * build-workflow prose (or nothing when no templates are bundled).
 *
 * @param {string} cwd
 * @param {{templateName?: string}} opts
 * @param {string} invocation
 * @param {import('../_adapter.mjs').InitLogger} logger
 * @param {import('../../../types/init').InitRunData} data
 */
function applyTemplate(cwd, {templateName}, invocation, logger, data) {
  const templates = listTemplates();
  if (templates.length === 0) {
    data.template = 'skipped';
    return;
  }

  if (!templateName) {
    // Point agents at the build workflow rather than dumping page-template
    // names — `build` surfaces pages AND blocks AND components for an idea,
    // and `build` with no args is the full how-to-build playbook.
    logger.log('✓ To build UI, use these commands:');
    logger.log('');
    logger.log(
      `    ${invocation} build "<what you're building>"   build a page — kit: closest template + blocks + components`,
    );
    logger.log(
      `    ${invocation} build                            the how-to-build workflow (read this first)`,
    );
    logger.log(
      `    ${invocation} search <query>                   find anything — components, docs, templates, blocks`,
    );
    logger.log('');
    data.template = 'workflow';
    return;
  }

  if (!templates.includes(templateName)) {
    throw new AstryxError(
      `Unknown template "${templateName}". Available: ${templates.join(', ')}`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
    );
  }

  const outputDir = path.resolve(cwd, `./src/pages/${templateName}`);
  const srcPath = path.join(CLI_ROOT, 'templates', 'pages', templateName, 'page.tsx');
  fs.mkdirSync(outputDir, {recursive: true});
  fs.copyFileSync(srcPath, path.join(outputDir, 'page.tsx'));
  const rel = path.relative(cwd, outputDir);
  logger.log(`✓ Template created at ${rel}/page.tsx`);
  data.template = 'created';
  data.templatePath = rel;
}

/**
 * Run the install path of the non-interactive init flow (the default no-flags
 * install plus `--features` / `--all`). Performs the side effects (agent-docs
 * install, template scaffold) and returns an `init.run` receipt. Progress is
 * emitted through `logger` (silent by default); unknown feature or template
 * names throw AstryxError with a stable code.
 *
 * @param {import('../../../types/api').InitOptions} [options]
 * @param {{cwd?: string, logger?: import('../_adapter.mjs').InitLogger}} [ctx]
 * @returns {Promise<import('../../../types/init').InitRunResponse>}
 */
export async function run(options = {}, {cwd = process.cwd(), logger = noopInitLogger} = {}) {
  const invocation = getCliInvocation();

  // Non-interactive feature install: --features or --all.
  if (options.features || options.all) {
    const features = options.all
      ? VALID_FEATURES
      : String(options.features)
          .split(',')
          .map(f => f.trim().toLowerCase());

    const invalid = features.filter(f => !VALID_FEATURES.includes(f));
    if (invalid.length > 0) {
      throw new AstryxError(
        `Unknown features: ${invalid.join(', ')}. Valid features: ${VALID_FEATURES.join(', ')}`,
        undefined,
        ERROR_CODES.ERR_UNKNOWN_FEATURE,
      );
    }

    /** @type {import('../../../types/init').InitRunData} */
    const data = {
      mode: 'features',
      features,
      docsWritten: [],
      docsError: null,
      theme: false,
      template: null,
      templatePath: null,
      nextSteps: false,
    };
    for (const feature of features) {
      if (feature === 'agents') applyAgents(cwd, options, invocation, logger, data);
      if (feature === 'theme') {
        logger.log(
          `✓ For a custom theme, run \`${invocation} theme\` (browse) or \`${invocation} theme add <slug>\` (scaffold).`,
        );
        data.theme = true;
      }
      if (feature === 'template') {
        applyTemplate(cwd, {templateName: options.templateName}, invocation, logger, data);
      }
    }
    return {type: 'init.run', data};
  }

  // No flags: TTY-free default — install the AI agent cheat sheet with NO
  // prompts, then print the getting-started guidance.
  /** @type {import('../../../types/init').InitRunData} */
  const data = {
    mode: 'default',
    features: ['agents'],
    docsWritten: [],
    docsError: null,
    theme: false,
    template: null,
    templatePath: null,
    nextSteps: true,
  };
  applyAgents(cwd, options, invocation, logger, data);
  logger.log('');
  logger.log(
    `  Tip: \`${invocation} init --all\` also points you to the theme and page-building workflows.`,
  );
  for (const line of getNextSteps(invocation)) logger.log(line);
  return {type: 'init.run', data};
}
