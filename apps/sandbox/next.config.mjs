import stylexPlugin from '@stylexjs/nextjs-plugin';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  transpilePackages: ['@xds/core'],
  // Base path for GitHub Pages deployment (set via env var in CI)
  basePath: process.env.SANDBOX_BASE_PATH || '',
  images: {unoptimized: true},
};

export default stylexPlugin({
  rootDir: __dirname,
})(nextConfig);
