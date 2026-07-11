// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file babel.config.js
 * @input Uses @babel/preset-react, @babel/preset-typescript, the local
 *   add-extensions plugin, and @stylexjs/babel-plugin
 * @output Babel config for compiling lab src → dist (ESM .js with StyleX)
 * @position Build config for @astryxdesign/lab
 *
 * Mirrors packages/core/babel.config.json, with one difference: lab consumes
 * core's StyleX theme tokens (@astryxdesign/core/theme/tokens.stylex), a
 * cross-package reference core never makes. The StyleX resolver therefore
 * needs an alias to core's source and a monorepo-root rootDir.
 *
 * SYNC: When modified, update this header and /packages/lab/README.md
 */

/* global module, require, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  presets: [
    ['@babel/preset-react', {runtime: 'automatic'}],
    ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
  ],
  plugins: [
    './babel-plugin-add-extensions.cjs',
    [
      '@stylexjs/babel-plugin',
      {
        dev: false,
        runtimeInjection: false,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        aliases: {
          '@astryxdesign/core/*': [path.join(rootDir, 'packages/core/src/*')],
          '@astryxdesign/core': [path.join(rootDir, 'packages/core/src')],
        },
        unstable_moduleResolution: {type: 'commonJS', rootDir},
      },
    ],
  ],
};
