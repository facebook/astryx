// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useDirection.test.tsx
 * @input packages/core/src/i18n/useDirection.ts, InternationalizationProvider
 * @output Unit tests for the ambient text-direction hook
 * @position Colocated tests; targets the default (no-provider) fallback,
 *   locale-derived direction, and the explicit `dir` override.
 */

import type {ReactNode} from 'react';
import {describe, expect, test} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useDirection} from '../useDirection';
import {InternationalizationProvider} from '../InternationalizationProvider';

describe('useDirection', () => {
  test('returns ltr when rendered without a provider', () => {
    const {result} = renderHook(() => useDirection());
    expect(result.current).toBe('ltr');
  });

  test('returns ltr under an English provider', () => {
    const {result} = renderHook(() => useDirection(), {
      wrapper: ({children}: {children: ReactNode}) => (
        <InternationalizationProvider locale="en">
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current).toBe('ltr');
  });

  test('returns rtl under an Arabic provider', () => {
    const {result} = renderHook(() => useDirection(), {
      wrapper: ({children}: {children: ReactNode}) => (
        <InternationalizationProvider locale="ar">
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current).toBe('rtl');
  });

  test('explicit dir="rtl" wins over an LTR locale', () => {
    const {result} = renderHook(() => useDirection(), {
      wrapper: ({children}: {children: ReactNode}) => (
        <InternationalizationProvider locale="en" dir="rtl">
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current).toBe('rtl');
  });

  test('explicit dir="ltr" wins over an RTL locale', () => {
    const {result} = renderHook(() => useDirection(), {
      wrapper: ({children}: {children: ReactNode}) => (
        <InternationalizationProvider locale="ar" dir="ltr">
          {children}
        </InternationalizationProvider>
      ),
    });
    expect(result.current).toBe('ltr');
  });
});
