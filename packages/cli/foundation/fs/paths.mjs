// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Path resolution utilities for Astryx CLI
 *
 * Finds packages/core, project root, and CLI package root.
 */

import * as fs from 'node:fs';
import {createRequire} from 'node:module';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {
  activePackageSet,
  packageSetDeclarations,
  resolveFromPackageSet,
} from '../runtime/package-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root of the @astryxdesign/cli package */
export const CLI_ROOT = path.resolve(__dirname, '..', '..');

/**
 * The base CLI's Core lookup. Keep this bounded, existence-only behavior when no
 * package set is active so installing this capability changes no ordinary run.
 * @param {string} startDir
 * @returns {string|null}
 */
export function findCoreDirWithoutPackageSet(startDir) {
  let dir = startDir;
  for (let i = 0; i < 5; i++) {
    const source = path.join(dir, 'packages', 'core');
    if (fs.existsSync(source)) return source;

    const installed = path.join(dir, 'node_modules', '@astryxdesign', 'core');
    if (fs.existsSync(installed)) return installed;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Find packages/core directory by walking up from startDir.
 * With a hosted package set, use the project Core the plan recorded, then the
 * set. With no set, preserve the base CLI lookup exactly.
 */
export function findCoreDir(startDir = process.cwd()) {
  const set = activePackageSet();
  if (!set) return findCoreDirWithoutPackageSet(startDir);
  const projectCore = set.packages.find(
    entry =>
      entry.name === '@astryxdesign/core' &&
      entry.source === 'project' &&
      entry.dir != null,
  )?.dir;
  return projectCore ?? resolveFromPackageSet('@astryxdesign/core');
}

/**
 * The Core the hosted planner sees in the project at `startDir`: a real Astryx
 * `packages/core`, an installed `node_modules/@astryxdesign/core`, or the
 * project's Yarn PnP resolution, never the active package set's.
 * @param {string} [startDir]
 * @returns {string|null}
 */
export function findProjectCoreDir(startDir = process.cwd()) {
  let dir = path.resolve(startDir);

  for (;;) {
    const source = path.join(dir, 'packages', 'core');
    if (isCorePackage(source)) return source;

    const installed = path.join(dir, 'node_modules', '@astryxdesign', 'core');
    if (isCorePackage(installed)) return installed;

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  return findPnpPackage(startDir, '@astryxdesign/core');
}

/** @param {string} dir */
function isCorePackage(dir) {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'),
    );
    return pkg?.name === '@astryxdesign/core';
  } catch {
    return false;
  }
}

/**
 * Where Yarn's Plug'n'Play runtime says a package lives.
 *
 * A PnP project has no node_modules for the walk below to find. PnP answers
 * from the project's own dependency graph and ignores NODE_PATH, so asking it
 * keeps the lookup project-local. Outside a PnP process there is nothing to ask.
 *
 * @param {string} startDir
 * @param {string} name
 * @returns {string|null}
 */
function findPnpPackage(startDir, name) {
  if (!process.versions.pnp) return null;
  try {
    const api = createRequire(path.join(startDir, 'noop.js'))('pnpapi');
    const dir = api.resolveToUnqualified(name, path.join(startDir, '/'));
    return dir && fs.existsSync(path.join(dir, 'package.json')) ? dir : null;
  } catch {
    // The project does not declare it, or this is not a PnP process after all.
    return null;
  }
}

/**
 * Locate a package the project at `startDir` actually installed.
 *
 * Deliberately not `require.resolve`: Node folds NODE_PATH and the global
 * folders into resolution even when `paths` is given, so a package merely
 * reachable from the ambient environment reads as installed here. pnpm's
 * isolated layout puts every package in `node_modules/.pnpm/node_modules`,
 * and Vitest puts that directory on NODE_PATH, so the gap is not theoretical.
 * Reading package.json off disk also sidesteps packages that don't export it,
 * so the version is always available to range-check.
 *
 * Walks the node_modules chain first, then asks PnP, which covers the Yarn
 * default layout where that chain does not exist.
 *
 * @param {string} startDir
 * @param {string} name
 * @returns {string|null} the package directory, or null when not installed
 */
export function findInstalledPackage(startDir, name) {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    const candidate = path.join(dir, 'node_modules', ...name.split('/'));
    if (fs.existsSync(path.join(candidate, 'package.json'))) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return findPnpPackage(startDir, name);
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
 * Scan the nearest project node_modules the same way legacy external-package
 * discovery does. The hosted planner uses the package directories and versions
 * to report the exact packages a project-only run can see.
 *
 * @param {string} [startDir]
 * @returns {Array<{name: string, version: string | null, packageDir: string, category: string, docsDir: string, blocksDir: string | null}>}
 */
export function scanLegacyExternalPackages(startDir = process.cwd()) {
  /** @type {Array<{name: string, version: string | null, packageDir: string, category: string, docsDir: string, blocksDir: string | null}>} */
  const packages = [];
  let dir = startDir;
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
  if (!nodeModulesDir) return packages;

  /** @param {string} searchDir */
  const scanDir = searchDir => {
    if (!fs.existsSync(searchDir)) return;
    const entries = fs.readdirSync(searchDir, {withFileTypes: true});

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.') || entry.name === '.bin') continue;

      const fullPath = path.join(searchDir, entry.name);
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
          packages.push({
            name: pkg.name,
            version: typeof pkg.version === 'string' ? pkg.version : null,
            packageDir: fullPath,
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
  return packages;
}

/**
 * Discover external Astryx-compatible packages from node_modules.
 * Scans for packages with an "astryx" field in their package.json:
 *
 *   { "astryx": { "docs": "./src", "category": "Common", "blocks": "./blocks/components" } }
 *
 * Also reads the packages an active package set declares, when the
 * project's node_modules does not hold them.
 *
 * Returns array of { name, category, docsDir, blocksDir }.
 */
export function discoverExternalPackages(startDir = process.cwd()) {
  /** @type {Array<{name: string, category: string, docsDir: string, blocksDir: string | null}>} */
  const externals = [];
  const set = activePackageSet();
  if (!set || set.mode === 'project') {
    // With no hosted root serving the run, keep the installed CLI's discovery
    // behavior: every installed legacy package remains visible.
    return scanLegacyExternalPackages(startDir).map(
      ({name, category, docsDir, blocksDir}) => ({
        name,
        category,
        docsDir,
        blocksDir,
      }),
    );
  }

  const found = new Set();

  /** @param {string} packageDir */
  const addPackage = packageDir => {
    try {
      const pkg = JSON.parse(
        fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
      );
      if (
        typeof pkg.name !== 'string' ||
        pkg.name === '@astryxdesign/core' ||
        found.has(pkg.name) ||
        !pkg.astryx?.docs
      ) {
        return;
      }
      found.add(pkg.name);
      externals.push({
        name: pkg.name,
        category: pkg.astryx.category || pkg.name,
        docsDir: path.resolve(packageDir, pkg.astryx.docs),
        blocksDir: pkg.astryx.blocks
          ? path.resolve(packageDir, pkg.astryx.blocks)
          : null,
      });
    } catch {
      // skip invalid JSON
    }
  };

  // A plan enumerates only the project package directories it recorded. Never
  // scan the caller's whole node_modules while a hosted set is active.
  for (const entry of set.packages) {
    if (entry.source === 'project' && entry.dir) addPackage(entry.dir);
  }

  // The active package set adds only packages its declaration list names; its
  // node_modules is never scanned wholesale.
  for (const name of packageSetDeclarations()) {
    if (found.has(name) || name === '@astryxdesign/core') continue;
    const pkgDir = resolveFromPackageSet(name);
    if (pkgDir) addPackage(pkgDir);
  }
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
  if (path.isAbsolute(rel) || rel === '..' || rel.startsWith(`..${path.sep}`))
    return false;

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
