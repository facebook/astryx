// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Force ESM resolution for @xds/core — the CJS dist has a bug where
    // "use client" appears after Object.defineProperty(exports, "__esModule").
    config.resolve.conditionNames = ['import', 'module', 'require', 'default'];
    return config;
  },
  // The playground scope uses `import * as Heroicons from '@heroicons/react/...'`
  // to make all icons available at runtime. Next.js's default barrel-file
  // optimization for @heroicons/react tree-shakes icons that aren't statically
  // referenced, breaking the playground. Exclude it from optimization.
  experimental: {
    optimizePackageImports: [],
  },
};

export default nextConfig;
