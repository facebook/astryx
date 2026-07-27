// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file SizeContext.test.tsx
 * @input Uses vitest, @testing-library/react, SizeContext module
 * @output Characterization tests for SizeContext / useSize / SizeProvider
 * @position Testing; validates the size-cascade resolution contract
 *
 * SYNC: When SizeContext.ts changes, update tests to match new behavior
 */

import {describe, it, expect} from 'vitest';
import {renderHook, render, screen} from '@testing-library/react';
import {createElement, type ReactNode} from 'react';
import {
  SizeContext,
  SizeProvider,
  useSize,
  type ElementSize,
} from './SizeContext';

/**
 * Wrap children in a SizeProvider set to `size`. Passing `null` mimics
 * "no container is providing a size".
 */
function withProvider(size: ElementSize | null) {
  return function Wrapper({children}: {children: ReactNode}) {
    return <SizeProvider value={size}>{children}</SizeProvider>;
  };
}

describe('SizeContext', () => {
  describe('context identity', () => {
    it('defaults to null when read outside any provider', () => {
      const {result} = renderHook(() => useSize());
      // No provider + no prop + no explicit default → the 'md' fallback.
      expect(result.current).toBe('md');
    });

    it('exposes a displayName for devtools', () => {
      expect(SizeContext.displayName).toBe('SizeContext');
    });

    it('SizeProvider is the context Provider itself', () => {
      expect(SizeProvider).toBe(SizeContext.Provider);
    });
  });

  describe('useSize — resolution priority', () => {
    it('returns the default "md" with no prop and no provider', () => {
      const {result} = renderHook(() => useSize());
      expect(result.current).toBe('md');
    });

    it('honors an explicit defaultSize when neither prop nor context is set', () => {
      const {result} = renderHook(() => useSize(undefined, 'lg'));
      expect(result.current).toBe('lg');
    });

    it('returns the explicit size prop when provided', () => {
      const {result} = renderHook(() => useSize('sm'));
      expect(result.current).toBe('sm');
    });

    it('prop wins over the explicit default', () => {
      const {result} = renderHook(() => useSize('sm', 'lg'));
      expect(result.current).toBe('sm');
    });

    it('inherits the size from an enclosing provider when no prop is passed', () => {
      const {result} = renderHook(() => useSize(), {
        wrapper: withProvider('lg'),
      });
      expect(result.current).toBe('lg');
    });

    it('prop wins over the inherited provider size', () => {
      const {result} = renderHook(() => useSize('sm'), {
        wrapper: withProvider('lg'),
      });
      expect(result.current).toBe('sm');
    });

    it('inherited context wins over the explicit default fallback', () => {
      const {result} = renderHook(() => useSize(undefined, 'sm'), {
        wrapper: withProvider('lg'),
      });
      expect(result.current).toBe('lg');
    });

    it('falls back to default when the provider value is explicitly null', () => {
      const {result} = renderHook(() => useSize(undefined, 'sm'), {
        wrapper: withProvider(null),
      });
      expect(result.current).toBe('sm');
    });

    it('falls back to "md" when provider is null and no default is given', () => {
      const {result} = renderHook(() => useSize(), {
        wrapper: withProvider(null),
      });
      expect(result.current).toBe('md');
    });
  });

  describe('useSize — every standard ElementSize resolves', () => {
    const sizes: ElementSize[] = ['sm', 'md', 'lg'];

    it.each(sizes)('resolves explicit prop "%s"', size => {
      const {result} = renderHook(() => useSize(size));
      expect(result.current).toBe(size);
    });

    it.each(sizes)('resolves inherited provider "%s"', size => {
      const {result} = renderHook(() => useSize(), {
        wrapper: withProvider(size),
      });
      expect(result.current).toBe(size);
    });
  });

  describe('useSize — nested providers', () => {
    it('resolves to the nearest provider', () => {
      function Nested({children}: {children: ReactNode}) {
        return (
          <SizeProvider value="sm">
            <SizeProvider value="lg">{children}</SizeProvider>
          </SizeProvider>
        );
      }
      const {result} = renderHook(() => useSize(), {wrapper: Nested});
      expect(result.current).toBe('lg');
    });

    it('a prop still overrides the nearest provider', () => {
      function Nested({children}: {children: ReactNode}) {
        return (
          <SizeProvider value="sm">
            <SizeProvider value="lg">{children}</SizeProvider>
          </SizeProvider>
        );
      }
      const {result} = renderHook(() => useSize('md'), {wrapper: Nested});
      expect(result.current).toBe('md');
    });
  });

  describe('useSize — generic (non-ElementSize) values', () => {
    it('supports a custom string union via the type parameter', () => {
      type Custom = 'compact' | 'comfortable';
      const {result} = renderHook(() =>
        useSize<Custom>('compact', 'comfortable'),
      );
      expect(result.current).toBe('compact');
    });

    it('returns the custom default when no prop is given', () => {
      type Custom = 'compact' | 'comfortable';
      const {result} = renderHook(() =>
        useSize<Custom>(undefined, 'comfortable'),
      );
      expect(result.current).toBe('comfortable');
    });

    it('empty-string prop is a real value and does NOT fall through to default', () => {
      // '' ?? x === '' because nullish coalescing only catches null/undefined.
      const {result} = renderHook(() => useSize('' as ElementSize, 'lg'));
      expect(result.current).toBe('');
    });
  });

  describe('integration — components consuming the cascade', () => {
    function SizedProbe({size}: {size?: ElementSize}) {
      const resolved = useSize(size);
      return <span data-testid="probe">{resolved}</span>;
    }

    it('a child with no size prop reads the container size', () => {
      render(
        <SizeProvider value="lg">
          <SizedProbe />
        </SizeProvider>,
      );
      expect(screen.getByTestId('probe')).toHaveTextContent('lg');
    });

    it('sibling children resolve independently against the same provider', () => {
      render(
        <SizeProvider value="lg">
          <span data-testid="a">
            <SizedProbe />
          </span>
          <span data-testid="b">
            <SizedProbe size="sm" />
          </span>
        </SizeProvider>,
      );
      expect(screen.getByTestId('a')).toHaveTextContent('lg');
      expect(screen.getByTestId('b')).toHaveTextContent('sm');
    });

    it('re-renders with the new size when the provider value changes', () => {
      const {rerender} = render(
        <SizeProvider value="sm">
          <SizedProbe />
        </SizeProvider>,
      );
      expect(screen.getByTestId('probe')).toHaveTextContent('sm');

      rerender(
        <SizeProvider value="lg">
          <SizedProbe />
        </SizeProvider>,
      );
      expect(screen.getByTestId('probe')).toHaveTextContent('lg');
    });

    it('works with createElement (no JSX) call form', () => {
      const {result} = renderHook(() => useSize(), {
        wrapper: ({children}: {children: ReactNode}) =>
          createElement(SizeProvider, {value: 'sm'}, children),
      });
      expect(result.current).toBe('sm');
    });
  });
});
