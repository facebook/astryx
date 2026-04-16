/* global module, process, __dirname */
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev,
        runtimeInjection: false,
        enableInlinedConditionalMerge: true,
        treeshakeCompensation: true,
        aliases: {
          '@xds/core/*': [path.join(__dirname, 'node_modules/@xds/core/*')],
          '@xds/core': [path.join(__dirname, 'node_modules/@xds/core')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
        },
      },
    ],
  ],
};
