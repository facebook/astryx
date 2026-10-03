// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {checkVanillaAssets} from './sync-vanilla-assets.mjs';

describe('bundled vanilla assets', () => {
  it('matches packages/vanilla markup and templates exactly', () => {
    expect(checkVanillaAssets()).toEqual([]);
  });
});
