// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contextMenuLiftGeometry.ts
 * @input The context-menu constants
 * @output Exports liftScale, liftedBox, menuPlacement, menuMorph and
 *   menuExit: where UIKit's lifted preview lands when the menu shows, where
 *   the menu sits against it, how the menu's glass grows out of the finger,
 *   and how it shrinks back into it when the menu closes
 * @position The geometry of ContextMenu's lift presentation (touch);
 *   ContextMenu.tsx renders it
 *
 * When a context menu shows on iOS 26.2, the long-pressed view's preview
 * lifts above a tinted backdrop: it grows about its center
 * (`contextMenu.lift`), stays inside the screen's side insets and the safe
 * area's margins, and the menu sits a gap away: below it when it fits, else
 * above, centered on it or flush with the edge it is held against.
 *
 * SYNC: When modified, update
 * /packages/core/src/ContextMenu/contextMenuLiftGeometry.test.ts
 */

import {SETTLING_EPSILON, solveSpring, toSpring} from '../motion/spring';
import {contextMenu, springs} from '../motion/uikit';

/** A box in client CSS px. */
export interface LiftBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** The viewport the preview lifts in, CSS px, and its safe-area insets. */
export interface LiftViewport {
  readonly width: number;
  readonly height: number;
  readonly safeTop?: number;
  readonly safeBottom?: number;
}

/**
 * The factor a `width` × `height` preview grows by when the menu shows: up to
 * `maxScale`, by `scaleUpPoints` on its larger side, and never wider than the
 * screen less its insets (which can make it smaller than 1).
 */
export function liftScale(
  width: number,
  height: number,
  viewport: LiftViewport,
): number {
  const {maxScale, scaleUpPoints, screenInset} = contextMenu.lift;
  const side = Math.max(width, height);
  if (side <= 0) {
    return 1;
  }
  const fitsWidth =
    width > 0 ? (viewport.width - 2 * screenInset) / width : Infinity;
  return Math.min(maxScale, (side + scaleUpPoints) / side, fitsWidth);
}

/**
 * The lifted preview's box: `source` scaled by `liftScale` about its center,
 * then moved inside the screen's side insets and the safe area's margins if
 * it crosses them.
 */
export function liftedBox(source: LiftBox, viewport: LiftViewport): LiftBox {
  const {screenInset, verticalMargin} = contextMenu.lift;
  const scale = liftScale(source.width, source.height, viewport);
  const width = source.width * scale;
  const height = source.height * scale;
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), Math.max(min, max));
  const top = (viewport.safeTop ?? 0) + verticalMargin;
  const bottom = viewport.height - (viewport.safeBottom ?? 0) - verticalMargin;
  return {
    x: clamp(
      source.x + source.width / 2 - width / 2,
      screenInset,
      viewport.width - screenInset - width,
    ),
    y: clamp(source.y + source.height / 2 - height / 2, top, bottom - height),
    width,
    height,
  };
}

/** Where the menu sits against the lifted preview. */
export interface MenuPlacement {
  readonly side: 'above' | 'below';
  readonly alignment: 'start' | 'center' | 'end';
}

/**
 * The menu's place: below the preview when `menuHeight` fits between it and
 * the bottom limit, else above; centered on the preview, or flush with the
 * preview's edge when the preview is held against a side of the screen.
 */
export function menuPlacement(
  lifted: LiftBox,
  menuHeight: number,
  viewport: LiftViewport,
): MenuPlacement {
  const {screenInset, verticalMargin, menuGap} = contextMenu.lift;
  const bottom = viewport.height - (viewport.safeBottom ?? 0) - verticalMargin;
  const side =
    lifted.y + lifted.height + menuGap + menuHeight <= bottom
      ? 'below'
      : 'above';
  const epsilon = 0.5;
  const alignment =
    lifted.x <= screenInset + epsilon
      ? 'start'
      : lifted.x + lifted.width >= viewport.width - screenInset - epsilon
        ? 'end'
        : 'center';
  return {side, alignment};
}

/** The menu's glass and content at one moment of its entrance. */
export interface MenuMorphState {
  /** The glass's centre and size, client px. */
  readonly centerX: number;
  readonly centerY: number;
  readonly width: number;
  readonly height: number;
  /** The content's scale, relative to its own size. */
  readonly contentScale: number;
  /** The content's progress in (opacity, and its blur's complement). */
  readonly fade: number;
}

