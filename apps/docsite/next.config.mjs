// Copyright (c) Meta Platforms, Inc. and affiliates.

import {readdirSync} from 'node:fs';
import {resolve} from 'node:path';

// ── Version-aware build (PR #3513) ───────────────────────────────────────
// ONE deployment serves BOTH content lines:
//   • latest (default) → full Next server build, served at "/". Keeps the
//     dynamic MCP route and request-time features (e.g. UA mobile hint).
//   • canary           → STATIC EXPORT with basePath "/canary", copied into
//     the latest build's public/canary/** so Vercel's CDN serves it at
//     "/canary" on the SAME deployment. No second project, no second domain.
//
// The static export can't run the dynamic MCP route or request-time headers(),
// so the canary pass excludes MCP (latest still serves /mcp) and the mobile
// hint falls back to a client-corrected default. See scripts/build-versioned.mjs
// and lib/serverMobileHint.ts.
const IS_CANARY_STATIC = process.env.DOCSITE_TARGET === 'canary';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(IS_CANARY_STATIC
    ? {
        output: 'export',
        basePath: '/canary',
        assetPrefix: '/canary',
        // Vercel's CDN resolves "/canary/components/" → the exported
        // index.html; trailing slashes make that mapping unambiguous.
        trailingSlash: true,
        // next/image optimization needs the server; export must opt out.
        images: {unoptimized: true},
        // NOTE: cacheComponents (Next 16 dynamicIO) and rewrites() are NOT set
        // for the canary pass — both require the server runtime and are
        // unsupported under output:'export'. The latest (server) build below
        // carries them; the static export serves /blog/<slug> pages directly.
      }
    : {
        // Next 16 Cache Components (dynamicIO) — server build only.
        cacheComponents: true,
        // A dynamic route segment can't carry a static extension, so the public
        // plaintext URL /blog/<slug>.txt is served by the /blog/txt/[slug]
        // handler. `rewrites()` requires the server runtime and is unsupported
        // under output:'export', so it applies to the latest (server) build
        // only.
        async rewrites() {
          return [{source: '/blog/:slug.txt', destination: '/blog/txt/:slug'}];
        },
      }),
  webpack: config => {
    // Force ESM resolution for @astryxdesign/core — the CJS dist has a bug where
    // "use client" appears after Object.defineProperty(exports, "__esModule").
    config.resolve.conditionNames = ['import', 'module', 'require', 'default'];

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
