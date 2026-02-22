import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.SANDBOX_BASE_PATH || '',
  transpilePackages: ['@xds/core', '@xds/theme-default'],
  images: {
    unoptimized: true,
  },
  typescript: {
    // Type errors are caught by the sandbox typecheck script.
    // Next.js build skips tsc to avoid duplicate checking.
    ignoreBuildErrors: false,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@xds/core/theme/tokens.stylex': path.resolve(
        __dirname,
        '../../packages/core/src/theme/tokens.stylex.ts',
      ),
    };
    return config;
  },
};

export default nextConfig;
