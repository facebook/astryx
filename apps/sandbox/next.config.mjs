/**
 * @file next.config.mjs
 * @description Next.js configuration for the XDS sandbox app.
 *
 * Supports two dev modes controlled by the XDS_SOURCE env var:
 *
 * - **Default** (XDS_SOURCE unset): Resolves @xds/core from dist/.
 *   CSS layers and theming work correctly. Pair with `yarn workspace @xds/core dev`
 *   in a second terminal for near-hot-reload via incremental dist rebuilds.
 *
 * - **Source mode** (XDS_SOURCE=1): Resolves @xds/core from TypeScript source.
 *   Instant hot reload (~200ms), but CSS layer separation is lost — theming
 *   won't work. Best for layout and behavior iteration.
 */

const useSource = process.env.XDS_SOURCE === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  trailingSlash: true,
  basePath: process.env.SANDBOX_BASE_PATH || '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.SANDBOX_BASE_PATH || '',
  },
  transpilePackages: [
    // Only transpile @xds/core in source mode — in dist mode, it's pre-built.
    // Theme packages are NOT listed here — their exports already resolve to
    // pre-compiled dist/ files (ESM + CSS), so re-transpilation is wasted work.
    ...(useSource ? ['@xds/core'] : []),
  ],
  images: {
    unoptimized: true,
  },
  typescript: {
    // In CI the dedicated typecheck job handles this — skip during next build.
    ignoreBuildErrors: !!process.env.CI,
  },
  webpack: useSource
    ? (config) => {
        // Prefer "source" exports condition so @xds/core resolves to src/ TypeScript.
        // This enables hot reload when editing packages/core/src/ files.
        config.resolve.conditionNames = [
          'source',
          'import',
          'require',
          'default',
        ];

        // Remove packages/core from snapshot managedPaths so webpack
        // doesn't treat it as an immutable dependency.
        config.snapshot = {
          ...config.snapshot,
          managedPaths: [],
        };

        // Poll as fallback — FSEvents can miss changes through symlinks.
        config.watchOptions = {
          ...config.watchOptions,
          poll: 1000,
          followSymlinks: true,
        };

        return config;
      }
    : undefined,
};

export default nextConfig;
