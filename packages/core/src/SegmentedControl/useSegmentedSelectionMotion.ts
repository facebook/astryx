// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedSelectionMotion.ts
 * @input The radiogroup element, the selected value and whether the touch
 *   presentation applies; the motion animator (motion/animator.ts) and the
 *   UIKit constants table (motion/uikit, `segmentedControl`)
 * @output Exports `useSegmentedSelectionMotion` (the React wiring) and
 *   `SegmentedSelectionMotion` (the controller): the selection slide, the
 *   lens a finger lifts, drags and lets go of, and the segment titles'
 *   cross-fade of SegmentedControl's touch presentation, plus the selectors
 *   that find a segment and its title layers
 * @position Internal to SegmentedControl; used by SegmentedControl.tsx, whose
 *   items render the title layers (SegmentedControlItem.tsx)
 *
 * WHAT MOVES, AND ON WHICH THREAD
 *
 * UISegmentedControl slides one selection indicator from the old segment to
 * the new one on a spring (`segmentedControl.selectionSpring`), after a tap and
 * after a programmatic change alike, and cross-fades the two titles that
 * change rendering over `segmentedControl.labelCrossFadeMs`. Every spring,
 * clock and curve is a motion role: the animator resolves the springs it is
 * handed, and the cross-fade resolves its clock and curve, under the
 * control's theme (UIKit's measured values by default).
 *
 * The selected segment paints its own raised surface at rest, so themes keep
 * styling it as they always have. For the slide, a proxy element (rendered by
 * SegmentedControl, aria-hidden, behind the segments) copies that surface's
 * computed paint, the segment hides its own surface (inline, so a theme rule
 * cannot keep painting it), and the proxy springs from the old segment's box
 * to the new one's through the compositor animator: `translate` for the
 * position and `scale` for the width, so nothing lays out or paints per frame
 * and the slide keeps moving while JavaScript is busy. The proxy's layout width
 * is the destination's, so it lands at scale 1 and hands the surface back to
 * the segment pixel for pixel. A change mid-flight starts from the proxy's
 * presented position and width with their velocities (the animator evaluates
 * its curves; the DOM is never read for it). The proxy scales around its
 * center, so its position (the center) and its size run on separate springs,
 * as UIKit's lens position and bounds do.
 *
 * UNDER A FINGER (useSegmentedTouchTracking.ts reports the touch)
 *
 * - Landing on the selected segment lifts the lens in place: its size grows
 *   by `segmentedControl.liftGrowth` on `liftSpring`.
 * - Dragging from there carries it: its center chases the finger on
 *   `trackingSpring`, no further than `dragOvershoot` past the end segments.
 * - Letting go commits the segment nearest the finger: the lens springs
 *   there on `selectionSpring` and comes back down on `liftSpring`.
 * - A touch that lands on another segment leaves the lens alone until the
 *   finger lifts; then it slides there like any change, lifted for the first
 *   `tapLiftHangMs` of the travel.
 * - A cancelled touch (the page took it to scroll) puts the lens back.
 *
 * The title cross-fade runs on opacity: each title has an aria-hidden twin
 * (a width sizer at rest). The visible title always shows the segment's
 * current rendering; during the fade the twin shows the previous one (its
 * color and weight, remembered at rest) and fades out while the title fades
 * in. A fade interrupted by the next change swaps the two layers' roles and
 * continues from the opacities on screen. A fade that ends while the surface
 * is still travelling keeps its (invisible) twin until the slide lands, so
 * the only main-thread work of a selection change is its first frame and the
 * hand-back's.
 *
 * Reduced Motion: UIKit drops the slide and the lift
 * (`segmentedControl.reducedMotion`): no lift, no chase, and when the
 * selection changes the lens jumps to the new segment and fades and scales
 * in place there (opacity from 0, scale from 0.88, about its center) on the
 * block's clock and curve. The titles still cross-fade, as UIKit's do.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.tsx
 * - /packages/core/src/SegmentedControl/SegmentedControlItem.tsx (title layers)
 * - /packages/core/src/SegmentedControl/useSegmentedTouchTracking.ts
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.test.ts
 * - /packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
  type MotionHandle,
  type MotionValues,
  type SpringTransition,
} from '../motion/animator';
import {cubicBezier} from '../motion/bezier';
import {resolveMotion} from '../motion/resolveMotion';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';
import {segmentedControl} from '../motion/uikit';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {observeResize} from '../utils/sharedResizeObserver';

