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
        aliases: {
          '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
          '@xds/core': [path.join(rootDir, 'packages/core/src')],
          '@xds/theme-default/*': [path.join(rootDir, 'packages/themes/default/src/*')],
          '@xds/theme-neutral/*': [path.join(rootDir, 'packages/themes/neutral/src/*')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir,
        },
      },
    ],
  ],
};
