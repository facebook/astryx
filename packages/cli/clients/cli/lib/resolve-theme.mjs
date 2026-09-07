// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme resolution — resolve a theme from config or environment
 *
 * Resolution sources (in priority order):
 * 1. ASTRYX_THEME environment variable
 * 2. astryx.theme field in package.json
 *
 * Resolution strategy for the value:
 * - Starts with `.` or `/` → file module relative to cwd (the documented
 *   `{"astryx": {"theme": "./src/theme.ts"}}` setup — see the theme guide)
 * - Starts with `@` → npm package, resolved from the project's node_modules
 * - Otherwise → try `@astryxdesign/theme-{name}`, then try as bare package name
 *
 * Loading a theme executes it — a file from the checkout directly, a package
 * via whatever the checkout installed. Both are project code, so both sit
 * behind the safe-mode gate: under ASTRYX_NO_PROJECT_CODE=1 no theme module
 * loads at all and the CLI renders theme-less, the same "built-in data only"
 * contract the rest of the CLI honors. (The variable is read inline here so
 * this change stands alone; module-loader's projectCodeAllowed reads the same
 * switch.)
 *
 * Returns the theme object's `variants` and `fonts` if available,
 * or null if no theme is configured or found.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {importUserModule} from '../../../foundation/fs/module-loader.mjs';

/**
 * Try to load a module, returning its namespace. File specifiers go through
 * the shared user-module loader (which also gives the documented `.ts` setup
 * the same jiti path configs use); package specifiers resolve with a require
 * bound to the PROJECT, not to the CLI's own install location, so
 * `astryx.theme` names packages out of the project's node_modules.
 * Returns null if the module cannot be found.
 * @param {string} specifier
 * @param {string} cwd
 * @returns {Promise<unknown>}
 */
async function tryLoadModule(specifier, cwd) {
  // For relative/absolute paths, resolve against cwd
  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    try {
      return await importUserModule(path.resolve(cwd, specifier));
    } catch {
      return null;
    }
  }

  // For package specifiers, require from the project
  try {
    const projectRequire = createRequire(path.join(cwd, 'package.json'));
    return projectRequire(specifier);
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
    if (
      key.endsWith('Theme') &&
      typeof mod[key] === 'object' &&
      mod[key]?.name
    ) {
      return mod[key];
    }
  }

  return null;
}

/**
 * A specifier comes from the environment or the checkout's package.json, so
 * it goes to the terminal with control characters replaced — a newline or an
 * escape sequence in `astryx.theme` must not write to the operator's TTY.
 * @param {string} specifier
 */
function printable(specifier) {
  return specifier.replace(/\p{Cc}/gu, '�');
}

/** Say once per process why a configured theme is not being loaded. */
let gateNoted = false;
/** @param {string} specifier */
function noteThemeSkipped(specifier) {
  if (gateNoted) return;
  gateNoted = true;
  console.warn(
    `⚠ theme: ASTRYX_NO_PROJECT_CODE=1 — not loading theme "${printable(specifier)}"; rendering without theme data`,
  );
}

/**
 * Resolve the active Astryx theme from config and environment.
 *
 * @param {string} [cwd] - Working directory (defaults to process.cwd())
 * @returns {Promise<{ variants?: Record<string, string[]>, fonts?: Record<string, string>, name?: string } | null>}
 */
export async function resolveTheme(cwd = process.cwd()) {
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

  // Any theme module is project code — a checkout file or a package the
  // checkout installed. One safe-mode gate covers both (see file header).
  if (process.env.ASTRYX_NO_PROJECT_CODE === '1') {
    noteThemeSkipped(specifier);
    return null;
  }

  // 2. Resolve the specifier to a module
  let mod;

  if (specifier.startsWith('.') || specifier.startsWith('/')) {
    // File path
    mod = await tryLoadModule(specifier, cwd);
    if (!mod) {
      console.warn(
        `⚠ theme: could not resolve file "${printable(specifier)}" from ${cwd}`,
      );
      return null;
    }
  } else if (specifier.startsWith('@')) {
    // Scoped package
    mod = await tryLoadModule(specifier, cwd);
    if (!mod) {
      console.warn(
        `⚠ theme: could not resolve package "${printable(specifier)}"`,
      );
      return null;
    }
  } else {
    // Convention: try @astryxdesign/theme-{name} first, then bare package
    mod = await tryLoadModule(`@astryxdesign/theme-${specifier}`, cwd);
    if (!mod) {
      mod = await tryLoadModule(specifier, cwd);
    }
    if (!mod) {
      console.warn(
        `⚠ theme: could not resolve "${printable(specifier)}" (tried @astryxdesign/theme-${printable(specifier)} and ${printable(specifier)})`,
      );
      return null;
    }
  }

  // 3. Extract theme data
  const theme = extractTheme(mod);
  if (!theme) {
    console.warn(
      `⚠ theme: loaded "${printable(specifier)}" but could not find a theme object`,
    );
    return null;
  }

  return {
    name: theme.name || null,
    variants: theme.variants || null,
    fonts: theme.fonts || null,
  };
}
