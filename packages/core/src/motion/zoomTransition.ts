// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomTransition.ts
 * @input Rects (a source cell and a detail's resting box) and UIKit's zoom
 *   transition constants (uikit/zoomMedia.ts `transition`)
 * @output Exports the geometry and the curves of UIKit's zoom transition
 *   (iOS 18 `.zoom`): where the detail starts on its source, both portals'
 *   frames and opacities at a progress, the progress springs that open and
 *   close it, and MotionCurves for `Animator.play` on elements at rest in
 *   their boxes
 * @position Pure math under the motion animator; read by Lightbox's viewer
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
 * progress per second (`zoomReleaseVelocity` converts a finger's px/s).
 *
 * Known gaps: UIKit's portals report no corner radius while the cell has
 * one (8 pt in the lab); where the rounding lives is not found yet. With no
 * source (gone, or off screen) the detail shrinks to `NO_SOURCE_SCALE` about
 * its centre and fades out (GUESS; @measure M-ZT3). The interactive
 * dismissal's release rule and its velocity mapping are GUESSes too
 * (`zoomShouldDismiss`, `zoomReleaseVelocity`; @measure M-ZT1, M-ZT2).
 *
 * Reduce Motion: a presentation's zoom becomes a cross-fade on the
 * transition's own spring (`ZOOM_REDUCED_MOTION`): the detail as an
 * entrance, the source as an exit; a finger-driven drag still tracks 1:1.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/zoomTransition.test.ts
 * - /packages/core/src/motion/README.md
 */

import type {MotionCurve} from './animator';
import {solveSpring, toSpring, type SpringDescription} from './spring';
import {zoomMedia} from './uikit/zoomMedia';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Where the portals are anchored: their tops, or their centres. */
export type ZoomAlign = 'center' | 'top';

export interface ZoomGeometry {
  /** The source's box (the cell); null when it is gone or off screen. */
  source: Rect | null;
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
 * With no source, the detail shrinks to this fraction of its size about its
 * centre while it fades (GUESS; @measure M-ZT3).
 */
export const NO_SOURCE_SCALE = 0.5;

function standInSource(detail: Rect): Rect {
  const width = detail.width * NO_SOURCE_SCALE;
  const height = detail.height * NO_SOURCE_SCALE;
  return {
    x: detail.x + (detail.width - width) / 2,
    y: detail.y + (detail.height - height) / 2,
    width,
    height,
  };
}

/**
 * Both portals at progress `p`: 0 on the source, 1 at the detail's rest
 * (beyond either end on a spring's undershoot). With no source the detail
 * shrinks toward its own centre and fades out entirely.
 */
export function zoomFramesAt(
  p: number,
  {source: given, detail, align = 'center'}: ZoomGeometry,
): ZoomFrames {
  const source = given ?? standInSource(detail);
  const detailAspect = detail.height / detail.width;
  const sourceAspect = source.height / source.width;
  const start = zoomStartRect(source, detailAspect, align);
  const lerp = (a: number, b: number) => a + (b - a) * p;
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
    detailOpacity: given == null ? clamp01(p) : clamp01(detailFadeGain * p),
    sourceOpacity: given == null ? 0 : clamp01(sourceFadeGain * (1 - p)),
  };
}

/** Where a progress curve settles: within 0.1 % of the whole move. */
const SETTLE_THRESHOLD = 1e-3;

/**
 * A progress spring toward 1 (opening) or 0 (closing), from `from` with
 * `velocity` (progress per second, see `zoomReleaseVelocity`): an
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

/** The opening's progress (frame and fades). */
export function zoomOpenProgress(options?: {
  from?: number;
  velocity?: number;
}): MotionCurve {
  return zoomProgress(zoomMedia.transition.openSpring, 1, options);
}

/** The closing's progress: the frame's (undershooting) and the fades'. */
export function zoomCloseProgress(options?: {
  from?: number;
  velocity?: number;
}): {frame: MotionCurve; fade: MotionCurve} {
  return {
    frame: zoomProgress(zoomMedia.transition.closeSpring, 0, options),
    fade: zoomProgress(zoomMedia.transition.closeFadeSpring, 0, options),
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
 * The dragged detail during an interactive dismissal, from the drag's
 * translation past its begin threshold: its centre follows the finger and it
 * shrinks about it by `zoomMedia.transition.dragScalePerPoint` per pt of
 * downward travel. UIKit eases the frame onto this target through
 * `dragFollowSpring` (about a frame behind). The source stays hidden.
 */
export function zoomDragFrame(
  translation: {x: number; y: number},
  detail: Rect,
): {detail: Rect; detailOpacity: number; sourceOpacity: number} {
  const scale = Math.max(
    0,
    1 - zoomMedia.transition.dragScalePerPoint * Math.max(0, translation.y),
  );
  const width = detail.width * scale;
  const height = detail.height * scale;
  return {
    detail: {
      x: detail.x + translation.x + (detail.width - width) / 2,
      y: detail.y + translation.y + (detail.height - height) / 2,
      width,
      height,
    },
    detailOpacity: 1,
    sourceOpacity: 0,
  };
}

/**
 * Whether a released interactive dismissal zooms back into the source:
 * unless the finger was moving up or came back within
 * `zoomMedia.dismiss.cancelTravel` of where it started (Photos' measured
 * rule, as a GUESS for the zoom transition; @measure M-ZT1).
 */
export function zoomShouldDismiss(
  translation: {x: number; y: number},
  velocity: {x: number; y: number},
): boolean {
  return velocity.y >= 0 && translation.y > zoomMedia.dismiss.cancelTravel;
}

/**
 * A finger's velocity (px/s) at the release of an interactive dismissal as
 * the closing progress's velocity (progress per second): its component
 * toward the source's centre over the distance left to it, negative as the
 * progress falls toward 0 (GUESS; @measure M-ZT2).
 */
export function zoomReleaseVelocity(
  velocity: {x: number; y: number},
  released: Rect,
  source: Rect | null,
): number {
  if (source == null) {
    return 0;
  }
  const dx = source.x + source.width / 2 - (released.x + released.width / 2);
  const dy = source.y + source.height / 2 - (released.y + released.height / 2);
  const distance = Math.hypot(dx, dy);
  if (distance < 1) {
    return 0;
  }
  return -((velocity.x * dx + velocity.y * dy) / distance) / distance;
}

/**
 * Reduce Motion: the zoom becomes a cross-fade on the transition's own
 * spring, the detail as an entrance and the source as an exit (AnimateOptions
 * for `Animator.play` / `animate`).
 */
export const ZOOM_REDUCED_MOTION = {
  detail: {
    reducedMotion: 'crossfade',
    crossfade: zoomMedia.transition.openSpring,
    crossfadeAs: 'entrance',
  },
  source: {
    reducedMotion: 'crossfade',
    crossfade: zoomMedia.transition.openSpring,
    crossfadeAs: 'exit',
  },
} as const;
