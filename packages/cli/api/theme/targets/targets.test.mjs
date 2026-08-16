// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Direct-API tests for the `theme targets` leaf. Runs against the real
 * core docs, so it doubles as a guard that the themeable surface stays
 * readable and shaped as `theme.targets` promises.
 */

import {describe, it, expect} from 'vitest';
import {themeTargets} from './targets.mjs';

describe('themeTargets (api/theme/targets)', () => {
  it('returns a theme.targets envelope covering the whole surface', async () => {
    const result = await themeTargets();
    expect(result.type).toBe('theme.targets');
    expect(result.data.filter).toBeNull();
    expect(result.data.targets.length).toBeGreaterThan(100);
    expect(result.data.componentCount).toBeGreaterThan(50);
    for (const t of result.data.targets) {
      expect(Object.keys(t).sort()).toEqual([
        'className',
        'component',
        'key',
        'props',
        'states',
      ]);
    }
  }, 60_000);

  it('scopes to one component by name', async () => {
    const {data} = await themeTargets('Switch');
    expect(data.filter).toBe('Switch');
    expect(data.componentCount).toBe(1);
    expect(data.targets.map(t => t.key)).toEqual([
      'switch',
      'switch-field',
      'switch-thumb',
    ]);
  }, 60_000);

  // The knot this command answers started with "which theme slot paints the
  // switch thumb?" — a question you can only ask by the part, not the
  // component, until you already know the answer.
  it('searches keys by substring, across components', async () => {
    const {data} = await themeTargets('thumb');
    expect(data.componentCount).toBeGreaterThan(1);
    expect(data.targets.map(t => t.key)).toContain('switch-thumb');
    for (const t of data.targets) expect(t.key).toContain('thumb');
  }, 60_000);

  it('rejects a filter that matches nothing, with components to try', async () => {
    await expect(themeTargets('nosuchthing')).rejects.toMatchObject({
      code: 'ERR_UNKNOWN_COMPONENT',
    });
  }, 60_000);
});
