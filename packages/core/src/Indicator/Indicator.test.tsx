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

/**
 * A theme target is public API. Renaming one to follow the
 * `<component>-kebab` convention (`checkbox` → `checkbox-indicator`) would
 * silently break every theme styling the old name — the CSS still compiles, it
 * just stops matching. So both names are emitted for a deprecation window, and
 * these tests pin that promise from both ends: the new name exists, and the
 * old one has not quietly disappeared.
 */
describe('renamed theme targets stay non-breaking', () => {
  const cases = [
    {
      name: 'CheckboxIndicator',
      render: () => <CheckboxIndicator state="checked" />,
      current: 'astryx-checkbox-indicator',
      legacy: 'astryx-checkbox',
    },
    {
      name: 'RadioIndicator',
      render: () => <RadioIndicator state="checked" />,
      current: 'astryx-radio-indicator',
      legacy: 'astryx-radio',
    },
  ] as const;

  for (const {name, render: renderCase, current, legacy} of cases) {
    it(`${name} emits both the current and the legacy target`, () => {
      const {container} = render(renderCase());
      const el = container.querySelector(`.${current}`);
      expect(el, `${name} should render ${current}`).toBeInTheDocument();
      expect(el, `${name} must keep emitting ${legacy}`).toHaveClass(legacy);
    });
  }

  it('keeps the legacy dot target on the radio mark', () => {
    const {container} = render(<RadioIndicator state="checked" />);
    const dot = container.querySelector('.astryx-radio-indicator-dot');
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveClass('astryx-radio-dot');
  });

  it('puts both names on ONE element, so either selector wins equally', () => {
    // If the legacy class were moved to a wrapper instead, an old theme's
    // rules would land on a different box than a new theme's — same-element
    // is what makes the two names interchangeable.
    const {container} = render(<CheckboxIndicator state="unchecked" />);
    expect(container.querySelectorAll('.astryx-checkbox')).toHaveLength(1);
    expect(container.querySelector('.astryx-checkbox')).toBe(
      container.querySelector('.astryx-checkbox-indicator'),
    );
  });
});
