// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file indicatorRegistry.test.tsx
 *
 * Pins the seam between the indicators core ships and the ones other packages
 * add, because that seam used to lie: `defaultIndicators` was typed as a total
 * map over the OPEN `IndicatorName` union, so augmenting `IndicatorMap` made
 * the compiler promise a component for a name nothing had registered, and
 * rendering the `undefined` it actually returned threw.
 *
 * The augmentation below is deliberately real, not a cast — it is exactly what
 * a downstream package writes, and it is what makes `defaultIndicators`
 * failing to cover `'brand-star'` a compile error if anyone re-widens the map.
 */

import {describe, expect, it} from 'vitest';
import {render} from '@testing-library/react';
import {defineTheme} from '../theme/defineTheme';
import {CheckboxIndicator} from './CheckboxIndicator';
import {CheckIndicator} from './CheckIndicator';
import {RadioIndicator} from './RadioIndicator';
import {defaultIndicators, getIndicator} from './indicatorRegistry';
import type {CoreIndicatorName} from './indicatorRegistry';
import type {IndicatorName, IndicatorProps} from './types';

declare module './types' {
  interface IndicatorMap {
    'brand-star': 'singleSelection';
  }
}

function BrandStar({state}: IndicatorProps<'singleSelection'>) {
  return <span aria-hidden="true" data-testid="star" data-state={state} />;
}

describe('defaultIndicators', () => {
  it('covers exactly the core indicator names', () => {
    // A Record over the union, not an array: adding a name to
    // CoreIndicatorName without shipping a default fails to compile here
    // before it can fail at runtime anywhere else.
    const coreNames: Record<CoreIndicatorName, true> = {
      check: true,
      checkbox: true,
      radio: true,
    };

    expect(Object.keys(defaultIndicators).sort()).toEqual(
      Object.keys(coreNames).sort(),
    );
    expect(defaultIndicators.check).toBe(CheckIndicator);
    expect(defaultIndicators.checkbox).toBe(CheckboxIndicator);
    expect(defaultIndicators.radio).toBe(RadioIndicator);
  });
});

describe('getIndicator', () => {
  it('resolves a core name to its built-in with no theme', () => {
    expect(getIndicator('check')).toBe(CheckIndicator);
    expect(getIndicator('radio')).toBe(RadioIndicator);
  });

  it('prefers a theme override, by name, across every host', () => {
    const theme = defineTheme({
      name: 'registry-override',
      indicators: {check: RadioIndicator},
    });

    expect(getIndicator('check', theme)).toBe(RadioIndicator);
    // Unmapped names keep their built-in.
    expect(getIndicator('checkbox', theme)).toBe(CheckboxIndicator);
  });

  it('returns undefined for an augmented name no theme supplies', () => {
    // The honest answer: core ships no `brand-star`. The type says
    // `| undefined` for exactly this reason, so a caller writes `?? BrandStar`
    // instead of rendering undefined.
    expect(getIndicator('brand-star')).toBeUndefined();
  });

  it('resolves an augmented name the theme does supply', () => {
    const theme = defineTheme({
      name: 'brand-star-theme',
      indicators: {'brand-star': BrandStar},
    });

    const Star = getIndicator('brand-star', theme);
    expect(Star).toBe(BrandStar);

    const {container} = render(<BrandStar state="checked" />);
    expect(container.querySelector('[data-testid="star"]')).toBeInTheDocument();
  });

  it('types a core name as always resolvable and an open name as maybe', () => {
    // Compile-time assertions; the runtime body only keeps them referenced.
    const core = getIndicator('check');
    const open = getIndicator('brand-star' as IndicatorName);

    // @ts-expect-error — an augmented name may have no default; callers must
    // handle undefined rather than render it.
    const _mustHandle: NonNullable<typeof open> = open;

    expect(core).toBeDefined();
    expect(_mustHandle ?? null).toBeDefined();
  });
});
