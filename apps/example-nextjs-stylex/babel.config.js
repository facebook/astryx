// Copyright (c) Meta Platforms, Inc. and affiliates.

/* global module, require, process, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('node:path');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      // See all options in the babel plugin configuration docs:
      // https://stylexjs.com/docs/api/configuration/babel-plugin/
      {
        dev,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: {
          '@/*': [path.join(__dirname, '*')],
        },
        classNamePrefix: 'p',
        unstable_moduleResolution: {
          type: 'commonJS',
        },
      },
    ],
  ],
};
