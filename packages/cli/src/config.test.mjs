// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createConfig, createIntegration} from './config.mjs';

describe('config helpers', () => {
  it('return config and integration objects unchanged', () => {
    const config = {integrations: ['@acme/widgets']};
    const integration = {name: '@acme/widgets', docs: './docs'};
    expect(createConfig(config)).toBe(config);
    expect(createIntegration(integration)).toBe(integration);
  });

  it('validates config and integration shapes', () => {
    expect(() => createConfig({integrations: [42]})).toThrow(/integrations/);
    expect(() => createIntegration({docs: './docs'})).toThrow(/name/);
    expect(() =>
      createIntegration({
        name: '@acme/widgets',
        postCodemod: [{name: 'empty'}],
      }),
    ).toThrow(/postCodemod/);
  });
});