/** The segments, in DOM order. */
export const SEGMENT_SELECTOR = '[role="radio"][data-value]';
/** A segment's title: the text assistive technology reads. */
export const TITLE_SELECTOR = '[data-segment-title="text"]';
/**
 * The title's twin: a hidden width sizer at rest, the outgoing rendering
 * while the title cross-fades.
 */
export const TITLE_TWIN_SELECTOR = '[data-segment-title="twin"]';

/** The selected surface's paint, copied onto the proxy for a slide. */
const SURFACE_PROPERTIES: ReadonlyArray<string> = [
  'background-color',
  'background-image',
  'background-position',
  'background-size',
  'background-repeat',
  'background-origin',
  'background-clip',
  'box-shadow',
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
  'border-top-width',
  'border-right-width',
  'border-bottom-width',
  'border-left-width',
  'border-top-style',
  'border-right-style',
  'border-bottom-style',
  'border-left-style',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'backdrop-filter',
  '-webkit-backdrop-filter',
];

/**
 * What the destination segment shows while the proxy carries its surface.
 * Written inline with priority so a theme's rule for the selected segment
 * cannot paint a second surface; borders keep their width so nothing moves.
 */
const HIDDEN_SURFACE: ReadonlyArray<readonly [string, string]> = [
  ['background-color', 'transparent'],
  ['background-image', 'none'],
  ['box-shadow', 'none'],
  ['border-top-color', 'transparent'],
  ['border-right-color', 'transparent'],
  ['border-bottom-color', 'transparent'],
  ['border-left-color', 'transparent'],
  ['backdrop-filter', 'none'],
  ['-webkit-backdrop-filter', 'none'],
];

/** A title's rendering: what its twin takes on to fade it out. */
export interface TitleRendering {
  readonly color: string;
  readonly fontWeight: string;
}

/** A box in the track's padding-box coordinates, in CSS px. */
interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Carried {
  /** The segment the proxy is bound for: it lands there at rest. */
  readonly segment: HTMLElement;
  /**
   * The proxy's layout box: the segment's, so it lands at translate 0
   * from the segment and scale 1, the segment's own size.
   */
  readonly box: Box;
  /**
   * The segment whose surface the proxy shows, hidden there meanwhile: the
   * selected one. A touch moves the proxy before the new value comes back,
   * so until then this is still the old selection.
   */
  hidden: HTMLElement;
}

/** A finger's touch, from landing to letting go. */
interface Touch {
  /** The track's geometry when the finger landed (read once). */
  readonly toTrackX: (clientX: number) => number;
  readonly boxes: ReadonlyMap<HTMLElement, Box>;
  /** The segment the finger landed on, if any. */
  readonly origin: HTMLElement | null;
  /** Whether it landed on the selected segment (it carries the lens). */
  readonly carriesLens: boolean;
}

interface TitleFade {
  readonly segment: HTMLElement;
  readonly title: HTMLElement;
  readonly twin: HTMLElement;
  readonly animations: ReadonlyArray<Animation>;
  /**
   * The fade has run its course (the twin holds opacity 0) and is waiting for
   * the slide to land: hiding the twin again restyles text, so it happens in
   * the hand-back's frame instead of in the middle of the slide.
   */
  done: boolean;
}

function cssCubicBezier(points: ReadonlyArray<number>): string {
  return `cubic-bezier(${points.join(', ')})`;
}

function renderingOf(element: HTMLElement): TitleRendering {
  const style = getComputedStyle(element);
  return {color: style.color, fontWeight: style.fontWeight};
}

function hideSurface(segment: HTMLElement): void {
  for (const [property, value] of HIDDEN_SURFACE) {
    segment.style.setProperty(property, value, 'important');
  }
}

function showSurface(segment: HTMLElement): void {
  for (const [property] of HIDDEN_SURFACE) {
    segment.style.removeProperty(property);
  }
}

function copySurface(segment: HTMLElement, proxy: HTMLElement): void {
  const style = getComputedStyle(segment);
  for (const property of SURFACE_PROPERTIES) {
    proxy.style.setProperty(property, style.getPropertyValue(property));
  }
}

/**
 * Boxes relative to the track's padding box, undoing any scale an ancestor
 * transform applies to the client rects (the proxy lays out untransformed).
 */
