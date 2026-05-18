// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Force ESM resolution for @xds/core — the CJS dist has a bug where
    // "use client" appears after Object.defineProperty(exports, "__esModule").
    config.resolve.conditionNames = ['import', 'module', 'require', 'default'];
    return config;
  },
};

export default nextConfig;
