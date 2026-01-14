/**
 * @file postcss.config.mjs
 * @input Uses postcss, @stylexjs/postcss-plugin, autoprefixer
 * @output PostCSS configuration for StyleX processing
 * @position Build config; used by Vite for CSS processing
 */

import autoprefixer from 'autoprefixer';
import stylexPlugin from '@stylexjs/postcss-plugin';
import babelrc from './.babelrc.cjs';

export default {
  plugins: [
    stylexPlugin({
      include: [
        'stories/**/*.{ts,tsx}',
        '../../../packages/core/src/**/*.{ts,tsx}',
      ],
      babelConfig: {
        babelrc: false,
        parserOpts: {
          plugins: ['typescript', 'jsx'],
        },
        ...babelrc,
      },
      useCSSLayers: process.env.NODE_ENV !== 'development',
    }),
    autoprefixer(),
  ],
};