function boxesIn(track: HTMLElement): (element: HTMLElement) => Box {
  const trackRect = track.getBoundingClientRect();
  const scale =
    track.offsetWidth > 0 && trackRect.width > 0
      ? trackRect.width / track.offsetWidth
      : 1;
  return element => {
    const rect = element.getBoundingClientRect();
    return {
      x: (rect.left - trackRect.left) / scale - track.clientLeft,
      y: (rect.top - trackRect.top) / scale - track.clientTop,
      width: rect.width / scale,
      height: rect.height / scale,
    };
  };
}

function segmentsOf(track: HTMLElement): HTMLElement[] {
  return Array.from(track.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR));
}

function isLaidOut(box: Box): boolean {
  return box.width > 0 && box.height > 0;
}

function center(box: Box): number {
  return box.x + box.width / 2;
}

/** The scale that lifts a lens resting on `box` (UIKit adds, not scales). */
function lifted(box: Box): MotionValues {
  return {
    scaleX: (box.width + segmentedControl.liftGrowth.width) / box.width,
    scaleY: (box.height + segmentedControl.liftGrowth.height) / box.height,
  };
}

/**
 * A timed curve from `from` to `to` over `durationMs` on the cubic-bézier
 * `points`, for the animator to bake.
 */
function timedCurve(
  from: number,
  to: number,
  durationMs: number,
  points: readonly [number, number, number, number],
): MotionCurve {
  const ease = cubicBezier(points);
  const duration = durationMs / 1000;
  const at = (t: number) =>
    t <= 0
      ? from
      : t >= duration
        ? to
        : from + (to - from) * ease(t / duration);
  const step = 1e-4;
  return {
    duration,
    at,
    velocity: t =>
      t <= 0 || t >= duration
        ? 0
        : (at(Math.min(duration, t + step)) - at(Math.max(0, t - step))) /
          (Math.min(duration, t + step) - Math.max(0, t - step)),
  };
}

/**
 * A tap's lift as one curve: from `from` (with `velocity`) up toward `peak`
 * on the lift spring, then from wherever that is at `hang` s back down to 1
 * on the same spring, keeping its velocity.
 */
function liftThenDown(
  liftSpring: SpringDescription,
  from: number,
  peak: number,
  velocity: number,
  hang: number,
): MotionCurve {
  const spring = toSpring(liftSpring);
  const up = solveSpring(spring, {from, to: peak, velocity});
  const down = solveSpring(spring, {
    from: up.value(hang),
    to: 1,
    velocity: up.velocity(hang),
  });
  // Settled to a ten-thousandth of the lens's size: under 0.02 px.
  const tail = Math.min(down.settleTime(1e-4), 4);
  const duration = hang + tail;
  return {
    duration,
    // Exactly the resting size at the end, so the hand-back is exact.
    at: t =>
      t >= duration ? 1 : t <= hang ? up.value(t) : down.value(t - hang),
    velocity: t =>
      t >= duration ? 0 : t <= hang ? up.velocity(t) : down.velocity(t - hang),
  };
}

/** Maps a client x to the track's padding-box x, read once per touch. */
function trackXIn(track: HTMLElement): (clientX: number) => number {
  const rect = track.getBoundingClientRect();
  const scale =
    track.offsetWidth > 0 && rect.width > 0
      ? rect.width / track.offsetWidth
      : 1;
  return clientX => (clientX - rect.left) / scale - track.clientLeft;
}

/** The enabled segment whose center is nearest `x`, or null. */
function nearestEnabled(
  boxes: ReadonlyMap<HTMLElement, Box>,
  x: number,
): HTMLElement | null {
  let best: HTMLElement | null = null;
  let distance = Infinity;
  for (const [segment, box] of boxes) {
    const d = Math.abs(center(box) - x);
    if (d < distance) {
      distance = d;
      best = segment;
    }
  }
  if (
    best != null &&
    (best.hasAttribute('disabled') ||
      best.getAttribute('aria-disabled') === 'true')
  ) {
    return null;
  }
  return best;
}

export interface SegmentedSelectionMotionOptions {
  /** The animator's clock (ms, document timeline); `performance.now()` by default. */
  readonly now?: () => number;
  /** The Reduced Motion preference; `prefers-reduced-motion` by default. */
  readonly prefersReducedMotion?: () => boolean;
}

function defaultNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function defaultPrefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * The selection motion of one SegmentedControl. Lives outside React's render
 * cycle: nothing here sets state, so a slide never re-renders anything.
 */
export class SegmentedSelectionMotion {
  private proxy: HTMLElement | null = null;
  private carried: Carried | null = null;
  /** The motions the hand-back waits for. */
  private readonly running = new Set<MotionHandle>();
  /** A finger holds the lens up. */
  private isLifted = false;
  private touch: Touch | null = null;
  /**
   * The value a touch already moved the lens to: the selection change that
   * follows (the controlled value coming back) only cross-fades the titles.
   */
  private committed: string | null = null;
  private readonly fades = new Map<HTMLElement, TitleFade>();
  private readonly renderings = new WeakMap<HTMLElement, TitleRendering>();

  private readonly now: () => number;
  private readonly prefersReducedMotion: () => boolean;

  constructor(
    private readonly animator: Animator = createAnimator(null),
    options: SegmentedSelectionMotionOptions = {},
  ) {
    this.now = options.now ?? defaultNow;
    this.prefersReducedMotion =
      options.prefersReducedMotion ?? defaultPrefersReducedMotion;
  }

  /** Callback ref for the proxy element; stable. */
  readonly attachProxy = (element: HTMLElement | null): void => {
    if (element == null) {
      this.settle();
    }
    this.proxy = element;
    this.animator.attach(element);
  };

  /** True while the proxy carries the selected surface. */
  get isSliding(): boolean {
    return this.carried != null;
  }

  /**
   * Remembers each segment's title rendering at rest: the outgoing side of
   * that segment's next cross-fade (by then its title already shows the new
   * rendering). Segments mid-fade were remembered when their fade began.
   */
  rememberTitles(track: HTMLElement): void {
    for (const segment of track.querySelectorAll<HTMLElement>(
      SEGMENT_SELECTOR,
    )) {
      if (this.fades.has(segment)) {
        continue;
      }
      const title = segment.querySelector<HTMLElement>(TITLE_SELECTOR);
      if (title != null) {
        this.renderings.set(segment, renderingOf(title));
      }
    }
  }

  /** The selection moved from `from` to `to`; the DOM already shows `to`. */
  select(track: HTMLElement, from: string, to: string): void {
    const segments = segmentsOf(track);
    const find = (value: string) =>
      segments.find(segment => segment.dataset.value === value) ?? null;
    const origin = find(from);
    const destination = find(to);
    for (const segment of [origin, destination]) {
      if (segment != null) {
        this.crossFadeTitle(segment);
      }
    }
    if (this.committed === to) {
      // A touch moved the lens there already; the new selection now paints
      // the surface the proxy carries.
      this.committed = null;
      const carried = this.carried;
      if (
        carried != null &&
        carried.segment === destination &&
        this.proxy != null
      ) {
        if (carried.hidden !== destination) {
          showSurface(carried.hidden);
          copySurface(destination, this.proxy);
          hideSurface(destination);
          carried.hidden = destination;
        }
      }
      return;
    }
    this.committed = null;
    if (destination == null) {
      // Nothing is selected any more: no surface to carry.
      this.settle();
      return;
    }
    if (this.carried == null && origin == null) {
      // Nothing was selected: there is no surface to slide from.
      return;
    }
    const boxOf = boxesIn(track);
    const to_ = boxOf(destination);
    if (!isLaidOut(to_)) {
      this.settle();
      return;
    }
    if (this.prefersReducedMotion()) {
      this.fadeInAt(destination, to_, destination);
      return;
    }
    const from_ = this.carried == null ? boxOf(origin as HTMLElement) : null;
    const at = this.carry(destination, to_, from_, destination);
    // A programmatic or keyboard change: the whole box on the slide spring.
    this.track(
      this.animator.animate(
        {x: 0, scaleX: 1, scaleY: 1},
        this.springFrom({x: 0, scaleX: 1, scaleY: 1}, 'selection'),
        {at},
      ),
    );
  }

