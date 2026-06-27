// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Config loader — reads astryx.config.mjs from project root
 *
 * Walks up from cwd looking for astryx.config.mjs.
 * Returns the config object or defaults if not found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {loadIntegrations} from './integrations.mjs';
import {validateConfig} from './config-schema.mjs';

const DEFAULTS = {
  packages: [],
  integrations: [],
};

/**
 * Find astryx.config.mjs by walking up from startDir.
 * Returns the absolute path or null.
 */
export function findConfigPath(startDir = process.cwd()) {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const candidate = path.join(dir, 'astryx.config.mjs');
    if (fs.existsSync(candidate)) return candidate;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

/**
 * Load and return the config from astryx.config.mjs.
 * Returns defaults if no config file is found.
 */
export async function loadConfig(startDir = process.cwd()) {
  const configPath = findConfigPath(startDir);
  if (!configPath) return {...DEFAULTS};

  let rawConfig;
  try {
    const mod = await import(pathToFileURL(configPath).href);
    rawConfig = mod.default || {};
  } catch {
    return {...DEFAULTS};
  }

  const config = validateConfig(rawConfig);
  const configDir = path.dirname(configPath);
  const integrationSpecs = normalizeIntegrations(config.integrations);
  const loadedIntegrations = await loadIntegrations(integrationSpecs, {
    cwd: configDir,
  });
  return {
    ...DEFAULTS,
    ...config,
    packages: normalizePackages(config.packages, configDir),
    integrations: integrationSpecs,
    loadedIntegrations,
    gapReport:
      config.gapReport ?? firstDefined(loadedIntegrations, 'gapReport'),
    template: mergeTemplateConfig(config.template, loadedIntegrations),
  };
}

/**
 * Normalize packages to an array of unique absolute paths.
 * Filters out empty strings and non-string values.
 * Relative paths resolved from config file directory.
 * Deduplicates by resolved path.
 */
function normalizePackages(packages, configDir) {
  if (!packages) return [];
  const arr = Array.isArray(packages) ? packages : [packages];
  const seen = new Set();
  const result = [];
  for (const p of arr) {
    if (typeof p !== 'string' || p === '') continue;
    const resolved = path.isAbsolute(p) ? p : path.resolve(configDir, p);
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    result.push(resolved);
  }
  return result;
}

/**
 * Normalize integration specs to a string array. Integrations are package names
 * or manifest paths consumed by `astryx upgrade --integration`.
 */
function normalizeIntegrations(integrations) {
  if (!integrations) return [];
  const arr = Array.isArray(integrations) ? integrations : [integrations];
  return arr.filter(value => typeof value === 'string' && value !== '');
}

function firstDefined(integrations, key) {
  for (const integration of integrations) {
    if (integration[key] !== undefined) return integration[key];
  }
  return undefined;
}

function mergeTemplateConfig(template, integrations) {
  if (template?.get) return template;
  const integrationTemplate = firstDefined(integrations, 'template');
  return integrationTemplate ?? template;
}
