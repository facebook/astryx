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
 * Build-in replacement for webpack's default `output.hashFunction`.
 *
 * Wraps Node's `crypto.createHash('sha256')` but tolerates `undefined` inputs
 * to `update()`. This works around a webpack 5 bug that surfaces on Node.js 24:
 * `FileSystemInfo._resolveContextTimestamp` occasionally passes an unresolved
 * context's `timestampHash` (which can be `undefined`) straight into
 * `hash.update()`, which crashes the dev server with either
 *   `TypeError: Cannot read properties of undefined (reading 'length')`
 *     (inside WasmHash, the default hash)
 * or
 *   `TypeError: The "data" argument must be of type string or an instance of
 *   Buffer, TypedArray, or DataView. Received undefined`
 *     (with a plain Node crypto hash).
 *
 * Treating `undefined` as an empty string is safe here because webpack is only
 * producing opaque cache/snapshot hashes; missing values simply collapse to a
 * stable empty hash contribution.
 */
function createSafeHash() {
  const crypto = require('node:crypto');
  const hash = crypto.createHash('sha256');
  return {
    update(data, inputEncoding) {
      if (data == null) {
        data = '';
      }
      return inputEncoding !== undefined
        ? hash.update(data, inputEncoding)
        : hash.update(data);
    },
    digest(encoding) {
      return hash.digest(encoding);
    },
  };
}

/**
 * Wraps a Next.js config to enable XDS source builds.
 * - Adds transpilePackages for @xds/* packages
 * - Sets conditionNames to resolve source exports
 * - Installs a Node 24-safe webpack `output.hashFunction`
 */
function withXDS(nextConfig = {}) {
  const xdsPackages = [
    '@xds/core',
    '@xds/theme-default',
    '@xds/theme-neutral',
    '@xds/theme-brutalist',
    '@xds/theme-meta',
    '@xds/theme-whatsapp',
    '@xds/theme-daily',
    '@xds/lab',
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

      // Swap webpack's default WasmHash-based hasher for a Node-crypto hasher
      // that tolerates `undefined` inputs. See `createSafeHash` above.
      if (config.output) {
        config.output.hashFunction = createSafeHash;
      }

      // Call user's webpack config if provided
      if (existingWebpack) {
        return existingWebpack(config, context);
      }
      return config;
    },
  };
}

module.exports = {withXDS};
