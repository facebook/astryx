// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file reducedMotionValues.test.ts
 * @input Core's component sources and reducedMotionFadeConsts
 * @output Every Reduce Motion fade arm that spells the cross-fade's duration
 *   or curve as a literal spells reducedMotionFadeConsts' value exactly
 * @position Unit test beside reducedMotion.test.ts: a component that a
 *   consumer can swizzle cannot import the internal reducedMotion.stylex.ts,
 *   so it spells the values, and this keeps them one definition
 */

import {readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {describe, expect, it} from 'vitest';
import {
  reducedMotionFadeConsts,
  reducedMotionKeys,
} from './reducedMotion.stylex';

describe("the cross-fade's values spelled in components", () => {
  it('equal reducedMotionFadeConsts wherever a fade arm spells them', () => {
    const root = resolve(__dirname, '..');
    const arm = new RegExp(
      `'${reducedMotionKeys.fade.replace(/[()]/g, '\\$&')}':\\s*'([^']*)'`,
      'g',
    );
    const spelled: string[] = [];
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, {withFileTypes: true})) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '__tests__') {
            walk(path);
          }
        } else if (
          /\.tsx?$/.test(entry.name) &&
          !/\.(test|spec|stories)\.tsx?$/.test(entry.name)
        ) {
          for (const match of readFileSync(path, 'utf8').matchAll(arm)) {
            const value = match[1];
            const where = `${path.slice(root.length)}: ${value}`;
            if (/^[\d.]+m?s$/.test(value)) {
              spelled.push(where);
              if (value !== reducedMotionFadeConsts.duration) {
                offenders.push(where);
              }
            } else if (value.startsWith('cubic-bezier')) {
              spelled.push(where);
              if (value !== reducedMotionFadeConsts.easing) {
                offenders.push(where);
              }
            }
          }
        }
      }
    };
    walk(root);
    // A pattern that stopped matching would pass with nothing checked.
    expect(spelled.length).toBeGreaterThan(0);
    expect(offenders).toEqual([]);
  });
});