  /** A finger landed at `clientX` (a touch, in client px). */
  press(track: HTMLElement, clientX: number): void {
    const segments = segmentsOf(track);
    const boxOf = boxesIn(track);
    const boxes = new Map(segments.map(segment => [segment, boxOf(segment)]));
    const toTrackX = trackXIn(track);
    const x = toTrackX(clientX);
    const origin =
      segments.find(segment => {
        const box = boxes.get(segment) as Box;
        return x >= box.x && x < box.x + box.width;
      }) ?? null;
    const carriesLens =
      origin != null && origin.getAttribute('aria-checked') === 'true';
    this.touch = {toTrackX, boxes, origin, carriesLens};
    if (!carriesLens || origin == null || this.prefersReducedMotion()) {
      return;
    }
    const box = boxes.get(origin) as Box;
    if (!isLaidOut(box)) {
      return;
    }
    const at = this.carry(origin, box, null, origin);
    this.isLifted = true;
    this.track(
      this.animator.animate(lifted(box), this.springFrom(lifted(box), 'lift'), {
        at,
      }),
    );
  }

  /** The finger moved to `clientX`. Only a lens it carries follows. */
  drag(clientX: number): void {
    const touch = this.touch;
    const carried = this.carried;
    if (touch == null || !touch.carriesLens || carried == null) {
      return;
    }
    const centers = [...touch.boxes.values()].map(center);
    const reach = segmentedControl.dragOvershoot;
    const target = Math.min(
      Math.max(touch.toTrackX(clientX), Math.min(...centers) - reach),
      Math.max(...centers) + reach,
    );
    // The center chases the finger; the size stays lifted.
    this.track(
      this.animator.animate(
        {x: target - center(carried.box)},
        this.springFrom({x: target - center(carried.box)}, 'tracking'),
      ),
    );
  }

  /**
   * The finger let go at `clientX`. Moves the lens to the segment nearest
   * the finger and returns that segment's value when it is not the selected
   * one (the caller commits it), else null.
   */
  release(clientX: number): string | null {
    const touch = this.touch;
    this.touch = null;
    if (touch == null) {
      return null;
    }
    const x = touch.toTrackX(clientX);
    const target = nearestEnabled(touch.boxes, x);
    const selected =
      [...touch.boxes.keys()].find(
        segment => segment.getAttribute('aria-checked') === 'true',
      ) ?? null;
    const destination = target ?? selected;
    if (destination == null) {
      this.unlift();
      return null;
    }
    const box = touch.boxes.get(destination) as Box;
    const value =
      destination !== selected ? (destination.dataset.value ?? null) : null;
    if (touch.carriesLens && this.isLifted) {
      // The lifted lens settles on the segment and comes down.
      this.moveLensTo(destination, box, selected ?? destination);
    } else if (value != null && selected != null) {
      // A tap or a drag that started elsewhere: the lens slides from the
      // selected segment, lifted for the first part of the way.
      this.slideLifted(
        destination,
        box,
        touch.boxes.get(selected) as Box,
        selected,
      );
    }
    this.committed = value;
    return value;
  }

  /** The touch was taken away (the page scrolled): the lens goes back. */
  cancel(): void {
    const touch = this.touch;
    this.touch = null;
    if (
      touch == null ||
      !touch.carriesLens ||
      touch.origin == null ||
      !this.isLifted
    ) {
      // Nothing was lifted (Reduce Motion): nothing to put back.
      return;
    }
    const box = touch.boxes.get(touch.origin) as Box;
    this.moveLensTo(touch.origin, box, touch.origin);
  }

  /** Hands the surface back to its segment now and hides the proxy. */
  settle(): void {
    this.isLifted = false;
    const carried = this.carried;
    if (carried == null) {
      return;
    }
    this.carried = null;
    this.running.clear();
    this.animator.stop();
    showSurface(carried.hidden);
    if (this.proxy != null) {
      this.proxy.style.visibility = 'hidden';
    }
    // Fades that finished during the slide restyle their twins now, in the
    // same frame as the hand-back.
    for (const fade of [...this.fades.values()]) {
      if (fade.done) {
        this.endFade(fade);
      }
    }
  }

  /**
   * Ends everything in flight (unmount). The controller stays usable, so an
   * effect cleanup followed by a setup (StrictMode's extra mount) loses
   * nothing; the animator keeps its element until the proxy's ref detaches it.
   */
  stop(): void {
    this.touch = null;
    this.committed = null;
    this.settle();
    for (const fade of [...this.fades.values()]) {
      this.endFade(fade);
    }
  }

