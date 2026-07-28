// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lazy jscodeshift installer
 *
 * Checks if jscodeshift is available and installs it on-demand.
 * Keeps the CLI lean — jscodeshift is only needed for codemods.
 *
 * Non-interactive by default (no prompts): pass `installDeps: true` to
 * auto-install, otherwise the command fails fast with a helpful error.
 */

import {execSync} from 'node:child_process';
import * as p from '../lib/term-log.mjs';
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

    if (installDeps) {
      // Explicit opt-in — install without prompting.
      return installJscodeshift(silent);
    }

    // Non-interactive by default: fail fast with a helpful message instead of
    // prompting (the CLI never blocks on a TTY).
    log.error(
      'Cannot run codemods without jscodeshift. Use --install-deps to auto-install.',
    );
    return false;
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
    log.error(`Failed to install jscodeshift: ${/** @type {any} */ (err).message}`);
    return false;
  }
}
