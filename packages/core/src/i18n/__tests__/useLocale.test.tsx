// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useLocale.test.tsx
 * @input packages/core/src/i18n/useLocale.ts, InternationalizationProvider
 * @output Unit tests for the internal provider-aware locale accessor
 * @position Colocated tests; targets the default (no-provider) fallback, the
 *   provider locale, and re-rendering when the provider locale changes.
 */

import type {ReactNode} from 'react';
import {describe, expect, test} from 'vitest';
import {render, renderHook} from '@testing-library/react';
import {useLocale} from '../useLocale';
import {InternationalizationProvider} from '../InternationalizationProvider';

describe('useLocale', () => {
  test('returns en when rendered without a provider', () => {
    const {result} = renderHook(() => useLocale());
    expect(result.current).toBe('en');
  });

  test('returns the provider locale', () => {
    const {result} = renderHook(() => useLocale(), {
      wrapper: ({children}: {children: ReactNode}) => (
        <InternationalizationProvider locale="fr">
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current).toBe('fr');
  });

  test('re-renders with the new locale when the provider locale changes', () => {
    function Probe() {
      return <span data-testid="locale">{useLocale()}</span>;
    }
    const {getByTestId, rerender} = render(
      <InternationalizationProvider locale="en">
        <Probe />
      </InternationalizationProvider>,
    );
    expect(getByTestId('locale').textContent).toBe('en');

    rerender(
      <InternationalizationProvider locale="ja-JP">
        <Probe />
      </InternationalizationProvider>,
    );
    expect(getByTestId('locale').textContent).toBe('ja-JP');
  });
});
