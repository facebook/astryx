/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: process.env.SANDBOX_BASE_PATH || '',
  // Theme packages still need transpilation for defineTheme() calls.
  // @xds/core uses pre-built dist — no transpilation needed.
  transpilePackages: [
    '@xds/theme-default',
    '@xds/theme-neutral',
    '@xds/theme-brutalist',
  ],
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
