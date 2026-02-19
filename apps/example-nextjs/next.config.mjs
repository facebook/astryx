import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@xds/core', '@xds/theme'],
  typescript: {
    // XDS core has a known type issue in Popover internals;
    // safe to ignore for this example.
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    // The @xds/core package exports ./theme/tokens.stylex but tsup
    // bundles it into chunks rather than producing a separate file.
    // Alias it to the source file so @xds/theme can resolve it.
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
