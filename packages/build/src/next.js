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
        test: /[\\/]node_modules[\\/]@astryxdesign[\\/]/,
        resolve: {
          conditionNames: ['source', '...'],
        },
      });

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
