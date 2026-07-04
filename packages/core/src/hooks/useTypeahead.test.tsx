// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file useTypeahead.test.tsx
 * @input Uses vitest, @testing-library/react, useTypeahead hook
 * @output Unit tests for useTypeahead first-character search
 * @position Testing; validates useTypeahead.ts
 *
 * SYNC: When useTypeahead.ts changes, update tests to match new behavior
 */

import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook} from '@testing-library/react';
import {useTypeahead} from './useTypeahead';

const LABELS = ['Apple', 'Apricot', 'Banana', 'Cherry'] as const;
const NO_DISABLED: number[] = [];

function setup(opts?: {current?: number; disabledIndices?: number[]}) {
  const onMatch = vi.fn();
  const disabled = opts?.disabledIndices ?? NO_DISABLED;
  const {result} = renderHook(() =>
    useTypeahead({
      getItemLabels: () => LABELS,
      onMatch,
      getCurrentIndex: () => opts?.current ?? -1,
      isDisabled: (i: number) => disabled.includes(i),
    }),
  );
  return {onMatch, api: result.current};
}

function key(k: string): KeyboardEvent {
  return new KeyboardEvent('keydown', {key: k});
}

describe('useTypeahead', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('matches the first item whose label starts with the typed character', () => {
    const {onMatch, api} = setup();
    const handled = api.onKeyDown(key('b'));
    expect(handled).toBe(true);
    expect(onMatch).toHaveBeenCalledWith(2); // Banana
  });

  it('accumulates the buffer to disambiguate (a → ap → apr)', () => {
    const {onMatch, api} = setup();
    api.onKeyDown(key('a')); // Apple (first "a")
    expect(onMatch).toHaveBeenLastCalledWith(0);
    api.onKeyDown(key('p')); // "ap" still Apple
    expect(onMatch).toHaveBeenLastCalledWith(0);
    api.onKeyDown(key('r')); // "apr" → Apricot
    expect(onMatch).toHaveBeenLastCalledWith(1);
  });

  it('cycles through same-letter matches on repeated presses', () => {
    // Start with nothing focused; repeated "a" walks Apple → Apricot → wrap.
    const onMatch = vi.fn();
    let current = -1;
    const {result} = renderHook(() =>
      useTypeahead({
        getItemLabels: () => LABELS,
        onMatch: (i: number) => {
          current = i;
          onMatch(i);
        },
        getCurrentIndex: () => current,
      }),
    );
    result.current.onKeyDown(key('a'));
    expect(onMatch).toHaveBeenLastCalledWith(0); // Apple (first match)
    result.current.onKeyDown(key('a'));
    expect(onMatch).toHaveBeenLastCalledWith(1); // advance to Apricot
    result.current.onKeyDown(key('a'));
    expect(onMatch).toHaveBeenLastCalledWith(0); // wrap back to Apple
  });

  it('resets the buffer after the timeout', () => {
    const {onMatch, api} = setup();
    api.onKeyDown(key('a')); // Apple
    api.onKeyDown(key('p')); // Apple ("ap")
    vi.advanceTimersByTime(800);
    api.onKeyDown(key('b')); // fresh buffer → Banana
    expect(onMatch).toHaveBeenLastCalledWith(2);
  });

  it('skips disabled items', () => {
    const {onMatch, api} = setup({disabledIndices: [0]}); // Apple disabled
    api.onKeyDown(key('a'));
    expect(onMatch).toHaveBeenCalledWith(1); // Apricot
  });

  it('ignores control keys and modifier chords', () => {
    const {onMatch, api} = setup();
    expect(api.onKeyDown(key('ArrowDown'))).toBe(false);
    expect(
      api.onKeyDown(new KeyboardEvent('keydown', {key: 'a', metaKey: true})),
    ).toBe(false);
    expect(onMatch).not.toHaveBeenCalled();
  });

  it('does not treat a bare Space as typeahead', () => {
    const {onMatch, api} = setup();
    expect(api.onKeyDown(key(' '))).toBe(false);
    expect(onMatch).not.toHaveBeenCalled();
  });
});