  /**
   * Binds the proxy for `segment` with `box` as its layout box, showing
   * `paint`'s surface (the selected segment's), keeping what is on screen:
   * from `from` (a segment's resting box) when nothing was carried, else
   * from the presented geometry, re-based onto the new box with the
   * velocities it had.
   */
  private carry(
    segment: HTMLElement,
    box: Box,
    from: Box | null,
    paint: HTMLElement,
  ): number | undefined {
    const proxy = this.proxy;
    if (proxy == null) {
      return undefined;
    }
    const previous = this.carried;
    let start: MotionValues;
    // Motion already on screen continues from this instant; a start from
    // rest waits for the browser to commit it (the animator's rule).
    let at: number | undefined;
    this.velocity = {};
    if (previous != null) {
      at = this.now();
      const presented = this.presented(previous.box, at);
      start = {
        x: presented.center - center(box),
        scaleX: presented.width / box.width,
        scaleY: presented.height / box.height,
      };
      this.velocity = {
        x: this.animator.getVelocity('x', at),
        scaleX:
          (this.animator.getVelocity('scaleX', at) * previous.box.width) /
          box.width,
        scaleY:
          (this.animator.getVelocity('scaleY', at) * previous.box.height) /
          box.height,
      };
    } else {
      const origin = from ?? box;
      start = {
        x: center(origin) - center(box),
        scaleX: origin.width / box.width,
        scaleY: origin.height / box.height,
      };
    }
    if (previous?.hidden !== paint) {
      if (previous != null) {
        showSurface(previous.hidden);
      }
      copySurface(paint, proxy);
      hideSurface(paint);
    }
    // The layout box sits on the segment's box, so the proxy rests at
    // translate 0 and scale 1; `x` is its center's offset from the box's.
    proxy.style.left = `${box.x}px`;
    proxy.style.top = `${box.y}px`;
    proxy.style.width = `${box.width}px`;
    proxy.style.height = `${box.height}px`;
    proxy.style.visibility = 'visible';
    this.carried = {segment, box, hidden: paint};
    // Opaque, whatever a Reduce Motion fade left.
    this.animator.set({...start, opacity: 1});
    return at;
  }

  /** Velocities captured by the last `carry`, in the new box's units. */
  private velocity: Partial<Record<'x' | 'scaleX' | 'scaleY', number>> = {};

  /** A spring transition that keeps the captured velocities of `values`. */
  private springFrom(
    values: MotionValues,
    kind: 'selection' | 'lift' | 'tracking',
  ): SpringTransition {
    const spring =
      kind === 'selection'
        ? segmentedControl.selectionSpring
        : kind === 'lift'
          ? segmentedControl.liftSpring
          : segmentedControl.trackingSpring;
    const velocity: Record<string, number> = {};
    for (const key of Object.keys(values) as (keyof typeof this.velocity)[]) {
      const v = this.velocity[key];
      if (v != null && v !== 0) {
        velocity[key] = v;
      }
    }
    // A captured velocity is spent by the first call that drives its channel.
    this.velocity = Object.fromEntries(
      Object.entries(this.velocity).filter(([key]) => !(key in values)),
    );
    return Object.keys(velocity).length > 0 ? {spring, velocity} : {spring};
  }

  /** The proxy's presented center and size, from the animator. */
  private presented(
    box: Box,
    at: number,
  ): {center: number; width: number; height: number} {
    return {
      center: center(box) + this.animator.get('x', at),
      width: box.width * this.animator.get('scaleX', at),
      height: box.height * this.animator.get('scaleY', at),
    };
  }

  /** A lifted lens settles on `segment` and comes down. */
  private moveLensTo(segment: HTMLElement, box: Box, paint: HTMLElement): void {
    this.isLifted = false;
    if (!isLaidOut(box)) {
      this.settle();
      return;
    }
    if (this.prefersReducedMotion()) {
      this.fadeInAt(segment, box, this.carried?.hidden ?? paint);
      return;
    }
    const at = this.carry(segment, box, null, this.carried?.hidden ?? paint);
    this.track(
      this.animator.animate({x: 0}, this.springFrom({x: 0}, 'selection'), {
        at,
      }),
    );
    this.track(
      this.animator.animate(
        {scaleX: 1, scaleY: 1},
        this.springFrom({scaleX: 1, scaleY: 1}, 'lift'),
        {reducedMotion: 'instant', at},
      ),
    );
  }

