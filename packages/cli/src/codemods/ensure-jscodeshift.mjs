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

/**
 * @param {object} [options]
 * @param {boolean} [options.installDeps] - Auto-install without prompting
 */
export async function ensureJscodeshift({installDeps = false} = {}) {
  try {
    await import('jscodeshift');
    return true;
  } catch {
    p.log.warn('jscodeshift is required for codemods but not installed.');

    const isInteractive = process.stdout.isTTY && !process.env.CI;

    if (installDeps) {
      // Explicit opt-in — install without prompting
      return installJscodeshift();
    }

    if (!isInteractive) {
      // Non-interactive environment — fail fast with a helpful message
      p.log.error(
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
    return installJscodeshift();
  }
}

/** @returns {boolean} */
function installJscodeshift() {
  try {
    p.log.step('Installing jscodeshift...');
    execSync('npm install --no-save jscodeshift', {stdio: 'pipe'});
    p.log.success('jscodeshift installed.');
    return true;
  } catch (err) {
    p.log.error(`Failed to install jscodeshift: ${err.message}`);
    return false;
  }
}
