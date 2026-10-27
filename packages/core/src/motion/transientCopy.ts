// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file transientCopy.ts
 * @input The DOM
 * @output Exports `isCopyable`, `inertCopy`, `visiblePartCopy`, `placeOver`,
 *   `paintedBackground` and `wrapText`: how Core makes, lays out and fades one
 *   transient copy of old content
 * @position Motion foundation, internal to core; the copy mechanism the
 *   in-place swap uses (`spec:AST-105` FR8,
 *   `architecture:component-style-authoring` INV7). Only
 *   motion/animatedLayout.ts imports it.
 *
 * A copy takes no part in the page: it is inert and hidden from assistive
 * technology, carries no ids or test ids, joins no form or radio group (a
 * copied checked radio would uncheck the live one), and its frames and media
 * load nothing. Laying it out changes no ancestor's position.
 *
 * SYNC: When modified, update /packages/core/src/motion/animatedLayout.ts
 */

/** Above this many elements, old content is not copied: the new one enters. */
const MAX_COPIED_ELEMENTS = 1500;

/** Whether `element` is small enough to copy. */
export function isCopyable(element: Element): boolean {
  return element.getElementsByTagName('*').length <= MAX_COPIED_ELEMENTS;
}

/**
 * A copy that takes no part: no ids or test ids, no form or radio group (a
 * copied checked radio would uncheck the live one), and copied frames and
 * media load nothing.
 */
export function inertCopy(element: HTMLElement): HTMLElement {
  const copy = element.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll('*')]) {
    for (const name of ['id', 'data-testid', 'name', 'form', 'autofocus']) {
      node.removeAttribute(name);
    }
  }
  for (const node of copy.querySelectorAll(
    'iframe, video, audio, source, embed, object',
  )) {
    for (const name of ['src', 'srcdoc', 'data', 'autoplay']) {
      node.removeAttribute(name);
    }
  }
  copy.setAttribute('aria-hidden', 'true');
  copy.setAttribute('inert', '');
  copy.style.pointerEvents = 'none';
  return copy;
}

/** The background `element` shows: its own, or the nearest ancestor's. */
export function paintedBackground(element: Element): string {
  for (let node: Element | null = element; node; node = node.parentElement) {
    const color = getComputedStyle(node).backgroundColor;
    if (color !== 'transparent' && !/^rgba\(.*,\s*0\)$/.test(color)) {
      return color;
    }
  }
  return 'Canvas';
}

/**
 * Lay `element` over `rect` (viewport coordinates), absolutely, as the last
 * child of `host`, wherever its containing block is: no ancestor's position
 * changes.
 */
export function placeOver(
  element: HTMLElement,
  host: Element,
  rect: DOMRect,
): void {
  Object.assign(element.style, {
    position: 'absolute',
    margin: '0px',
    left: '0px',
    top: '0px',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  host.appendChild(element);
  const origin = element.getBoundingClientRect();
  element.style.left = `${rect.left - origin.left}px`;
  element.style.top = `${rect.top - origin.top}px`;
}

/**
 * `element`'s visible part as a copy: its content scrolled as it was, in a
 * holder the size of the visible part (a scroll container), and where that
 * part showed, in viewport coordinates.
 */
export function visiblePartCopy(element: HTMLElement): {
  copy: HTMLElement;
  rect: DOMRect;
} {
  const content = inertCopy(element);
  content.removeAttribute('role');
  content.removeAttribute('tabindex');
  Object.assign(content.style, {
    position: 'absolute',
    top: `${-element.scrollTop}px`,
    left: '0px',
    boxSizing: 'border-box',
    width: `${element.clientWidth}px`,
    height: 'auto',
    padding: getComputedStyle(element).padding,
    margin: '0px',
    overflow: 'visible',
    translate: 'none',
  });
  const holder = element.ownerDocument.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.setAttribute('inert', '');
  Object.assign(holder.style, {overflow: 'hidden', pointerEvents: 'none'});
  holder.appendChild(content);
  const box = element.getBoundingClientRect();
  return {
    copy: holder,
    rect: DOMRect.fromRect({
      x: box.left + element.clientLeft,
      y: box.top + element.clientTop,
      width: element.clientWidth,
      height: element.clientHeight,
    }),
  };
}

/** Wraps each run of text in a copy in its own span, so the text can fade. */
export function wrapText(copy: HTMLElement): HTMLElement[] {
  const walker = copy.ownerDocument.createTreeWalker(copy, 4);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.trim()) {
      texts.push(walker.currentNode as Text);
    }
  }
  return texts.map(text => {
    const span = copy.ownerDocument.createElement('span');
    text.replaceWith(span);
    span.appendChild(text);
    return span;
  });
}
