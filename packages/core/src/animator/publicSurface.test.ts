// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file publicSurface.test.ts
 * @input The animator entry, the hooks barrel, the package root's source
 * @output Checks `spec:AST-107` FR4 and FR6 for the animator: the public
 *   entry hands out `createAnimator` alone, the hooks barrel hands out
 *   `useAnimator` and nothing of the motion module beneath, and no internal
 *   factory takes the public factory's name
 * @position Public API test; enforced by Vitest and Core typecheck
 */

import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';
import * as hooks from '../hooks';
import * as entry from './index';

const SRC = path.join(__dirname, '..');

/** Names of the motion module beneath the public animator. */
const INTERNAL = [
  'createMotionAnimator',
  'createAttachableAnimator',
  'animatorFor',
  'coast',
  'resolveMotion',
  'registerSpringsTable',
  'springs',
];

describe('the public animator surface', () => {
  it('the animator entry exports createAnimator and nothing else at runtime', () => {
    expect(Object.keys(entry)).toEqual(['createAnimator']);
  });

  it('the hooks barrel exports useAnimator, and nothing of the motion module', () => {
    expect(typeof hooks.useAnimator).toBe('function');
    for (const name of INTERNAL) {
      expect(hooks).not.toHaveProperty(name);
    }
  });

  it('the package root re-exports the animator entry and no motion or gesture module', () => {
    const root = fs.readFileSync(path.join(SRC, 'index.ts'), 'utf8');
    expect(root).toContain("export * from './animator';");
    expect(root).not.toMatch(/from '\.\/(motion|gestures)(\/|')/);
  });

  it('no internal factory takes the public factory\u2019s name', () => {
    const motion = fs.readFileSync(
      path.join(SRC, 'motion', 'animator.ts'),
      'utf8',
    );
    expect(motion).not.toMatch(/export function createAnimator\b/);
    expect(motion).toMatch(/export function createMotionAnimator\b/);
  });
});
