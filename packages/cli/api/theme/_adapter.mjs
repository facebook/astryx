// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Shared data and write adapter for app-theme commands.
 *
 * Keeps the historical synchronous bundled-theme helper, resolves project-aware
 * source themes through Project, reads static generated-module state, and applies
 * each add/remove/use regeneration through the shared atomic write transaction.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {Project} from '../../foundation/config/project.mjs';
import {
  BUNDLED_THEME_PACKAGE,
  THEMES_DIR,
  discoverBundledThemes,
  discoverUnmigratedThemeCopies,
  themeImportPackage,
} from '../../foundation/discovery/theme-discovery.mjs';
import {
  ThemeImportError,
  resolveThemeImports,
} from '../../foundation/discovery/theme-imports.mjs';
import {
  ThemeStateError,
  planThemeAppWrite,
  readThemeState,
} from '../../foundation/config/theme-state.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {
  assertWithin,
  PathSafetyError,
} from '../../foundation/fs/path-safety.mjs';
import {stripCopyrightHeader} from '../../foundation/text/copyright-header.mjs';
import {applyWrites} from '../integration/add-helpers.mjs';

export {BUNDLED_THEME_PACKAGE, THEMES_DIR};

/**
 * Package written to the generated app record for one discovered theme.
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme} theme
 */
export function themeRecordOwner(theme) {
  return themeImportPackage(theme);
}

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
 * absent theme from an installed package whose theme descriptors are broken.
 * @param {string} cwd
 * @param {{includeLocal?: boolean}} [options]
 * @returns {Promise<{themes: import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[], issues: Array<import('../../foundation/integrations/issue').AstryxIntegrationIssue & {package: string}>}>}
 */
async function availableThemeState(cwd, {includeLocal = true} = {}) {
  let project;
  try {
    project = await Project.load(cwd);
  } catch {
    return {themes: availableBundledThemes(), issues: []};
  }
  try {
    const themes = await project.themes({includeLocal});
    return {themes, issues: await project.issues()};
  } catch (error) {
    throw asThemeError(error);
  }
}

/**
 * Bundled themes plus local and installed integration themes available to the
 * project.
 * @param {string} [cwd]
 * @param {{includeLocal?: boolean}} [options]
 * @returns {Promise<import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[]>}
 */
export async function listAvailableThemes(cwd = process.cwd(), options = {}) {
  return (await availableThemeState(cwd, options)).themes;
}

/**
 * Source copies made by the released `theme add` before local descriptors.
 * @param {string} cwd
 */
export function listUnmigratedThemeCopies(cwd) {
  return discoverUnmigratedThemeCopies(cwd);
}

/** @param {string} slug */
function defaultEjectTarget(slug) {
  return path.join('src', 'themes', slug);
}

/**
 * Strip repository boilerplate from UTF-8 text while preserving binary bytes.
 * @param {Buffer} bytes
 * @returns {Buffer|string}
 */
function scaffoldContents(bytes) {
  const text = bytes.toString('utf-8');
  return Buffer.from(text, 'utf-8').equals(bytes)
    ? stripCopyrightHeader(text)
    : bytes;
}

/**
 * Describe an ejected theme as a new, unmaintained local fork.
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme} theme
 */
function localThemeDescriptor(theme) {
  return `/** @type {import('@astryxdesign/cli/authoring').ThemeDoc} */
export default {
  type: 'theme',
  name: ${JSON.stringify(theme.slug)},
  displayName: ${JSON.stringify(theme.displayName)},
  description: ${JSON.stringify(theme.description)},
  maintained: false,
};
`;
}

/**
 * Publish one theme's complete source inventory as an atomic local fork.
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme} theme
 * @param {{cwd: string, targetPath?: string, overwrite?: boolean}} options
 * @returns {string} project-relative output directory
 */
