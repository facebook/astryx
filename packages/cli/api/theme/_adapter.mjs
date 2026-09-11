// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared data layer for `theme list` and `theme add`.
 *
 * `listThemes()` intentionally keeps its historical synchronous, bundled-only
 * contract. Project-aware callers use `listAvailableThemes()`, which asks
 * Project for the bundled catalog plus every installed integration catalog.
 */

import {Project} from '../../foundation/config/project.mjs';
import {
  BUNDLED_THEME_PACKAGE,
  MANIFEST_PATH,
  THEMES_DIR,
  discoverBundledThemes,
} from '../../foundation/discovery/theme-discovery.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

export {BUNDLED_THEME_PACKAGE, MANIFEST_PATH, THEMES_DIR};

/**
 * A bundled theme entry kept for the historical public `listThemes()` helper.
 * @typedef {Pick<import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme, 'slug' | 'displayName' | 'description' | 'maintained' | 'entry' | 'exportName' | 'files'>} BundledTheme
 */

/**
 * The themes bundled in this CLI build. Kept synchronous for compatibility with
 * programmatic callers that use this low-level helper directly.
 * @returns {BundledTheme[]}
 */
export function listThemes() {
  return availableBundledThemes().map(theme => ({
    slug: theme.slug,
    displayName: theme.displayName,
    description: theme.description,
    maintained: theme.maintained,
    entry: theme.entry,
    exportName: theme.exportName,
    files: theme.files,
  }));
}

/** @returns {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[]} */
function availableBundledThemes() {
  try {
    return discoverBundledThemes();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(message, undefined, ERROR_CODES.ERR_NO_SOURCE);
  }
}

/**
 * Load available themes with any package-owned integration issues found while
 * discovering them. The issue set lets a package-scoped lookup distinguish an
 * absent theme from an installed package whose catalog is broken.
 * @param {string} cwd
 * @returns {Promise<{themes: import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[], issues: Array<import('../../foundation/integrations/issue').AstryxIntegrationIssue & {package: string}>}>}
 */
async function availableThemeState(cwd) {
  try {
    const project = await Project.load(cwd);
    const themes = await project.themes();
    return {themes, issues: await project.issues()};
  } catch {
    return {themes: availableBundledThemes(), issues: []};
  }
}

/**
 * Bundled themes plus source themes from integrations installed in `cwd`.
 * A project/config load failure degrades to the bundled catalog, preserving the
 * command's historical usefulness outside a configured project.
 * @param {string} [cwd]
 * @returns {Promise<import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[]>}
 */
export async function listAvailableThemes(cwd = process.cwd()) {
  return (await availableThemeState(cwd)).themes;
}

/**
 * Resolve an available theme by case-insensitive slug and optional owner package.
 * Duplicate slugs fail closed until the caller selects an owner.
 * @param {string} [slug]
 * @param {{cwd?: string, package?: string}} [options]
 * @returns {Promise<import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme | undefined>}
 */
export async function findTheme(slug, options = {}) {
  if (!slug) return undefined;
  const {themes, issues} = await availableThemeState(
    options.cwd ?? process.cwd(),
  );
  const normalized = String(slug).toLowerCase();
  const matches = themes.filter(
    theme =>
      theme.slug.toLowerCase() === normalized &&
      (options.package == null || theme.package === options.package),
  );
  if (matches.length === 0 && options.package != null) {
    const packageIssue = issues.find(
      issue => issue.package === options.package && issue.severity === 'error',
    );
    if (packageIssue) {
      throw new AstryxError(
        `Theme package "${options.package}" is installed but unavailable: ${packageIssue.message}`,
        undefined,
        ERROR_CODES.ERR_THEME_INVALID,
      );
    }
  }
  if (matches.length > 1) {
    throw new AstryxError(
      `Theme "${slug}" is provided by more than one package. Select one with --package.`,
      matches.map(theme => ({
        name: `${theme.slug} --package ${theme.package}`,
        reason: theme.bundled
          ? 'bundled theme'
          : `provided by ${theme.package}`,
      })),
      ERROR_CODES.ERR_AMBIGUOUS_THEME,
    );
  }
  return matches[0];
}
