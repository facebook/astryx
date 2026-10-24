// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedSelectionMotion.ts
 * @input The radiogroup element, the selected value and whether the touch
 *   presentation applies; the motion animator (motion/animator.ts) and the
 *   UIKit constants table (motion/uikit, `segmentedControl`)
 * @output Exports `useSegmentedSelectionMotion` (the React wiring) and
 *   `SegmentedSelectionMotion` (the controller): the selection slide and the
 *   segment titles' cross-fade of SegmentedControl's touch presentation, plus
 *   the selectors that find a segment and its title layers
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
 * its curves; the DOM is never read for it).
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
 * Reduced Motion (`design:reduced-motion`): nothing travels or scales. The
 * slide is handed to the animator as an entrance, so its Reduce Motion
 * cross-fade lands the surface on the new segment and fades it in, while a
 * copy of the surface on screen fades out where it is, on the same clock (a
 * leaving travel the animator fades out in place). The titles cross-fade on
 * that clock too, whatever the title cross-fade role says: no theme value
 * keeps a longer animation under Reduced Motion.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.tsx
 * - /packages/core/src/SegmentedControl/SegmentedControlItem.tsx (title layers)
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.test.ts
 * - /packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {
  createAnimator,
  type Animator,
  type MotionHandle,
} from '../motion/animator';
import {reducedMotionFade} from '../motion/reducedMotion';
import {resolveMotion} from '../motion/resolveMotion';
import {segmentedControl} from '../motion/uikit';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {observeResize} from '../utils/sharedResizeObserver';

/** What Reduced Motion makes of a change (Animator.reducedMotion). */
type ReducedMotion = ReturnType<Animator['reducedMotion']>;

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

