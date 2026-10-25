// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file scrollLockTouchGuard.ts
 * @input The node under a finger and the pan's direction, while a scroll lock
 *   holds the page
 * @output isPanAbsorbedBeforePage, the scroll lock's decision for the gesture
 *   host's page-scroll hold
 * @position Internal hook utility; used by useScrollLock, through
 *   gestures/pageHold's holdPageScroll on the gesture host (the host owns
 *   the touch listeners).
 *
 * `overflow: hidden` on the root stops wheel, keyboard and scrollbar scrolling,
 * but iOS Safari before 26.4 still scrolls such a page under a finger: on iOS
 * 26.2 a drag on a scrim, on a dialog's header, or on an `overflow: auto` body
 * whose content fits each scrolls the page behind the overlay. The lock
 * cancels exactly those pans through the gesture host. This walk decides each
 * one: a scroller that can move in the pan's direction, or one at its edge
 * that contains its own overscroll, takes the pan, and the move goes through;
 * a pan that would reach the page is cancelled.
 */

import {parentAcrossShadow} from '../gestures/nativeScroll';
import {isRtlElement} from './isRtlElement';

const SCROLLABLE = new Set(['auto', 'scroll']);

/** Overflow at or below this many px is a box that fits, not a scroller. */
const EDGE_TOLERANCE = 1;

function canMoveY(element: Element, dy: number, range: number): boolean {
  // A finger moving down drags the content down: scrollTop decreases.
  return dy > 0
    ? element.scrollTop > EDGE_TOLERANCE - 0.5
    : element.scrollTop < range - EDGE_TOLERANCE + 0.5;
}

function canMoveX(
  element: Element,
  dx: number,
  range: number,
  isRtl: boolean,
): boolean {
  const min = isRtl ? -range : 0;
  const max = isRtl ? 0 : range;
  // A finger moving right drags the content right: scrollLeft decreases.
  return dx > 0
    ? element.scrollLeft > min + EDGE_TOLERANCE - 0.5
    : element.scrollLeft < max - EDGE_TOLERANCE + 0.5;
}

/**
 * Whether a scroller under `target` takes a pan of (`dx`, `dy`) before the
 * page does: one that can still move that way, or one at its edge whose
 * `overscroll-behavior` keeps the overscroll to itself.
 */
export function isPanAbsorbedBeforePage(
  target: EventTarget | null,
  dx: number,
  dy: number,
): boolean {
  if (!(target instanceof Node)) {
    return false;
  }
  const doc = target.ownerDocument ?? document;
  const view = doc.defaultView;
  if (view == null) {
    return false;
  }
  const isVertical = Math.abs(dy) >= Math.abs(dx);
  for (
    let node: Node | null = target;
    node != null;
    node = parentAcrossShadow(node)
  ) {
    if (!(node instanceof Element)) {
      continue;
    }
    if (
      node === doc.documentElement ||
      node === doc.body ||
      node === doc.scrollingElement
    ) {
      break;
    }
    const style = view.getComputedStyle(node);
    if (!SCROLLABLE.has(isVertical ? style.overflowY : style.overflowX)) {
      continue;
    }
    const range = isVertical
      ? node.scrollHeight - node.clientHeight
      : node.scrollWidth - node.clientWidth;
    // Content that fits gives the finger nothing to scroll: the pan passes
    // on to the next scroller up, and in the end to the page.
    if (range <= EDGE_TOLERANCE) {
      continue;
    }
    const canMove = isVertical
      ? canMoveY(node, dy, range)
      : canMoveX(node, dx, range, isRtlElement(node as HTMLElement));
    if (canMove) {
      return true;
    }
    const behavior = isVertical
      ? style.overscrollBehaviorY
      : style.overscrollBehaviorX;
    if (behavior === 'contain' || behavior === 'none') {
      return true;
    }
  }
  return false;
}
