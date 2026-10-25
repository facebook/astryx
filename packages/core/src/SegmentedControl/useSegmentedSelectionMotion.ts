// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedSelectionMotion.ts
 * @input The radiogroup element, the selected value and whether the touch
 *   presentation applies; the motion animator (motion/animator.ts) and the
 *   UIKit constants table (motion/uikit, `segmentedControl`)
 * @output Exports `useSegmentedSelectionMotion` (the React wiring),
 *   `SegmentedSelectionMotion` (the controller), `SURFACE_PROPERTIES` and
 *   `layerVariable` (the custom properties that paint the lens) and the
 *   segment selector: SegmentedControl's touch layer, the selection slide
 *   under a finger
 * @position SegmentedControl's touch layer. Its one import site is
 *   SegmentedControl.tsx, which styles the radiogroup's two pseudo-elements
 *   from these custom properties.
 *
 * WHAT MOVES, AND ON WHICH THREAD
 *
 * UISegmentedControl slides one selection indicator from the old segment to
 * the new one on a spring (`segmentedControl.selectionSpring`), after a tap and
 * after a programmatic change alike. The spring is a motion role: the animator
 * resolves it under the control's theme (UIKit's measured value by default).
 *
 * The selected segment paints its own raised surface at rest, so themes keep
 * styling it as they always have. For the slide the lens takes over: the
 * radiogroup's ::before pseudo-element, decoration with no element of its own
 * (`architecture:component-style-authoring` INV7), painted from custom
 * properties copied from the segment's computed surface. The segment hides its
 * own surface (inline, so a theme rule cannot keep painting it) and the lens
 * springs from the old segment's box to the new one's through the compositor
 * animator: `translate` for the position and `scale` for the width, so nothing
 * lays out or paints per frame and the slide keeps moving while JavaScript is
 * busy. The lens's layout width is the destination's, so it lands at scale 1
 * and hands the surface back to the segment pixel for pixel. A change
 * mid-flight starts from the lens's presented position and width with their
 * velocities (the animator evaluates its curves; the DOM is never read for
 * it). The titles change with the selection, at once.
 *
 * Reduced Motion (`design:reduced-motion`): nothing travels or scales. The
 * slide is handed to the animator as an entrance, so its Reduce Motion
 * cross-fade lands the lens on the new segment and fades it in, while the
 * radiogroup's ::after, painted with the surface that was on screen, fades out
 * where it is on the same clock (a leaving travel the animator fades out in
 * place). On any other pointer both change at once.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.tsx (the pseudo-elements)
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.test.ts
 * - /packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {
  createAnimator,
  type Animator,
  type MotionHandle,
} from '../motion/animator';
import {
  registerSegmentedControlTable,
  segmentedControl,
} from '../motion/uikit/segmented';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {observeResize} from '../utils/sharedResizeObserver';

/** What Reduced Motion makes of a change (Animator.reducedMotion). */
type ReducedMotion = ReturnType<Animator['reducedMotion']>;

/** The segments, in DOM order. */
export const SEGMENT_SELECTOR = '[role="radio"][data-value]';

