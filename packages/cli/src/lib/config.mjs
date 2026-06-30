// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Config loader — reads astryx.config.{ts,mjs,js} from the consumer root.
 *
 * The config must be a SIBLING of the consumer package.json. We find the
 * nearest package.json walking up from cwd, then look for a single
 * astryx.config.{ts,mjs,js} next to it. Multiple configs at that root is a
 * hard error; a missing config yields an empty config.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createJiti} from 'jiti';
import {loadIntegrations} from './integrations.mjs';
import {validateConfig} from './config-schema.mjs';

/** Conventional config basenames, in load-precedence order. */
const CONFIG_BASENAMES = [
  'astryx.config.ts',
  'astryx.config.mjs',
  'astryx.config.js',
];

let jitiInstance;
function getJiti() {
  if (!jitiInstance) {
    jitiInstance = createJiti(import.meta.url);
  }
  return jitiInstance;
}

/**
 * Find the directory of the nearest package.json walking up from startDir.
 * Returns the absolute directory or null.
 */
function findPackageRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 50; i++) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Find astryx.config.{ts,mjs,js} as a sibling of the nearest package.json.
 * Returns the absolute path, or null if none is present.
 * Throws if multiple config files exist at that root.
 */
export function findConfigPath(startDir = process.cwd()) {
  const root = findPackageRoot(startDir) ?? startDir;
  const present = CONFIG_BASENAMES.filter(name =>
    fs.existsSync(path.join(root, name)),
  );
  if (present.length > 1) {
    throw new Error(
      `Multiple Astryx config files found in ${root} (${present.join(', ')}). Keep exactly one.`,
    );
  }
  return present.length === 1 ? path.join(root, present[0]) : null;
}

/**
 * Load a config module. `.ts` is loaded via jiti; `.mjs`/`.js` via dynamic
 * import.
 */
async function importConfig(file) {
  if (file.endsWith('.ts')) {
    return await getJiti().import(file);
  }
  return await import(pathToFileURL(file).href);
}

/**
 * Load and return the resolved config.
 * Returns an empty config when no config file is found.
 *
 * @param {string} [startDir]
 * @returns {Promise<{integrations: string[], issuesUrl?: string, hooks?: object, experimental?: object, loadedIntegrations: object[]}>}
 */
export async function loadConfig(startDir = process.cwd()) {
  const configPath = findConfigPath(startDir);
  if (!configPath) {
    return {integrations: [], loadedIntegrations: []};
  }

  const mod = await importConfig(configPath);
  const rawConfig = mod.default ?? {};
  const config = validateConfig(rawConfig);

  const configDir = path.dirname(configPath);
  const integrations = config.integrations ?? [];
  const loadedIntegrations = await loadIntegrations(integrations, {
    cwd: configDir,
  });

  return {
    integrations,
    issuesUrl: config.issuesUrl,
    hooks: config.hooks,
    experimental: config.experimental,
    loadedIntegrations,
  };
}
