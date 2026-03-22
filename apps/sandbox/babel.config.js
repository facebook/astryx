/* global module, process, __dirname */
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  presets: ['next/babel'],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: process.env.NODE_ENV === 'development',
        runtimeInjection: false,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir,
        },
      },
    ],
  ],
  // Don't run StyleX babel plugin on pre-built dist files —
  // their CSS is already compiled and shipped via xds.css imports.
  ignore: [
    '**/packages/core/dist/**',
  ],
};
