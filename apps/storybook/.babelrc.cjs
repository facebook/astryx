/**
 * @file .babelrc.cjs
 * @input Uses @babel/preset-react, @babel/preset-typescript, @stylexjs/babel-plugin
 * @output Babel configuration for React/TypeScript with StyleX
 * @position Build config; used by Vite and PostCSS for transpilation
 */

const path = require('path');

const rootDir = path.join(__dirname, '../..');

module.exports = {
  presets: [
    ['@babel/preset-react', { runtime: 'automatic' }],
    '@babel/preset-typescript',
  ],
  plugins: [
    [
      '@stylexjs/babel-plugin',
      {
        dev: true,
        runtimeInjection: true,
        genConditionalClasses: true,
        treeshakeCompensation: true,
        aliases: {
          '@xds/core/*': [path.join(rootDir, 'packages/core/src/*')],
          '@xds/core': [path.join(rootDir, 'packages/core/src')],
        },
        unstable_moduleResolution: {
          type: 'commonJS',
          rootDir: rootDir,
        },
      },
    ],
  ],
};