  /** A tap's slide: travels on the slide spring, lifted for a moment. */
  private slideLifted(
    segment: HTMLElement,
    box: Box,
    from: Box,
    paint: HTMLElement,
  ): void {
    if (!isLaidOut(box)) {
      this.settle();
      return;
    }
    if (this.prefersReducedMotion()) {
      this.fadeInAt(segment, box, this.carried?.hidden ?? paint);
      return;
    }
    const at = this.carry(
      segment,
      box,
      this.carried == null ? from : null,
      this.carried?.hidden ?? paint,
    );
    this.track(
      this.animator.animate({x: 0}, this.springFrom({x: 0}, 'selection'), {
        at,
      }),
    );
    // Up on the lift spring and, after the hang, back down on it: one curve
    // known in advance, so the compositor brings the lens down on time even
    // while the main thread is busy.
    const peak = lifted(box);
    // The lift's spring and hang as the control's theme sets them (motion
    // roles), UIKit's by default: the curve is baked here, so it resolves
    // them itself.
    const liftSpring = resolveMotion(this.proxy, segmentedControl.liftSpring);
    const hang =
      resolveMotion(this.proxy, segmentedControl, 'tapLiftHangMs') / 1000;
    const velocityX = this.velocity.scaleX ?? 0;
    const velocityY = this.velocity.scaleY ?? 0;
    this.velocity = {};
    this.track(
      this.animator.play(
        {
          scaleX: liftThenDown(
            liftSpring,
            this.animator.get('scaleX'),
            peak.scaleX as number,
            velocityX,
            hang,
          ),
          scaleY: liftThenDown(
            liftSpring,
            this.animator.get('scaleY'),
            peak.scaleY as number,
            velocityY,
            hang,
          ),
        },
        {at},
      ),
    );
  }

  /**
   * Reduce Motion, as UIKit does it: no travel. The lens jumps to `segment`
   * and fades and scales in place there, its opacity from 0 and its scale
   * from `reducedMotion.scaleFrom` (about its center), on the clock and curve
   * the control's theme sets (UIKit's 0.2 s block by default).
   */
  private fadeInAt(segment: HTMLElement, box: Box, paint: HTMLElement): void {
    const proxy = this.proxy;
    if (proxy == null) {
      return;
    }
    this.isLifted = false;
    this.carry(segment, box, box, paint);
    this.velocity = {};
    const {reducedMotion} = segmentedControl;
    const fadeMs = resolveMotion(proxy, reducedMotion, 'fadeMs');
    const curve = resolveMotion(proxy, reducedMotion.curve);
    const from = reducedMotion.scaleFrom;
    this.animator.set({x: 0, scaleX: from, scaleY: from, opacity: 0});
    this.track(
      this.animator.play(
        {
          opacity: timedCurve(0, 1, fadeMs, curve),
          scaleX: timedCurve(from, 1, fadeMs, curve),
          scaleY: timedCurve(from, 1, fadeMs, curve),
        },
        // This is the Reduce Motion substitution itself: play it as given.
        {reducedMotion: 'keep'},
      ),
    );
  }

  private unlift(): void {
    this.isLifted = false;
    if (this.carried == null) {
      return;
    }
    this.track(
      this.animator.animate(
        {scaleX: 1, scaleY: 1},
        this.springFrom({scaleX: 1, scaleY: 1}, 'lift'),
        {reducedMotion: 'instant'},
      ),
    );
  }

  /** Waits for `handle`; the surface goes back when nothing is left. */
  private track(handle: MotionHandle): void {
    this.running.add(handle);
    void handle.finished.then(() => {
      this.running.delete(handle);
      if (this.running.size === 0 && !this.isLifted && this.touch == null) {
        this.settle();
      }
    });
  }

