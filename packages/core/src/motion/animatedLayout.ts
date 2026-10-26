// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file animatedLayout.ts
 * @input The DOM (layout rectangles, computed style), Web Animations
 * @output Exports `createAnimatedLayout` and the opaque `AnimatedLayout`
 *   handle, `reportLayoutChange`, `playLayoutChange` and
 *   `layoutChangeTiming`: the one module that animates the layout shift
 *   around an element whose size changes inside a container
 *   (`architecture:react-component-runtime` INV12)
 * @position Motion foundation. `useAnimatedLayout({containerRef})` (public)
 *   returns a handle; Collapsible and TreeList take it as their
 *   `animatedLayout` prop and report their size changes through it. Internal
 *   to core.
 *
 * How it works:
 * - `measureBefore()` runs before the change commits: from the changed
 *   element it walks up to the handle's container and, at each level,
 *   records the rectangle of every following element sibling (a manual
 *   `parentElement` / `nextElementSibling` walk that never descends into a
 *   subtree, except through `display: contents`, which has no box).
 * - `animate()` runs after the commit (a layout effect). Every change in the
 *   same area reported in one frame is measured together after the commit,
 *   once, in a microtask, so each element moves once by its total change.
 * - An element moves only when its rectangle changed and it is visible in
 *   the area, before or after. Absolute and fixed elements are skipped (an
 *   absolute child rides with its moving parent), and a stuck sticky element
 *   does not change rectangle, so it stays.
 * - The move is a compositor-only translate from the old place to the new
 *   one, added to any motion already running (`composite: 'add'`), corrected
 *   for a scaled ancestor. Nothing animates height.
 * - Every pointer. Under Reduce Motion nothing travels: moved content
 *   cross-fades in at its new place.
 * - The changed element plays its own animation (`playLayoutChange`) on the
 *   same timing, read from one theme role, so both start on the same frame.
 */

/**
 * The layout-change motion role. A placeholder until the theme names the
 * role: the medium-short duration and the standard ease, read from the
 * element's theme so a theme override reaches every participant at once.
 */
const DURATION_VAR = '--duration-medium-min';
const EASE_VAR = '--ease-standard';
const DEFAULT_DURATION_MS = 310;
const DEFAULT_EASE = 'cubic-bezier(0.24, 1, 0.4, 1)';
/** Below this many pixels a shift is not worth a move. */
const MIN_SHIFT_PX = 0.5;

export interface LayoutChangeTiming {
  readonly duration: number;
  readonly easing: string;
}

/** The shared timing for a change under `element`'s theme. */
export function layoutChangeTiming(element: Element): LayoutChangeTiming {
  const view = element.ownerDocument.defaultView;
  const style = view?.getComputedStyle(element);
  const rawDuration = style?.getPropertyValue(DURATION_VAR).trim() ?? '';
  const rawEase = style?.getPropertyValue(EASE_VAR).trim() ?? '';
  return {
    duration: parseDuration(rawDuration) ?? DEFAULT_DURATION_MS,
    easing: rawEase === '' ? DEFAULT_EASE : rawEase,
  };
}

function parseDuration(value: string): number | null {
  const match = /^([\d.]+)(ms|s)$/.exec(value);
  if (match == null) {
    return null;
  }
  const amount = Number(match[1]);
  return match[2] === 's' ? amount * 1000 : amount;
}

