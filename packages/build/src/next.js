// Copyright (c) Meta Platforms, Inc. and affiliates.

"use strict";

/**
 * @astryxdesign/build/next
 *
 * Next.js configuration helper for Astryx source builds.
 *
 * Usage in next.config.mjs:
 *   import {withAstryx} from '@astryxdesign/build/next';
 *   export default withAstryx({
 *     // your normal next config
 *   });
 */

const fs = require('fs');
const path = require('path');

const ASTRYX_MODULE = /[\\/]node_modules[\\/]@astryxdesign[\\/]/;

/**
 * Locate an installed package's directory by walking `node_modules` up from
 * the app, the way Node resolves a bare specifier. Returns null when the
 * package is not installed.
 */
function findPackageDir(name, from) {
  let dir = path.resolve(from);
  for (;;) {
    const candidate = path.join(dir, 'node_modules', name);
    if (fs.existsSync(path.join(candidate, 'package.json'))) {
      return candidate;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      return null;
    }
    dir = parent;
  }
}

/**
 * Map each installed astryx package to the `source` targets in its export map,
 * so an app's imports reach raw TS the way an in-repo build does. Subpaths get
 * an entry each — `@astryxdesign/core/AlertDialog` is as much a documented
 * entry point as the package root. Packages that are absent, and export keys
 * that ship no `source` condition, are skipped and keep normal resolution.
 */
function sourceEntryAliases(packages, context) {
  const from = (context && context.dir) || process.cwd();
  const aliases = {};
  for (const name of packages) {
    // Not `require.resolve(`${name}/package.json`)`: packages that define
    // `exports` without a `./package.json` key — astryx's own among them —
    // make that request throw ERR_PACKAGE_PATH_NOT_EXPORTED.
    const packageDir = findPackageDir(name, from);
    if (packageDir == null) {
      continue;
    }
    let exports;
    try {
      exports = require(path.join(packageDir, 'package.json')).exports;
    } catch {
      continue;
    }
    if (exports == null || typeof exports !== 'object') {
      continue;
    }
    for (const [key, value] of Object.entries(exports)) {
      const entry = value && typeof value === 'object' ? value.source : null;
      if (typeof entry !== 'string' || key.includes('*')) {
        continue;
      }
      const request = key === '.' ? name : `${name}/${key.slice(2)}`;
      aliases[`${request}$`] = path.resolve(packageDir, entry);
    }
  }
  return aliases;
}

/**
 * Wraps a Next.js config to enable Astryx source builds.
 * - Adds transpilePackages for @astryxdesign/* packages
 * - Sets conditionNames to resolve source exports
 */
function withAstryx(nextConfig = {}) {
  const astryxPackages = [
    '@astryxdesign/core',
    '@astryxdesign/theme-neutral',
    '@astryxdesign/lab',
  ];

  const existingTranspile = nextConfig.transpilePackages || [];
  const merged = Array.from(new Set([...existingTranspile, ...astryxPackages]));

  const existingWebpack = nextConfig.webpack;

  return {
    ...nextConfig,
    transpilePackages: merged,
    webpack: (config, context) => {
      // Astryx packages are consumed from their `source` export (raw TS) so
      // the sandbox/docsite build straight from src without a prebuild step.
      // Apply the `source` condition via a scoped, ALLOWLIST rule that only
      // matches @astryxdesign packages — the global conditions stay as Next's
      // defaults (webpack's `'...'` sentinel + react-server), which React JSX
      // resolution depends on. Third-party deps (e.g. `lexical`, which also
      // ships a `source` export) therefore resolve to their built output, not
      // raw TS. This is robust to new third-party `source`-shipping deps.
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.unshift({
        test: ASTRYX_MODULE,
        resolve: {
          conditionNames: ['source', '...'],
        },
      });

      // The rule above only covers astryx-to-astryx imports: `Rule.test`
      // matches the module being processed and `Rule.resolve` governs the
      // requests that module makes, so an app's own `@astryxdesign/*` imports —
      // issued from its sources, outside node_modules — never match it. Those
      // resolve through `default` to dist, whose runtime class names are
      // disjoint from the CSS the PostCSS pass compiles out of source, and the
      // app renders unstyled without erroring. Rules cannot key on the request
      // string, so point the packages at their `source` entry directly; the
      // global conditions stay as Next's defaults for React and for
      // third-party `source` shippers such as `lexical`.
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...sourceEntryAliases(astryxPackages, context),
        ...(config.resolve.alias || {}),
      };

      // Preserve the symlinked node_modules path so Next.js's
      // transpilePackages matcher recognizes @astryxdesign/* packages under
      // pnpm's symlinked layout. Without this, webpack dereferences
      // the symlink to packages/<name>/... which doesn't contain
      // "node_modules/@astryxdesign" and transpilation is silently skipped,
      // breaking subpath imports like '@astryxdesign/core/AlertDialog'.
      config.resolve.symlinks = false;

      // Call user's webpack config if provided
      if (existingWebpack) {
        return existingWebpack(config, context);
      }
      return config;
    },
  };
}

module.exports = {withAstryx};
