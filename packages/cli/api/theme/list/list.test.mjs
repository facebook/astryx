// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Direct-API tests for the `theme list` leaf. Runs against the real
 * bundled-theme manifest (committed under templates/themes/), so it doubles as a
 * guard that the bundle stays readable and shaped as `theme.list` expects.
 */

import {describe, it, expect} from 'vitest';
import {themeList} from './list.mjs';

describe('themeList (api/theme/list)', () => {
  it('returns a theme.list envelope of the bundled themes', () => {
    const result = themeList();
    expect(result.type).toBe('theme.list');
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data.length).toBeGreaterThan(0);
    for (const t of result.data) {
      expect(typeof t.slug).toBe('string');
      expect(typeof t.displayName).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(typeof t.maintained).toBe('boolean');
    }
  });

  it('surfaces the maintained neutral theme', () => {
    const neutral = themeList().data.find(t => t.slug === 'neutral');
    expect(neutral).toBeTruthy();
    expect(neutral?.maintained).toBe(true);
  });

  it('projects only the list fields (no entry/exportName/files leak)', () => {
    const [first] = themeList().data;
    expect(first).toBeTruthy();
    expect(Object.keys(first ?? {}).sort()).toEqual([
      'description',
      'displayName',
      'maintained',
      'slug',
    ]);
  });
});
