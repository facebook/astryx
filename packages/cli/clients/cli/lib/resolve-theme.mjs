// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme resolution — resolve a theme from config or environment
 * @input Configured theme module (package or file) and its `themeVariants` export
 * @output Theme name, fonts, and custom variant metadata for component docs
 * @position CLI theme metadata resolution
 *
 * Resolution sources (in priority order):
 * 1. ASTRYX_THEME environment variable
 * 2. astryx.theme field in package.json
 *
 * Resolution strategy for the value:
 * - Starts with `.` or `/` → file path relative to cwd
 * - Starts with `@` → npm package (require/import)
 * - Otherwise → try `@astryxdesign/theme-{name}`, then try as bare package name
 *
 * Returns the theme object's `name` and `fonts`, plus the loaded module's
 * `themeVariants` export (custom component prop values that `astryx theme
 * build` emits beside the built theme object), or null if no theme is
 * configured or found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';

const _require = createRequire(import.meta.url);

/**
 * Try to load a module, returning the default export or the module itself.
 * Returns null if the module cannot be found.
 * @param {string} specifier
 * @param {string} cwd
 * @returns {unknown}
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
 * @param {any} mod
 * @returns {any}
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
 * Read the custom-value metadata a built theme module exports as
 * `themeVariants`: `{ [componentKey]: { [prop]: value[] } }`. It is a sibling
 * of the theme object rather than a theme field, because build/CLI metadata
 * stays outside `DefinedTheme` (docs/architecture/theme-authoring-contract.md).
 * @param {any} mod
 * @returns {Record<string, Record<string, string[]>> | null}
 */
function extractVariants(mod) {
  const variants = mod?.themeVariants;
  return variants && typeof variants === 'object' ? variants : null;
}

/**
 * Resolve the active Astryx theme from config and environment.
 *
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 * @returns {{ variants?: Record<string, Record<string, string[]>> | null, fonts?: Record<string, string>, name?: string } | null}
 */
export function resolveTheme(cwd = process.cwd()) {
  // 1. Determine theme specifier
  let specifier = process.env.ASTRYX_THEME || null;

  if (!specifier) {
    // Read from package.json
    const pkgPath = path.join(cwd, 'package.json');
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        specifier = pkg.astryx?.theme || null;
      } catch {
        // Ignore parse errors
      }
    }
  }

  // `astryx.theme` (package.json) and ASTRYX_THEME are user/third-party
  // controlled and may be any value. Anything that isn't a usable non-empty
  // string means "no theme" — degrade to null rather than crashing on
  // specifier.startsWith(...) below. (Subsumes the empty-string case.)
  if (typeof specifier !== 'string' || specifier.length === 0) {
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
    // Convention: try @astryxdesign/theme-{name} first, then bare package
    mod = tryLoadModule(`@astryxdesign/theme-${specifier}`, cwd);
    if (!mod) {
      mod = tryLoadModule(specifier, cwd);
    }
    if (!mod) {
      console.warn(`⚠ theme: could not resolve "${specifier}" (tried @astryxdesign/theme-${specifier} and ${specifier})`);
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
    variants: extractVariants(mod),
    fonts: theme.fonts || null,
  };
}
