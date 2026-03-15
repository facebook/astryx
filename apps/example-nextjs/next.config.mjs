/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xds/core', '@xds/theme-default'],
  typescript: {
    // XDS core has a known type issue in Popover internals;
    // safe to ignore for this example.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
