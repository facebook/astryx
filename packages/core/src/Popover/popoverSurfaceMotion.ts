// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file popoverSurfaceMotion.ts
 * @input A Popover's layer element, the source it hangs off, the motion
 *   foundation (compositor animator, spring math), the UIKit table and the
 *   layer runtime's exit copy and input hold
 * @output Exports `popoverCollapsedState` (where the popover meets its source
 *   and the shape it grows from), `popoverFrame` (the transform and opacity
 *   at a progress of the spring), `POPOVER_EXIT_COPY_ATTRIBUTE` and
 *   `createPopoverSurfaceMotion` (the touch presentation's present and
 *   dismiss)
 * @position Internal to Popover: under a finger the popover is presented
 *   and dismissed the way UIPopoverPresentationController does it
 *
 * On iOS 26.2 a popover grows out of the point where it meets its source: the
 * bottom centre of the source for a popover below it. Its scale (from
 * `popover.collapsedScale`), its length away from the source (from
 * `popover.collapsedLengthPx` to its own) and its opacity run on one spring,
 * `POPOVER_PRESENT_SPRING`, with the edge that meets the source held in
 * place. The dismissal runs the same path back into that point on
 * `POPOVER_DISMISS_SPRING`.
 *
 * Here the layer element is scaled about that point. Across the source's
 * edge its scale is s = s₀ + (1 − s₀)·p; along the axis away from the source
 * it is s·f with f = f₀ + (1 − f₀)·p, the length's share of the full length,
 * which is UIKit's box growing while it scales. Both are products of the
 * spring's progress p, so they are played as curves (`Animator.play`) on the
 * compositor (law M1), and a dismissal during the presentation (or a
 * presentation during the dismissal) continues from the frame on screen with
 * its velocity (M2, M3).
 *
 * Measured for a popover below its source; one above or beside it runs the
 * same motion turned toward its source (M-PO1 confirms it). The point it
 * grows out of is the source's centre on that edge, kept on the popover.
 *
 * A presentation writes and reads nothing until the next animation frame,
 * which runs before that frame paints: as the popover opens, the element's
 * style and the boxes would lay the page out inside the task that opened it.
 * The layer's own CSS entrance, started meanwhile, is turned off in that
 * frame, before anything paints.
 *
 * The dismissal outlives the popover: the browser hides a popover as it
 * closes, so it plays on the layer runtime's exit copy (`placeLayerExitCopy`),
 * removed when its motion ends.
 *
 * Under Reduce Motion the animator's policy applies (design:reduced-motion):
 * on a coarse pointer the popover neither grows nor springs, it lands at its
 * full size and cross-fades in, and out where it stands, opacity only, in
 * `timing.reducedMotionCrossFadeMs`; on any other pointer it changes at once.
 * UIKit itself fades a popover on its presentation springs, about half a
 * second; the current record caps a touch cross-fade at 200 ms.
 *
 * UIKit ignores every touch while the popover is presented: a tap outside
 * 60 ms in neither dismisses it nor reaches what is under it, and the
 * presentation finishes. The browser's light dismiss cannot be cancelled from
 * an event, so the presentation runs under the layer runtime's own hold
 * (`holdInput`, scope `viewport`), the one the Layer module places for
 * every component whose layer presents under a finger: its shield covers the
 * viewport from inside the layer until the present spring settles, so a tap
 * on it is a tap inside the popover, which the browser leaves open, and a
 * pinch on it still zooms the page.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Popover/popoverSurfaceFrame.ts
 * - /packages/core/src/Popover/popoverSurfaceMotion.test.ts
 * - /packages/core/src/Popover/Popover.tsx
 */

