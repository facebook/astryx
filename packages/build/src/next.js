"use strict";

/**
 * @xds/build/next
 *
 * Next.js configuration helper for XDS source builds.
 *
 * Usage in next.config.mjs:
 *   import {withXDS} from '@xds/build/next';
 *   export default withXDS({
 *     // your normal next config
 *   });
 */

/**
 * Wraps a Next.js config to enable XDS source builds.
 * - Adds transpilePackages for @xds/* packages
 * - Sets conditionNames to resolve source exports (webpack)
 * - Adds empty turbopack config for Next.js 16+ compatibility
 */
function withXDS(nextConfig = {}) {
  const xdsPackages = [
    '@xds/core',
    '@xds/theme-default',
    '@xds/theme-neutral',
    '@xds/theme-brutalist',
    '@xds/theme-daily',
    '@xds/lab',
  ];

  const existingTranspile = nextConfig.transpilePackages || [];
  const merged = Array.from(new Set([...existingTranspile, ...xdsPackages]));

  const existingWebpack = nextConfig.webpack;
  const existingTurbopack = nextConfig.turbopack;

  return {
    ...nextConfig,
    transpilePackages: merged,
    // Next.js 16+ defaults to Turbopack and errors if only webpack config
    // is present. An empty turbopack config silences the check, and
    // transpilePackages handles @xds/* source resolution for both bundlers.
    turbopack: existingTurbopack || {},
    webpack: (config, context) => {
      // Resolve to source exports
      config.resolve.conditionNames = [
        'source',
        'import',
        'require',
        'default',
      ];

      // Call user's webpack config if provided
      if (existingWebpack) {
        return existingWebpack(config, context);
      }
      return config;
    },
  };
}

module.exports = {withXDS};
