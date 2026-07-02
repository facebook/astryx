// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readdirSync} from 'fs';
import {resolve} from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  webpack: config => {
    // Webpack's CSS @import resolver doesn't follow package.json "exports".
    // Map each theme's /theme.css subpath to the actual dist file.
    const themesDir = resolve(import.meta.dirname, '../../packages/themes');
    const themes = readdirSync(themesDir, {withFileTypes: true})
      .filter(d => d.isDirectory())
      .map(d => d.name);
    for (const t of themes) {
      config.resolve.alias[`@astryxdesign/theme-${t}/theme.css`] = resolve(
        themesDir,
        t,
        'dist/theme.css',
      );
    }

    return config;
  },
};

export default nextConfig;
