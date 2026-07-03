// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {getExpandedColorScale} from '../app/playground/themeEditor/helpers';

describe('theme editor helpers - getExpandedColorScale', () => {
  it('omits --color-accent from output to prevent overriding user picker selection', () => {
    const scale = getExpandedColorScale('#0064E0');
    expect(scale).not.toHaveProperty('--color-accent');
  });

  it('correctly generates other derived semantic color tokens', () => {
    const scale = getExpandedColorScale('#0064E0');
    const expectedKeys = [
      '--color-accent-muted',
      '--color-neutral',
      '--color-background-surface',
      '--color-background-body',
      '--color-text-primary',
      '--color-text-secondary',
      '--shadow-inset-hover',
      '--shadow-inset-selected',
    ];
    for (const key of expectedKeys) {
      expect(scale).toHaveProperty(key);
      expect(typeof scale[key]).toBe('string');
    }
  });

  it('properly falls back on invalid hex accent color', () => {
    const scale = getExpandedColorScale('invalid-hex');
    // Should fall back to black, which produces valid tokens
    expect(scale).toHaveProperty('--color-neutral');
    expect(typeof scale['--color-neutral']).toBe('string');
  });
});
