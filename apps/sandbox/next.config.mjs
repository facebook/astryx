import stylexPlugin from '@stylexjs/nextjs-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xds/core'],
};

export default stylexPlugin({
  rootDir: __dirname,
})(nextConfig);
