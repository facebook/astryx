#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sync-exports.js
 * @description Auto-generates the "exports" map in packages/core/package.json
 *   from the source tree. Ensures every component with src/Component/index.ts
 *   has correct export entries with source, types, and default conditions.
 *
 * Usage:
 *   node scripts/sync-exports.js          # Update package.json in place
 *   node scripts/sync-exports.js --check  # Exit 1 if package.json is stale
 *
 * The "source" export condition follows the convention used by Parcel, webpack,
 * and other bundlers for pointing to unbuilt TypeScript source files. This
 * enables monorepo consumers to resolve imports to source without post-import
 * transforms.
 *
 * Condition ordering matters — Node.js resolves top-to-bottom:
 *   1. "source"  — for bundlers configured with the "source" condition
 *   2. "types"   — for TypeScript
 *   3. "default" — for all JS consumers (ESM-only)
 */

const fs = require('fs');
const path = require('path');

const CORE_DIR = path.resolve(__dirname, '..', 'packages', 'core');
const SRC_DIR = path.join(CORE_DIR, 'src');
const PKG_PATH = path.join(CORE_DIR, 'package.json');

const CHECK_MODE = process.argv.includes('--check');

/**
 * Directories that are exported as subpath modules but aren't components.
 * These use the same pattern (source/types/import/require) but are listed
 * separately for clarity.
 */
const UTILITY_DIRS = new Set(['hooks', 'theme', 'utils']);

/**
 * Internal directories that have an index.ts but should NOT be
 * publicly exported. These are shared implementation details
 * consumed by other components via relative imports.
 */
const INTERNAL_DIRS = new Set(['NavItem']);

/**
 * Additional exports that can't be auto-discovered from directory structure.
 * These are maintained manually here as the single source of truth.
 */
const STATIC_EXPORTS = {
  './reset.css': {
    types: './src/reset.css.d.ts',
    default: './src/reset.css',
  },
  './astryx.css': {
    types: './src/astryx.css.d.ts',
    default: './dist/astryx.css',
  },
  './astryx.umd.js': './dist/astryx.umd.js',
  './tailwind-theme.css': {
    types: './src/tailwind-theme.css.d.ts',
    default: './src/tailwind-theme.css',
  },
  './naming': {
    source: './src/naming.ts',
    types: './dist/naming.d.ts',
    default: './dist/naming.js',
  },
  './theme/tokens': {
    source: './src/theme/tokens.ts',
    types: './dist/theme/tokens.d.ts',
    default: './dist/theme/tokens.js',
  },
  './theme/tokens.stylex': {
    source: './src/theme/tokens.stylex.ts',
    types: './dist/theme/tokens.stylex.d.ts',
    default: './dist/theme/tokens.stylex.js',
  },
  './theme/syntax': {
    source: './src/theme/syntax/index.ts',
    types: './dist/theme/syntax/index.d.ts',
    default: './dist/theme/syntax/index.js',
  },
  './docs.mjs': './docs.mjs',
  './groups.doc.mjs': './groups.doc.mjs',
};

/**
 * Server-safe utility subpath exports.
 *
 * These re-export pure functions from component directories without
 * the `'use client'` directive, making them importable from React
 * Server Components. Each entry points to a `utils.ts` file that
 * re-exports only the server-safe subset of a component's utilities.
 *
 * See: https://github.com/facebook/astryx/issues/1977
 */
const UTIL_SUBPATH_DIRS = [
  'Calendar',
  'Markdown',
  'PowerSearch',
  'Selector',
  'Table',
  'Typeahead',
];

/**
 * Discover all exportable directories under src/.
 * A directory is exportable if it contains an index.ts file.
 */
function discoverExportDirs() {
  const entries = fs.readdirSync(SRC_DIR, {withFileTypes: true});
  const dirs = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (INTERNAL_DIRS.has(entry.name)) continue;

    const indexPath = path.join(SRC_DIR, entry.name, 'index.ts');
    if (fs.existsSync(indexPath)) {
      dirs.push(entry.name);
    }
  }

  return dirs.sort();
}

/**
 * Generate the export entry for a directory.
 * Condition order: source → types → default
 */
function makeExportEntry(dirName) {
  return {
    source: `./src/${dirName}/index.ts`,
    types: `./dist/${dirName}/index.d.ts`,
    default: `./dist/${dirName}/index.js`,
  };
}

/**
 * Build the complete exports map.
 */
function buildExports() {
  const exports = {};

  // Root export
  exports['.'] = {
    source: './src/index.ts',
    types: './dist/index.d.ts',
    default: './dist/index.js',
  };

  // Static exports (CSS, markdown, etc.)
  for (const [key, value] of Object.entries(STATIC_EXPORTS)) {
    exports[key] = value;
  }

  // Auto-discovered directories
  const dirs = discoverExportDirs();
  for (const dir of dirs) {
    const key = `./${dir}`;
    // Skip if already covered by static exports
    if (exports[key]) continue;
    exports[key] = makeExportEntry(dir);
  }

  // Server-safe utility subpath exports
  for (const dir of UTIL_SUBPATH_DIRS) {
    exports[`./${dir}/utils`] = {
      source: `./src/${dir}/utils.ts`,
      types: `./dist/${dir}/utils.d.ts`,
      default: `./dist/${dir}/utils.js`,
    };
  }

  return exports;
}

function main() {
  const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));
  const newExports = buildExports();

  if (CHECK_MODE) {
    const currentStr = JSON.stringify(pkg.exports, null, 2);
    const newStr = JSON.stringify(newExports, null, 2);

    if (currentStr === newStr) {
      console.log('✓ package.json exports are up to date');
      process.exit(0);
    } else {
      console.error('✗ package.json exports are stale!');
      console.error('');
      console.error('Run `node scripts/sync-exports.js` to update.');
      console.error('');

      // Show what changed
      const currentKeys = new Set(Object.keys(pkg.exports));
      const newKeys = new Set(Object.keys(newExports));

      for (const key of newKeys) {
        if (!currentKeys.has(key)) {
          console.error(`  + ${key} (missing from package.json)`);
        }
      }
      for (const key of currentKeys) {
        if (!newKeys.has(key)) {
          console.error(`  - ${key} (in package.json but not in src/)`);
        }
      }
      for (const key of newKeys) {
        if (
          currentKeys.has(key) &&
          JSON.stringify(pkg.exports[key]) !== JSON.stringify(newExports[key])
        ) {
          console.error(`  ~ ${key} (conditions differ)`);
        }
      }

      process.exit(1);
    }
  }

  // Write mode
  pkg.exports = newExports;
  fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');

  const dirs = discoverExportDirs();
  console.log(
    `✓ Synced ${Object.keys(newExports).length} exports (${dirs.length} components/modules)`,
  );
}

main();
