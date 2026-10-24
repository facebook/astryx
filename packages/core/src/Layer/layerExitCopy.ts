// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file layerExitCopy.ts
 * @input A layer's popover element as it closes, and the box it stands in
 * @output Exports `placeLayerExitCopy`: a static, inert copy of the layer put
 *   where the layer stands, for a touch presentation's close to play on, and
 *   `LayerExitBox`
 * @position Layer runtime helper for the touch presentations that animate a
 *   popover out (DropdownMenu's menu, Popover)
 *
 * The browser hides a popover the moment it closes (a pick, Escape, its own
 * light dismiss), so a close that has to stay on screen plays on a copy taken
 * as the popover closes: same place, same size, same inherited theme. The
 * copy has no ids and no `popover` attribute, is `inert` and hidden from
 * assistive technology, takes no pointer events, and sits at the top of the
 * stacking order. Its owner animates it and removes it when its spring
 * settles; nothing on the main thread runs per frame while it moves.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Layer/layerExitCopy.test.ts
 */

/** A box in viewport px. */
export interface LayerExitBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Inline properties the copy must not keep from the live layer. */
const LIVE_ONLY_PROPERTIES = [
  'position-anchor',
  'position-area',
  'position-try-fallbacks',
  'inset',
  'right',
  'bottom',
  'scale',
  'opacity',
  'transition',
] as const;

/**
 * Copies `element` into a static box at `box`, marked with `attribute`, and
 * inserts it right after the element. The copy keeps the element's scroll
 * positions and stands exactly on `box` even inside an ancestor that is a
 * containing block for fixed boxes (a transform, a filter).
 */
export function placeLayerExitCopy(
  element: HTMLElement,
  box: LayerExitBox,
  attribute: string,
): HTMLElement {
  const copy = element.cloneNode(true) as HTMLElement;
  copy.removeAttribute('id');
  copy.removeAttribute('popover');
  for (const node of copy.querySelectorAll('[id]')) {
    node.removeAttribute('id');
  }
  copy.setAttribute(attribute, '');
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  const {style} = copy;
  for (const property of LIVE_ONLY_PROPERTIES) {
    style.removeProperty(property);
  }
  style.setProperty('position', 'fixed');
  style.setProperty('margin', '0');
  style.setProperty('left', `${box.left}px`);
  style.setProperty('top', `${box.top}px`);
  style.setProperty('width', `${box.width}px`);
  style.setProperty('height', `${box.height}px`);
  style.setProperty('box-sizing', 'border-box');
  style.setProperty('z-index', '2147483647');
  style.setProperty('pointer-events', 'none');
  style.setProperty('animation-name', 'none');
  // The UA's popover styles no longer apply: keep it visible as it was.
  style.setProperty('display', 'block');
  style.setProperty('overflow', 'visible');
  element.after(copy);
  // An ancestor that is a containing block for fixed boxes (a transform, a
  // filter) moves the copy: put it back where the layer is.
  const landed = copy.getBoundingClientRect();
  if (Math.abs(landed.left - box.left) > 0.01) {
    style.setProperty('left', `${box.left + (box.left - landed.left)}px`);
  }
  if (Math.abs(landed.top - box.top) > 0.01) {
    style.setProperty('top', `${box.top + (box.top - landed.top)}px`);
  }
  // Scrolled content stays where it was scrolled to.
  const sources = element.querySelectorAll('*');
  const copies = copy.querySelectorAll('*');
  sources.forEach((source, index) => {
    const target = copies[index];
    if (target != null && (source.scrollTop !== 0 || source.scrollLeft !== 0)) {
      target.scrollTop = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
    }
  });
  return copy;
}
