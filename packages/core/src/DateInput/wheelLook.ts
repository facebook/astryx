// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wheelLook.ts
 * @input A row's distance from the band's centre, the column's height, and
 *   whether reduced motion is on; for a motion, a baked curve
 *   (wheelDrum.ts's samples) and the wheel's layout
 * @output Exports WHEEL_ROW_PITCH, todayLook (each row's transform and
 *   opacity at a distance) and lookKeyframes (a row's keyframes along a
 *   baked curve)
 * @position Rendering math of the touch Wheel (PickerWheel.tsx) and its
 *   player (wheelMotion.ts); pure, no DOM
 *
 * The touch column draws today's look: the rows of today's scrolling column
 * (28 px, `dateInputTouchSizes.wheelItemSize`), each tipping and fading
 * toward the edges of the column as today's `view()` timeline draws it
 * (Wheel.tsx's `falloff`). That timeline maps a row's place in the
 * scrollport over the `cover` range linearly: progress 0 is a row whose top
 * meets the bottom edge, 0.5 a row centred on the band, 1 a row whose bottom
 * meets the top edge. Keyframes at 0, 50% and 100% give rotateX(52°),
 * scale(0.86) and opacity 0.3 at either edge, none of them at the centre.
 * Here the column does not scroll: a strip holding the rows translates by
 * minus the wheel's offset (the gesture system and the compositor move it),
 * and the same mapping is evaluated per row for its tip and fade, about the
 * row's own centre, so the column's perspective draws them as today's
 * scroller does. The player bakes it into each row's keyframes, and a drag
 * frame writes it.
 *
 * Under reduced motion only the opacity falls off, as today's `fadeOnly`
 * does: rows move with the finger or the motion, flat.
 *
 * A row out of sight (its box wholly past an edge) is transparent and
 * upright, so a motion that never shows it animates nothing. On a looping
 * wheel a row keeps its place along the strip but moves a whole cycle when
 * the fold puts it on the other side (`stripTranslation` folds the strip, a
 * row's own translate makes up the rest), as a step, never a sweep.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DateInput/wheelLook.test.ts
 * - /packages/core/src/DateInput/Wheel.tsx (`falloff`, `fadeOnly`)
 */

import type {CurveSample} from './wheelDrum';
import {rowDistance, stripTranslation} from './wheelDrum';
import type {WheelLayout} from './wheelPhysics';

/** A row's height, px: today's wheel row (`dateInputTouchSizes.wheelItemSize`). */
export const WHEEL_ROW_PITCH = 28;

/** The falloff at either edge of the column: today's `falloff` keyframes. */
const EDGE_ANGLE_DEG = 52;
const EDGE_SCALE = 0.86;
const EDGE_OPACITY = 0.3;

/** How a row is drawn at one distance from the band's centre. */
export interface RowFrame {
  /** The row's tip about its own centre, upright when flat or out of sight. */
  readonly transform: string;
  readonly opacity: number;
  /** Whether any of the row shows inside the column. */
  readonly visible: boolean;
}

/** A look: how a row is drawn at `distance` px below the band's centre. */
export interface WheelLook {
  rowFrame(distance: number): RowFrame;
}

/** Shortest decimal for a style value, so equal frames compare equal. */
function css(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

/** A row's tip when it has none: upright, at full size. */
const UPRIGHT = 'rotateX(0deg) scale(1)';

/**
 * Today's look for a column `columnHeight` px tall: rows tip and fade toward
 * its edges (only fade, under reduced motion).
 */
export function todayLook(
  columnHeight: number,
  {reducedMotion = false}: {reducedMotion?: boolean} = {},
): WheelLook {
  // The cover range: from a row's top at the bottom edge to its bottom at
  // the top edge.
  const span = columnHeight + WHEEL_ROW_PITCH;
  return {
    rowFrame(distance) {
      const progress = 0.5 - distance / span;
      if (!(progress > 0 && progress < 1)) {
        return {transform: UPRIGHT, opacity: 0, visible: false};
      }
      // 1 on the band, 0 at either edge, linear between (the timeline's
      // `linear` keyframes).
      const nearness = 1 - Math.abs(2 * progress - 1);
      const opacity = EDGE_OPACITY + (1 - EDGE_OPACITY) * nearness;
      if (reducedMotion) {
        return {
          transform: UPRIGHT,
          opacity: Number(css(opacity)),
          visible: true,
        };
      }
      const angle = EDGE_ANGLE_DEG * (1 - 2 * progress);
      const scale = EDGE_SCALE + (1 - EDGE_SCALE) * nearness;
      return {
        transform: `rotateX(${css(angle)}deg) scale(${css(scale)})`,
        opacity: Number(css(opacity)),
        visible: true,
      };
    },
  };
}

/**
 * How the row at `position` is drawn at `offset` under `look`: its look
 * frame, behind the whole cycles a looping wheel moves it past the strip's
 * fold.
 */
export function rowFrameAt(
  position: number,
  offset: number,
  layout: WheelLayout,
  look: WheelLook,
): RowFrame & {readonly shift: number} {
  const distance = rowDistance(position, offset, layout);
  const shift =
    distance - (position * layout.rowHeight + stripTranslation(offset, layout));
  const frame = look.rowFrame(distance);
  const rounded = Math.abs(shift) < 1e-6 ? 0 : Number(css(shift));
  // Every frame names the same functions, so the compositor can interpolate
  // any two (WebKit runs an animation whose lists differ on the main thread).
  return {
    ...frame,
    transform: `translateY(${rounded}px) ${frame.transform}`,
    shift: rounded,
  };
}

/** A keyframe of one row's motion under a look. */
export interface LookKeyframe {
  /** Progress through the motion, 0 to 1. */
  readonly offset: number;
  readonly transform: string;
  readonly opacity: number;
}

/**
 * The keyframes of the row at `position` along `samples` (a baked curve
 * lasting `duration` seconds) under `look`, or null when it stays out of
 * sight throughout. Runs of identical frames collapse to their ends; a row
 * that moves a whole cycle (a looping wheel's fold) steps there instead of
 * sweeping across.
 */
export function lookKeyframes(
  position: number,
  samples: ReadonlyArray<CurveSample>,
  duration: number,
  layout: WheelLayout,
  look: WheelLook,
): LookKeyframe[] | null {
  const frames: LookKeyframe[] = [];
  let everVisible = false;
  let previous: (RowFrame & {readonly shift: number}) | null = null;
  let pendingRun: LookKeyframe | null = null;
  const progress = (t: number) =>
    duration > 0 ? Math.min(1, t / duration) : 1;
  for (const sample of samples) {
    const frame = rowFrameAt(position, sample.value, layout, look);
    const keyframe: LookKeyframe = {
      offset: progress(sample.t),
      transform: frame.transform,
      opacity: frame.opacity,
    };
    everVisible ||= frame.visible;
    if (
      previous != null &&
      frame.transform === previous.transform &&
      frame.opacity === previous.opacity
    ) {
      pendingRun = keyframe;
      continue;
    }
    if (pendingRun != null) {
      frames.push(pendingRun);
      pendingRun = null;
    }
    if (
      previous != null &&
      frame.shift !== previous.shift &&
      frames.length > 0
    ) {
      // A whole cycle, with the strip's own step: at once.
      frames.push({...frames[frames.length - 1], offset: keyframe.offset});
    }
    frames.push(keyframe);
    previous = frame;
  }
  if (pendingRun != null) {
    frames.push(pendingRun);
  }
  if (!everVisible) {
    return null;
  }
  if (frames.length === 1) {
    frames.push({...frames[0], offset: 1});
  }
  return frames;
}
