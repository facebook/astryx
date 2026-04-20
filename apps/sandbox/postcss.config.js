/* global module, __dirname */
const path = require('path');
const {postcss} = require('@xds/build');

const rootDir = path.resolve(__dirname, '../..');

module.exports = postcss(rootDir, {
  appDir: path.relative(rootDir, path.resolve(__dirname, 'src')),
  extraInclude: ['packages/cli/templates/**/*.{ts,tsx}'],
});
