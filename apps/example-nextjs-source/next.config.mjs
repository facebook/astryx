/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xds/core', '@xds/theme-default'],
  webpack: (config) => {
    config.resolve.conditionNames = ['source', 'import', 'require', 'default'];
    return config;
  },
};

export default nextConfig;
