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
 * cancels exactly those pans through the page hold. This walk decides each
 * one: a scroller that can move in the pan's direction, or one at its edge
 * that contains its own overscroll, takes the pan, and the move goes through;
 * a pan that would reach the page is cancelled. The walk follows the scroll
 * chain the browser uses, which runs along containing blocks: it ends at an
 * element in the top layer (an open modal dialog) or a fixed-position one,
 * whose untaken pans go to the viewport, so an overlay rendered inside a
 * scrolling container still holds the page.
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
 * Whether `element` itself takes a pan: it scrolls and can still move that
 * way, or it is at its edge and its `overscroll-behavior` keeps the
 * overscroll to itself.
 */
function takesPan(
  element: Element,
  style: CSSStyleDeclaration,
  isVertical: boolean,
  dx: number,
  dy: number,
): boolean {
  if (!SCROLLABLE.has(isVertical ? style.overflowY : style.overflowX)) {
    return false;
  }
  const range = isVertical
    ? element.scrollHeight - element.clientHeight
    : element.scrollWidth - element.clientWidth;
  // Content that fits gives the finger nothing to scroll: the pan passes on
  // to the next scroller in the chain, and in the end to the page.
  if (range <= EDGE_TOLERANCE) {
    return false;
  }
  const canMove = isVertical
    ? canMoveY(element, dy, range)
    : canMoveX(element, dx, range, isRtlElement(element as HTMLElement));
  if (canMove) {
    return true;
  }
  const behavior = isVertical
    ? style.overscrollBehaviorY
    : style.overscrollBehaviorX;
  return behavior === 'contain' || behavior === 'none';
}

function matchesSelector(element: Element, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    // An engine without the pseudo-class: the position check still applies.
    return false;
  }
}

/**
 * Whether a pan `element` does not take goes on to the viewport rather than to
 * its DOM parent. The browser chains scrolling along containing blocks, and an
 * element in the top layer (an open modal dialog or popover) or a
 * fixed-position one has the viewport as its containing block: a Dialog
 * rendered inside a scrolling container hands an untaken pan to the page,
 * never to that container.
 */
function chainsToViewport(
  element: Element,
  style: CSSStyleDeclaration,
): boolean {
  return (
    style.position === 'fixed' ||
    matchesSelector(element, ':modal') ||
    matchesSelector(element, ':popover-open')
  );
}

/**
 * Whether a scroller in the scroll chain of `target` takes a pan of (`dx`,
 * `dy`) before the page does: one that can still move that way, or one at
 * its edge whose `overscroll-behavior` keeps the overscroll to itself.
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
    if (takesPan(node, style, isVertical, dx, dy)) {
      return true;
    }
    if (chainsToViewport(node, style)) {
      break;
    }
  }
  return false;
}