function prefersReducedMotion(element: Element): boolean {
  const view = element.ownerDocument.defaultView;
  return (
    typeof view?.matchMedia === 'function' &&
    view.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

// ---------------------------------------------------------------------------
// Feature tests: each option is tried through `element.animate` itself, so an
// engine that rejects one (an older iOS WebKit on `linear()` or
// `composite: 'add'`) falls back for that call instead of throwing.
// ---------------------------------------------------------------------------

let supportsComposite: boolean | null = null;

/**
 * Play `keyframes` on `element`, dropping `composite` and then the easing
 * when the engine rejects them. Returns null when Web Animations is missing.
 */
function safeAnimate(
  element: Element,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
): Animation | null {
  if (typeof (element as HTMLElement).animate !== 'function') {
    return null;
  }
  const attempts: KeyframeAnimationOptions[] = [];
  if (options.composite != null && supportsComposite !== false) {
    attempts.push(options);
  }
  const {composite: _composite, ...withoutComposite} = options;
  attempts.push(withoutComposite);
  attempts.push({...withoutComposite, easing: 'ease-out'});
  for (const attempt of attempts) {
    try {
      const animation = (element as HTMLElement).animate(keyframes, attempt);
      if (attempt.composite != null) {
        supportsComposite = true;
      }
      return animation;
    } catch {
      if (attempt.composite != null) {
        supportsComposite = false;
      }
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Handles
// ---------------------------------------------------------------------------

const AREA = Symbol('astryx.animatedLayout.area');

/**
 * The opaque handle `useAnimatedLayout` returns: a component that receives
 * it reports its size changes to the handle's container, the area the walk
 * stops at. Without a handle a component keeps its jump.
 */
export interface AnimatedLayout {
  readonly [AREA]: () => Element | null;
}

/** A handle over `area` (the container element, read when a change runs). */
export function createAnimatedLayout(
  area: () => Element | null,
): AnimatedLayout {
  return {[AREA]: area};
}

function areaOf(handle: AnimatedLayout, element: Element): Element | null {
  const area = handle[AREA]();
  return area != null && area !== element && area.contains(element)
    ? area
    : null;
}

// ---------------------------------------------------------------------------
// The walk
// ---------------------------------------------------------------------------

/**
 * The elements that can shift when `changed` changes size: at each ancestor
 * level up to `area`, every following element sibling. `display: contents`
 * is replaced by its children; hidden and out-of-flow elements are skipped.
 */
function collectFollowers(changed: Element, area: Element): Element[] {
  const view = changed.ownerDocument.defaultView;
  const out: Element[] = [];
  const take = (element: Element) => {
    const style = view?.getComputedStyle(element);
    if (style == null) {
      return;
    }
    if (style.display === 'contents') {
      for (
        let child = element.firstElementChild;
        child != null;
        child = child.nextElementSibling
      ) {
        take(child);
      }
      return;
    }
    if (
      style.display === 'none' ||
      style.position === 'absolute' ||
      style.position === 'fixed'
    ) {
      return;
    }
    out.push(element);
  };
  for (
    let node: Element | null = changed;
    node != null && node !== area;
    node = node.parentElement
  ) {
    for (
      let sibling = node.nextElementSibling;
      sibling != null;
      sibling = sibling.nextElementSibling
    ) {
      take(sibling);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Batches: every change in one area in one frame moves together
// ---------------------------------------------------------------------------

interface Batch {
  readonly area: Element;
  readonly changed: Set<Element>;
  readonly before: Map<Element, DOMRect>;
  scheduled: boolean;
}

const batches = new Map<Element, Batch>();

function batchFor(area: Element): Batch {
  let batch = batches.get(area);
  if (batch == null) {
    batch = {area, changed: new Set(), before: new Map(), scheduled: false};
    batches.set(area, batch);
  }
  return batch;
}

function intersects(a: DOMRect, b: DOMRect): boolean {
  return (
    a.width > 0 &&
    a.height > 0 &&
    a.right > b.left &&
    a.left < b.right &&
    a.bottom > b.top &&
    a.top < b.bottom
  );
}

/** The part of the area the person can see: its box within the viewport. */
function visibleRect(area: Element): DOMRect {
  const box = area.getBoundingClientRect();
  const view = area.ownerDocument.defaultView;
  const width = view?.innerWidth ?? box.right;
  const height = view?.innerHeight ?? box.bottom;
  const left = Math.max(box.left, 0);
  const top = Math.max(box.top, 0);
  return new DOMRect(
    left,
    top,
    Math.max(0, Math.min(box.right, width) - left),
    Math.max(0, Math.min(box.bottom, height) - top),
  );
}

/** The element's rendered scale against its layout size (a scaled ancestor). */
function scaleOf(element: Element, rect: DOMRect): {x: number; y: number} {
  const html = element as HTMLElement;
  const x =
    html.offsetWidth > 0 && rect.width > 0 ? rect.width / html.offsetWidth : 1;
  const y =
    html.offsetHeight > 0 && rect.height > 0
      ? rect.height / html.offsetHeight
      : 1;
  // Subpixel rounding makes an unscaled element read a hair off 1; only a
  // real scale is corrected.
  return {
    x: Math.abs(x - 1) < 0.01 ? 1 : x || 1,
    y: Math.abs(y - 1) < 0.01 ? 1 : y || 1,
  };
}

function flush(batch: Batch): void {
  batches.delete(batch.area);
  const followers = new Set<Element>();
  for (const changed of batch.changed) {
    if (!changed.isConnected) {
      continue;
    }
    for (const element of collectFollowers(changed, batch.area)) {
      followers.add(element);
    }
  }
  if (followers.size === 0) {
    return;
  }
  const visible = visibleRect(batch.area);
  const timing = layoutChangeTiming(batch.area);
  const reduced = prefersReducedMotion(batch.area);
  for (const element of followers) {
    const before = batch.before.get(element);
    if (before == null || batch.changed.has(element)) {
      // Added by the change, or itself a changed element: it plays its own.
      continue;
    }
    const after = element.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < MIN_SHIFT_PX && Math.abs(dy) < MIN_SHIFT_PX) {
      continue;
    }
    if (!intersects(before, visible) && !intersects(after, visible)) {
      // Offscreen before and after: it lands silently.
      continue;
    }
    if (reduced) {
      safeAnimate(element, [{opacity: 0}, {opacity: 1}], {
        duration: timing.duration,
        easing: 'linear',
      });
      continue;
    }
    const scale = scaleOf(element, after);
    safeAnimate(
      element,
      [
        {transform: `translate(${dx / scale.x}px, ${dy / scale.y}px)`},
        {transform: 'translate(0px, 0px)'},
      ],
      {duration: timing.duration, easing: timing.easing, composite: 'add'},
    );
  }
}

type Target = {readonly current: Element | null} | (() => Element | null);

function resolve(target: Target): Element | null {
  return typeof target === 'function' ? target() : target.current;
}

export interface LayoutChange {
  /** Before the change commits (in the event handler that causes it). */
  measureBefore(): void;
  /** After it commits (a layout effect); a no-op without `measureBefore`. */
  animate(): void;
}

/**
 * Report a size change of `target` to the handle's area. Call
 * `measureBefore()` before the change commits and `animate()` after it; the
 * content after `target`, up to the area, glides from its old place.
 * Changes in one area in one frame move together. Without a handle, or
 * outside its container, nothing moves.
 */
export function reportLayoutChange(
  handle: AnimatedLayout | null | undefined,
  target: Target,
): LayoutChange {
  return {
    measureBefore() {
      const element = resolve(target);
      if (element == null || handle == null) {
        return;
      }
      const area = areaOf(handle, element);
      if (area == null) {
        return;
      }
      const batch = batchFor(area);
      batch.changed.add(element);
      for (const follower of collectFollowers(element, area)) {
        if (!batch.before.has(follower)) {
          batch.before.set(follower, follower.getBoundingClientRect());
        }
      }
    },
    animate() {
      const element = resolve(target);
      if (element == null || handle == null) {
        return;
      }
      const area = areaOf(handle, element);
      const batch = area == null ? undefined : batches.get(area);
      if (batch == null || batch.scheduled) {
        return;
      }
      batch.scheduled = true;
      // After every layout effect of this commit, before paint.
      queueMicrotask(() => flush(batch));
    },
  };
}

/**
 * The changed element's own animation, on the shared timing: content that
 * appears fades and reveals downward; under Reduce Motion it only fades.
 */
export function playLayoutChange(
  handle: AnimatedLayout | null | undefined,
  element: Element,
  kind: 'enter' | 'exit' = 'enter',
): void {
  if (handle == null || areaOf(handle, element) == null) {
    return;
  }
  const timing = layoutChangeTiming(element);
  const reduced = prefersReducedMotion(element);
  const shown = reduced
    ? [{opacity: 0}, {opacity: 1}]
    : [
        {opacity: 0, clipPath: 'inset(0 0 100% 0)'},
        {opacity: 1, clipPath: 'inset(0 0 0% 0)'},
      ];
  safeAnimate(element, kind === 'enter' ? shown : [...shown].reverse(), {
    duration: timing.duration,
    easing: reduced ? 'linear' : timing.easing,
  });
}
