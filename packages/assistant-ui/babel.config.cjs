// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file babel.config.cjs
 * @input Uses the shared Babel, React, TypeScript, and StyleX toolchain
 * @output Compiles assistant-ui adapter source to distributable ESM
 * @position Build configuration for @astryxdesign/assistant-ui
 */

/* global module, require, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  presets: [
    ['@babel/preset-react', {runtime: 'automatic', development: false}],
    ['@babel/preset-typescript', {isTSX: true, allExtensions: true}],
  ],
  plugins: [
    '../lab/babel-plugin-add-extensions.cjs',
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
