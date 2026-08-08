// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {render, renderHook, screen} from '@testing-library/react';
import type {PropsWithChildren, ReactNode} from 'react';
import {Theme} from '../theme/Theme';
import {defineTheme} from '../theme/defineTheme';
import {CheckboxIndicator} from './CheckboxIndicator';
import {RadioIndicator} from './RadioIndicator';
import {getIndicator} from './indicatorRegistry';
import {useIndicator} from './useIndicator';
import type {IndicatorProps} from './types';

function createThemeWrapper(theme: ReturnType<typeof defineTheme>) {
  function ThemeWrapper({children}: PropsWithChildren): ReactNode {
    return <Theme theme={theme}>{children}</Theme>;
  }
  return ThemeWrapper;
}

describe('default indicators', () => {
  it('renders the checkbox theme target with state and size', () => {
    render(<CheckboxIndicator state="indeterminate" size="sm" />);

    const box = document.querySelector('.astryx-checkbox');
    expect(box).toBeInTheDocument();
    expect(box).toHaveAttribute('data-checked', 'indeterminate');
    expect(box).toHaveAttribute('data-size', 'sm');
    // Decorative: the owning control keeps the role and accessible name.
    expect(box).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders the radio dot only when checked, in both states', () => {
    const {rerender} = render(<RadioIndicator state="unchecked" />);

    // The circle draws in the unchecked state — this is what lets a radio act
    // as a selection indicator where an icon would render nothing.
    expect(document.querySelector('.astryx-radio')).toBeInTheDocument();
    expect(document.querySelector('.astryx-radio-dot')).not.toBeInTheDocument();

    rerender(<RadioIndicator state="checked" />);
    expect(document.querySelector('.astryx-radio-dot')).toBeInTheDocument();
    expect(document.querySelector('.astryx-radio')).toHaveAttribute(
      'data-checked',
      'checked',
    );
  });

  it('renders children instead of the state mark', () => {
    render(
      <CheckboxIndicator state="checked">
        <span data-testid="busy" />
      </CheckboxIndicator>,
    );

    expect(screen.getByTestId('busy')).toBeInTheDocument();
  });

  it('reflects the disabled state for theme targeting', () => {
    render(<RadioIndicator state="checked" isDisabled />);

    expect(document.querySelector('.astryx-radio')).toHaveAttribute(
      'data-disabled',
      'disabled',
    );
  });
});

describe('useIndicator', () => {
  it('returns the built-in indicator without a theme override', () => {
    const {result} = renderHook(() => useIndicator('checkbox'));

    expect(result.current).toBe(CheckboxIndicator);
  });

  it('resolves an indicator component from the nearest theme', () => {
    function BrandCheckbox({state}: IndicatorProps) {
      return <span data-testid="brand">{state}</span>;
    }
    const theme = defineTheme({
      name: 'brand-indicators',
      indicators: {checkbox: BrandCheckbox},
    });

    const {result} = renderHook(() => useIndicator('checkbox'), {
      wrapper: createThemeWrapper(theme),
    });

    expect(result.current).toBe(BrandCheckbox);
    // Unmapped indicators keep the built-in.
    expect(getIndicator('radio', theme)).toBe(RadioIndicator);
  });
});
