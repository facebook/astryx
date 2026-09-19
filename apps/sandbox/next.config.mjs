// Copyright (c) Meta Platforms, Inc. and affiliates.

import {withAstryx} from '@astryxdesign/build/next';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
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
  webpack(config, {dev}) {
    // Workarounds for Node v24+ where webpack's hashing/caching feeds
    // `undefined` to Hash.update and crashes the dev server.
    config.output = config.output || {};
    // Use a Node-crypto JS hash instead of the bundled WASM xxhash64.
    config.output.hashFunction = 'sha512';
    if (dev) {
      // Disable the persistent filesystem cache in dev — its async pack/unpack
      // queue is the source of the recurring `Hash.update(undefined)` crash
      // on Node 24+. Cold rebuilds are slightly slower, but the server stays
      // alive across requests.
      config.cache = false;
    }
    return config;
  },
};

export default withAstryx(nextConfig);
