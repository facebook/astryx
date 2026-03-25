/**
 * @file Detect the project's package manager from lockfiles.
 *
 * Returns the correct command prefix for running package binaries
 * (e.g. 'npx xds', 'yarn xds', 'pnpm exec xds').
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Detect the package manager used in a project directory.
 * Walks up from targetDir looking for lockfiles.
 *
 * @param {string} [targetDir=process.cwd()]
 * @returns {'yarn'|'pnpm'|'bun'|'npm'}
 */
export function detectPackageManager(targetDir = process.cwd()) {
  let dir = path.resolve(targetDir);
  const root = path.parse(dir).root;

  while (dir !== root) {
    if (fs.existsSync(path.join(dir, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(dir, 'bun.lockb')) || fs.existsSync(path.join(dir, 'bun.lock'))) return 'bun';
    if (fs.existsSync(path.join(dir, 'package-lock.json'))) return 'npm';
    dir = path.dirname(dir);
  }

  return 'npx';
}

/**
 * Get the command prefix for running a package binary.
 *
 * @param {string} [targetDir]
 * @returns {string} e.g. 'npx', 'yarn', 'pnpm exec', 'bunx'
 */
export function getRunPrefix(targetDir) {
  const pm = detectPackageManager(targetDir);
  switch (pm) {
    case 'yarn': return 'yarn';
    case 'pnpm': return 'pnpm exec';
    case 'bun': return 'bunx';
    case 'npm':
    default: return 'npx';
  }
}
