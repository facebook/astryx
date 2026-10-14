// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {generateThemeCSS} from '@astryxdesign/core/theme';
import {butterTheme} from './butterTheme';

describe('butter touch + narrow type pin', () => {
  it('floors body to 16px and holds Display 1 at its desktop size', () => {
    const rule = butterTheme.__adaptationRules?.[0];

    expect(butterTheme.__adaptations.rules).toHaveLength(1);
    expect(rule?.when).toEqual({pointer: 'coarse', width: {below: 'lg'}});
    expect(rule?.query).toBe('(width < 1024px) and (pointer: coarse)');
    // Pinned ladder: base 16 (was 14), ratio 1.25 -> 1.2225, Display 1 pinned.
    expect(rule?.tokens['--font-size-base']).toBe('1rem');
    expect(rule?.tokens['--font-size-lg']).toBe('1.25rem');
    expect(rule?.tokens['--font-size-5xl']).toBe('3.3125rem');
    // Desktop scale is untouched.
    expect(butterTheme.tokens['--font-size-base']).toBe('0.875rem');
    expect(butterTheme.tokens['--font-size-5xl']).toBe('3.3125rem');
    expect(generateThemeCSS(butterTheme).component).toContain(
      '@media (width < 1024px) and (pointer: coarse)',
    );
  });
});
