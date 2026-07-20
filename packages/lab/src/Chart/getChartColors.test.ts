// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {getChartColorsFromResolver} from './getChartColors';

describe('getChartColorsFromResolver alpha', () => {
  const colors = getChartColorsFromResolver(name => `resolved(${name})`);

  it('applies opacity to a hex color', () => {
    expect(colors.alpha('#0064E0', 0.2)).toBe('rgba(0, 100, 224, 0.2)');
  });

  it('applies opacity to bare hex without the leading # (pre-#3739 behavior)', () => {
    expect(colors.alpha('0064E0', 0.2)).toBe('rgba(0, 100, 224, 0.2)');
  });

  it('applies opacity to rgba() input, overriding its alpha', () => {
    expect(colors.alpha('rgba(0, 100, 224, 0.9)', 0.2)).toBe(
      'rgba(0, 100, 224, 0.2)',
    );
  });

  it('preserves unparseable input unchanged', () => {
    expect(colors.alpha('var(--color-accent)', 0.5)).toBe(
      'var(--color-accent)',
    );
  });
});
