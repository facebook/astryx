// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useListFormatter.test.tsx
 * @input packages/core/src/i18n/useListFormatter.ts, InternationalizationProvider
 * @output Unit tests for the internal provider-aware list formatter
 * @position Colocated tests; the platform Intl.ListFormat is the independent
 *   oracle for each locale.
 */

import type {ReactNode} from 'react';
import {describe, expect, test} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useListFormatter} from '../useListFormatter';
import {InternationalizationProvider} from '../InternationalizationProvider';

const items = ['"a.png" is not an accepted file type', '"b.pdf" exceeds 1 MB'];

function wrapperFor(locale: string) {
  return ({children}: {children: ReactNode}) => (
    <InternationalizationProvider locale={locale}>
      {children}
    </InternationalizationProvider>
  );
}

const oracle = (locale: string, list: string[]) =>
  new Intl.ListFormat(locale, {type: 'unit', style: 'short'}).format(list);

describe('useListFormatter', () => {
  test('joins with the en fallback when rendered without a provider', () => {
    const {result} = renderHook(() => useListFormatter());
    expect(result.current(items)).toBe(oracle('en', items));
  });

  test('joins in the provider locale', () => {
    const three = ['un', 'deux', 'trois'];
    const {result: fr} = renderHook(() => useListFormatter(), {
      wrapper: wrapperFor('fr-FR'),
    });
    const {result: en} = renderHook(() => useListFormatter(), {
      wrapper: wrapperFor('en'),
    });
    expect(fr.current(three)).toBe(oracle('fr-FR', three));
    expect(fr.current(three)).not.toBe(en.current(three));
  });

  test('keeps the same function while the locale is unchanged', () => {
    const {result, rerender} = renderHook(() => useListFormatter(), {
      wrapper: wrapperFor('de-DE'),
    });
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });
});
