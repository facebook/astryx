// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Detect the project's package manager from lockfiles.
 *
 * Returns the correct command prefix for running package binaries
 * (e.g. 'npx astryx', 'yarn astryx', 'pnpm exec astryx').
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
  const KNOWN_PMS = new Set(['yarn', 'pnpm', 'bun', 'npm']);
  let dir = path.resolve(targetDir);
  const root = path.parse(dir).root;

  while (dir !== root) {
    // 1. Lockfiles (highest priority)
    if (fs.existsSync(path.join(dir, 'yarn.lock'))) return 'yarn';
    if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) return 'pnpm';
    if (fs.existsSync(path.join(dir, 'bun.lockb')) || fs.existsSync(path.join(dir, 'bun.lock'))) return 'bun';
    if (fs.existsSync(path.join(dir, 'package-lock.json'))) return 'npm';

    // 2. packageManager field in package.json
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.packageManager) {
          const name = pkg.packageManager.split('@')[0];
          if (KNOWN_PMS.has(name)) return name;
        }
      } catch {
        // Best-effort: unreadable/invalid package.json — keep walking up.
      }
    }

    dir = path.dirname(dir);
  }

  // 3. npm_config_user_agent env var (set by all PMs when running scripts)
  const ua = process.env.npm_config_user_agent;
  if (ua) {
    const name = ua.split('/')[0];
    if (KNOWN_PMS.has(name)) return name;
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
