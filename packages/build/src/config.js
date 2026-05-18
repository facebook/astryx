// Copyright (c) Meta Platforms, Inc. and affiliates.

"use strict";

/**
 * @xds/build
 *
 * Unified build configuration for XDS source builds.
 * 
 * Usage:
 *   // babel.config.js
 *   const {babel} = require('@xds/build');
 *   module.exports = babel(__dirname);
 * 
 *   // postcss.config.js
 *   const {postcss} = require('@xds/build');
 *   module.exports = postcss(__dirname);
 */

const path = require('node:path');

/**
 * Resolve XDS package aliases from a root directory.
 * Handles both npm installs (node_modules/@xds/core) and
 * monorepo layouts (packages/core).
 */
function resolveAliases(rootDir) {
  const coreDir = path.join(rootDir, 'node_modules/@xds/core');
  return {
    '@xds/core/*': [path.join(coreDir, '*')],
    '@xds/core': [coreDir],
  };
}

/**
 * Build shared StyleX babel plugin options from a root directory.
 */
function stylexOptions(rootDir, overrides = {}) {
  return {
    dev: process.env.NODE_ENV !== 'production',
    runtimeInjection: false,
    enableInlinedConditionalMerge: true,
    treeshakeCompensation: true,
    aliases: resolveAliases(rootDir),
    unstable_moduleResolution: {
      type: 'commonJS',
    },
    ...overrides,
  };
}

/**
 * Generate a complete babel.config.js for XDS source builds.
 * 
 * @param {string} rootDir — __dirname of the project root
 * @param {object} [overrides] — extra StyleX options to merge
 * @returns {object} babel config object
 */
function babel(rootDir, overrides = {}) {
  return {
    presets: ['next/babel'],
    plugins: [
      [require.resolve('./babel.js'), stylexOptions(rootDir, overrides)],
    ],
  };
}

/**
 * Generate a complete postcss.config.js for XDS source builds.
 * 
 * @param {string} rootDir — __dirname of the project root
 * @param {object} [overrides] — extra options (appDir, extraInclude, etc.)
 * @returns {object} postcss config object
 */
function postcss(rootDir, overrides = {}) {
  const {appDir = 'src', extraInclude = [], ...rest} = overrides;
  return {
    plugins: {
      [require.resolve('./index.js')]: {
        cwd: rootDir,
        appDir,
        babelPlugins: [
          ['@stylexjs/babel-plugin', stylexOptions(rootDir, rest)],
        ],
        extraInclude,
      },
      autoprefixer: {},
    },
  };
}

module.exports = {babel, postcss, stylexOptions, resolveAliases};
