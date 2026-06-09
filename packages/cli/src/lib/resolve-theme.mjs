// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme resolution — resolve a theme from config or environment
 *
 * Resolution sources (in priority order):
 * 1. XDS_THEME environment variable
 * 2. xds.theme field in package.json
 *
 * Resolution strategy for the value:
 * - Starts with `.` or `/` → file path relative to cwd
 * - Starts with `@` → npm package (require/import)
 * - Otherwise → try `@xds/theme-{name}`, then try as bare package name
 *
 * Returns the theme object's `variants` and `fonts` if available,
 * or null if no theme is configured or found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';

const _require = createRequire(import.meta.url);

/**
 * Try to load a module, returning the default export or the module itself.
 * Returns null if the module cannot be found.
 */
function tryLoadModule(specifier, cwd) {
  // For relative/absolute paths, resolve against cwd
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    const resolved = path.resolve(cwd, specifier);
    try {
      return _require(resolved);
    } catch {
      return null;
    }
  }

  // For package specifiers, try require
  try {
    return _require(specifier);
  } catch {
    return null;
  }
}

/**
 * Extract theme data from a loaded module.
 * Handles both `module.default` and direct `module` patterns,
 * as well as named exports like `module.theme` or `module.{name}Theme`.
 */
function extractTheme(mod) {
  if (!mod || typeof mod !== 'object') return null;

  // Check default export
  const obj = mod.default || mod;

  // If it looks like a theme (has name + tokens or variants), use it directly
  if (obj.name && (obj.tokens || obj.variants)) {
    return obj;
  }

  // Check for a `theme` named export
  if (mod.theme && typeof mod.theme === 'object' && mod.theme.name) {
    return mod.theme;
  }

  // Check for any export ending in 'Theme'
  for (const key of Object.keys(mod)) {
    if (key.endsWith('Theme') && typeof mod[key] === 'object' && mod[key]?.name) {
      return mod[key];
    }
  }

  return null;
}

/**
 * Resolve the active XDS theme from config and environment.
 *
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 * @returns {{ variants?: Record<string, string[]>, fonts?: Record<string, string>, name?: string } | null}
 */
export function resolveTheme(cwd = process.cwd()) {
  // 1. Determine theme specifier
  let specifier = process.env.XDS_THEME || null;

  if (!specifier) {
    // Read from package.json
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        specifier = pkg.xds?.theme || null;
      } catch {
        // Ignore parse errors
      }
    }
  }

  if (!specifier) {
    return null;
  }

  // 2. Resolve the specifier to a module
  let mod;

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    // File path
    mod = tryLoadModule(specifier, cwd);
    if (!mod) {
      console.warn(`⚠ theme: could not resolve file "${specifier}" from ${cwd}`);
      return null;
    }
  } else if (specifier.startsWith('@')) {
    // Scoped package
    mod = tryLoadModule(specifier, cwd);
    if (!mod) {
      console.warn(`⚠ theme: could not resolve package "${specifier}"`);
      return null;
    }
  } else {
    // Convention: try @xds/theme-{name} first, then bare package
    mod = tryLoadModule(`@xds/theme-${specifier}`, cwd);
    if (!mod) {
      mod = tryLoadModule(specifier, cwd);
    }
    if (!mod) {
      console.warn(`⚠ theme: could not resolve "${specifier}" (tried @xds/theme-${specifier} and ${specifier})`);
      return null;
    }
  }

  // 3. Extract theme data
  const theme = extractTheme(mod);
  if (!theme) {
    console.warn(`⚠ theme: loaded "${specifier}" but could not find a theme object`);
    return null;
  }

  return {
    name: theme.name || null,
    variants: theme.variants || null,
    fonts: theme.fonts || null,
  };
}
