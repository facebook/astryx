// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useMergedRefs.test.tsx
 * @input Uses vitest, @testing-library/react, useMergedRefs hook
 * @output Unit tests for stable merged ref behavior
 * @position Testing; validates useMergedRefs.ts
 *
 * SYNC: When useMergedRefs.ts changes, update tests to match new behavior
 */

import {renderHook} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {useMergedRefs} from './useMergedRefs';

describe('useMergedRefs', () => {
  it('forwards values to callback and object refs', () => {
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLDivElement>();
    const {result} = renderHook(() =>
      useMergedRefs<HTMLDivElement>(callbackRef, objectRef),
    );
    const element = document.createElement('div');

    const cleanup = result.current(element);

    expect(callbackRef).toHaveBeenCalledWith(element);
    expect(objectRef.current).toBe(element);

    cleanup?.();
    expect(callbackRef).toHaveBeenLastCalledWith(null);
    expect(objectRef.current).toBeNull();
  });

  it('keeps the merged callback stable when input refs are unchanged', () => {
    const callbackRef = vi.fn();
    const objectRef = createRef<HTMLDivElement>();
    const {result, rerender} = renderHook(() =>
      useMergedRefs<HTMLDivElement>(callbackRef, objectRef),
    );
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('updates the merged callback when an input ref changes', () => {
    const firstRef = vi.fn();
    const secondRef = vi.fn();
    const {result, rerender} = renderHook(
      ({ref}) => useMergedRefs<HTMLDivElement>(ref),
      {initialProps: {ref: firstRef}},
    );
    const first = result.current;

    rerender({ref: secondRef});

    expect(result.current).not.toBe(first);
  });
});
