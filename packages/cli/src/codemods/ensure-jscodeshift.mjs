// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lazy jscodeshift installer
 *
 * Checks if jscodeshift is available and offers to install it on-demand.
 * Keeps the CLI lean — jscodeshift is only needed for codemods.
 *
 * In non-interactive environments (CI, LLM agents), the interactive prompt
 * is skipped. Pass `installDeps: true` to auto-install without prompting,
 * or the command will fail with a helpful error message.
 */

import {execSync} from 'node:child_process';
import * as p from '@clack/prompts';
import {detectPackageManager} from '../utils/package-manager.mjs';

/**
 * @param {object} [options]
 * @param {boolean} [options.installDeps] - Auto-install without prompting
 * @param {boolean} [options.silent] - Suppress human-facing output (for --json)
 */
export async function ensureJscodeshift({installDeps = false, silent = false} = {}) {
  const log = silent
    ? {warn() {}, error() {}, step() {}, success() {}}
    : p.log;
  try {
    await import('jscodeshift');
    return true;
  } catch {
    log.warn('jscodeshift is required for codemods but not installed.');

    const isInteractive = process.stdout.isTTY && !process.env.CI;

    if (installDeps) {
      // Explicit opt-in — install without prompting
      return installJscodeshift(silent);
    }

    if (!isInteractive || silent) {
      // Non-interactive environment (or --json) — fail fast with a helpful message
      log.error(
        'Cannot run codemods without jscodeshift. ' +
          'Use --install-deps to auto-install in non-interactive environments.',
      );
      return false;
    }

    // Interactive TTY — prompt as before
    const shouldInstall = await p.confirm({
      message: 'Install jscodeshift now?',
      initialValue: true,
    });
    if (p.isCancel(shouldInstall) || !shouldInstall) {
      p.log.error('Cannot run codemods without jscodeshift.');
      return false;
    }
    return installJscodeshift(silent);
  }
}

/** @returns {boolean} */
function installJscodeshift(silent = false) {
  const log = silent
    ? {step() {}, success() {}, error() {}}
    : p.log;
  const pm = detectPackageManager();
  const cmds = {
    yarn: 'yarn add --dev jscodeshift',
    pnpm: 'pnpm add -D jscodeshift',
    bun: 'bun add -D jscodeshift',
    npm: 'npm install --save-dev jscodeshift',
    npx: 'npm install --save-dev jscodeshift',
  };
  const cmd = cmds[pm] || cmds.npm;

  try {
    log.step(`Installing jscodeshift via ${pm}...`);
    execSync(cmd, {stdio: 'pipe'});
    log.success('jscodeshift installed.');
    return true;
  } catch (err) {
    log.error(`Failed to install jscodeshift: ${err.message}`);
    return false;
  }
}