export function ejectThemeFiles(theme, {cwd, targetPath, overwrite = false}) {
  let resolvedDir;
  try {
    resolvedDir = assertWithin(
      targetPath || defaultEjectTarget(theme.slug),
      cwd,
      {label: 'theme target path'},
    );
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  let writes;
  try {
    writes = theme.files.map(name => ({
      name,
      src: path.join(theme.sourceDir, name),
      dest: assertWithin(name, resolvedDir, {
        label: `theme destination for ${name}`,
      }),
    }));
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  for (const write of writes) {
    if (!fs.existsSync(write.src)) {
      throw new AstryxError(
        `Theme "${theme.slug}" is missing bundled file "${write.name}". ` +
          'Re-run `node scripts/generate-cli-themes.mjs` to rebuild the bundle.',
        undefined,
        ERROR_CODES.ERR_NO_SOURCE,
      );
    }
  }

  if (!overwrite) {
    const existing = writes.find(write => fs.existsSync(write.dest));
    if (existing) {
      const rel = path.relative(cwd, existing.dest) || existing.dest;
      throw new AstryxError(
        `Refusing to overwrite existing file ${rel}. ` +
          'Re-run with --overwrite (or -f) to replace it.',
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  }

  try {
    fs.mkdirSync(resolvedDir, {recursive: true});
    const plans = writes.map(write => {
      fs.mkdirSync(path.dirname(write.dest), {recursive: true});
      const dest = assertWithin(write.name, resolvedDir, {
        label: `theme destination for ${write.name}`,
      });
      return {
        path: dest,
        contents:
          path.resolve(write.src) === path.resolve(theme.docPath)
            ? localThemeDescriptor(theme)
            : scaffoldContents(fs.readFileSync(write.src)),
        createOnly: !overwrite,
      };
    });
    applyWrites(plans);
  } catch (error) {
    if (error instanceof AstryxError) throw error;
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Failed to write theme files: ${message}`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }

  return path.relative(cwd, resolvedDir) || '.';
}

/** @param {unknown} error */
function asThemeError(error) {
  if (error instanceof AstryxError) return error;
  const message = error instanceof Error ? error.message : String(error);
  const code =
    error instanceof ThemeStateError &&
    message.startsWith('Refusing to replace')
      ? ERROR_CODES.ERR_FILE_EXISTS
      : ERROR_CODES.ERR_THEME_INVALID;
  return new AstryxError(message, undefined, code);
}

/**
 * Resolve an available theme by case-insensitive slug and optional owner package.
 * Without an explicit package, a local theme shadows package themes that share
 * its slug. Other duplicate slugs fail closed until the caller selects an owner.
 * @param {string} [slug]
 * @param {{cwd?: string, package?: string, includeLocal?: boolean}} [options]
 * @returns {Promise<import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme | undefined>}
 */
export async function findTheme(slug, options = {}) {
  if (!slug) return undefined;
  const {themes, issues} = await availableThemeState(
    options.cwd ?? process.cwd(),
    {includeLocal: options.includeLocal},
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
  if (matches.length > 1 && options.package == null) {
    const local = matches.find(theme => theme.source === 'local');
    if (local) return local;
  }
  if (matches.length > 1) {
    throw new AstryxError(
      `Theme "${slug}" is provided by more than one package. Select one with --package.`,
      matches.map(theme => ({
        name: `${theme.slug} --package ${theme.package}`,
        reason:
          theme.source === 'bundled'
            ? 'bundled theme'
            : theme.source === 'local'
              ? 'local theme'
              : `provided by ${theme.package}`,
      })),
      ERROR_CODES.ERR_AMBIGUOUS_THEME,
    );
  }
  return matches[0];
}

/**
 * Read the generated module's app-theme record with stable CLI errors.
 * @param {string} [cwd]
 */
export function readAppThemeState(cwd = process.cwd()) {
  try {
    return readThemeState(cwd);
  } catch (error) {
    throw asThemeError(error);
  }
}

/**
 * Resolve every recorded owner to built import metadata, in record order.
 * @param {ReturnType<typeof readThemeState>} state
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[]} available
 */
export function resolveRecordedThemes(state, available) {
  /** @type {Map<string, number>} */
  const ownerCounts = new Map();
  for (const theme of available) {
    const owner = themeImportPackage(theme);
    ownerCounts.set(owner, (ownerCounts.get(owner) ?? 0) + 1);
  }
  return Object.entries(state.themes).map(([slug, owner]) => {
    const theme = available.find(
      candidate =>
        candidate.slug === slug && themeImportPackage(candidate) === owner,
    );
    if (!theme) {
      throw new AstryxError(
        `Added theme "${slug}" from ${owner} is unavailable. Reinstall the package or restore the local theme, then run \`astryx theme add ${slug} --package ${owner}\`.`,
        undefined,
        ERROR_CODES.ERR_UNKNOWN_THEME,
      );
    }
    try {
      return resolveThemeImports(theme, {
        cwd: state.projectDir,
        ownerThemeCount: ownerCounts.get(owner) ?? 1,
      });
    } catch (error) {
      if (error instanceof ThemeImportError) throw asThemeError(error);
      throw error;
    }
  });
}

/**
 * Resolve the current generated-module state without changing it.
 * @param {string} [cwd]
 */
export async function resolveThemeApp(cwd = process.cwd()) {
  const state = readAppThemeState(cwd);
  const available = await listAvailableThemes(state.projectDir);
  const entries = state.configured
    ? resolveRecordedThemes(state, available)
    : [];
  return {state, available, entries};
}

/**
 * @param {ReturnType<typeof readThemeState>} state
 * @param {Record<string, string>} themes
 * @param {string} defaultSlug
 * @param {'add'|'remove'|'use'} action
 * @param {string} slug
 * @param {boolean} changed
 * @param {import('../../foundation/discovery/theme-discovery.mjs').DiscoveredTheme[]} available
 * @returns {Promise<import('./theme.type.mjs').ThemeAppResponse>}
 */
async function writeThemeApp(
  state,
  themes,
  defaultSlug,
  action,
  slug,
  changed,
  available,
) {
  const finalState = {...state, themes, defaultSlug, configured: true};
  const resolved = resolveRecordedThemes(finalState, available);
  let prepared;
  try {
    prepared = planThemeAppWrite(finalState, themes, defaultSlug, resolved);
  } catch (error) {
    throw asThemeError(error);
  }
  try {
    applyWrites([prepared.plan]);
  } catch (error) {
    if (error instanceof AstryxError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Failed to write the generated theme module: ${message}`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }
  return {
    type: 'theme.app',
    data: {
      themes: prepared.entries.map(theme => ({
        slug: theme.slug,
        owner: theme.owner,
        module: theme.module,
        stylesheet: theme.stylesheet,
        ...(theme.fontStylesheet ? {fontStylesheet: theme.fontStylesheet} : {}),
        source: theme.source,
      })),
      default: defaultSlug,
      modulePath: prepared.module.path,
      change: {
        action,
        slug,
        changed,
        firstAdd: action === 'add' && !state.configured,
      },
    },
  };
}

/**
 * Add one available built theme to the app record.
 * @param {string} slug
 * @param {{cwd?: string, package?: string}} [options]
 * @returns {Promise<import('./theme.type.mjs').ThemeAppResponse>}
 */
export async function addThemeToApp(slug, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const match = await findTheme(slug, {cwd, package: options.package});
  if (!match) {
    const available = await listAvailableThemes(cwd);
    throw new AstryxError(
      `Unknown theme "${slug}"${options.package ? ` in package "${options.package}"` : ''}.`,
      available.map(theme => ({
        name: `${theme.slug} --package ${theme.package}`,
        reason:
          theme.source === 'bundled'
            ? 'bundled theme'
            : theme.source === 'local'
              ? 'local theme'
              : `provided by ${theme.package}`,
      })),
      ERROR_CODES.ERR_UNKNOWN_THEME,
    );
  }
  const state = readAppThemeState(cwd);
  const available = await listAvailableThemes(state.projectDir);
  const owner = themeImportPackage(match);
  const themes = {...state.themes, [match.slug]: owner};
  const changed = state.themes[match.slug] !== owner;
  const defaultSlug =
    state.configured && state.defaultSlug != null
      ? state.defaultSlug
      : match.slug;
  return writeThemeApp(
    state,
    themes,
    defaultSlug,
    'add',
    match.slug,
    changed,
    available,
  );
}

/**
 * Remove one non-default theme from the app record.
 * @param {string} slug
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('./theme.type.mjs').ThemeAppResponse>}
 */
export async function removeThemeFromApp(slug, options = {}) {
  const state = readAppThemeState(options.cwd ?? process.cwd());
  if (!state.configured || !Object.hasOwn(state.themes, slug)) {
    throw new AstryxError(
      `Theme "${slug}" is not added. Run \`astryx theme add ${slug}\` first.`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_THEME,
    );
  }
  if (state.defaultSlug === slug) {
    throw new AstryxError(
      `Theme "${slug}" is the default. Run \`astryx theme use <other-slug>\` before removing it.`,
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }
  const themes = {...state.themes};
  delete themes[slug];
  if (state.defaultSlug == null) {
    throw new AstryxError(
      'The generated theme module has no default theme. Run `astryx theme use <slug>` first.',
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }
  const available = await listAvailableThemes(state.projectDir);
  return writeThemeApp(
    state,
    themes,
    state.defaultSlug,
    'remove',
    slug,
    true,
    available,
  );
}

/**
 * Select one added theme as the app default.
 * @param {string} slug
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('./theme.type.mjs').ThemeAppResponse>}
 */
export async function useThemeInApp(slug, options = {}) {
  const state = readAppThemeState(options.cwd ?? process.cwd());
  if (!state.configured || !Object.hasOwn(state.themes, slug)) {
    throw new AstryxError(
      `Theme "${slug}" is not added. Run \`astryx theme add ${slug}\` first.`,
      undefined,
      ERROR_CODES.ERR_UNKNOWN_THEME,
    );
  }
  const available = await listAvailableThemes(state.projectDir);
  return writeThemeApp(
    state,
    state.themes,
    slug,
    'use',
    slug,
    state.defaultSlug !== slug,
    available,
  );
}
