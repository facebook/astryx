// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readdirSync} from 'node:fs';
import {resolve} from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // A dynamic route segment can't carry a static extension, so the public
  // plaintext URL /blog/<slug>.txt is served by the /blog/txt/[slug] handler.
  async rewrites() {
    return [{source: '/blog/:slug.txt', destination: '/blog/txt/:slug'}];
  },
  // The playground preview evaluates user-authored code, so it is the one
  // route that must never be embeddable by another site and never a loader of
  // third-party script. The origin check on its postMessage channel is the
  // actual guard (playground/previewChannel.ts); these headers are the layer
  // underneath it. 'unsafe-eval' is inherent — the route's whole job is
  // compiling and running TSX in the browser. img/connect stay open so demo
  // code can still fetch and show remote data; the allowed hosts are the ones
  // the site itself loads (Google Fonts, Vercel analytics).
  async headers() {
    return [
      {
        source: '/playground/preview',
        headers: [
          {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
          {
            key: 'Content-Security-Policy',
            value: [
              "frame-ancestors 'self'",
              "base-uri 'none'",
              "object-src 'none'",
              "form-action 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
            ].join('; '),
          },
        ],
      },
    ];
  },
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
