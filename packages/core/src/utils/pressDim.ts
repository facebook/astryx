// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file pressDim.ts
 * @input An element, the opacity to fade it to, a clock (duration and
 *   cubic-bezier curve), and whether the fade answers a touch release
 * @output fadePressDim: fades the element's opacity from what it shows now to
 *   the target, on the clock (on the motion foundation's Reduce Motion fade
 *   when motion is reduced); stopPressDim: drops a running dim at once
 * @position Internal to core, beside the press machine (pressFeedback.ts):
 *   the dim a press puts on content that paints no press surface of its own,
 *   as UIKit dims a pressed segment's title. One job, plain inputs; no
 *   component names. Not exported from core's entry points
 *   (`architecture:public-component-api` INV12).
 *
 * The fade runs as a Web Animation on opacity, so it keeps running while the
 * main thread is busy. It starts from the opacity on screen, so a dim that
 * moves mid-fade never jumps. Back at 1, the animation is dropped once it
 * finishes and the element's own style takes over again. A new fade on the
 * same element replaces the one running.
 *
 * SYNC: When modified, update /packages/core/src/utils/pressDim.test.ts
 */

import {reducedMotionFade} from '../motion/reducedMotion';

/** A dim's clock: how long it takes and its cubic-bezier curve. */
export interface PressDimClock {
  readonly durationMs: number;
  readonly curve: ReadonlyArray<number>;
}

const running = new WeakMap<HTMLElement, Animation>();

/**
 * Fades `element`'s opacity to `to` on `clock`, from the opacity it shows
 * now. Under Reduce Motion the fade is the motion foundation's
 * (`design:reduced-motion` DR2-DR4; `touchRelease` says the change starts
 * from a touch's release).
 */
export function fadePressDim(
  element: HTMLElement,
  to: number,
  clock: PressDimClock,
  {touchRelease = false}: {touchRelease?: boolean} = {},
): void {
  const view = element.ownerDocument.defaultView;
  const shown =
    view == null ? NaN : parseFloat(view.getComputedStyle(element).opacity);
  stopPressDim(element);
  if (typeof element.animate !== 'function') {
    return;
  }
  const timing = reducedMotionFade(element, {touchRelease}) ?? {
    duration: clock.durationMs,
    easing: `cubic-bezier(${clock.curve.join(', ')})`,
  };
  const animation = element.animate(
    [{opacity: Number.isFinite(shown) ? shown : 1}, {opacity: to}],
    {...timing, fill: 'forwards'},
  );
  running.set(element, animation);
  if (to === 1) {
    animation.finished.then(
      () => {
        if (running.get(element) === animation) {
          running.delete(element);
          animation.cancel();
        }
      },
      () => {
        // Replaced by a newer fade, which owns the element now.
      },
    );
  }
}

/** Drops `element`'s running dim at once; its own style shows again. */
export function stopPressDim(element: HTMLElement): void {
  running.get(element)?.cancel();
  running.delete(element);
}
