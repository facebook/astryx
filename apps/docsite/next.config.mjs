import {withXDS} from '@xds/build/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@xds/theme-chocolate',
    '@xds/theme-gothic',
    '@xds/theme-matcha',
    '@xds/theme-stone',
  ],
};

export default withXDS(nextConfig);
