// Copyright (c) Meta Platforms, Inc. and affiliates.

"use strict";

/**
 * @astryxdesign/build/next
 *
 * Next.js configuration helper for Astryx source builds.
 *
 * Usage in next.config.mjs:
 *   import {withXDS} from '@astryxdesign/build/next';
 *   export default withXDS({
 *     // your normal next config
 *   });
 */

/**
 * Wraps a Next.js config to enable Astryx source builds.
 * - Adds transpilePackages for @astryxdesign/* packages
 * - Sets conditionNames to resolve source exports
 */
function withXDS(nextConfig = {}) {
  const xdsPackages = [
    '@astryxdesign/core',
    '@astryxdesign/theme-default',
    '@astryxdesign/theme-neutral',
    '@astryxdesign/theme-brutalist',
    '@astryxdesign/theme-daily',
    '@astryxdesign/lab',
  ];

  const existingTranspile = nextConfig.transpilePackages || [];
  const merged = Array.from(new Set([...existingTranspile, ...xdsPackages]));

  const existingWebpack = nextConfig.webpack;

  return {
    ...nextConfig,
    transpilePackages: merged,
    webpack: (config, context) => {
      // Resolve to source exports
      config.resolve.conditionNames = [
        'source',
        'import',
        'require',
        'default',
      ];

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

module.exports = {withXDS};
