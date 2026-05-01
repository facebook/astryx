/* global module, require, process, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
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
