// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Unit tests for levenshteinDistance — the fuzzy-suggestion primitive
 * behind "did you mean" errors across component/hook/discover/theme. Had no
 * coverage; these lock the edge cases (empty strings, symmetry, unicode).
 */

import {describe, it, expect} from 'vitest';
import {levenshteinDistance as d} from './levenshtein.mjs';

describe('levenshteinDistance', () => {
  it('is 0 for identical strings', () => {
    expect(d('Button', 'Button')).toBe(0);
    expect(d('', '')).toBe(0);
  });

  it('handles empty inputs (distance = other length)', () => {
    expect(d('', 'abc')).toBe(3);
    expect(d('abc', '')).toBe(3);
  });

  it('computes the classic kitten/sitting distance', () => {
    expect(d('kitten', 'sitting')).toBe(3);
  });

  it('is symmetric', () => {
    expect(d('abc', 'xyz')).toBe(d('xyz', 'abc'));
    expect(d('Button', 'Buttonn')).toBe(d('Buttonn', 'Button'));
  });

  it('counts a single substitution/insertion for near-miss names', () => {
    expect(d('Button', 'Buttonn')).toBe(1);
    expect(d('useMediaQuery', 'usemediaquery')).toBe(2); // M->m and Q->q
  });

  it('handles unicode', () => {
    expect(d('café', 'cafe')).toBe(1);
  });
});
