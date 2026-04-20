import {withXDS} from '@xds/build/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: false,
  trailingSlash: true,
  basePath: process.env.SANDBOX_BASE_PATH || '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.SANDBOX_BASE_PATH || '',
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withXDS(nextConfig);
