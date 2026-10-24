// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file popoverSurfaceMotion.ts
 * @input A Popover's layer element, the source it hangs off, the motion
 *   foundation (compositor animator, spring math), the UIKit table and the
 *   layer runtime's exit copy
 * @output Exports `popoverCollapsedState` (where the popover meets its source
 *   and the shape it grows from), `popoverFrame` (the transform and opacity
 *   at a progress of the spring), `POPOVER_EXIT_COPY_ATTRIBUTE`,
 *   `POPOVER_HOLD_ATTRIBUTE` and `createPopoverSurfaceMotion` (the touch
 *   presentation's present and dismiss)
 * @position Internal to Popover: in the iOS idiom the popover is presented
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
 * removed when the spring settles.
 *
 * Under Reduce Motion UIKit keeps the springs and drops the size and scale:
 * the animator's cross-fade on `springs.popoverPresent` fades the popover in
 * at its place, and on `springs.popoverDismiss` fades it out where it stands.
 *
 * UIKit ignores every touch while the popover is presented: a tap outside
 * 60 ms in neither dismisses it nor reaches what is under it, and the
 * presentation finishes. The browser's light dismiss cannot be cancelled from
 * an event, so for the length of the present spring a transparent manual
 * popover nested in the layer covers the viewport (`POPOVER_HOLD_ATTRIBUTE`):
 * in the top layer it is above everything, and as a descendant of the layer a
 * tap on it is a tap inside the popover, which the browser leaves open.
 *
 * SYNC: When modified, update:
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
import {popover, springs} from '../motion/uikit';
import {placeLayerExitCopy, type LayerExitBox} from '../Layer/layerExitCopy';

/** A box in viewport px. */
export type PopoverSurfaceRect = LayerExitBox;

/** Where the popover sits and what it hangs off, in viewport px. */
export interface PopoverSurfaceGeometry {
  /** The layer element's border box once positioned, at full size. */
  surface: PopoverSurfaceRect;
  /** The box of the source the popover is anchored to. */
  source: PopoverSurfaceRect;
}

/** Where the popover grows from, and the shape it starts as. */
export interface PopoverCollapsedState {
  /** Transform origin, px from the surface's top-left corner. */
  originX: number;
  originY: number;
  /**
   * The scale axis that also carries the length: the axis pointing away
   * from the source (`y` for a popover above or below it).
   */
  axis: 'x' | 'y';
  /** The uniform scale it grows from. */
  scale: number;
  /** The share of its own length along `axis` it grows from, at most 1. */
  length: number;
}

/** The transform and opacity of the surface. */
export interface PopoverFrame {
  scaleX: number;
  scaleY: number;
  opacity: number;
}

/** Marks the static copy the dismissal plays on. */
export const POPOVER_EXIT_COPY_ATTRIBUTE = 'data-astryx-popover-exit';

/** The attribute on the hold that takes every touch during a presentation. */
export const POPOVER_HOLD_ATTRIBUTE = 'data-astryx-popover-hold';

// The hold covers the viewport, transparent, and lets no touch start a pan.
const HOLD_STYLE: Readonly<Record<string, string>> = {
  position: 'fixed',
  inset: '0',
  width: 'auto',
  height: 'auto',
  'max-width': 'none',
  'max-height': 'none',
  margin: '0',
  padding: '0',
  border: '0',
  background: 'transparent',
  overflow: 'hidden',
  'touch-action': 'none',
};

/**
 * Places the hold in `layer` and shows it; null where the browser has no
 * popovers (the touch then reaches the page, as before).
 */
function placePresentationHold(layer: HTMLElement): HTMLElement | null {
  const hold = layer.ownerDocument.createElement('div');
  if (typeof hold.showPopover !== 'function') {
    return null;
  }
  hold.setAttribute(POPOVER_HOLD_ATTRIBUTE, '');
  hold.setAttribute('popover', 'manual');
  hold.setAttribute('aria-hidden', 'true');
  hold.setAttribute(
    'style',
    Object.entries(HOLD_STYLE)
      .map(([property, value]) => `${property}: ${value}`)
      .join('; '),
  );
  layer.append(hold);
  try {
    hold.showPopover();
  } catch {
    hold.remove();
    return null;
  }
  return hold;
}

function releasePresentationHold(hold: HTMLElement) {
  try {
    hold.hidePopover();
  } catch {
    // Already hidden with its layer.
  }
  hold.remove();
}

/** How far the edges may sit apart and still count as touching, px. */
const EDGE_TOLERANCE = 1;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

/**
 * Where the popover meets its source and the shape it grows from: the
 * middle of the source on the popover's edge facing it (the arrow's tip),
 * kept on that edge.
 */
export function popoverCollapsedState({
  surface,
  source,
}: PopoverSurfaceGeometry): PopoverCollapsedState {
  const gaps = {
    below: surface.top - (source.top + source.height),
    above: source.top - (surface.top + surface.height),
    right: surface.left - (source.left + source.width),
    left: source.left - (surface.left + surface.width),
  };
  // The side with the widest gap is the one the popover was placed on; a
  // popover that overlaps its source grows from below, as the default.
  let side: keyof typeof gaps = 'below';
  for (const candidate of ['above', 'right', 'left'] as const) {
    if (gaps[candidate] > gaps[side]) {
      side = candidate;
    }
  }
  if (gaps[side] < -EDGE_TOLERANCE) {
    side = 'below';
  }
  const centerX = clamp(
    source.left + source.width / 2 - surface.left,
    0,
    surface.width,
  );
  const centerY = clamp(
    source.top + source.height / 2 - surface.top,
    0,
    surface.height,
  );
  const vertical = side === 'below' || side === 'above';
  const fullLength = vertical ? surface.height : surface.width;
  return {
    originX: vertical ? centerX : side === 'right' ? 0 : surface.width,
    originY: vertical ? (side === 'below' ? 0 : surface.height) : centerY,
    axis: vertical ? 'y' : 'x',
    scale: popover.collapsedScale,
    length:
      fullLength > 0 ? Math.min(1, popover.collapsedLengthPx / fullLength) : 1,
  };
}

interface SurfaceState {
  /** Uniform scale. */
  scale: number;
  /** Share of the full length along the axis. */
  length: number;
  opacity: number;
}

const PRESENTED: SurfaceState = {scale: 1, length: 1, opacity: 1};

function frameOf(state: SurfaceState, axis: 'x' | 'y'): PopoverFrame {
  const along = state.scale * state.length;
  return {
    scaleX: axis === 'x' ? along : state.scale,
    scaleY: axis === 'y' ? along : state.scale,
    opacity: state.opacity,
  };
}

/**
 * The surface at progress `p` of the present spring (past 1 is the
 * spring's overshoot): what UIKit's popover view shows at that moment.
 */
export function popoverFrame(
  state: PopoverCollapsedState,
  p: number,
): PopoverFrame {
  return frameOf(
    {
      scale: state.scale + (1 - state.scale) * p,
      length: state.length + (1 - state.length) * p,
      opacity: p,
    },
    state.axis,
  );
}

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

function defaultPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function createPopoverSurfaceMotion(
  element: HTMLElement,
  options: Pick<AnimatorOptions, 'now' | 'prefersReducedMotion'> = {},
): PopoverSurfaceMotion {
  const prefersReducedMotion =
    options.prefersReducedMotion ?? defaultPrefersReducedMotion;
  const animator = createAnimator(element, {
    now: options.now,
    prefersReducedMotion,
  });
  // The presentation in progress or last played; null while the popover is
  // in a presentation this motion does not drive.
  let collapsed: PopoverCollapsedState | null = null;
  // The geometry the presentation measured, and whether its spring is still
  // running (the element's box then includes a scale only the curve knows).
  let measured: PopoverSurfaceGeometry | null = null;
  let presentHandle: MotionHandle | null = null;
  // The dismissal in progress: its copy and the copy's animator.
  let exiting: {copy: HTMLElement; animator: Animator} | null = null;
  // The hold that takes every touch while the presentation runs.
  let hold: HTMLElement | null = null;

  const releaseHold = () => {
    if (hold != null) {
      releasePresentationHold(hold);
      hold = null;
    }
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
      {crossfade: springs.popoverPresent},
    );
    presentHandle = handle;
    // No touch reaches the page, or dismisses the popover, until it is in.
    releaseHold();
    hold = placePresentationHold(element);
    void handle.finished.then(() => {
      if (presentHandle === handle) {
        presentHandle = null;
        releaseHold();
      }
    });
  };

  const exit = () => {
    releaseHold();
    const target = collapsed;
    if (target == null || exiting != null) {
      return;
    }
    // The surface at full size where it stands: the presentation's own
    // measurement while its spring runs, the element's box once settled.
    let box: PopoverSurfaceRect;
    if (presentHandle != null && measured != null) {
      box = measured.surface;
    } else {
      const rect = element.getBoundingClientRect();
      box = {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
    const from = readState(animator, target.axis);
    const velocity = progressVelocity(
      animator,
      target.axis,
      from,
      target.scale,
    );
    presentHandle = null;
    const copy = placeLayerExitCopy(element, box, POPOVER_EXIT_COPY_ATTRIBUTE);
    copy.style.setProperty(
      'transform-origin',
      `${target.originX}px ${target.originY}px`,
    );
    const closing = createAnimator(copy, {
      now: options.now,
      prefersReducedMotion,
    });
    closing.set(frameOf(from, target.axis));
    const handle = closing.play(
      surfaceCurves(
        from,
        {scale: target.scale, length: target.length, opacity: 0},
        target.axis,
        springs.popoverDismiss,
        velocity,
      ),
      {crossfade: springs.popoverDismiss},
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
