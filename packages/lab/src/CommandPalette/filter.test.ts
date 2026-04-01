/**
 * @file filter.test.ts
 * @input Uses vitest
 * @output Unit tests for default filter function
 */

import {describe, it, expect} from 'vitest';
import {defaultFilter} from './filter';

describe('defaultFilter', () => {
  it('returns 1 for empty search', () => {
    expect(defaultFilter('anything', '')).toBe(1);
  });

  it('returns 1 for exact match', () => {
    expect(defaultFilter('settings', 'settings')).toBe(1);
  });

  it('returns 0.9 for starts-with match', () => {
    expect(defaultFilter('settings', 'set')).toBe(0.9);
  });

  it('returns 0.7 for contains match', () => {
    expect(defaultFilter('settings', 'ting')).toBe(0.7);
  });

  it('returns 0 for no match', () => {
    expect(defaultFilter('settings', 'xyz')).toBe(0);
  });

  it('is case-insensitive', () => {
    expect(defaultFilter('Settings', 'settings')).toBe(1);
    expect(defaultFilter('settings', 'SET')).toBe(0.9);
  });

  it('matches keywords', () => {
    expect(defaultFilter('theme', 'dark', ['dark mode', 'appearance'])).toBe(
      0.6,
    );
  });

  it('returns 0.5 for keyword contains match', () => {
    expect(defaultFilter('theme', 'ear', ['dark mode', 'appearance'])).toBe(
      0.5,
    );
  });
});
