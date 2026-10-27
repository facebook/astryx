// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomTransition.ts
 * @input Rects (a source cell and a detail's resting box) and UIKit's zoom
 *   transition constants (uikit/zoomMedia.ts `transition`)
 * @output Exports the geometry and the curves of UIKit's zoom transition
 *   (iOS 18 `.zoom`): where the detail starts on its source, both portals'
 *   frames and opacities at a progress, the progress springs that open and
 *   close it, MotionCurves for `Animator.play` on elements at rest in
 *   their boxes, and each portal as a path for the shared rect morph
 *   (`zoomPath`)
 * @position Pure math for Lightbox's zoom transition, played by
 *   and by navigation's zoom push
 *
 * UIKit runs the transition on two portals in the transition container:
 * one shows the source (a cell), one the detail. They share an anchor and a
 * width; each keeps its own aspect. The detail starts at the source's width
 * and grows to its own resting box while the source grows with it; the
 * detail fades in and the source fades out, both as gains on the same
 * progress. One spring drives the progress: critically damped to open, a
 * 0.92 damping ratio for the closing frame (its small undershoot into the
 * cell), critically damped for the closing fades.
 *
 * The anchor: UIKit's full-screen detail starts top-aligned with its source
 * (`'top'`); a photo starts centred on its thumbnail (`'center'`), where an
 * aspect-fill cell shows the photo's middle.
 *
 * Progress is 0 on the source and 1 at the detail's rest; its velocity is in
 * progress per second.
 *
 * Known gap: UIKit's portals report no corner radius while the cell has
 * one (8 pt in the lab); where the rounding lives is not found yet. Without
 * a source the viewer opens and closes plainly (zoomFromSource.ts).
 *
 * Reduce Motion: the animator's default applies (design:reduced-motion);
 * the detail plays as an entrance or an exit, and a finger-driven drag
 * still tracks 1:1.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Lightbox/zoomTransition.test.ts
 */

import type {MotionCurve} from '../motion/animator';
import type {MorphPath} from '../motion/rectMorph';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';
import {zoomMedia} from '../motion/uikit/zoomMedia';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where the portals are anchored: their tops, or their centres. */
export type ZoomAlign = 'center' | 'top';

export interface ZoomGeometry {
  /** The source's box (the cell). */
  source: Rect;
  /** The detail's resting box. */
  detail: Rect;
  /** @default 'center' */
  align?: ZoomAlign;
}

export interface ZoomFrames {
  detail: Rect;
  source: Rect;
  detailOpacity: number;
  sourceOpacity: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function anchorOf(rect: Rect, align: ZoomAlign): number {
  return align === 'top' ? rect.y : rect.y + rect.height / 2;
}

/** The detail's first frame: the source's width, its own aspect. */
export function zoomStartRect(
  source: Rect,
  detailAspect: number,
  align: ZoomAlign = 'center',
): Rect {
  const height = source.width * detailAspect;
  return {
    x: source.x,
    y: align === 'top' ? source.y : anchorOf(source, 'center') - height / 2,
    width: source.width,
    height,
  };
}

/**
 * Both portals at progress `p`: 0 on the source, 1 at the detail's rest
 * (beyond either end on a spring's undershoot).
 */
export function zoomFramesAt(
  p: number,
  {source, detail, align = 'center'}: ZoomGeometry,
): ZoomFrames {
  const detailAspect = detail.height / detail.width;
  const sourceAspect = source.height / source.width;
  const start = zoomStartRect(source, detailAspect, align);
  // Exact at both ends, so a portal at its own box shows no transform.
  const lerp = (a: number, b: number) =>
    p === 0 ? a : p === 1 ? b : a + (b - a) * p;
  const width = lerp(start.width, detail.width);
  const x = lerp(start.x, detail.x);
  const anchor = lerp(anchorOf(start, align), anchorOf(detail, align));
  const place = (height: number): Rect => ({
    x,
    y: align === 'top' ? anchor : anchor - height / 2,
    width,
    height,
  });
  const {detailFadeGain, sourceFadeGain} = zoomMedia.transition;
  return {
    detail: place(width * detailAspect),
    source: place(width * sourceAspect),
    detailOpacity: clamp01(detailFadeGain * p),
    sourceOpacity: clamp01(sourceFadeGain * (1 - p)),
  };
}

/** Where a progress curve settles: within 0.1 % of the whole move. */
const SETTLE_THRESHOLD = 1e-3;

/**
 * A progress spring toward 1 (opening) or 0 (closing), from `from` with
 * `velocity` (progress per second): an
 * interrupted transition continues from where it shows, as UIKit's does.
 */
export function zoomProgress(
  spring: SpringDescription,
  to: 0 | 1,
  {
    from = to === 1 ? 0 : 1,
    velocity = 0,
  }: {from?: number; velocity?: number} = {},
): MotionCurve {
  const curve = solveSpring(toSpring(spring), {from, to, velocity});
  const duration = curve.settleTime(SETTLE_THRESHOLD);
  return {
    duration,
    at: t => (t >= duration ? to : curve.value(t)),
    velocity: t => (t >= duration ? 0 : curve.velocity(t)),
  };
}

/**
 * The opening's progress (frame and fades), on `spring`: the viewer's
 * theme value for `zoomMedia.transition.openSpring` (read with
 * `resolveMotion`), the table's by default.
 */
export function zoomOpenProgress({
  spring = zoomMedia.transition.openSpring,
  ...from
}: {
  from?: number;
  velocity?: number;
  spring?: SpringDescription;
} = {}): MotionCurve {
  return zoomProgress(spring, 1, from);
}

/**
 * The closing's progress: the frame's (undershooting, on `spring`) and the
 * fades' (on `fadeSpring`), each the viewer's theme value for its
 * `zoomMedia.transition` role, the table's by default.
 */
export function zoomCloseProgress({
  spring = zoomMedia.transition.closeSpring,
  fadeSpring = zoomMedia.transition.closeFadeSpring,
  ...from
}: {
  from?: number;
  velocity?: number;
  spring?: SpringDescription;
  fadeSpring?: SpringDescription;
} = {}): {frame: MotionCurve; fade: MotionCurve} {
  return {
    frame: zoomProgress(spring, 0, from),
    fade: zoomProgress(fadeSpring, 0, from),
  };
}

/** A curve of f(progress(t)), its velocity by the chain rule. */
function mapCurve(
  progress: MotionCurve,
  f: (p: number) => number,
): MotionCurve {
  const h = 1e-4;
  return {
    duration: progress.duration,
    at: t => f(progress.at(t)),
    velocity: t => {
      const p = progress.at(t);
      return ((f(p + h) - f(p - h)) / (2 * h)) * progress.velocity(t);
    },
  };
}

export interface ZoomElementCurves {
  x: MotionCurve;
  y: MotionCurve;
  scale: MotionCurve;
  opacity: MotionCurve;
}

/**
 * Curves for `Animator.play` that put an element at rest in `box` (its
 * transform relative to that box, `transform-origin: 0 0`, uniform scale)
 * on a portal's frame and opacity: the detail's (`portal: 'detail'`) or the
 * source's. `frame` drives the geometry and `fade` the opacity; they are the
 * same curve when opening.
 */
export function zoomElementCurves(
  geometry: ZoomGeometry,
  box: Rect,
  portal: 'detail' | 'source',
  frame: MotionCurve,
  fade: MotionCurve = frame,
): ZoomElementCurves {
  const rectAt = (p: number) => zoomFramesAt(p, geometry)[portal];
  return {
    x: mapCurve(frame, p => rectAt(p).x - box.x),
    y: mapCurve(frame, p => rectAt(p).y - box.y),
    scale: mapCurve(frame, p => rectAt(p).width / box.width),
    opacity: mapCurve(fade, p => {
      const frames = zoomFramesAt(p, geometry);
      return portal === 'detail' ? frames.detailOpacity : frames.sourceOpacity;
    }),
  };
}

/**
 * A portal as a path for the shared rect morph (motion/rectMorph.ts,
 * architecture:layer-runtime INV15): the detail laid out in its resting box,
 * or the source's copy laid out on the source (`box`), each scaled uniformly
 * (each keeps its aspect), on the frames and gains above. An interrupted
 * motion continues in a straight line from the rect on screen to the end it
 * heads for, its opacity on the same gains from where it stood: a closing
 * photo fades out only near its source, and an opening turned around never
 * brightens again.
 */
export function zoomPath(
  geometry: ZoomGeometry,
  portal: 'detail' | 'source',
  box: Rect,
): MorphPath {
  const rectAt = (p: number) => zoomFramesAt(p, geometry)[portal];
  const opacityAt = (p: number) => {
    const frames = zoomFramesAt(p, geometry);
    return portal === 'detail' ? frames.detailOpacity : frames.sourceOpacity;
  };
  const first = rectAt(0);
  const last = rectAt(1);
  return {
    box,
    scale: 'uniform',
    rectAt,
    opacityAt,
    restartFrom(rect, opacity, end) {
      // Where the rect on screen stands on the path: the width moves with
      // the progress.
      const at =
        last.width !== first.width
          ? (rect.width - first.width) / (last.width - first.width)
          : end === 'rest'
            ? 0
            : 1;
      const goal = end === 'rest' ? 1 : 0;
      const target = rectAt(goal);
      // A fade on a spring of its own can lag the frame: what it shows now
      // joins the gains by the end.
      const lag = opacity - opacityAt(at);
      const lerp = (a: number, b: number, q: number) =>
        q === 0 ? a : q === 1 ? b : a + (b - a) * q;
      return {
        box,
        scale: 'uniform',
        rectAt: q => ({
          x: lerp(rect.x, target.x, q),
          y: lerp(rect.y, target.y, q),
          width: lerp(rect.width, target.width, q),
          height: lerp(rect.height, target.height, q),
        }),
        opacityAt: q =>
          clamp01(opacityAt(at + (goal - at) * q) + lag * (1 - q)),
      };
    },
  };
}
