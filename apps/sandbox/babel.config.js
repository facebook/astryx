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
        // StyleX needs aliases to resolve .stylex.ts token files from source.
        // This is only needed because the sandbox lives in the monorepo —
        // external consumers using published packages don't need this.
        // When adding a new @xds/theme-* package, add an alias here too.
        aliases: {
          '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
          '@xds/core': [path.join(rootDir, 'packages/core/src')],
          '@xds/theme-default/*': [path.join(rootDir, 'packages/themes/default/src/*')],
          '@xds/theme-neutral/*': [path.join(rootDir, 'packages/themes/neutral/src/*')],
          '@xds/theme-brutalist/*': [path.join(rootDir, 'packages/themes/brutalist/src/*')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir,
        },
      },
    ],
  ],
};
