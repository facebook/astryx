// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createConfig} from './config';

describe('createConfig', () => {
  it('returns its argument unchanged (identity)', () => {
    const input = {integrations: ['@acme/astryx'], issuesUrl: 'https://x'};
    expect(createConfig(input)).toBe(input);
  });

  it('does not stamp a discriminant', () => {
    const cfg = createConfig({integrations: []}) as Record<string, unknown>;
    expect(cfg.type).toBeUndefined();
  });
});