import {
  createAnimator,
  type Animator,
  type AnimatorOptions,
  type MotionCurve,
  type MotionHandle,
} from '../motion/animator';
import {
  SETTLING_EPSILON,
  solveSpring,
  toSpring,
  type SpringDescription,
} from '../motion/spring';
import {
  POPOVER_DISMISS_SPRING,
  POPOVER_PRESENT_SPRING,
} from '../motion/uikit/springs';
import {placeLayerExitCopy} from '../Layer/layerExitCopy';
import {holdInput} from '../Layer/inputHold';
import {
  frameOf,
  popoverCollapsedState,
  PRESENTED,
  type PopoverCollapsedState,
  type PopoverFrame,
  type PopoverSurfaceGeometry,
  type SurfaceState,
} from './popoverSurfaceFrame';

export {popoverCollapsedState, popoverFrame} from './popoverSurfaceFrame';
export type {
  PopoverCollapsedState,
  PopoverFrame,
  PopoverSurfaceGeometry,
  PopoverSurfaceRect,
} from './popoverSurfaceFrame';

/** Marks the static copy the dismissal plays on. */
export const POPOVER_EXIT_COPY_ATTRIBUTE = 'data-astryx-popover-exit';

/**
 * The curves from `from` to `to` on `spring`, its progress starting with
 * `velocity` (progress per second): each channel follows UIKit's path, the
 * scale along the axis as the product of scale and length.
 */
function surfaceCurves(
  from: SurfaceState,
  to: SurfaceState,
  axis: 'x' | 'y',
  spring: SpringDescription,
  velocity: number,
): Record<'scaleX' | 'scaleY' | 'opacity', MotionCurve> {
  const progress = solveSpring(toSpring(spring), {from: 0, to: 1, velocity});
  const duration = progress.settleTime(SETTLING_EPSILON);
  const end = {across: to.scale, along: to.scale * to.length};
  const state = (p: number): SurfaceState => ({
    scale: from.scale + (to.scale - from.scale) * p,
    length: from.length + (to.length - from.length) * p,
    opacity: from.opacity + (to.opacity - from.opacity) * p,
  });
  const scaleCurve = (along: boolean): MotionCurve => ({
    duration,
    at(t) {
      if (t >= duration) {
        return along ? end.along : end.across;
      }
      const s = state(progress.value(t));
      return along ? s.scale * s.length : s.scale;
    },
    velocity(t) {
      if (t >= duration) {
        return 0;
      }
      const s = state(progress.value(t));
      const dp = progress.velocity(t);
      const dScale = (to.scale - from.scale) * dp;
      if (!along) {
        return dScale;
      }
      return dScale * s.length + s.scale * (to.length - from.length) * dp;
    },
  });
  const opacity: MotionCurve = {
    duration,
    at: t => (t >= duration ? to.opacity : state(progress.value(t)).opacity),
    velocity: t =>
      t >= duration ? 0 : (to.opacity - from.opacity) * progress.velocity(t),
  };
  const across = scaleCurve(false);
  const along = scaleCurve(true);
  return {
    scaleX: axis === 'x' ? along : across,
    scaleY: axis === 'y' ? along : across,
    opacity,
  };
}

/** What `animator` shows now, split back into scale and length. */
function readState(animator: Animator, axis: 'x' | 'y'): SurfaceState {
  const across = animator.get(axis === 'x' ? 'scaleY' : 'scaleX');
  const along = animator.get(axis === 'x' ? 'scaleX' : 'scaleY');
  return {
    scale: across,
    length: across > 0 ? along / across : 1,
    opacity: animator.get('opacity'),
  };
}

/**
 * The progress velocity that continues `animator`'s motion toward a scale of
 * `target`: the scale's own velocity over the distance left.
 */
function progressVelocity(
  animator: Animator,
  axis: 'x' | 'y',
  from: SurfaceState,
  target: number,
): number {
  const distance = target - from.scale;
  if (Math.abs(distance) < 1e-6) {
    return 0;
  }
  return animator.getVelocity(axis === 'x' ? 'scaleY' : 'scaleX') / distance;
}

