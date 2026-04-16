/* global module, __dirname */
const path = require('path');
const babelConfig = require('./babel.config');

const rootDir = path.resolve(__dirname, '../..');

module.exports = {
  plugins: {
    '@stylexjs/postcss-plugin': {
      include: [
        'src/**/*.{js,jsx,ts,tsx}',
        // Core and theme CSS is pre-compiled (xds.css, theme.css) and imported
        // in layout.tsx — no need to re-extract from source here.
        path.join(rootDir, 'packages/cli/templates/**/*.{ts,tsx}'),
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        presets: [
          ['@babel/preset-react', {runtime: 'automatic'}],
          // Must come after preset-react (runs first due to reverse order)
          // to strip TypeScript type assertions before StyleX evaluates them.
          '@babel/preset-typescript',
        ],
        plugins: babelConfig.plugins,
      },
      useCSSLayers: true,
    },
  },
};
