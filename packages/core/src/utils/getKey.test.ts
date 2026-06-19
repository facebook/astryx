// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {getKey} from './getKey';

describe('getKey', () => {
  it('uses the id key when present', () => {
    expect(getKey('alpha', 0)).toBe('id:alpha');
    expect(getKey(0, 1)).toBe('id:0');
  });

  it('uses the fallback key only when the id key is missing', () => {
    expect(getKey(undefined, 0)).toBe('fallback:0');
    expect(getKey(null, 'empty')).toBe('fallback:empty');
    expect(getKey(undefined, () => 2)).toBe('fallback:2');
  });

  it('does not read lazy fallback keys when the id key is present', () => {
    expect(
      getKey('alpha', () => {
        throw new Error('Fallback should not be read');
      }),
    ).toBe('id:alpha');
  });
});
