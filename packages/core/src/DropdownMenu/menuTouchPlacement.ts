// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file menuTouchPlacement.ts
 * @input UIMenu's placement values from the UIKit constants table
 *   (motion/uikit/menu.ts)
 * @output COVER_TRIGGER_STYLE and placeOverTrigger: where a menu sits on a
 *   compact touch screen
 * @position Internal to DropdownMenu, imported only through its touch layer
 *   (DropdownMenuTouch.ts): on a compact touch screen the anchored menu sits
 *   over its trigger, as UIMenu does on iOS 26.2
 */

import type React from 'react';
import {menu as uikitMenu} from '../motion/uikit/menu';

/**
 * The covering menu's distance from a viewport edge: UIKit's screen margin,
 * or the device's safe area where it is larger, plus a LayerProvider inset
 * for that edge, as the layer runtime's own gutter adds them.
 */
function coverEdge(
  safeArea: 'top' | 'right' | 'bottom' | 'left',
  inset: 'block-start' | 'block-end' | 'inline-start' | 'inline-end',
): string {
  return `calc(max(${uikitMenu.screenMargin}px, env(safe-area-inset-${safeArea}, 0px)) + var(--astryx-layer-inset-${inset}, 0px))`;
}

/**
 * Over the trigger on a phone, as UIMenu: centered on it (`anchor-center`)
 * within the viewport less the screen margin on each side. The vertical
 * edge and the room below or above it are set as the menu opens
 * (placeOverTrigger).
 */
export const COVER_TRIGGER_STYLE: React.CSSProperties = {
  left: coverEdge('left', 'inline-start'),
  right: coverEdge('right', 'inline-end'),
  justifySelf: 'anchor-center',
  margin: 0,
};

/**
 * Pins the covering menu's vertical edge to its trigger as it opens: its top
 * to the trigger's top, or, when the trigger's center is in the lower part of
 * the viewport, its bottom to the trigger's bottom (UIMenu on iOS 26.2).
 * Anchored, so it follows the trigger while open. The menu stays on screen,
 * as UIMenu does: no taller than the room between that edge and the far one,
 * less the screen margin, and it scrolls past that. Clears all of it off a
 * menu that does not cover its trigger.
 */
export function placeOverTrigger(
  surface: HTMLElement,
  trigger: HTMLElement,
  covers: boolean,
): void {
  const {style} = surface;
  style.removeProperty('max-block-size');
  if (!covers) {
    style.removeProperty('top');
    style.removeProperty('bottom');
    return;
  }
  const view = surface.ownerDocument.defaultView;
  // The layout viewport, the space getBoundingClientRect and a fixed box's
  // insets are in (a pinch-zoomed visual viewport is smaller and offset);
  // the window's height where the document has no layout.
  const height =
    surface.ownerDocument.documentElement.clientHeight ||
    (view?.innerHeight ?? 0);
  const box = trigger.getBoundingClientRect();
  const upward = box.top + box.height / 2 > height * uikitMenu.openUpwardBelow;
  style.setProperty('top', upward ? 'auto' : 'anchor(top)');
  style.setProperty('bottom', upward ? 'anchor(bottom)' : 'auto');
  const room = upward
    ? `calc(${box.bottom}px - ${coverEdge('top', 'block-start')})`
    : `calc(${height - box.top}px - ${coverEdge('bottom', 'block-end')})`;
  // The menu's own cap (menuMaxHeight, the layer's viewport cap) still holds.
  const cap = Number.parseFloat(
    view?.getComputedStyle(surface).maxBlockSize ?? '',
  );
  style.setProperty(
    'max-block-size',
    Number.isFinite(cap) ? `min(${cap}px, ${room})` : room,
  );
}
