// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowMotion.test.ts
 * @input vitest, rowMotion.ts and the outline spring (motion/uikit/list.ts)
 * @output Proof that springTo starts from rest at the browser's commit, as
 *   springHome does, and that a motion already running keeps its clock
 * @position Testing for /packages/core/src/utils/rowMotion.ts
 */

import {describe, expect, it, vi} from 'vitest';
import {list} from '../motion/uikit/list';
import {animatorFor, springTo} from './rowMotion';

describe('springTo', () => {
  it('starts from rest when the browser commits it, so the motions a toggle starts share one clock, and a running motion keeps its clock (spec:AST-108 FR4a)', () => {
    const element = document.createElement('div');
    document.body.append(element);
    const animate = vi.spyOn(animatorFor(element), 'animate');
    void springTo(element, -40, list.update.outlineSpring, 123);
    expect(animate).toHaveBeenCalledTimes(1);
    // From rest: no start of its own; the browser's commit sets it.
    expect(animate.mock.calls[0][2]).not.toHaveProperty('at');
    // A retarget while it runs continues from the frame on screen.
    void springTo(element, 0, list.update.outlineSpring, 456);
    expect(animate.mock.calls[1][2]).toHaveProperty('at', 456);
    element.remove();
  });
});
