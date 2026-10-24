// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file zoomStage.ts
 * @input The stage's size, the photo's fitted box and its pixel size, a
 *   transform (offset from the fitted box and scale), finger positions
 * @output Exports the zoom stage's pure geometry: zoom limits, the resting
 *   place for a scale (centred where the photo is smaller than the stage,
 *   kept inside it where larger), the rubber band of a drag, the overshoot
 *   of a pinch past a limit, the transform that keeps a point under the
 *   fingers, the eased settle curves (UIScrollView's zoom animation), and
 *   the chrome's fade and the black behind the photo as a tap hides it
 * @position Pure math under useZoomStage (Lightbox's touch zoom); no DOM, no
 *   React
 *
 * The model is a zooming UIScrollView in a photo viewer. The photo's box at
 * the fitted size (scale 1, laid out by CSS) is `fit`, in the stage's
 * coordinates. A transform `{x, y, scale}` scales the box about its top-left
 * corner and moves it by (x, y): a photo point at (u, v) in the fitted box
 * shows at (fit.x + x + u·scale, fit.y + y + v·scale). On an axis where the
 * scaled photo is smaller than the stage it rests centred (WWDC 2010 session
 * 104's recentring, which every UIKit photo viewer uses); where it is larger
 * it rests with no gap at either edge. All constants come from
 * motion/uikit/zoomMedia.ts and motion/uikit/scroll.ts.
 *
 * SYNC: When modified, update zoomStage.test.ts and useZoomStage.ts.
 */

import {cubicBezier} from '../motion/bezier';
import {rubberBandClamp, rubberBandUnclamp} from '../motion/rubberBand';
import {zoomMedia} from '../motion/uikit/zoomMedia';
import type {MotionCurve} from '../motion/animator';

export interface StagePoint {
  readonly x: number;
  readonly y: number;
}

export interface ZoomTransform {
  /** Offset of the photo's box from its fitted place, px. */
  readonly x: number;
  readonly y: number;
  /** Scale relative to the fitted size. */
  readonly scale: number;
}

export interface ZoomGeometry {
  /** The stage's size, px. */
  readonly width: number;
  readonly height: number;
  /** The photo's box at the fitted size, in stage coordinates. */
  readonly fit: {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
  };
  readonly minScale: number;
  readonly maxScale: number;
  /** The zoom a double tap goes to from the fitted size. */
  readonly doubleTapScale: number;
}

export const IDENTITY: ZoomTransform = {x: 0, y: 0, scale: 1};

/** Within this of the fitted size the photo counts as not zoomed. */
export const ZOOMED_EPSILON = 0.001;

/**
 * The zoom a double tap goes to from the fitted size, for a stage of
 * `width` × `height` and a photo fitted at `fitWidth` × `fitHeight`:
 * Photos' aspect fill (`zoomMedia.viewer.doubleTapZoom`), or
 * `filledDoubleTapScale` when the photo already fills the stage.
 */
export function doubleTapScaleFor(
  width: number,
  height: number,
  fitWidth: number,
  fitHeight: number,
): number {
  const {filledDoubleTapScale} = zoomMedia.viewer;
  if (!(fitWidth > 0) || !(fitHeight > 0)) {
    return filledDoubleTapScale;
  }
  const fill = Math.max(width / fitWidth, height / fitHeight);
  return fill > 1 + ZOOMED_EPSILON ? fill : filledDoubleTapScale;
}

/**
 * The largest zoom for a photo of `naturalWidth` image pixels fitted at
 * `fitWidth` CSS px on a screen of `devicePixelRatio`: Photos' multiple of
 * the zoom that shows one image pixel per device pixel, and never less than
 * `doubleTapScale` (a double tap always lands inside the limits).
 */
export function maxScaleFor(
  naturalWidth: number,
  fitWidth: number,
  devicePixelRatio: number,
  doubleTapScale: number,
): number {
  const {maxPixelZoomMultiple} = zoomMedia.viewer;
  if (!(fitWidth > 0) || !(naturalWidth > 0) || !(devicePixelRatio > 0)) {
    return doubleTapScale;
  }
  const pixelScale = naturalWidth / (fitWidth * devicePixelRatio);
  return Math.max(doubleTapScale, maxPixelZoomMultiple * pixelScale);
}

/** Whether `transform` shows the photo larger than fitted. */
export function isZoomed(
  geometry: ZoomGeometry,
  transform: ZoomTransform,
): boolean {
  return transform.scale > geometry.minScale + ZOOMED_EPSILON;
}

interface AxisRange {
  readonly min: number;
  readonly max: number;
}

function axisRange(
  stageSize: number,
  fitStart: number,
  fitSize: number,
  scale: number,
): AxisRange {
  const size = fitSize * scale;
  if (size <= stageSize) {
    const centred = (stageSize - size) / 2 - fitStart;
    return {min: centred, max: centred};
  }
  // `0 - fitStart`, not `-fitStart`: no negative zero in the style.
  return {min: stageSize - size - fitStart, max: 0 - fitStart};
}

/** Where the photo may rest at `scale`: the offset range on each axis. */
export function restRange(
  geometry: ZoomGeometry,
  scale: number,
): {readonly x: AxisRange; readonly y: AxisRange} {
  const {fit} = geometry;
  return {
    x: axisRange(geometry.width, fit.x, fit.width, scale),
    y: axisRange(geometry.height, fit.y, fit.height, scale),
  };
}

/** The resting transform nearest to `transform`, at its scale. */
export function restingTransform(
  geometry: ZoomGeometry,
  transform: ZoomTransform,
): ZoomTransform {
  const range = restRange(geometry, transform.scale);
  return {
    x: Math.min(range.x.max, Math.max(range.x.min, transform.x)),
    y: Math.min(range.y.max, Math.max(range.y.min, transform.y)),
    scale: transform.scale,
  };
}

/**
 * The scale a pinch shows for its own scale `scale`: 1:1 inside the
 * limits, giving way past them (`zoomMedia.overshoot.limitFactor`).
 */
export function overshootScale(geometry: ZoomGeometry, scale: number): number {
  const f = zoomMedia.overshoot.limitFactor;
  const {minScale: m, maxScale: M} = geometry;
  if (scale > M) {
    return M * (f - ((f - 1) * M) / scale);
  }
  if (scale < m) {
    return m / (f - ((f - 1) * scale) / m);
  }
  return scale;
}

/**
 * The pinch's own scale that shows `shown`: the inverse of
 * `overshootScale`, to continue a pinch from a photo already past a limit.
 */
export function pinchScaleFor(geometry: ZoomGeometry, shown: number): number {
  const f = zoomMedia.overshoot.limitFactor;
  const {minScale: m, maxScale: M} = geometry;
  if (shown > M) {
    // shown = M·(f − (f − 1)·M ÷ s)  ⇒  s = (f − 1)·M² ÷ (f·M − shown)
    const gap = f * M - shown;
    return gap > 0 ? ((f - 1) * M * M) / gap : Number.POSITIVE_INFINITY;
  }
  if (shown < m) {
    // shown = m ÷ (f − (f − 1)·s ÷ m)  ⇒  s = (f − m ÷ shown)·m ÷ (f − 1)
    return Math.max(0, ((f - m / shown) * m) / (f - 1));
  }
  return shown;
}

/**
 * The transform at `scale` that shows the photo point under `anchor` (as
 * placed by `from`) under `point`: a pinch keeps the point under its first
 * centroid under the current centroid; a double tap brings the tapped point
 * to the stage's centre; a settle past a limit keeps the point under the last
 * centroid (`point` = `anchor`).
 */
export function transformKeepingPoint(
  geometry: ZoomGeometry,
  from: ZoomTransform,
  anchor: StagePoint,
  point: StagePoint,
  scale: number,
): ZoomTransform {
  const {fit} = geometry;
  // The fitted-box point under `anchor`.
  const u = (anchor.x - fit.x - from.x) / from.scale;
  const v = (anchor.y - fit.y - from.y) / from.scale;
  return {
    x: point.x - fit.x - u * scale,
    y: point.y - fit.y - v * scale,
    scale,
  };
}

/**
 * Where a drag shows the photo: `raw` is where the finger's travel would put
 * it with no edges. Past an edge it gives way with UIScrollView's rubber
 * band over the stage's size on that axis; on an axis where the photo is
 * smaller than the stage it stays centred (a scroll view that does not
 * bounce when its content fits).
 */
export function draggedTransform(
  geometry: ZoomGeometry,
  raw: ZoomTransform,
): ZoomTransform {
  const range = restRange(geometry, raw.scale);
  return {
    x:
      range.x.min === range.x.max
        ? range.x.min
        : rubberBandClamp(raw.x, range.x.min, range.x.max, geometry.width),
    y:
      range.y.min === range.y.max
        ? range.y.min
        : rubberBandClamp(raw.y, range.y.min, range.y.max, geometry.height),
    scale: raw.scale,
  };
}

/** The finger-travel position behind a shown one: `draggedTransform` undone. */
export function rawForDragged(
  geometry: ZoomGeometry,
  shown: ZoomTransform,
): ZoomTransform {
  const range = restRange(geometry, shown.scale);
  return {
    x:
      range.x.min === range.x.max
        ? shown.x
        : rubberBandUnclamp(shown.x, range.x.min, range.x.max, geometry.width),
    y:
      range.y.min === range.y.max
        ? shown.y
        : rubberBandUnclamp(shown.y, range.y.min, range.y.max, geometry.height),
    scale: shown.scale,
  };
}

/**
 * The resting transform a double tap at `point` goes to from `from`, as in
 * Photos: from the fitted size, `geometry.doubleTapScale` with the tapped
 * photo point brought to the stage's centre and kept inside the stage (a
 * tap near an edge stops at that edge); when zoomed, back to the fitted
 * size.
 */
export function doubleTapTarget(
  geometry: ZoomGeometry,
  from: ZoomTransform,
  point: StagePoint,
): ZoomTransform {
  if (isZoomed(geometry, from)) {
    return restingTransform(geometry, {...IDENTITY, scale: geometry.minScale});
  }
  const scale = Math.min(
    geometry.maxScale,
    Math.max(geometry.minScale, geometry.doubleTapScale),
  );
  const centre = {x: geometry.width / 2, y: geometry.height / 2};
  return restingTransform(
    geometry,
    transformKeepingPoint(geometry, from, point, centre, scale),
  );
}

/**
 * The resting transform a release goes to: inside the limits, `shown`
 * itself (a drag's coast settles any edge); past a limit, the limit, with
 * the point under the last centroid kept where it is, then kept inside the
 * stage.
 */
export function releaseTarget(
  geometry: ZoomGeometry,
  shown: ZoomTransform,
  centroid: StagePoint,
): ZoomTransform {
  const limit = Math.min(
    geometry.maxScale,
    Math.max(geometry.minScale, shown.scale),
  );
  if (limit === shown.scale) {
    return shown;
  }
  return restingTransform(
    geometry,
    transformKeepingPoint(geometry, shown, centroid, centroid, limit),
  );
}

/**
 * The settle's length, s: `zoomMedia.settle` — a base plus a term in the
 * log of the zoom ratio, at most `maxSeconds`.
 */
export function settleSeconds(fromScale: number, toScale: number): number {
  const {baseSeconds, secondsPerLnRatio, maxSeconds} = zoomMedia.settle;
  if (!(fromScale > 0) || !(toScale > 0)) {
    return baseSeconds;
  }
  return Math.min(
    maxSeconds,
    baseSeconds + secondsPerLnRatio * Math.abs(Math.log(toScale / fromScale)),
  );
}

const ease = cubicBezier(zoomMedia.settle.curve);
const SLOPE_STEP = 1e-4;

function easeSlope(p: number): number {
  const lo = Math.max(0, p - SLOPE_STEP);
  const hi = Math.min(1, p + SLOPE_STEP);
  return hi > lo ? (ease(hi) - ease(lo)) / (hi - lo) : 0;
}

/**
 * UIScrollView's zoom settle as curves for the animator: the offset and the
 * scale move together along the eased curve (one CABasicAnimation), from
 * `from` to `to`, over `settleSeconds`.
 */
export function settleCurves(
  from: ZoomTransform,
  to: ZoomTransform,
): {
  readonly duration: number;
  readonly x: MotionCurve;
  readonly y: MotionCurve;
  readonly scale: MotionCurve;
} {
  const duration = settleSeconds(from.scale, to.scale);
  const curve = (a: number, b: number): MotionCurve => ({
    duration,
    at: t => a + (b - a) * ease(Math.min(1, Math.max(0, t / duration))),
    velocity: t =>
      ((b - a) * easeSlope(Math.min(1, Math.max(0, t / duration)))) / duration,
  });
  return {
    duration,
    x: curve(from.x, to.x),
    y: curve(from.y, to.y),
    scale: curve(from.scale, to.scale),
  };
}

/** The resting transform after panning by (dx, dy): a keyboard step. */
export function pannedBy(
  geometry: ZoomGeometry,
  from: ZoomTransform,
  dx: number,
  dy: number,
): ZoomTransform {
  return restingTransform(geometry, {
    x: from.x + dx,
    y: from.y + dy,
    scale: from.scale,
  });
}

/**
 * The transform that shows the same photo after the stage resizes (a
 * rotation): the photo point at the stage's centre stays at its centre and
 * the photo keeps its size on screen (the zoom relative to the fitted size
 * changes with the fitted size), within the new limits, at rest.
 */
export function transformForResize(
  before: ZoomGeometry,
  after: ZoomGeometry,
  transform: ZoomTransform,
): ZoomTransform {
  if (!isZoomed(before, transform)) {
    return {...IDENTITY, scale: after.minScale};
  }
  const ratio = after.fit.width > 0 ? before.fit.width / after.fit.width : 1;
  const scale = Math.min(
    after.maxScale,
    Math.max(after.minScale, transform.scale * ratio),
  );
  // The photo point (in fitted-box px of `before`) at the old centre, then
  // the same point in the new fitted box.
  const u =
    (before.width / 2 - before.fit.x - transform.x) /
    transform.scale /
    before.fit.width;
  const v =
    (before.height / 2 - before.fit.y - transform.y) /
    transform.scale /
    before.fit.height;
  return restingTransform(after, {
    x: after.width / 2 - after.fit.x - u * after.fit.width * scale,
    y: after.height / 2 - after.fit.y - v * after.fit.height * scale,
    scale,
  });
}

// ---------------------------------------------------------------------------
// Drag to dismiss (Photos)

/**
 * The photo under a drag to dismiss, from its fitted size: its centre
 * follows the finger (dx, dy) and it shrinks about that centre by
 * `zoomMedia.dismiss.scalePerTravelSquared` × the downward travel².
 */
export function dismissTransform(
  geometry: ZoomGeometry,
  dx: number,
  dy: number,
): ZoomTransform {
  const travel = Math.max(0, dy);
  const scale = Math.max(
    0,
    1 - zoomMedia.dismiss.scalePerTravelSquared * travel * travel,
  );
  return {
    x: dx + ((1 - scale) * geometry.fit.width) / 2,
    y: dy + ((1 - scale) * geometry.fit.height) / 2,
    scale,
  };
}

/** The backdrop's opacity at a drag's downward travel (pt). */
export function dismissBackdropAlpha(travel: number): number {
  const t = Math.max(0, travel);
  return Math.min(
    1,
    Math.max(0, 1 - zoomMedia.dismiss.backdropAlphaPerTravelSquared * t * t),
  );
}

/** The controls' and neighbouring photos' opacity at a drag's travel (pt). */
export function dismissChromeAlpha(travel: number): number {
  const {chromeAlphaPerPoint, chromeFadeStart} = zoomMedia.dismiss;
  return Math.min(
    1,
    Math.max(0, 1 - chromeAlphaPerPoint * (travel - chromeFadeStart)),
  );
}

/**
 * Whether a released drag to dismiss dismisses: any release does, unless
 * the finger was moving up when it lifted or came back within
 * `zoomMedia.dismiss.cancelTravel` of where it started.
 */
export function dismissCommits(travel: number, velocityY: number): boolean {
  return velocityY >= 0 && travel > zoomMedia.dismiss.cancelTravel;
}

/**
 * Where a dismissed photo goes with no thumbnail to return to: straight on
 * down until its top passes the stage's bottom edge (a stage px offset for
 * the transform's y).
 */
export function dismissExitY(
  geometry: ZoomGeometry,
  shown: ZoomTransform,
): number {
  return Math.max(shown.y, geometry.height - geometry.fit.y) + 1;
}

/**
 * A timed curve from `from` to `to`: it holds `from` for `delay` s, then
 * eases over `duration` s on the cubic Bézier `points` (Core Animation's
 * CABasicAnimation, begun from the current value).
 */
export function easedCurve(
  from: number,
  to: number,
  duration: number,
  points: readonly [number, number, number, number],
  delay = 0,
): MotionCurve {
  const ease = cubicBezier(points);
  const total = delay + duration;
  const at = (t: number) => {
    if (t <= delay) {
      return from;
    }
    if (t >= total) {
      return to;
    }
    return from + (to - from) * ease((t - delay) / duration);
  };
  const step = 1e-4;
  return {
    duration: total,
    at,
    velocity: t => {
      const a = Math.max(0, t - step);
      const b = Math.min(total, t + step);
      return b > a ? (at(b) - at(a)) / (b - a) : 0;
    },
  };
}

/**
 * The chrome's opacity as it hides or shows, from where it is: Photos'
 * 0.2 s easeInEaseOut fade.
 */
export function chromeFadeCurve(from: number, isHidden: boolean): MotionCurve {
  const {fadeSeconds, fadeCurve} = zoomMedia.chrome;
  return easedCurve(from, isHidden ? 0 : 1, fadeSeconds, fadeCurve);
}

/**
 * The black behind the photo as the chrome hides (it fades in after a
 * 0.1 s wait) or shows (it fades out at once), from where it is.
 */
export function chromeBackgroundCurve(
  from: number,
  isHidden: boolean,
): MotionCurve {
  const {backgroundSeconds, backgroundHideDelaySeconds, fadeCurve} =
    zoomMedia.chrome;
  return easedCurve(
    from,
    isHidden ? 1 : 0,
    backgroundSeconds,
    fadeCurve,
    isHidden ? backgroundHideDelaySeconds : 0,
  );
}
