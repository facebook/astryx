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
 * load nothing. Laying it out changes no ancestor's position, and a scaled
 * host draws it at the old size. Limits: a rule keyed on a removed `id` does
 * not style the copy, and content holding a canvas whose pixels cannot be
 * read back (a WebGL canvas without `preserveDrawingBuffer`, or a tainted
 * one) is not copied: the new content enters without an old copy.
 *
 * SYNC: When modified, update /packages/core/src/motion/animatedLayout.ts
 */

/** Above this many elements, old content is not copied: the new one enters. */
const MAX_COPIED_ELEMENTS = 1500;

/** Whether a canvas's pixels can be read back: drawn into a small probe. */
function isReadable(canvas: HTMLCanvasElement): boolean {
  if (canvas.width === 0 || canvas.height === 0) {
    return true;
  }
  const probe = canvas.ownerDocument.createElement('canvas');
  probe.width = 16;
  probe.height = 16;
  const context = probe.getContext('2d', {willReadFrequently: true});
  if (context == null) {
    // No 2D canvas here (a test environment): nothing to tell.
    return true;
  }
  try {
    context.drawImage(canvas, 0, 0, 16, 16);
    const {data} = context.getImageData(0, 0, 16, 16);
    // A canvas that reads back empty is either blank or unreadable; either
    // way its copy would show nothing, so the content is not copied.
    return data.some((value, index) => index % 4 === 3 && value !== 0);
  } catch {
    return false;
  }
}

/**
 * Whether `element` can be copied faithfully: small enough, and every canvas
 * in it readable.
 */
export function isCopyable(element: Element): boolean {
  return (
    element.getElementsByTagName('*').length <= MAX_COPIED_ELEMENTS &&
    Array.from(element.getElementsByTagName('canvas')).every(isReadable)
  );
}

/** Scroll offsets a copy restores once laid out (a clone carries none). */
const scrollOffsets = new WeakMap<
  HTMLElement,
  ReadonlyArray<readonly [Element, number, number]>
>();

/**
 * A copy that takes no part: no ids or test ids, no form or radio group (a
 * copied checked radio would uncheck the live one), no label for a live
 * control, and copied frames and media load nothing. Scrolled descendants
 * keep their offsets once the copy is laid out (`placeOver`).
 */
export function inertCopy(element: HTMLElement): HTMLElement {
  const copy = element.cloneNode(true) as HTMLElement;
  const sourceNodes = [element, ...element.querySelectorAll('*')];
  const copyNodes = [copy, ...copy.querySelectorAll('*')];
  const offsets: [Element, number, number][] = [];
  sourceNodes.forEach((source, index) => {
    if (source.scrollTop !== 0 || source.scrollLeft !== 0) {
      offsets.push([copyNodes[index], source.scrollTop, source.scrollLeft]);
    }
  });
  scrollOffsets.set(copy, offsets);
  for (const node of copyNodes) {
    for (const name of [
      'id',
      'data-testid',
      'name',
      'form',
      'for',
      'autofocus',
    ]) {
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
  // A clone's canvas is blank: paint each with its source's pixels (content
  // with an unreadable canvas is not copied: `isCopyable`).
  const sources = element.querySelectorAll('canvas');
  copy.querySelectorAll('canvas').forEach((canvas, index) => {
    const source = sources[index];
    try {
      canvas.getContext('2d')?.drawImage(source, 0, 0);
    } catch {
      // A canvas the copy cannot read (tainted, or a lost context) stays blank.
    }
  });
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
    boxSizing: 'border-box',
    margin: '0px',
    left: '0px',
    top: '0px',
    width: `${rect.width}px`,
    height: `${rect.height}px`,
  });
  host.appendChild(element);
  // The origin, and the host's scale: the rect is in viewport pixels, the
  // copy's styles in the host's own.
  const origin = element.getBoundingClientRect();
  const scaleX =
    origin.width > 0 && rect.width > 0 ? origin.width / rect.width : 1;
  const scaleY =
    origin.height > 0 && rect.height > 0 ? origin.height / rect.height : 1;
  element.style.width = `${rect.width / scaleX}px`;
  element.style.height = `${rect.height / scaleY}px`;
  element.style.left = `${(rect.left - origin.left) / scaleX}px`;
  element.style.top = `${(rect.top - origin.top) / scaleY}px`;
  for (const [node, top, left] of scrollOffsets.get(element) ?? []) {
    // At once, whatever the element's own `scroll-behavior`.
    if (typeof node.scrollTo === 'function') {
      node.scrollTo({top, left, behavior: 'instant'});
    } else {
      node.scrollTop = top;
      node.scrollLeft = left;
    }
  }
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
    left: `${-element.scrollLeft}px`,
    boxSizing: 'border-box',
    width: `${element.clientWidth}px`,
    height: 'auto',
    padding: getComputedStyle(element).padding,
    // The holder is the visible part, inside the border.
    borderWidth: '0px',
    margin: '0px',
    overflow: 'visible',
    translate: 'none',
  });
  const holder = element.ownerDocument.createElement('div');
  holder.setAttribute('aria-hidden', 'true');
  holder.setAttribute('inert', '');
  Object.assign(holder.style, {overflow: 'hidden', pointerEvents: 'none'});
  holder.appendChild(content);
  // The content's own offset is its position; its scrolled descendants
  // restore theirs when the holder is laid out.
  scrollOffsets.set(
    holder,
    (scrollOffsets.get(content) ?? []).filter(([node]) => node !== content),
  );
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

const SVG = 'http://www.w3.org/2000/svg';

/**
 * The elements that let a copy's text fade: each run of HTML text wrapped in
 * its own span, and each SVG `text` element as it is (a span does not render
 * inside SVG).
 */
export function wrapText(copy: HTMLElement): Element[] {
  const walker = copy.ownerDocument.createTreeWalker(copy, 4);
  const texts: Text[] = [];
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.trim()) {
      texts.push(walker.currentNode as Text);
    }
  }
  const faded = new Set<Element>();
  for (const text of texts) {
    const parent = text.parentElement;
    if (parent?.namespaceURI === SVG) {
      const svgText = parent.closest('text');
      if (svgText != null) {
        faded.add(svgText);
      }
      continue;
    }
    const span = copy.ownerDocument.createElement('span');
    text.replaceWith(span);
    span.appendChild(text);
    faded.add(span);
  }
  return [...faded];
}