  private crossFadeTitle(segment: HTMLElement): void {
    const title = segment.querySelector<HTMLElement>(TITLE_SELECTOR);
    const twin = segment.querySelector<HTMLElement>(TITLE_TWIN_SELECTOR);
    if (title == null || twin == null) {
      return;
    }
    const outgoing = this.renderings.get(segment);
    // From now on the title shows the new rendering: the outgoing side of
    // this segment's next change, even if that change interrupts this fade.
    this.renderings.set(segment, renderingOf(title));
    if (outgoing == null) {
      return;
    }
    let twinFrom = 1;
    let titleFrom = 0;
    const running = this.fades.get(segment);
    if (running != null) {
      // The renderings swap layers: the one the title was fading in is the
      // one the twin now fades out, each from the opacity on screen.
      twinFrom = Number(getComputedStyle(running.title).opacity);
      titleFrom = Number(getComputedStyle(running.twin).opacity);
      this.endFade(running);
    }
    twin.style.visibility = 'visible';
    twin.style.color = outgoing.color;
    twin.style.fontWeight = outgoing.fontWeight;
    const animations: Animation[] = [];
    if (typeof twin.animate === 'function') {
      // The clock and curve as the title's theme sets them (motion roles),
      // UIKit's by default.
      const fadeMs = resolveMotion(title, segmentedControl, 'labelCrossFadeMs');
      const fadeCurve = resolveMotion(
        title,
        segmentedControl.labelCrossFadeCurve,
      );
      const timing = {
        duration: fadeMs,
        easing: cssCubicBezier(fadeCurve),
      };
      // Both hold their last frame until the fade is cleaned up: the twin
      // must stay invisible until it is hidden again (on the main thread,
      // possibly late), and the title ends on its resting opacity, so letting
      // either effect lapse would only restyle text in the middle of a slide.
      animations.push(
        twin.animate([{opacity: twinFrom}, {opacity: 0}], {
          ...timing,
          fill: 'forwards',
        }),
        title.animate([{opacity: titleFrom}, {opacity: 1}], {
          ...timing,
          fill: 'forwards',
        }),
      );
    }
    const fade: TitleFade = {segment, title, twin, animations, done: false};
    this.fades.set(segment, fade);
    if (animations.length === 0) {
      this.endFade(fade);
      return;
    }
    animations[0].finished.then(
      () => {
        if (this.fades.get(segment) !== fade) {
          return;
        }
        // Mid-slide, leave the twin at opacity 0 (it is invisible and no
        // wider than the title) until the hand-back: no style or layout work
        // while the surface is still travelling.
        if (this.carried != null) {
          fade.done = true;
        } else {
          this.endFade(fade);
        }
      },
      () => {
        // Cancelled by an interrupting change, which cleaned up.
      },
    );
  }

  private endFade(fade: TitleFade): void {
    for (const animation of fade.animations) {
      animation.cancel();
    }
    fade.twin.style.removeProperty('visibility');
    fade.twin.style.removeProperty('color');
    fade.twin.style.removeProperty('font-weight');
    if (this.fades.get(fade.segment) === fade) {
      this.fades.delete(fade.segment);
    }
  }
}

export interface UseSegmentedSelectionMotionResult {
  /** Callback ref for the proxy that carries the selected surface; stable. */
  readonly thumbRef: (element: HTMLElement | null) => void;
  /** The controller, for the touch tracking that drives the lens. */
  readonly motion: SegmentedSelectionMotion;
}

/**
 * Wires `SegmentedSelectionMotion` to a SegmentedControl: every change of
 * `value` while `isEnabled` slides the selection and cross-fades the titles,
 * in the commit that shows the new value (no frame shows it unanimated).
 */
export function useSegmentedSelectionMotion(
  trackRef: RefObject<HTMLElement | null>,
  value: string,
  isEnabled: boolean,
): UseSegmentedSelectionMotionResult {
  const [motion] = useState(() => new SegmentedSelectionMotion());
  const previousValueRef = useRef(value);

  useIsomorphicLayoutEffect(() => {
    const from = previousValueRef.current;
    previousValueRef.current = value;
    const track = trackRef.current;
    if (!isEnabled || track == null || from === value) {
      return;
    }
    motion.select(track, from, value);
  }, [isEnabled, motion, trackRef, value]);

  // After every commit (and after the slide above): each title's resting
  // rendering, the outgoing side of its next cross-fade.
  useIsomorphicLayoutEffect(() => {
    const track = trackRef.current;
    if (isEnabled && track != null) {
      motion.rememberTitles(track);
    }
  });

  // A slide aims at boxes measured when it began: if the control resizes
  // under it, hand the surface back rather than land somewhere stale.
  useEffect(() => {
    const track = trackRef.current;
    if (!isEnabled || track == null) {
      motion.settle();
      return;
    }
    return observeResize(track, () => motion.settle());
  }, [isEnabled, motion, trackRef]);

  useEffect(() => () => motion.stop(), [motion]);

  return {thumbRef: motion.attachProxy, motion};
}
