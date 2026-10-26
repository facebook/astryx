// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file animatedLayout.ts
 * @input The DOM (layout rectangles, computed style), Web Animations, the
 *   internal `springs.settle` motion role (motion/roles.ts) and the Reduce Motion
 *   cross-fade clock (uikit/timing.ts)
 * @output Exports `createAnimatedLayout` and the opaque `AnimatedLayout`
 *   handle, `reportLayoutChange`, `playLayoutChange` and
 *   `applyLayoutChangeTransition`: the one module that produces the
 *   size-change glide `spec:AST-105` defines
 *   (`architecture:react-component-runtime` INV12)
 * @position Motion foundation, internal to core. `useAnimatedLayout`
 *   (public) returns a handle; Collapsible and TreeList take it as their
 *   `animatedLayout` prop and report their size changes through it.
 *
 * How it works:
 * - `measureBefore()` runs before the change commits: from the changed
 *   element it walks up to the handle's container and, at each level,
 *   records the rectangle of every following element sibling, through
 *   `parentElement` and `nextElementSibling`, descending only into an element
 *   with `display: contents` (it has no box).
 * - `animate()` runs after the commit (a layout effect). Every change in the
 *   same area reported in one frame is measured together after the commit,
 *   once, in a microtask, so each element moves once, by its total change.
 * - An element moves only when its rectangle changed and it is in the area's
 *   visible part, before or after. Absolute, fixed, top-layer, hidden and
 *   zero-size elements are skipped (an absolute child rides with its moving
 *   parent); a stuck sticky element does not change rectangle, so it stays.
 * - The move is a compositor-only translate from the old place to the new
 *   one, sampled from `springs.settle` into linear keyframes and added to any
 *   motion already running (`composite: 'add'`), corrected for a scaled
 *   ancestor. Nothing animates height, and nothing scrolls the area.
 * - The changed element plays its own entrance on the same spring, started in
 *   the same frame (`playLayoutChange`), and a disclosure's indicator turns
 *   on it too (`applyLayoutChangeTransition`).
 * - Every pointer (`spec:AST-105` FR5). Under Reduce Motion nothing travels
 *   (`design:reduced-motion` DR1–DR3): a cross-fade under a coarse primary
 *   pointer, an immediate change otherwise.
 * - Without a handle nothing happens: the component keeps its jump
 *   (`spec:AST-105` FR2).
 */

import {motionRole} from './roles';
import {isSpring} from './roleValue';
import {solveSpring, toSpring, type SpringDescription} from './spring';
import {registerSpringsTable, SETTLE_SPRING} from './uikit/springs';
import {reducedMotionCrossFade} from './uikit/timing';

/** The shared motion role (`spec:AST-105` FR4). */
const ROLE_ID = 'springs.settle';
/** Below this many pixels a shift is not worth a move. */
const MIN_SHIFT_PX = 0.5;
/** The touch cross-fade's cap (`design:reduced-motion` DR2). */
const CROSS_FADE_CAP_MS = 200;
/** Keyframes per second the spring is sampled at. */
const SAMPLES_PER_SECOND = 60;

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

/** How a change plays under the reader's settings. */
type LayoutMotion =
  | {readonly kind: 'spring'; readonly progress: SpringProgress}
  | {
      readonly kind: 'fade';
      readonly durationMs: number;
      readonly easing: string;
    }
  | {readonly kind: 'instant'};

/** The settle spring as remaining distance (1 → 0) over its duration. */
interface SpringProgress {
  readonly durationMs: number;
  /** Remaining fraction of the move at `t` ms. */
  remaining(t: number): number;
}

function matches(element: Element, query: string): boolean {
  const view = element.ownerDocument.defaultView;
  return (
    typeof view?.matchMedia === 'function' && view.matchMedia(query).matches
  );
}

/**
 * `springs.settle` from the internal role registry: one shared value for the
 * glide, the changed element and the indicator. Motion roles are internal
 * (`spec:AST-094` DEC-11): no theme, scope or custom property changes it.
 */
function settleSpring(): SpringDescription {
  registerSpringsTable();
  const value = motionRole(ROLE_ID)?.value;
  return isSpring(value) ? value : SETTLE_SPRING;
}

function springProgress(description: SpringDescription): SpringProgress {
  const curve = solveSpring(toSpring(description), {from: 1, to: 0});
  const durationMs = Math.max(1, curve.settleTime(0.001) * 1000);
  return {
    durationMs,
    remaining: t => (t >= durationMs ? 0 : curve.value(t / 1000)),
  };
}

/** The motion a change in `area` plays now. */
function layoutMotion(area: Element): LayoutMotion {
  if (matches(area, '(prefers-reduced-motion: reduce)')) {
    if (!matches(area, '(pointer: coarse)')) {
      return {kind: 'instant'};
    }
    const [x1, y1, x2, y2] = reducedMotionCrossFade.curve;
    return {
      kind: 'fade',
      durationMs: Math.min(
        CROSS_FADE_CAP_MS,
        reducedMotionCrossFade.durationMs,
      ),
      easing: `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`,
    };
  }
  return {kind: 'spring', progress: springProgress(settleSpring())};
}

/** Linear keyframes sampled from the spring, one per frame. */
function sampleKeyframes(
  progress: SpringProgress,
  frame: (remaining: number) => Keyframe,
): Keyframe[] {
  const count = Math.max(
    2,
    Math.ceil((progress.durationMs / 1000) * SAMPLES_PER_SECOND) + 1,
  );
  const keyframes: Keyframe[] = [];
  for (let i = 0; i < count; i++) {
    const offset = i / (count - 1);
    keyframes.push({
      ...frame(progress.remaining(offset * progress.durationMs)),
      offset,
    });
  }
  return keyframes;
}

