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
      // Apply the `source` condition via a scoped rule that matches
      // @astryxdesign packages — the global conditions stay as Next's defaults
      // (webpack's `'...'` sentinel + react-server), which React JSX resolution
      // depends on.
      //
      // IMPORTANT: a rule's `resolve.conditionNames` governs how the MATCHED
      // module resolves ITS OWN imports. So the @astryxdesign rule also decides
      // how e.g. `@astryxdesign/lab/dist/RichTextEditor.js` resolves its
      // `import 'lexical'`. `lexical` (and `@lexical/*`) ship a `source` export
      // pointing at raw `.ts` (`./src/index.ts`), which Next's Babel cannot
      // compile (it hits `declare` class fields → build failure). We must NOT
      // let the `source` condition leak into those third-party imports.
      //
      // Fix: add a higher-precedence rule (unshifted AFTER the astryx rule, so
      // it sits first in the array and wins) that matches lexical resources and
      // forces the DEFAULT conditions — resolving them to built dist output
      // regardless of which package imported them.
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.unshift({
        test: /[\\/]node_modules[\\/]@astryxdesign[\\/]/,
        resolve: {
          conditionNames: ['source', '...'],
        },
      });
      // Force lexical + @lexical/* to their built output (skip the `source`
      // raw-TS export). Placed first so it takes precedence over the
      // @astryxdesign `source` rule for these third-party resources.
      config.module.rules.unshift({
        test: /[\\/]node_modules[\\/](lexical|@lexical[\\/][^\\/]+)[\\/]/,
        resolve: {
          conditionNames: ['...'],
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
