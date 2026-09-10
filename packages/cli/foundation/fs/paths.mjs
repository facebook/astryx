// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path resolution utilities for Astryx CLI
 *
 * Finds packages/core, project root, and CLI package root.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root of the @astryxdesign/cli package */
export const CLI_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Find packages/core directory by walking up from startDir.
 * Also checks node_modules/@astryxdesign/core for installed usage.
 */
export function findCoreDir(startDir = process.cwd()) {
  let dir = startDir;

  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'packages', 'core');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const nodeModules = path.join(dir, 'node_modules', '@astryxdesign', 'core');
    if (fs.existsSync(nodeModules)) {
      return nodeModules;
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

/**
 * Find the monorepo root by looking for the root package.json
 * that has workspaces defined.
 */
export function findProjectRoot(startDir = process.cwd()) {
  let dir = startDir;

  for (let i = 0; i < 5; i++) {
    const pkgPath = path.join(dir, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
        if (pkg.workspaces) {
          return dir;
        }
      } catch {
        // skip invalid JSON
      }
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return null;
}

/**
 * Discover external Astryx-compatible packages from node_modules.
 * Scans for packages with an "astryx" field in their package.json:
 *
 *   { "astryx": { "docs": "./src", "category": "Common", "blocks": "./blocks/components" } }
 *
 * Returns array of { name, category, docsDir, blocksDir }.
 */
export function discoverExternalPackages(startDir = process.cwd()) {
  /** @type {Array<{name: string, category: string, docsDir: string, blocksDir: string | null}>} */
  const externals = [];
  let dir = startDir;

  // Walk up to find node_modules
  let nodeModulesDir = null;
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'node_modules');
    if (fs.existsSync(candidate)) {
      nodeModulesDir = candidate;
      break;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  if (!nodeModulesDir) return externals;

  /** @param {string} searchDir */
  const scanDir = (searchDir) => {
    if (!fs.existsSync(searchDir)) return;
    const entries = fs.readdirSync(searchDir, {withFileTypes: true});

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === '.bin') continue;

      const fullPath = path.join(searchDir, entry.name);

      // Recurse into scoped packages (@org/*)
      if (entry.name.startsWith('@')) {
        scanDir(fullPath);
        continue;
      }

      const pkgJsonPath = path.join(fullPath, 'package.json');
      if (!fs.existsSync(pkgJsonPath)) continue;

      try {
        const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf-8'));
        if (pkg.name === '@astryxdesign/core') continue;
        if (pkg.astryx && pkg.astryx.docs) {
          externals.push({
            name: pkg.name,
            category: pkg.astryx.category || pkg.name,
            docsDir: path.resolve(fullPath, pkg.astryx.docs),
            blocksDir: pkg.astryx.blocks
              ? path.resolve(fullPath, pkg.astryx.blocks)
              : null,
          });
        }
      } catch {
        // skip invalid JSON
      }
    }
  };

  scanDir(nodeModulesDir);
  return externals;
}

/**
 * List available component directories in packages/core/src.
 * Returns directory names that contain Astryx*.tsx files.
 * @param {string} coreDir
 */
export function listComponents(coreDir) {
  const srcDir = path.join(coreDir, 'src');
  if (!fs.existsSync(srcDir)) return [];

  const entries = fs.readdirSync(srcDir, {withFileTypes: true});
  return entries
    .filter(e => {
      if (!e.isDirectory()) return false;
      // Skip non-component dirs
      if (['hooks', 'theme', 'utils'].includes(e.name)) return false;
      return true;
    })
    .map(e => e.name)
    .sort();
}

/**
 * Does `targetPath` exist with EXACTLY this spelling?
 *
 * `fs.existsSync` answers through the filesystem's own case folding, so on
 * macOS and Windows a probe for `src/button/Button.doc.mjs` succeeds against
 * the real `src/Button/Button.doc.mjs`. Name resolvers built on that probe
 * then resolve a component or hook the caller never named, and hand back a
 * path spelled the way the caller typed it — a path that does not exist on
 * Linux, where the same lookup correctly misses. Every segment below
 * `rootDir` is checked against its parent's real directory listing.
 *
 * @param {string} targetPath - Path to probe; must be inside `rootDir`.
 * @param {string} rootDir - Already-real path; it and its parents are not checked.
 * @returns {boolean}
 */
export function existsCaseExact(targetPath, rootDir) {
  if (!fs.existsSync(targetPath)) return false;

  const rel = path.relative(rootDir, targetPath);
  if (rel === '') return true;
  if (path.isAbsolute(rel) || rel === '..' || rel.startsWith(`..${path.sep}`)) return false;

  let dir = rootDir;
  for (const segment of rel.split(path.sep)) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
}
