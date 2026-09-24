// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Where an authored file ships: its package and its path inside it.
 *
 * @input An absolute file path.
 * @output `<package name>/<path inside the package>`, found by walking up to
 *   the nearest package.json that names a package.
 * @position Used by the doc compiler for provenance and diagnostics, so no
 *   compiled node or diagnostic carries a machine-specific path.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** @type {Map<string, {dir: string, name: string} | null>} */
const packageRoots = new Map();

/**
 * Where a file ships: its package's name and its path inside that package.
 * @param {string} file absolute path
 * @returns {string}
 */
export function packageSource(file) {
  const root = packageRootOf(path.dirname(file));
  if (root == null) return file.split(path.sep).join('/');
  const inside = path.relative(root.dir, file).split(path.sep).join('/');
  return `${root.name}/${inside}`;
}

/**
 * @param {string} dir
 * @returns {{dir: string, name: string} | null}
 */
function packageRootOf(dir) {
  const cached = packageRoots.get(dir);
  if (cached !== undefined) return cached;
  /** @type {{dir: string, name: string} | null} */
  let found = null;
  const manifest = path.join(dir, 'package.json');
  if (fs.existsSync(manifest)) {
    try {
      const {name} = JSON.parse(fs.readFileSync(manifest, 'utf-8'));
      if (typeof name === 'string') found = {dir, name};
    } catch {
      // An unreadable package.json names no package; keep walking up.
    }
  }
  if (found == null) {
    const parent = path.dirname(dir);
    found = parent === dir ? null : packageRootOf(parent);
  }
  packageRoots.set(dir, found);
  return found;
}

/**
 * The name of the package a file ships in, or null outside any package.
 * @param {string} file absolute path
 * @returns {string | null}
 */
export function packageOf(file) {
  return packageRootOf(path.dirname(file))?.name ?? null;
}
