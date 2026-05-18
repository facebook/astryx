// Copyright (c) Meta Platforms, Inc. and affiliates.

import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
  },
});
