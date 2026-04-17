/* global module, process, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

module.exports = {
  presets: ['next/babel'],
  plugins: [
    ['@xds/build/babel', {
      dev: process.env.NODE_ENV !== 'production',
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
    }],
  ],
};
