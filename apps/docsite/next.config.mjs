// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Configure the docsite's routes, response headers, and theme resolution.
 * @input Next.js build configuration and staged preview-only static exports.
 * @output Docsite routes plus Storybook and Sandbox at /storybook/ and /sandbox/.
 * @position Next.js configuration for the existing Vercel docsite deployment.
 */

import {readdirSync} from 'node:fs';
import {resolve} from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Sandbox exports trailing-slash directories; Next's automatic slash
  // redirect runs before rewrites. Only preview/canary needs to preserve
  // those URLs. Production docs keep their existing canonical redirects.
  skipTrailingSlashRedirect: process.env.VERCEL_ENV === 'preview',
  // A dynamic route segment can't carry a static extension, so the public
  // plaintext URL /blog/<slug>.txt is served by the /blog/txt/[slug] handler.
  // Static files (including Storybook's iframe and Sandbox's JS/CSS, embeds
  // and template assets) take precedence over afterFiles rewrites. A missing
  // Sandbox path maps only to its own absent index.html, never to the root.
  async rewrites() {
    return {
      afterFiles: [
        {source: '/blog/:slug.txt', destination: '/blog/txt/:slug'},
        {source: '/storybook', destination: '/storybook/index.html'},
        ...(process.env.VERCEL_ENV === 'preview'
          ? [
              {source: '/sandbox', destination: '/sandbox/index.html'},
              {
                source: '/sandbox/:path+',
                destination: '/sandbox/:path+/index.html',
              },
            ]
          : []),
      ],
    };
  },
  // The playground preview evaluates user-authored code, so it is the one
  // route that must never be embeddable by another site and never a loader of
  // third-party script. The nonce-attested port handshake on its message
  // channel is the actual guard (playground/previewChannel.ts); these headers
  // are the layer underneath it. 'unsafe-eval' is inherent — the route's whole
  // job is compiling and running TSX in the browser. img/connect stay open so
  // demo code can still fetch and show remote data; the allowed hosts are the
  // ones the site itself loads (Google Fonts, Vercel analytics).
  async headers() {
    return [
      {
        // The playground page itself also refuses embedding: today the
        // nested preview's own frame-ancestors already breaks any embedding
        // chain, but that protection shouldn't hinge on a child frame's
        // headers — the parent states it directly.
        source: '/playground',
        headers: [
          {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
          {key: 'Content-Security-Policy', value: "frame-ancestors 'self'"},
        ],
      },
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
