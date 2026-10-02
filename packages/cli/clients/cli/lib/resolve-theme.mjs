// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Resolve the app's default theme for component metadata.
 *
 * A generated theme module is the primary record. Its default slug and owner
 * choose a built package or local module without executing the generated module
 * itself. Only a project with no generated module falls back to the released
 * `package.json#astryx.theme` behavior. Environment variables never select a
 * theme.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {
  isLocalThemeOwner,
  readThemeState,
} from '../../../foundation/config/theme-state.mjs';
import {inspectPackageExport} from '../../../foundation/discovery/package-exports.mjs';
import {findInstalledPackage} from '../../../foundation/fs/paths.mjs';

/**
 * Try to load a module from the app's resolution context.
 * @param {string} specifier
 * @param {string} cwd
 * @returns {unknown}
 */
function tryLoadModule(specifier, cwd) {
  const appRequire = createRequire(path.join(cwd, 'package.json'));
  try {
    const resolved =
      specifier.startsWith('.') || specifier.startsWith('/')
        ? path.resolve(cwd, specifier)
        : specifier;
    return appRequire(resolved);
  } catch {
    return null;
  }
}

/**
 * Extract a theme object from a loaded module.
 * @param {any} mod
 * @returns {any}
 */
function extractTheme(mod) {
  if (!mod || typeof mod !== 'object') return null;
  const obj = mod.default || mod;
  if (obj.name && (obj.tokens || obj.variants)) return obj;
  if (mod.theme && typeof mod.theme === 'object' && mod.theme.name) {
    return mod.theme;
  }
  for (const key of Object.keys(mod)) {
    if (key.endsWith('Theme') && typeof mod[key] === 'object' && mod[key]?.name) {
      return mod[key];
    }
  }
  return null;
}

/**
 * Resolve a generated record's default slug to its built module file.
 * @param {ReturnType<typeof readThemeState>} state
 * @returns {string|null}
 */
function defaultBuiltModule(state) {
  const slug = state.defaultSlug;
  if (slug == null || !Object.hasOwn(state.themes, slug)) return null;
  const owner = state.themes[slug];
  if (isLocalThemeOwner(owner)) {
    return path.resolve(state.projectDir, owner, slug, `${slug}.js`);
  }
  const packageDir = findInstalledPackage(state.projectDir, owner);
  if (!packageDir) return null;
  let pkg;
  try {
    pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, 'package.json'), 'utf-8'),
    );
  } catch {
    return null;
  }
  const perTheme = inspectPackageExport(
    pkg,
    packageDir,
    `./themes/${slug}`,
  );
  if (perTheme.target != null) return perTheme.target;
  const ownerCount = Object.values(state.themes).filter(
    value => value === owner,
  ).length;
  if (ownerCount !== 1) return null;
  return inspectPackageExport(pkg, packageDir, './built').target;
}

/**
 * Resolve the legacy `astryx.theme` value to a module.
 * @param {string} specifier
 * @param {string} cwd
 */
function loadLegacyTheme(specifier, cwd) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const mod = tryLoadModule(specifier, cwd);
    if (!mod) {
      console.warn(`⚠ theme: could not resolve file "${specifier}" from ${cwd}`);
    }
    return mod;
  }
  if (specifier.startsWith('@')) {
    const mod = tryLoadModule(specifier, cwd);
    if (!mod) console.warn(`⚠ theme: could not resolve package "${specifier}"`);
    return mod;
  }
  const conventional = `@astryxdesign/theme-${specifier}`;
  const mod =
    tryLoadModule(conventional, cwd) ?? tryLoadModule(specifier, cwd);
  if (!mod) {
    console.warn(
      `⚠ theme: could not resolve "${specifier}" (tried ${conventional} and ${specifier})`,
    );
  }
  return mod;
}

/**
 * Resolve the active Astryx theme from the generated record or legacy package
 * field.
 * @param {string} [cwd]
 * @returns {{variants?: Record<string, string[]>|null, fonts?: Record<string, string>|null, name?: string|null}|null}
 */
export function resolveTheme(cwd = process.cwd()) {
  let state;
  try {
    state = readThemeState(cwd);
  } catch (error) {
    console.warn(
      `⚠ theme: could not read the generated theme record: ${error instanceof Error ? error.message : String(error)}`,
    );
    return null;
  }

  let label;
  let mod;
  if (state.configured) {
    label = state.defaultSlug;
    const built = defaultBuiltModule(state);
    if (!built) {
      console.warn(
        `⚠ theme: default theme "${state.defaultSlug ?? ''}" has no resolvable built module`,
      );
      return null;
    }
    mod = tryLoadModule(built, state.projectDir);
  } else {
    const specifier = state.legacyTheme;
    if (typeof specifier !== 'string' || specifier.length === 0) return null;
    label = specifier;
    mod = loadLegacyTheme(specifier, state.projectDir);
  }

  if (!mod) return null;
  const theme = extractTheme(mod);
  if (!theme) {
    console.warn(`⚠ theme: loaded "${label}" but could not find a theme object`);
    return null;
  }
  return {
    name: theme.name || null,
    variants: theme.variants || null,
    fonts: theme.fonts || null,
  };
}
