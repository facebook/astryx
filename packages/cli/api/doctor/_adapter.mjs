// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @file Environment adapter for app-theme doctor evidence. */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {Project} from '../../foundation/config/project.mjs';
import {
  discoverUnmigratedThemeCopies,
  themeImportPackage,
} from '../../foundation/discovery/theme-discovery.mjs';
import {resolveThemeImports} from '../../foundation/discovery/theme-imports.mjs';
import {findCoreDir, findInstalledPackage} from '../../foundation/fs/paths.mjs';

/**
 * Package written to the generated app record for one discovered theme.
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme} theme
 */
export function themeRecordOwner(theme) {
  return themeImportPackage(theme);
}

export const SOURCE_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
]);

const SKIP_DIRS = new Set([
  '.git',
  '.next',
  'build',
  'coverage',
  'dist',
  'node_modules',
]);

/** @param {string} file */
export function readTextFile(file) {
  return fs.readFileSync(file, 'utf-8');
}

/** @param {string} file */
export function readTextFileIfExists(file) {
  if (!fs.existsSync(file)) return null;
  try {
    return readTextFile(file);
  } catch {
    return null;
  }
}

/**
 * A bounded app-source walk that excludes dependencies, generated output, and
 * links. The doctor parses the returned bytes without executing app code.
 * @param {string} root
 * @param {string} generatedModule
 */
export function listProjectSourceFiles(root, generatedModule) {
  /** @type {string[]} */
  const files = [];
  /** @type {string[]} */
  const queue = [root];
  while (queue.length > 0 && files.length < 5000) {
    const dir = /** @type {string} */ (queue.shift());
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.astryx-')) {
          queue.push(file);
        }
      } else if (
        entry.isFile() &&
        file !== generatedModule &&
        SOURCE_EXTENSIONS.has(path.extname(entry.name))
      ) {
        files.push(file);
      }
    }
  }
  return files;
}

/** @param {string} projectDir */
export async function discoverDoctorThemes(projectDir) {
  const project = await Project.load(projectDir);
  return project.themes();
}

/**
 * Resolve one discovered theme's built module and stylesheets.
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme} theme
 * @param {{cwd: string, ownerThemeCount: number}} options
 */
export function resolveDoctorThemeImports(theme, options) {
  return resolveThemeImports(theme, options);
}

/** @param {string} projectDir */
export function discoverDoctorUnmigratedCopies(projectDir) {
  return discoverUnmigratedThemeCopies(projectDir);
}

/** @param {string} projectDir */
export function findDoctorCoreDir(projectDir) {
  return findCoreDir(projectDir);
}

/** @param {string} projectDir @param {string} packageName */
export function findDoctorInstalledPackage(projectDir, packageName) {
  return findInstalledPackage(projectDir, packageName);
}

/** @param {string} file */
export function readPackageJson(file) {
  try {
    return JSON.parse(readTextFile(file));
  } catch {
    return null;
  }
}