/** The selected surface's paint, copied into a layer's custom properties. */
export const SURFACE_PROPERTIES: ReadonlyArray<string> = [
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
 * The radiogroup's two pseudo-element layers: the lens (::before) and, under
 * Reduced Motion, the surface that fades out where it is (::after).
 */
export type Layer = 'lens' | 'leaving';

/** Box and visibility of a layer, besides its paint. */
export const LAYER_GEOMETRY: ReadonlyArray<string> = [
  'top',
  'width',
  'height',
  'visibility',
];

/** The custom property on the radiogroup that sets `property` of `layer`. */
export function layerVariable(layer: Layer, property: string): string {
  return `--_segmented-${layer}-${property.replace(/^-+/, '')}`;
}

/**
 * What the destination segment shows while the lens carries its surface.
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

/** A box in the track's padding-box coordinates, in CSS px. */
interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Slide {
  readonly handle: MotionHandle;
  /** The segment whose surface the lens carries (hidden on the segment). */
  readonly destination: HTMLElement;
  /** The lens's layout width: the destination's, so it lands at scale 1. */
  readonly width: number;
  /** The track's layout size when the boxes were measured. */
  readonly trackSize: {readonly width: number; readonly height: number};
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

/** Paints `layer` with `segment`'s computed surface. */
function paintLayer(
  track: HTMLElement,
  layer: Layer,
  segment: HTMLElement,
): void {
  const style = getComputedStyle(segment);
  for (const property of SURFACE_PROPERTIES) {
    track.style.setProperty(
      layerVariable(layer, property),
      style.getPropertyValue(property),
    );
  }
}

/** Copies one layer's paint onto the other. */
function copyLayerPaint(track: HTMLElement, from: Layer, to: Layer): void {
  for (const property of SURFACE_PROPERTIES) {
    track.style.setProperty(
      layerVariable(to, property),
      track.style.getPropertyValue(layerVariable(from, property)),
    );
  }
}

/** Lays `layer` out on `box`'s row, `width` wide, and shows it. */
function placeLayer(
  track: HTMLElement,
  layer: Layer,
  box: Pick<Box, 'y' | 'height'>,
  width: number,
): void {
  track.style.setProperty(layerVariable(layer, 'top'), `${box.y}px`);
  track.style.setProperty(layerVariable(layer, 'width'), `${width}px`);
  track.style.setProperty(layerVariable(layer, 'height'), `${box.height}px`);
  track.style.setProperty(layerVariable(layer, 'visibility'), 'visible');
}

/** Hides `layer` and drops its custom properties. */
function clearLayer(track: HTMLElement, layer: Layer): void {
  for (const property of [...LAYER_GEOMETRY, ...SURFACE_PROPERTIES]) {
    track.style.removeProperty(layerVariable(layer, property));
  }
}

/**
 * Boxes relative to the track's padding box, undoing any scale an ancestor
 * transform applies to the client rects (the lens lays out untransformed).
 */
function boxesIn(track: HTMLElement): (element: HTMLElement) => Box {
  const trackRect = track.getBoundingClientRect();
  // `offsetWidth` is rounded to whole pixels, so a fractional track width
  // reads as a scale a little off 1 even with no transform at all; only a
  // real ancestor transform moves it further than that rounding can.
  const measured =
    track.offsetWidth > 0 && trackRect.width > 0
      ? trackRect.width / track.offsetWidth
      : 1;
  const scale =
    Math.abs(trackRect.width - track.offsetWidth) <= 1 ? 1 : measured;
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
   * The animator for the radiogroup's ::after, the surface that fades out
   * where it is under Reduced Motion; one of its own by default.
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
  private track: HTMLElement | null = null;
  private slide: Slide | null = null;
  /**
   * Segments whose surface the lens carried until a change turned it
   * elsewhere. They stay surface-hidden until it lands: a tap's press is
   * still fading on such a segment, and its paint would cover the lens (which
   * sits under the segments' backgrounds) while the lens is still crossing it.
   */
  private readonly abandoned = new Set<HTMLElement>();
  /** Bumped by every leaving fade; a finished fade clears only its own. */
  private leaving = 0;
  private isLeaving = false;
  private readonly leavingAnimator: Animator;
  private readonly now: () => number;

  constructor(
    private readonly animator: Animator = createAnimator(null, {
      pseudoElement: '::before',
    }),
    options: SegmentedSelectionMotionOptions = {},
  ) {
    // The selection spring is a motion role a theme may retune: registered
    // before the first animation (idempotent; nothing registers on import).
    registerSegmentedControlTable();
    this.now = options.now ?? defaultNow;
    this.leavingAnimator =
      options.leavingAnimator ??
      createAnimator(null, {pseudoElement: '::after'});
  }

  /** Attaches the radiogroup whose pseudo-elements are the lens (null detaches). */
  attachTrack(element: HTMLElement | null): void {
    if (element == null) {
      this.settle();
    }
    this.track = element;
    this.animator.attach(element);
    this.leavingAnimator.attach(element);
  }

  /** True while the lens carries the selected surface. */
  get isSliding(): boolean {
    return this.slide != null;
  }

  /** The selection moved from `from` to `to`; the DOM already shows `to`. */
  select(track: HTMLElement, from: string, to: string): void {
    const segments = Array.from(
      track.querySelectorAll<HTMLElement>(SEGMENT_SELECTOR),
    );
    const find = (value: string) =>
      segments.find(segment => segment.dataset.value === value) ?? null;
    // What Reduced Motion makes of this change (design:reduced-motion).
    this.slideSurface(
      track,
      find(from),
      find(to),
      this.animator.reducedMotion(),
    );
  }

  /** Hands the surface back to its segment now and hides the lens. */
  settle(): void {
    this.endLeaving();
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
    if (this.track != null) {
      clearLayer(this.track, 'lens');
    }
  }

  /**
   * The control resized. A slide aims at boxes measured when it began, so it
   * hands the surface back rather than land somewhere stale, unless the
   * track still has the size it had then: the change itself resized it (a
   * title takes its new weight, and a content-sized control follows), and
   * the boxes were measured after that.
   */
  resized(track: HTMLElement): void {
    const slide = this.slide;
    if (slide == null) {
      return;
    }
    if (
      Math.abs(track.offsetWidth - slide.trackSize.width) < 0.5 &&
      Math.abs(track.offsetHeight - slide.trackSize.height) < 0.5
    ) {
      return;
    }
    this.settle();
  }

  /**
   * Ends everything in flight (unmount). The controller stays usable, so an
   * effect cleanup followed by a setup (StrictMode's extra mount) loses
   * nothing.
   */
  stop(): void {
    this.settle();
  }

  private slideSurface(
    track: HTMLElement,
    origin: HTMLElement | null,
    destination: HTMLElement | null,
    reduced: ReducedMotion,
  ): void {
    if (this.track !== track) {
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
    if (reduced === 'crossfade') {
      // The travel becomes a fade-in at the new segment (below): the surface
      // on screen fades out where it is, on the same clock.
      this.leave(
        track,
        current != null,
        destination,
        {x, width, opacity},
        to,
        at,
      );
    }
    // A segment abandoned mid-flight still has its surface hidden: read its
    // paint with it shown.
    if (this.abandoned.has(destination)) {
      showSurface(destination);
    }
    paintLayer(track, 'lens', destination);
    hideSurface(destination);
    this.abandoned.delete(destination);
    placeLayer(track, 'lens', to, to.width);
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
    this.carry(handle, destination, to.width, {
      width: track.offsetWidth,
      height: track.offsetHeight,
    });
  }

  /**
   * Reduced Motion: the surface on screen (`from`: where it is, how wide, how
   * opaque) fades out where it is on the radiogroup's ::after while the lens
   * fades in on the new segment. It is handed to the animator as a leaving
   * travel, so it fades on the same Reduce Motion clock and lands only once
   * it is invisible.
   */
  private leave(
    track: HTMLElement,
    fromLens: boolean,
    paint: HTMLElement,
    from: {x: number; width: number; opacity: number},
    to: Box,
    at: number | undefined,
  ): void {
    this.endLeaving();
    if (from.opacity <= 0) {
      return;
    }
    if (fromLens) {
      copyLayerPaint(track, 'lens', 'leaving');
    } else {
      paintLayer(track, 'leaving', paint);
    }
    placeLayer(track, 'leaving', to, from.width);
    const id = ++this.leaving;
    this.isLeaving = true;
    const animator = this.leavingAnimator;
    animator.set({x: from.x, scaleX: 1, scaleY: 1, opacity: from.opacity});
    const handle = animator.animate(
      {x: to.x, opacity: 0},
      {spring: segmentedControl.selectionSpring},
      {at},
    );
    void handle.finished.then(() => {
      if (this.leaving === id) {
        this.endLeaving();
      }
    });
  }

  private endLeaving(): void {
    if (!this.isLeaving) {
      return;
    }
    this.isLeaving = false;
    this.leaving++;
    this.leavingAnimator.stop();
    if (this.track != null) {
      clearLayer(this.track, 'leaving');
    }
  }

  /** The lens now carries `destination`'s surface until `handle` lands. */
  private carry(
    handle: MotionHandle,
    destination: HTMLElement,
    width: number,
    trackSize: Slide['trackSize'],
  ): void {
    const slide: Slide = {handle, destination, width, trackSize};
    this.slide = slide;
    void handle.finished.then(finished => {
      if (finished && this.slide === slide) {
        this.settle();
      }
    });
  }
}

/**
 * Wires `SegmentedSelectionMotion` to a SegmentedControl: every change of
 * `value` while `isEnabled` slides the selection, in the commit that shows the
 * new value (no frame shows it unanimated).
 */
export function useSegmentedSelectionMotion(
  trackRef: RefObject<HTMLElement | null>,
  value: string,
  isEnabled: boolean,
): void {
  const [motion] = useState(() => new SegmentedSelectionMotion());
  const previousValueRef = useRef(value);

  // The lens is the radiogroup's own pseudo-elements: the animators attach to
  // it while the touch presentation applies.
  useIsomorphicLayoutEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    motion.attachTrack(trackRef.current);
    return () => motion.attachTrack(null);
  }, [isEnabled, motion, trackRef]);

  useIsomorphicLayoutEffect(() => {
    const from = previousValueRef.current;
    previousValueRef.current = value;
    const track = trackRef.current;
    if (!isEnabled || track == null || from === value) {
      return;
    }
    motion.select(track, from, value);
  }, [isEnabled, motion, trackRef, value]);

  // A slide aims at boxes measured when it began: if the control resizes
  // under it, hand the surface back rather than land somewhere stale.
  useEffect(() => {
    const track = trackRef.current;
    if (!isEnabled || track == null) {
      motion.settle();
      return;
    }
    return observeResize(track, () => motion.resized(track));
  }, [isEnabled, motion, trackRef]);

  useEffect(() => () => motion.stop(), [motion]);
}