/** The spring as a CSS `linear()` easing, for a CSS transition. */
function linearEasing(progress: SpringProgress): string {
  const stops: string[] = [];
  const count = 24;
  for (let i = 0; i <= count; i++) {
    const fraction = i / count;
    const value = 1 - progress.remaining(fraction * progress.durationMs);
    stops.push(`${round(value)} ${round(fraction * 100)}%`);
  }
  return `linear(${stops.join(', ')})`;
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

// ---------------------------------------------------------------------------
// Feature tests: each option is tried through `element.animate` itself, so an
// engine that rejects one falls back for that call instead of throwing.
// ---------------------------------------------------------------------------

let supportsComposite: boolean | null = null;

/**
 * Play `keyframes` on `element`, dropping `composite` and then the easing when
 * the engine rejects them. Returns null when Web Animations is missing.
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
 * The opaque handle `useAnimatedLayout` returns (`spec:AST-105` FR1): no
 * public members. A component that receives it reports its size changes to
 * the handle's container, the area the glide stays inside.
 */
export interface AnimatedLayout {
  readonly [AREA]: () => Element | null;
}

/** A handle over `area` (the container element, read when a change runs). */
export function createAnimatedLayout(
  area: () => Element | null,
): AnimatedLayout {
  // Not enumerable and frozen: the handle shows no fields to a caller.
  return Object.freeze(
    Object.defineProperty({}, AREA, {value: area}),
  ) as AnimatedLayout;
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
 * Whether `element` takes part: in flow, rendered, not in the top layer.
 * `display: contents` is handled by the caller.
 */
function takesPart(element: Element, style: CSSStyleDeclaration): boolean {
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.position === 'absolute' ||
    style.position === 'fixed'
  ) {
    return false;
  }
  try {
    if (element.matches(':popover-open, :modal')) {
      return false;
    }
  } catch {
    // An engine without these pseudo-classes has no top layer to skip.
  }
  return true;
}

/**
 * The elements that can shift when `changed` changes size: at each ancestor
 * level up to `area`, every following element sibling. `display: contents` is
 * replaced by its children.
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
    if (takesPart(element, style)) {
      out.push(element);
    }
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
  const motion = layoutMotion(batch.area);
  if (motion.kind === 'instant') {
    return;
  }
  const visible = visibleRect(batch.area);
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
      // Outside the visible part before and after: it lands silently.
      continue;
    }
    if (motion.kind === 'fade') {
      safeAnimate(element, [{opacity: 0}, {opacity: 1}], {
        duration: motion.durationMs,
        easing: motion.easing,
      });
      continue;
    }
    const scale = scaleOf(element, after);
    const x = dx / scale.x;
    const y = dy / scale.y;
    safeAnimate(
      element,
      sampleKeyframes(motion.progress, remaining => ({
        transform: `translate(${x * remaining}px, ${y * remaining}px)`,
      })),
      {
        duration: motion.progress.durationMs,
        easing: 'linear',
        composite: 'add',
      },
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
 * The changed element's own animation, on the same motion as the content
 * after it: content that appears reveals downward from its top edge. Plays
 * only with a handle, inside its area and in the area's visible part.
 */
export function playLayoutChange(
  handle: AnimatedLayout | null | undefined,
  element: Element,
): void {
  if (handle == null) {
    return;
  }
  const area = areaOf(handle, element);
  if (area == null) {
    return;
  }
  if (!intersects(element.getBoundingClientRect(), visibleRect(area))) {
    return;
  }
  const motion = layoutMotion(area);
  if (motion.kind === 'instant') {
    return;
  }
  if (motion.kind === 'fade') {
    safeAnimate(element, [{opacity: 0}, {opacity: 1}], {
      duration: motion.durationMs,
      easing: motion.easing,
    });
    return;
  }
  safeAnimate(
    element,
    sampleKeyframes(motion.progress, remaining => ({
      opacity: 1 - remaining,
      clipPath: `inset(0 0 ${round(remaining * 100)}% 0)`,
    })),
    {duration: motion.progress.durationMs, easing: 'linear'},
  );
}

/**
 * A disclosure's indicator (its chevron) turns on the same motion as the
 * glide: its CSS transition takes the spring as a `linear()` easing, and an
 * immediate change under Reduce Motion. Without a handle the inline values are
 * cleared, so the component's own transition applies. An engine without
 * `linear()` drops that value and keeps the component's easing.
 */
export function applyLayoutChangeTransition(
  handle: AnimatedLayout | null | undefined,
  element: HTMLElement | SVGElement | null,
): void {
  if (element == null) {
    return;
  }
  const area = handle == null ? null : areaOf(handle, element);
  if (area == null) {
    element.style.removeProperty('transition-duration');
    element.style.removeProperty('transition-timing-function');
    return;
  }
  const motion = layoutMotion(area);
  if (motion.kind !== 'spring') {
    element.style.setProperty('transition-duration', '0s');
    element.style.removeProperty('transition-timing-function');
    return;
  }
  element.style.setProperty(
    'transition-duration',
    `${Math.round(motion.progress.durationMs)}ms`,
  );
  element.style.setProperty(
    'transition-timing-function',
    linearEasing(motion.progress),
  );
}

/** @internal For tests: the motion a change in `area` plays. */
export function layoutMotionFor(area: Element): LayoutMotion {
  return layoutMotion(area);
}
