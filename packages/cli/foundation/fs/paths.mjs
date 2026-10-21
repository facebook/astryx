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
import {listDir, pathExists} from './listing-cache.mjs';
import {ERROR_CODES} from '../response/error-codes.mjs';
import {carriedCore, runChoice} from '../release/run-context.mjs';
import {findDeclaringPackage} from '../release/project.mjs';
import {hostedRun, recordResolved} from '../runtime/package-root.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root of the @astryxdesign/cli package */
export const CLI_ROOT = path.resolve(__dirname, '..', '..');

/**
 * The Core a command answers from: the project's (see
 * {@link findProjectCoreDir}), else, when a copy other than the project's own
 * CLI answers, the Core that copy carries (spec AST-081 FR3): the
 * `@astryxdesign/core` of its own release, beside it or in the per-user
 * release cache. Never fetches; {@link requireCoreDir} does.
 *
 * Commands that judge or change a project (`doctor`, `swizzle`, `upgrade`)
 * read {@link findProjectCoreDir} instead, so a carried Core never passes a
 * project check or lands in a folder that installed none.
 *
 * @param {string} [startDir]
 * @returns {string | null}
 */
export function findCoreDir(startDir = process.cwd()) {
  const own = findProjectCoreDir(startDir);
  return own
    ? noteCore(own, 'project')
    : noteCore(carriedCoreFor(startDir).dir);
}

/**
 * Note the Core a hosted run reads, for the record its host entry returns
 * (architecture:cli-surface INV30). Does nothing outside a hosted run.
 * @template {string | null} T
 * @param {T} dir
 * @param {'project'} [source] where it came from, when the caller knows
 * @returns {T}
 */
function noteCore(dir, source) {
  if (dir && hostedRun()) {
    let version;
    try {
      version = JSON.parse(
        fs.readFileSync(path.join(dir, 'package.json'), 'utf8'),
      ).version;
    } catch {
      version = null;
    }
    recordResolved('@astryxdesign/core', version, dir, source);
  }
  return dir;
}

/**
 * Why a command that reads Core cannot run, when the answering release's own
 * Core is needed and cannot be installed: outside a project, or in a project
 * with nothing installed (spec AST-081 FR3).
 * @param {{unavailable: string | null, version?: string, reason?: string}} found
 * @param {boolean} inProject
 * @returns {string}
 */
export function unavailableCoreMessage(found, inProject) {
  const unwritable = /cannot be written/.test(found.unavailable ?? '');
  if (inProject) {
    const core = found.version ? `Core ${found.version}` : 'its Core';
    const why = found.reason ? ` (${found.reason})` : '';
    return `This project has no Core installed, and ${core} could not be downloaded${why}. Install the project's dependencies${unwritable ? ', or make that folder writable' : ''}, then run again.`;
  }
  return `${found.unavailable}. Outside a project, commands that read Core use the Core of the release that answers; ${unwritable ? 'make that folder writable and run again' : 'run again when the package registry can be reached'}.`;
}

/**
 * Like {@link findCoreDir}, but a copy that carries no Core installs its
 * release's Core into the per-user cache first. Throws ERR_CORE_NOT_FOUND
 * when there is no Core to answer from, and ERR_VERSIONS_UNAVAILABLE when the
 * carried Core is needed and cannot be installed.
 *
 * @param {string} [startDir]
 * @returns {string}
 */
export function requireCoreDir(startDir = process.cwd()) {
  const found = findProjectCoreDir(startDir) ?? carriedCoreFor(startDir, true);
  if (typeof found === 'string') return noteCore(found, 'project');
  if (found.unavailable) {
    throw codedError(
      unavailableCoreMessage(found, runChoice(startDir).inProject),
      ERROR_CODES.ERR_VERSIONS_UNAVAILABLE,
    );
  }
  if (found.dir) return noteCore(found.dir);
  throw codedError(
    'Could not find @astryxdesign/core package',
    ERROR_CODES.ERR_CORE_NOT_FOUND,
  );
}

/**
 * An Error carrying a stable error code, which the JSON envelope and every
 * command's error output read the way they read an API error's.
 * @param {string} message
 * @param {string} code
 * @returns {Error & {code: string}}
 */
function codedError(message, code) {
  return Object.assign(new Error(message), {code});
}

/**
 * The carried Core alone, for a caller that already looked for the project's
 * Core its own way: the folder, or null when the copy answering in `startDir`
 * is the project's own CLI or carries none.
 * @param {string} startDir
 * @param {{fetch?: boolean}} [options]
 * @returns {string | null}
 */
export function findCarriedCoreDir(startDir, {fetch = false} = {}) {
  return carriedCoreFor(startDir, fetch).dir;
}

/**
 * The carried Core for a run in `startDir`, when the copy answering there is
 * not the project's own CLI.
 * @param {string} startDir
 * @param {boolean} [fetch]
 * @returns {{dir: string | null, unavailable: string | null, version?: string, reason?: string}}
 */
function carriedCoreFor(startDir, fetch = false) {
  const carried = carriedCore({fetch: false});
  if (!carried.dir && !fetch) return carried;
  if (runChoice(startDir).copy === 'project') {
    return {dir: null, unavailable: null};
  }
  return carried.dir ? carried : carriedCore({fetch: true});
}

/**
 * Find packages/core directory by walking up from startDir.
 * Also checks node_modules/@astryxdesign/core for installed usage.
 *
 * The project's Core only: in the folder or four above it, the reach every
 * released version used, else from the folder of the package.json that makes
 * the folder part of a project, however deep the folder is.
 *
 * @param {string} [startDir]
 * @returns {string | null}
 */
export function findProjectCoreDir(startDir = process.cwd()) {
  const near = findNearbyCoreDir(startDir);
  if (near) return near;
  // A folder deeper than that reach still belongs to the project the walk to
  // its package.json finds, so its Core is looked up from there too (spec
  // AST-081, a folder's project): never the carried Core in its place.
  const declaring = findDeclaringPackage(startDir);
  return declaring && declaring.dir !== path.resolve(startDir)
    ? findNearbyCoreDir(declaring.dir)
    : null;
}

/**
 * The Core installed in `startDir` or one of the four folders above it.
 * @param {string} startDir
 * @returns {string | null}
 */
function findNearbyCoreDir(startDir) {
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
  const scanDir = searchDir => {
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
  if (!pathExists(targetPath)) return false;

  const rel = path.relative(rootDir, targetPath);
  if (rel === '') return true;
  if (path.isAbsolute(rel) || rel === '..' || rel.startsWith(`..${path.sep}`))
    return false;

  let dir = rootDir;
  for (const segment of rel.split(path.sep)) {
    let entries;
    try {
      entries = listDir(dir);
    } catch {
      return false;
    }
    if (!entries.includes(segment)) return false;
    dir = path.join(dir, segment);
  }
  return true;
}