/** The menu's entrance, from the press point to its frame. */
export interface MenuMorph {
  /** Seconds until every part has settled. */
  readonly duration: number;
  /** The state `t` seconds in. */
  at(t: number): MenuMorphState;
}

/**
 * The menu's entrance out of the finger: the glass starts as
 * `contextMenu.lift.morphStart` at `press` and grows into `menu`, its centre
 * on `morphSpring` and its size on `morphSizeSpring` (`morphSizeDelayMs`
 * later); the content follows
 * the centre, scaled from `morphContentScale` and faded in on
 * `morphSpring`. Reduced Motion takes `springs.menuReducedMotion`.
 */
export function menuMorph(
  menu: LiftBox,
  press: {readonly x: number; readonly y: number},
  {reduced = false}: {reduced?: boolean} = {},
): MenuMorph {
  const {
    morphSpring,
    morphSizeSpring,
    morphSizeDelayMs,
    morphStart,
    morphContentScale,
  } = contextMenu.lift;
  const delay = morphSizeDelayMs / 1000;
  const move = solveSpring(
    toSpring(reduced ? springs.menuReducedMotion : morphSpring),
    {from: 0, to: 1},
  );
  const grow = solveSpring(
    toSpring(reduced ? springs.menuReducedMotion : morphSizeSpring),
    {from: 0, to: 1},
  );
  const duration = Math.max(
    move.settleTime(SETTLING_EPSILON),
    delay + grow.settleTime(SETTLING_EPSILON),
  );
  const centerX = menu.x + menu.width / 2;
  const centerY = menu.y + menu.height / 2;
  return {
    duration,
    at(t) {
      const p = t >= duration ? 1 : move.value(Math.max(t, 0));
      const s = t >= duration ? 1 : grow.value(Math.max(t - delay, 0));
      return {
        centerX: press.x + (centerX - press.x) * p,
        centerY: press.y + (centerY - press.y) * p,
        width: morphStart.width + (menu.width - morphStart.width) * s,
        height: morphStart.height + (menu.height - morphStart.height) * s,
        contentScale: morphContentScale + (1 - morphContentScale) * p,
        fade: p,
      };
    },
  };
}

/**
 * The menu's exit into the finger: the glass shrinks from `menu` to
 * `contextMenu.lift.exitEnd` at `press`, its centre on `morphSpring` and
 * its width and height on `exitWidthSpring` / `exitHeightSpring`; the
 * content follows the centre, shrinking to `exitContentScale` as it fades
 * (`fade` goes 1 → 0) on `morphSpring`. Reduced Motion takes
 * `springs.menuReducedMotion`. A close during the entrance passes where it
 * stands as `from`: every part retargets from there (UIKit's springs do),
 * so nothing jumps to the menu's full frame first.
 */
export function menuExit(
  menu: LiftBox,
  press: {readonly x: number; readonly y: number},
  {reduced = false, from}: {reduced?: boolean; from?: MenuMorphState} = {},
): MenuMorph {
  const {
    morphSpring,
    exitWidthSpring,
    exitHeightSpring,
    exitEnd,
    exitContentScale,
  } = contextMenu.lift;
  const curve = (description: Parameters<typeof toSpring>[0]) =>
    solveSpring(toSpring(reduced ? springs.menuReducedMotion : description), {
      from: 0,
      to: 1,
    });
  const move = curve(morphSpring);
  const wide = curve(exitWidthSpring);
  const tall = curve(exitHeightSpring);
  const duration = Math.max(
    move.settleTime(SETTLING_EPSILON),
    wide.settleTime(SETTLING_EPSILON),
    tall.settleTime(SETTLING_EPSILON),
  );
  const start: MenuMorphState = from ?? {
    centerX: menu.x + menu.width / 2,
    centerY: menu.y + menu.height / 2,
    width: menu.width,
    height: menu.height,
    contentScale: 1,
    fade: 1,
  };
  return {
    duration,
    at(t) {
      const done = t >= duration;
      const time = Math.max(t, 0);
      const p = done ? 1 : move.value(time);
      const w = done ? 1 : wide.value(time);
      const h = done ? 1 : tall.value(time);
      return {
        centerX: start.centerX + (press.x - start.centerX) * p,
        centerY: start.centerY + (press.y - start.centerY) * p,
        width: start.width + (exitEnd.width - start.width) * w,
        height: start.height + (exitEnd.height - start.height) * h,
        contentScale:
          start.contentScale + (exitContentScale - start.contentScale) * p,
        fade: start.fade * (1 - p),
      };
    },
  };
}