interface Slide {
  readonly handle: MotionHandle;
  /** The segment whose surface the proxy carries (hidden on the segment). */
  readonly destination: HTMLElement;
  /** The proxy's layout width: the destination's, so it lands at scale 1. */
  readonly width: number;
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

export interface SegmentedSelectionMotionOptions {
  /** The animator's clock (ms, document timeline); `performance.now()` by default. */
  readonly now?: () => number;
  /**
   * The animator for the copy of the surface that fades out where it is
   * under Reduced Motion; one of its own by default.
   */
  readonly leavingAnimator?: Animator;
}

function defaultNow(): number {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

/**
 * The selection motion of one SegmentedControl. Lives outside React's render
 * cycle: nothing here sets state, so a slide never re-renders anything.
 */
export class SegmentedSelectionMotion {
  private proxy: HTMLElement | null = null;
  private slide: Slide | null = null;
  /** Under Reduced Motion, the copy of the surface fading out where it is. */
  private leaving: HTMLElement | null = null;
  private readonly leavingAnimator: Animator;
  /**
   * Segments the lens was headed for when a change turned it elsewhere. They
   * stay surface-hidden until it lands: a tap's press is still fading on such
   * a segment, and its paint would cover the lens (which sits under the
   * segments' backgrounds) while the lens is still crossing it.
   */
  private readonly abandoned = new Set<HTMLElement>();
  private readonly fades = new Map<HTMLElement, TitleFade>();
  private readonly renderings = new WeakMap<HTMLElement, TitleRendering>();

  private readonly now: () => number;

  constructor(
    private readonly animator: Animator = createAnimator(null),
    options: SegmentedSelectionMotionOptions = {},
  ) {
    this.now = options.now ?? defaultNow;
    this.leavingAnimator = options.leavingAnimator ?? createAnimator(null);
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
    return this.slide != null;
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
    const segments = Array.from(
      track.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR),
    );
    const find = (value: string) =>
      segments.find(segment => segment.dataset.value === value) ?? null;
    const origin = find(from);
    const destination = find(to);
    // What Reduced Motion makes of this change (design:reduced-motion): the
    // animator's call, for the surface and the titles alike.
    const reduced = this.animator.reducedMotion();
    this.slideSurface(track, origin, destination, reduced);
    for (const segment of [origin, destination]) {
      if (segment != null) {
        this.crossFadeTitle(segment, reduced);
      }
    }
  }

  /** Hands the surface back to its segment now and hides the proxy. */
  settle(): void {
    this.removeLeaving();
    const slide = this.slide;
    if (slide == null) {
      return;
    }
    this.slide = null;
    this.animator.stop();
    showSurface(slide.destination);
    for (const segment of this.abandoned) {
      showSurface(segment);
    }
    this.abandoned.clear();
    if (this.proxy != null) {
      this.proxy.style.visibility = 'hidden';
      this.proxy.style.removeProperty('transform-origin');
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
    this.settle();
    for (const fade of [...this.fades.values()]) {
      this.endFade(fade);
    }
  }

  private slideSurface(
    track: HTMLElement,
    origin: HTMLElement | null,
    destination: HTMLElement | null,
    reduced: ReducedMotion,
  ): void {
    const proxy = this.proxy;
    if (proxy == null) {
      return;
    }
    const current = this.slide;
    if (destination == null) {
      // Nothing is selected any more: no surface to carry.
      this.settle();
      return;
    }
    if (current == null && origin == null) {
      // Nothing was selected: there is no surface to slide from.
      return;
    }
    const boxOf = boxesIn(track);
    const to = boxOf(destination);
    if (to.width <= 0 || to.height <= 0) {
      // Not laid out (hidden, collapsed): nothing to show moving.
      this.settle();
      return;
    }
    let x: number;
    let width: number;
    let velocityX = 0;
    let velocityWidth = 0;
    let opacity = 1;
    // A slide from rest starts when the browser commits it; one that
    // continues a slide on screen starts now, from the frame on screen.
    let at: number | undefined;
    if (current != null) {
      // Mid-flight: from what is on screen, with its velocity.
      at = this.now();
      x = this.animator.get('x', at);
      width = current.width * this.animator.get('scaleX', at);
      opacity = this.animator.get('opacity', at);
      velocityX = this.animator.getVelocity('x', at);
      velocityWidth = current.width * this.animator.getVelocity('scaleX', at);
      if (current.destination !== destination) {
        this.abandoned.add(current.destination);
      }
    } else {
      const from = boxOf(origin as HTMLElement);
      x = from.x;
      width = from.width;
    }
    copySurface(destination, proxy);
    hideSurface(destination);
    this.abandoned.delete(destination);
    proxy.style.top = `${to.y}px`;
    proxy.style.width = `${to.width}px`;
    proxy.style.height = `${to.height}px`;
    proxy.style.visibility = 'visible';
    proxy.style.removeProperty('transform-origin');
    this.animator.set({x, scaleX: width / to.width, scaleY: 1, opacity: 1});
    const handle = this.animator.animate(
      {x: to.x, scaleX: 1},
      {
        spring: segmentedControl.selectionSpring,
        velocity: {x: velocityX, scaleX: velocityWidth / to.width},
      },
      // Under Reduced Motion the animator lands it on the new segment and
      // fades it in (design:reduced-motion); otherwise this changes nothing.
      {at, crossfadeAs: 'entrance'},
    );
    this.carry(handle, destination, to.width);
    if (reduced === 'crossfade') {
      // The travel became a fade-in at the new segment: the surface that was
      // on screen fades out where it is, on the same clock.
      this.leave(proxy, {x, width, opacity}, to, at);
    }
  }

  /**
   * Reduced Motion: a copy of the surface on screen (`from`: where it is, how
   * wide, how opaque) fades out where it is while the proxy fades in on the
   * new segment. It is handed to the animator as a leaving travel, so it fades
   * on the same Reduce Motion clock and lands only once it is invisible.
   */
  private leave(
    proxy: HTMLElement,
    from: {x: number; width: number; opacity: number},
    to: Box,
    at: number | undefined,
  ): void {
    this.removeLeaving();
    if (from.opacity <= 0 || proxy.parentElement == null) {
      return;
    }
    const copy = proxy.cloneNode(false) as HTMLElement;
    copy.removeAttribute('data-selection-proxy');
    copy.setAttribute('data-selection-leaving', '');
    copy.setAttribute('aria-hidden', 'true');
    copy.style.top = `${to.y}px`;
    copy.style.width = `${from.width}px`;
    copy.style.height = `${to.height}px`;
    copy.style.visibility = 'visible';
    copy.style.removeProperty('transform-origin');
    proxy.after(copy);
    this.leaving = copy;
    const animator = this.leavingAnimator;
    animator.attach(copy);
    animator.set({x: from.x, scaleX: 1, scaleY: 1, opacity: from.opacity});
    const handle = animator.animate(
      {x: to.x, opacity: 0},
      {spring: segmentedControl.selectionSpring},
      {at},
    );
    void handle.finished.then(() => {
      if (this.leaving === copy) {
        this.removeLeaving();
      }
    });
  }

  private removeLeaving(): void {
    const copy = this.leaving;
    if (copy == null) {
      return;
    }
    this.leaving = null;
    this.leavingAnimator.stop();
    this.leavingAnimator.attach(null);
    copy.remove();
  }

  /** The proxy now carries `destination`'s surface until `handle` lands. */
  private carry(
    handle: MotionHandle,
    destination: HTMLElement,
    width: number,
  ): void {
    const slide: Slide = {handle, destination, width};
    this.slide = slide;
    void handle.finished.then(finished => {
      if (finished && this.slide === slide) {
        this.settle();
      }
    });
  }

  private crossFadeTitle(segment: HTMLElement, reduced: ReducedMotion): void {
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
      // Both hold their last frame until the fade is cleaned up: the twin
      // must stay invisible until it is hidden again (on the main thread,
      // possibly late), and the title ends on its resting opacity, so letting
      // either effect lapse would only restyle text in the middle of a slide.
      if (reduced !== 'off') {
        // Reduced Motion: the animator's fade (200 ms on a finger, at once
        // otherwise), whatever the title cross-fade role says
        // (design:reduced-motion DR4).
        const fade = reducedMotionFade(title, {
          prefersReducedMotion: () => true,
          isCoarsePointer: () => reduced === 'crossfade',
        });
        const timing = {
          duration: fade?.duration ?? 0,
          easing: fade?.easing ?? 'linear',
          fill: 'forwards' as const,
        };
        animations.push(
          twin.animate([{opacity: twinFrom}, {opacity: 0}], timing),
          title.animate([{opacity: titleFrom}, {opacity: 1}], timing),
        );
      } else {
        // The clock and curve as the title's theme sets them (motion roles),
        // UIKit's by default.
        const fadeMs = resolveMotion(
          title,
          segmentedControl,
          'labelCrossFadeMs',
        );
        const fadeCurve = resolveMotion(
          title,
          segmentedControl.labelCrossFadeCurve,
        );
        const timing = {
          duration: fadeMs,
          easing: cssCubicBezier(fadeCurve),
          fill: 'forwards' as const,
        };
        animations.push(
          twin.animate([{opacity: twinFrom}, {opacity: 0}], timing),
          title.animate([{opacity: titleFrom}, {opacity: 1}], timing),
        );
      }
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
        if (this.slide != null) {
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

  return {thumbRef: motion.attachProxy};
}
