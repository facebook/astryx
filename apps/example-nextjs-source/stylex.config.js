// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, require, process, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const productSourceGlob = 'src/app/**/*.{js,jsx,ts,tsx}';
const astryxSourceExcludes = [
  '**/node_modules/**',
  '**/*.test.*',
  '**/*.stories.*',
  '../../packages/**/*',
];

const stylexPlugin = [
  '@stylexjs/babel-plugin',
  {
    dev: process.env.NODE_ENV !== 'production',
    runtimeInjection: false,
    enableInlinedConditionalMerge: true,
    treeshakeCompensation: true,
    aliases: {
      '@/*': [path.join(__dirname, '*')],
    },
    classNamePrefix: 'p',
    unstable_moduleResolution: {
      type: 'commonJS',
      rootDir: __dirname,
    },
  },
];

module.exports = {
  astryxSourceExcludes,
  productSourceGlob,
  stylexPlugin,
};
