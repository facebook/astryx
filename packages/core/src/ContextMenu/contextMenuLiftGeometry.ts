// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contextMenuLiftGeometry.ts
 * @input The context-menu constants
 * @output Exports liftScale, liftedBox and menuPlacement: where UIKit's
 *   lifted preview lands when the menu shows, and where the menu sits
 *   against it
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

import {contextMenu} from '../motion/uikit';

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
