/* global module, require, __dirname */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');

module.exports = {
  plugins: {
    '@xds/build/postcss': {
      appDir: 'src',
      babelPlugins: [
        [
          '@stylexjs/babel-plugin',
          {
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
          },
        ],
      ],
    },
    autoprefixer: {},
  },
};
