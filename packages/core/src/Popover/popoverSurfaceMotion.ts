// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file popoverSurfaceMotion.ts
 * @input A Popover's layer element, the source it hangs off, the motion
 *   foundation (compositor animator, spring math), the UIKit table and the
 *   layer runtime's exit copy
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
 * `springs.popoverPresent`, with the edge that meets the source held in
 * place. The dismissal runs the same path back into that point on
 * `springs.popoverDismiss`.
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
import {registerSpringsTable, springs} from '../motion/uikit/springs';
import {placeLayerExitCopy} from '../Layer/layerExitCopy';
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
   * of its source. `measure` reads the geometry; it runs with the element at
   * its full size. During a dismissal, the popover grows back from where the
   * dismissal has it, about the same point.
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
  options: Pick<AnimatorOptions, 'now'> = {},
): PopoverSurfaceMotion {
  // The table registers once, before the first animation (nothing runs on
  // import). The popover's two springs are not among the roles it
  // registers: they are this component's measured values, so there is
  // nothing to resolve them against. Making them roles is the motion
  // table's call, and no theme writes a role variable on this base anyway.
  registerSpringsTable();
  const animator = createAnimator(element, options);
  // The presentation in progress or last played; null while the popover is
  // in a presentation this motion does not drive.
  let collapsed: PopoverCollapsedState | null = null;
  // The geometry the presentation measured, and whether its spring is still
  // running (the element's box then includes a scale only the curve knows).
  let measured: PopoverSurfaceGeometry | null = null;
  let presentHandle: MotionHandle | null = null;
  // The dismissal in progress: its copy and the copy's animator.
  let exiting: {copy: HTMLElement; animator: Animator} | null = null;

  const endExit = () => {
    if (exiting == null) {
      return;
    }
    exiting.animator.dispose();
    exiting.copy.remove();
    exiting = null;
  };

  const reset = () => {
    collapsed = null;
    measured = null;
    presentHandle = null;
    endExit();
    animator.set({scaleX: 1, scaleY: 1, opacity: 1});
    for (const property of MOTION_STYLE_PROPERTIES) {
      element.style.removeProperty(property);
    }
  };

  const enter = (measure: () => PopoverSurfaceGeometry) => {
    let from: SurfaceState | null = null;
    let velocity = 0;
    if (exiting != null && collapsed != null) {
      // Presented again during the dismissal: continue from the frame on
      // screen, about the same point.
      from = readState(exiting.animator, collapsed.axis);
      velocity = progressVelocity(exiting.animator, collapsed.axis, from, 1);
    }
    endExit();
    if (from == null) {
      // Full size and invisible for the read: the element's box must not
      // include a scale left over from the last dismissal, nor the first
      // keyframe of the layer's CSS entrance (which belongs to the pointer
      // presentation). Nothing paints before the curves below replace these.
      element.style.setProperty('animation-name', 'none');
      animator.set({scaleX: 1, scaleY: 1, opacity: 0});
    }
    const geometry = from != null && measured != null ? measured : measure();
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
        springs.popoverPresent,
        velocity,
      ),
    );
    presentHandle = handle;
    void handle.finished.then(() => {
      if (presentHandle === handle) {
        presentHandle = null;
      }
    });
  };

  const exit = () => {
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
    // included (the layer runtime's exit copy, INV13).
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
    const closing = createAnimator(copy, options);
    // Under Reduce Motion the copy fades out where it stands, then lands.
    closing.set(frameOf(from, target.axis));
    const handle = closing.play(
      surfaceCurves(
        from,
        {scale: target.scale, length: target.length, opacity: 0},
        target.axis,
        springs.popoverDismiss,
        velocity,
      ),
    );
    exiting = {copy, animator: closing};
    // The element itself is hidden by the browser now; leave it at rest.
    animator.set({scaleX: 1, scaleY: 1, opacity: 1});
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
