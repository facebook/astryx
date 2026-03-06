/**
 * @file Lazy jscodeshift installer
 *
 * Checks if jscodeshift is available and offers to install it on-demand.
 * Keeps the CLI lean — jscodeshift is only needed for codemods.
 */

import {execSync} from 'node:child_process';
import * as p from '@clack/prompts';

export async function ensureJscodeshift() {
  try {
    await import('jscodeshift');
    return true;
  } catch {
    p.log.warn('jscodeshift is required for codemods but not installed.');
    const shouldInstall = await p.confirm({
      message: 'Install jscodeshift now?',
      initialValue: true,
    });
    if (p.isCancel(shouldInstall) || !shouldInstall) {
      p.log.error('Cannot run codemods without jscodeshift.');
      return false;
    }
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
}
