/**
 * @file Path resolution utilities for XDS CLI
 *
 * Finds packages/core, project root, and CLI package root.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root of the @xds/cli package */
export const CLI_ROOT = path.resolve(__dirname, '..', '..');

/**
 * Find packages/core directory by walking up from startDir.
 * Also checks node_modules/@xds/core for installed usage.
 */
export function findCoreDir(startDir = process.cwd()) {
  let dir = startDir;

  for (let i = 0; i < 5; i++) {
    const candidate = path.join(dir, 'packages', 'core');
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const nodeModules = path.join(dir, 'node_modules', '@xds', 'core');
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
 * Discover external XDS-compatible packages from node_modules.
 * Scans for packages with an "xds" field in their package.json:
 *
 *   { "xds": { "docs": "./src", "category": "Common" } }
 *
 * Returns array of { name, category, docsDir }.
 */
export function discoverExternalPackages(startDir = process.cwd()) {
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
        if (pkg.name === '@xds/core') continue;
        if (pkg.xds && pkg.xds.docs) {
          externals.push({
            name: pkg.name,
            category: pkg.xds.category || pkg.name,
            docsDir: path.resolve(fullPath, pkg.xds.docs),
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
 * Returns directory names that contain XDS*.tsx files.
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
