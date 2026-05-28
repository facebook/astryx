// Copyright (c) Meta Platforms, Inc. and affiliates.

import {resolve} from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Force ESM resolution for @xds/core — the CJS dist has a bug where
    // "use client" appears after Object.defineProperty(exports, "__esModule").
    config.resolve.conditionNames = ['import', 'module', 'require', 'default'];

    // Webpack's CSS @import resolver doesn't follow package.json "exports".
    // Map each theme's /theme.css subpath to the actual dist file.
    const themesDir = resolve(import.meta.dirname, '../../packages/themes');
    const themes = ['default', 'neutral', 'gothic', 'matcha', 'stone'];
    for (const t of themes) {
      config.resolve.alias[`@xds/theme-${t}/theme.css`] =
        resolve(themesDir, t, 'dist/theme.css');
    }

    return config;
  },
};

export default nextConfig;
