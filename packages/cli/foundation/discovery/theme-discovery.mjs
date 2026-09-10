// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme catalog discovery shared by Project, theme list/add, and
 * integration validation.
 *
 * A theme root uses the same layout as the CLI's generated bundle:
 * `manifest.json` beside one directory per slug. Manifest `entry` and `files`
 * paths are relative to that slug directory and are confined there before any
 * caller reads or copies them.
 *
 * @input a bundled or integration-owned theme root
 * @output validated source-theme records with package ownership
 * @position packages/cli/foundation/discovery — shared theme discovery
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../fs/paths.mjs';
import {assertWithin, PathSafetyError} from '../fs/path-safety.mjs';

export const BUNDLED_THEME_PACKAGE = '@astryxdesign/cli';
export const THEMES_DIR = path.join(CLI_ROOT, 'assets', 'templates', 'themes');
export const THEME_MANIFEST_BASENAME = 'manifest.json';
export const MANIFEST_PATH = path.join(THEMES_DIR, THEME_MANIFEST_BASENAME);

/**
 * @typedef {object} DiscoveredTheme
 * @property {string} slug
 * @property {string} displayName
 * @property {string} description
 * @property {boolean} maintained
 * @property {string} entry
 * @property {string} exportName
 * @property {string[]} files
 * @property {string} package
 * @property {string} sourceDir absolute directory holding this theme's files
 * @property {boolean} bundled
 */

/** @param {unknown} value @param {string} field @param {string} owner */
function requiredString(value, field, owner) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(
      `Theme catalog for ${owner} has an invalid ${field}; expected a non-empty string.`,
    );
  }
  return value;
}

/**
 * Resolve one authored relative path without allowing POSIX or Windows escape
 * syntax, even when discovery runs on the other platform.
 * @param {string} value
 * @param {string} root
 * @param {string} label
 */
function resolveThemePath(value, root, label) {
  if (
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    value.split(/[\\/]/u).some(segment => segment === '..' || segment === '.')
  ) {
    throw new Error(
      `Invalid ${label} "${value}": it must stay inside the theme directory.`,
    );
  }
  try {
    return assertWithin(value, root, {label});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new Error(error.message, {cause: error});
    }
    throw error;
  }
}

/**
 * Read and validate one theme catalog.
 * @param {string} themeRoot absolute catalog root
 * @param {string} owner package that owns the catalog
 * @param {{bundled?: boolean}} [options]
 * @returns {DiscoveredTheme[]}
 */
export function discoverThemeCatalog(themeRoot, owner, {bundled = false} = {}) {
  if (!fs.existsSync(themeRoot) || !fs.statSync(themeRoot).isDirectory()) {
    throw new Error(
      `Declared themes root does not exist on disk: ${themeRoot}`,
    );
  }

  const manifestPath = resolveThemePath(
    THEME_MANIFEST_BASENAME,
    themeRoot,
    'theme catalog manifest',
  );
  if (!fs.existsSync(manifestPath) || !fs.statSync(manifestPath).isFile()) {
    throw new Error(
      `Theme root for ${owner} must contain ${THEME_MANIFEST_BASENAME}.`,
    );
  }

  /** @type {unknown} */
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Theme catalog for ${owner} is unreadable: ${message}`, {
      cause: error,
    });
  }

  if (parsed == null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Theme catalog for ${owner} must be a JSON object.`);
  }
  const catalog = /** @type {{version?: unknown, themes?: unknown}} */ (parsed);
  if (catalog.version !== 1) {
    throw new Error(`Theme catalog for ${owner} must use version 1.`);
  }
  if (!Array.isArray(catalog.themes)) {
    throw new Error(`Theme catalog for ${owner} must contain a themes array.`);
  }

  /** @type {DiscoveredTheme[]} */
  const themes = [];
  const slugs = new Set();
  for (const [index, raw] of catalog.themes.entries()) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      throw new Error(
        `Theme catalog for ${owner} has an invalid entry at index ${index}.`,
      );
    }
    const entry = /** @type {Record<string, unknown>} */ (raw);
    const slug = requiredString(entry.slug, `themes[${index}].slug`, owner);
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u.test(slug)) {
      throw new Error(
        `Theme catalog for ${owner} has invalid slug "${slug}"; use lowercase kebab-case starting with a letter.`,
      );
    }
    const normalizedSlug = slug.toLowerCase();
    if (slugs.has(normalizedSlug)) {
      throw new Error(
        `Theme catalog for ${owner} declares duplicate slug "${slug}".`,
      );
    }
    slugs.add(normalizedSlug);

    const displayName = requiredString(
      entry.displayName,
      `theme "${slug}" displayName`,
      owner,
    );
    if (typeof entry.description !== 'string') {
      throw new Error(
        `Theme catalog for ${owner} has an invalid description for "${slug}".`,
      );
    }
    if (typeof entry.maintained !== 'boolean') {
      throw new Error(
        `Theme catalog for ${owner} has an invalid maintained flag for "${slug}".`,
      );
    }
    const entryFile = requiredString(
      entry.entry,
      `theme "${slug}" entry`,
      owner,
    );
    const exportName = requiredString(
      entry.exportName,
      `theme "${slug}" exportName`,
      owner,
    );
    if (!/^[$A-Z_a-z][$\w]*$/u.test(exportName)) {
      throw new Error(
        `Theme catalog for ${owner} has invalid exportName "${exportName}".`,
      );
    }
    if (!Array.isArray(entry.files) || entry.files.length === 0) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" must list at least one file.`,
      );
    }

    const files = entry.files.map((file, fileIndex) =>
      requiredString(file, `theme "${slug}" files[${fileIndex}]`, owner),
    );
    if (new Set(files).size !== files.length) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" lists a file more than once.`,
      );
    }
    if (!files.includes(entryFile)) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" must include entry "${entryFile}" in files.`,
      );
    }
    if (!/\.(?:ts|tsx|mjs|js)$/u.test(entryFile)) {
      throw new Error(
        `Theme catalog for ${owner} theme "${slug}" entry must be source code.`,
      );
    }

    const sourceDir = resolveThemePath(
      slug,
      themeRoot,
      `theme "${slug}" directory`,
    );
    if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
      throw new Error(
        `Theme catalog for ${owner} is missing directory "${slug}".`,
      );
    }
    for (const file of files) {
      const source = resolveThemePath(file, sourceDir, `theme "${slug}" file`);
      if (!fs.existsSync(source) || !fs.statSync(source).isFile()) {
        throw new Error(
          `Theme catalog for ${owner} theme "${slug}" is missing file "${file}".`,
        );
      }
    }

    themes.push({
      slug,
      displayName,
      description: entry.description,
      maintained: entry.maintained,
      entry: entryFile,
      exportName,
      files,
      package: owner,
      sourceDir,
      bundled,
    });
  }

  return themes;
}

/** @returns {DiscoveredTheme[]} */
export function discoverBundledThemes() {
  return discoverThemeCatalog(THEMES_DIR, BUNDLED_THEME_PACKAGE, {
    bundled: true,
  });
}

/**
 * @param {import('../integrations/integrations.mjs').LoadedIntegration} integration
 * @returns {DiscoveredTheme[]}
 */
export function discoverIntegrationThemes(integration) {
  if (!integration.themes) return [];
  return discoverThemeCatalog(integration.themes, integration.name);
}
