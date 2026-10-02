// Copyright (c) Meta Platforms, Inc. and affiliates.
/* global CustomEvent, Element, window */

let floatingID = 0;

export function elementsMatching(root, selector) {
  const matches = [];
  if (root instanceof Element && root.matches(selector)) matches.push(root);
  if ('querySelectorAll' in root)
    matches.push(...root.querySelectorAll(selector));
  return matches;
}

export function ensureID(element, prefix) {
  if (!element.id) {
    floatingID += 1;
    element.id = `${prefix}-${floatingID}`;
  }
  return element.id;
}

export function positionFloating(
  anchor,
  surface,
  placement = 'below',
  alignment = 'start',
) {
  const anchorRect = anchor.getBoundingClientRect();
  const surfaceRect = surface.getBoundingClientRect();
  const gap = 8;
  let top = anchorRect.bottom + gap;
  let left = anchorRect.left;

  if (placement === 'above') top = anchorRect.top - surfaceRect.height - gap;
  if (placement === 'start') left = anchorRect.left - surfaceRect.width - gap;
  if (placement === 'end') left = anchorRect.right + gap;

  if (placement === 'above' || placement === 'below') {
    if (alignment === 'center')
      left = anchorRect.left + (anchorRect.width - surfaceRect.width) / 2;
    if (alignment === 'end') left = anchorRect.right - surfaceRect.width;
  } else {
    if (alignment === 'center')
      top = anchorRect.top + (anchorRect.height - surfaceRect.height) / 2;
    if (alignment === 'end') top = anchorRect.bottom - surfaceRect.height;
  }

  const gutter = 8;
  left = Math.max(
    gutter,
    Math.min(left, window.innerWidth - surfaceRect.width - gutter),
  );
  top = Math.max(
    gutter,
    Math.min(top, window.innerHeight - surfaceRect.height - gutter),
  );
  surface.style.left = `${Math.round(left)}px`;
  surface.style.top = `${Math.round(top)}px`;
}

export function dispatchAstryx(element, type, detail = {}) {
  element.dispatchEvent(
    new CustomEvent(`astryx:${type}`, {bubbles: true, detail}),
  );
}
