/**
 * @file Config loader — reads xds.config.mjs from project root
 *
 * Walks up from cwd looking for xds.config.mjs.
 * Returns the config object or defaults if not found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';

const DEFAULTS = {
  packages: [],
};

/**
 * Find xds.config.mjs by walking up from startDir.
 * Returns the absolute path or null.
 */
export function findConfigPath(startDir = process.cwd()) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, 'xds.config.mjs');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Load and return the config from xds.config.mjs.
 * Returns defaults if no config file is found.
 */
export async function loadConfig(startDir = process.cwd()) {
  const configPath = findConfigPath(startDir);
  if (!configPath) return {...DEFAULTS};

  try {
    const mod = await import(pathToFileURL(configPath).href);
    const config = mod.default || {};
    return {
      ...DEFAULTS,
      ...config,
      packages: normalizePackages(config.packages, path.dirname(configPath)),
    };
  } catch {
    return {...DEFAULTS};
  }
}

/**
 * Normalize packages to an array of absolute paths.
 * Relative paths resolved from config file directory.
 */
function normalizePackages(packages, configDir) {
  if (!packages) return [];
  const arr = Array.isArray(packages) ? packages : [packages];
  return arr.map(p => (path.isAbsolute(p) ? p : path.resolve(configDir, p)));
}