export interface PopoverSurfaceMotion {
  /**
   * The popover has just been shown in its touch presentation: grow it out
   * of its source, from the next animation frame, before it paints:
   * `measure` reads the geometry there, with the element invisible at its
   * full size.
   * During a dismissal, the popover grows back from where the dismissal has
   * it, about the same point, at once (it reads nothing).
   */
  enter(measure: () => PopoverSurfaceGeometry): void;
  /**
   * The popover is closing (its `beforetoggle` to closed, while it is still
   * shown): shrink it back into its source. Does nothing unless the last
   * presentation was a touch one.
   */
  exit(): void;
  /**
   * The popover opened in a presentation that does not use this motion:
   * leave the element exactly as the component styles it.
   */
  reset(): void;
  /** Cancels everything and restores the element. */
  dispose(): void;
}

const MOTION_STYLE_PROPERTIES = [
  'scale',
  'opacity',
  'transform-origin',
  'animation-name',
] as const;

export function createPopoverSurfaceMotion(
  element: HTMLElement,
  {
    requestFrame,
    cancelFrame,
    ...animatorOptions
  }: Pick<AnimatorOptions, 'now'> & {
    /** Schedules the presentation's read (default: the element's window's animation frame). */
    requestFrame?: (callback: () => void) => number;
    /** Cancels a read `requestFrame` scheduled. */
    cancelFrame?: (handle: number) => void;
  } = {},
): PopoverSurfaceMotion {
  // The popover's two springs are this component's measured values, not
  // motion roles (touch motion stays internal, spec:AST-094 DEC-11): they
  // play as given, so no table is registered and no other row is bundled.
  const animator = createAnimator(element, animatorOptions);
  const view = element.ownerDocument.defaultView;
  const scheduleFrame =
    requestFrame ??
    ((callback: () => void) =>
      typeof view?.requestAnimationFrame === 'function'
        ? view.requestAnimationFrame(() => callback())
        : (callback(), 0));
  const unscheduleFrame =
    cancelFrame ??
    ((handle: number) => {
      if (typeof view?.cancelAnimationFrame === 'function') {
        view.cancelAnimationFrame(handle);
      }
    });
  // The frame the presentation waits for to read its geometry.
  let pendingFrame: number | null = null;
  const cancelPending = () => {
    if (pendingFrame != null) {
      unscheduleFrame(pendingFrame);
      pendingFrame = null;
    }
  };
  // The presentation in progress or last played; null while the popover is
  // in a presentation this motion does not drive.
  let collapsed: PopoverCollapsedState | null = null;
  // The geometry the presentation measured, and whether its spring is still
  // running (the element's box then includes a scale only the curve knows).
  let measured: PopoverSurfaceGeometry | null = null;
  let presentHandle: MotionHandle | null = null;
  // The dismissal in progress: its copy and the copy's animator.
  let exiting: {copy: HTMLElement; animator: Animator} | null = null;
  // Releases the hold that takes every touch while the presentation runs.
  let holdRelease: (() => void) | null = null;

  const releaseHold = () => {
    holdRelease?.();
    holdRelease = null;
  };

  const endExit = () => {
    if (exiting == null) {
      return;
    }
    exiting.animator.dispose();
    exiting.copy.remove();
    exiting = null;
  };

  const reset = () => {
    cancelPending();
    collapsed = null;
    measured = null;
    presentHandle = null;
    releaseHold();
    endExit();
    animator.set({scaleX: 1, scaleY: 1, opacity: 1});
    for (const property of MOTION_STYLE_PROPERTIES) {
      element.style.removeProperty(property);
    }
  };

  const enter = (measure: () => PopoverSurfaceGeometry) => {
    cancelPending();
    // A dismissal let the element go (exit, below).
    animator.attach(element);
    let from: SurfaceState | null = null;
    let velocity = 0;
    if (exiting != null && collapsed != null) {
      // Presented again during the dismissal: continue from the frame on
      // screen, about the same point.
      from = readState(exiting.animator, collapsed.axis);
      velocity = progressVelocity(exiting.animator, collapsed.axis, from, 1);
    }
    endExit();
    if (from != null && measured != null) {
      present(from, velocity, measured);
      return;
    }
    // A fresh presentation writes and reads nothing until the next frame,
    // which runs before that frame paints: here, the element's style and
    // the boxes would lay the page out inside the task that opened the
    // popover. The layer's own CSS entrance, started meanwhile, is turned
    // off before anything paints.
    pendingFrame = scheduleFrame(() => {
      pendingFrame = null;
      // Full size and invisible for the read: the element's box must not
      // include a scale left over from the last dismissal, nor the first
      // keyframe of the layer's CSS entrance (which belongs to the pointer
      // presentation). Nothing paints before the curves below replace these.
      element.style.setProperty('animation-name', 'none');
      animator.set({scaleX: 1, scaleY: 1, opacity: 0});
      present(null, 0, measure());
    });
  };

  const present = (
    from: SurfaceState | null,
    velocity: number,
    geometry: PopoverSurfaceGeometry,
  ) => {
    const next =
      from != null && collapsed != null
        ? collapsed
        : popoverCollapsedState(geometry);
    collapsed = next;
    measured = geometry;
    // The layer's own CSS entrance belongs to the pointer presentation.
    element.style.setProperty('animation-name', 'none');
    element.style.setProperty(
      'transform-origin',
      `${next.originX}px ${next.originY}px`,
    );
    // Under Reduce Motion the animator lands the growth at once and fades
    // the opacity in (design:reduced-motion).
    const start = from ?? {scale: next.scale, length: next.length, opacity: 0};
    animator.set(frameOf(start, next.axis));
    const handle = animator.play(
      surfaceCurves(
        start,
        PRESENTED,
        next.axis,
        POPOVER_PRESENT_SPRING,
        velocity,
      ),
    );
    presentHandle = handle;
    // No touch reaches the page, or dismisses the popover, until it is in.
    releaseHold();
    holdRelease = holdInput(element, {until: handle, scope: 'viewport'});
    void handle.finished.then(() => {
      if (presentHandle === handle) {
        presentHandle = null;
        releaseHold();
      }
    });
  };

  const exit = () => {
    releaseHold();
    if (pendingFrame != null) {
      // Closed before the frame that would have presented it: nothing is on
      // screen to dismiss.
      reset();
      return;
    }
    const target = collapsed;
    if (target == null || exiting != null) {
      return;
    }
    const from = readState(animator, target.axis);
    const velocity = progressVelocity(
      animator,
      target.axis,
      from,
      target.scale,
    );
    presentHandle = null;
    // The copy stands where the surface is drawn, the presentation's frame
    // included (the layer runtime's shared exit copy, INV14).
    const copy = placeLayerExitCopy(element, POPOVER_EXIT_COPY_ATTRIBUTE);
    if (copy == null) {
      // No top layer for a copy: the close is immediate.
      animator.set({scaleX: 1, scaleY: 1, opacity: 1});
      return;
    }
    copy.style.setProperty(
      'transform-origin',
      `${target.originX}px ${target.originY}px`,
    );
    const closing = createAnimator(copy, animatorOptions);
    // Under Reduce Motion the copy fades out where it stands, then lands.
    closing.set(frameOf(from, target.axis));
    const handle = closing.play(
      surfaceCurves(
        from,
        {scale: target.scale, length: target.length, opacity: 0},
        target.axis,
        POPOVER_DISMISS_SPRING,
        velocity,
      ),
    );
    exiting = {copy, animator: closing};
    // The element itself is hidden by the browser now: leave it at rest with
    // no layer, and let go of the layer its presentation promoted in this
    // task. Kept, the promotion would end PROMOTION_LINGER_MS (500 ms) after
    // the element's last motion, a style write on an element that no longer
    // paints landing inside the dismissal (a Layout in its frames). The next
    // presentation attaches the element again.
    animator.set({scaleX: 1, scaleY: 1, opacity: 1}, {promote: false});
    animator.attach(null);
    void handle.finished.then(finished => {
      if (finished && exiting?.copy === copy) {
        endExit();
      }
    });
  };

  return {
    enter,
    exit,
    reset,
    dispose() {
      reset();
      animator.dispose();
    },
  };
}
