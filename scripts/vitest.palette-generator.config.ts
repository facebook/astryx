// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'vitest/config';

/**
 * Focused config for sandbox-only palette experiments. The root config builds
 * every publishable package before node tests; this tool has no dependency on
 * those build artifacts and can be checked independently.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['scripts/palette-generator.test.ts'],
  },
});
