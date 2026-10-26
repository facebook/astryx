// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSegmentedSelectionMotion.ts
 * @input The radiogroup element, the selected value and whether the touch
 *   presentation applies; the motion animator (motion/animator.ts), the
 *   UIKit constants table (motion/uikit, `segmentedControl`) and the touch
 *   tracking (useSegmentedTouchTracking.ts)
 * @output Exports `useSegmentedSelectionMotion` (the React wiring, the touch
 *   tracking included), `SegmentedSelectionMotion` (the controller),
 *   `SURFACE_PROPERTIES` and `layerVariable` (the custom properties that paint
 *   the radiogroup's two pseudo-element layers) and the selectors that find a
 *   segment, its title and its icon: SegmentedControl's touch layer, the
 *   selection slide and the lens a finger lifts, drags and lets go of
 * @position SegmentedControl's touch layer. Its one import site is
 *   SegmentedControl.tsx, which styles the radiogroup's ::before and ::after
 *   from these custom properties.
 *
 * WHAT MOVES, AND ON WHICH THREAD
 *
 * UISegmentedControl slides one selection indicator from the old segment to
 * the new one on a spring (`segmentedControl.selectionSpring`), after a tap and
 * after a programmatic change alike. Every spring, clock and curve here is
 * UIKit's measured value, an internal constant of the table: no theme
 * retunes them.
 *
 * The selected segment paints its own raised surface at rest, so themes keep
 * styling it as they always have. For the slide the lens takes over: the
 * radiogroup's ::before pseudo-element, decoration with no element of its own
 * (`architecture:component-style-authoring` INV7), painted from custom
 * properties copied from the segment's computed surface. The segment hides its
 * own surface (inline, so a theme rule cannot keep painting it) and the lens
 * springs from the old segment's box to the new one's through the compositor
 * animator: `translate` for the position and `scale` for the size, so nothing
 * lays out or paints per frame and the slide keeps moving while JavaScript is
 * busy. The lens is laid out on the destination's box, so it lands at
 * translate 0 and scale 1 and hands the surface back to the segment pixel for
 * pixel. It scales around its center, so its position (the center) and its
 * size run on separate springs, as UIKit's lens position and bounds do. A
 * change mid-flight starts from the presented geometry with its velocities
 * (the animator evaluates its curves; the DOM is never read for it). The
 * titles change with the selection, at once.
 *
 * UNDER A FINGER (useSegmentedTouchTracking.ts reports the touch)
 *
 * - Landing on the selected segment lifts the lens in place: its size grows
 *   by twice the theme's `--spacing-3` across and twice its `--spacing-2` down
 *   (`segmentedControl.liftGrowth`, UIKit's 24 × 16 pt, where the spacing
 *   cannot be read) on `liftSpring`, and the radiogroup's ::after, laid out
 *   with the lens and moved with it on the same curves, casts the theme's
 *   elevation shadow (`--shadow-high`), its opacity following the lift on the
 *   same spring, so the raised lens reads as raised over any page. (UIKit's
 *   lens is glass; that material is an open owner decision.) Inside a
 *   scroller the press waits the content-touch delay, as UIScrollView delays
 *   a control's touches.
 * - Dragging from there carries it: its center chases the finger on
 *   `springs.fingerTracking` (the shared `spec:AST-094` FR4 role, which
 *   UISegmentedControl's tracking values match), no further than
 *   `dragOvershoot` past the end segments.
 *   The selected title's colour follows the lens's presented center, moving
 *   to a neighbour only once the center is a quarter of that segment (at
 *   least 8 px) past the boundary (inline, until the commit's own styles take
 *   over); every title keeps its weight until the lift.
 * - Letting go commits the segment nearest the finger: the lens springs
 *   there on `selectionSpring` and comes back down on `liftSpring`.
 * - A touch that lands on another segment leaves the lens alone until the
 *   finger lifts; then it slides there like any change, lifted for the first
 *   `tapLiftHangMs` of the travel. Meanwhile that segment takes the
 *   `segmented-control-item` target's pressed state, its opacity fading to the
 *   state's (0.2 by default) on the `pressedTitle` fade clock (the dim moves
 *   with the finger to another segment) and back on its lift clock; the
 *   segments paint no press of their own there (SegmentedControlItem.tsx
 *   drops the shared press paint under a finger).
 * - The value a finger lets go on is committed through that segment's click.
 *   The commit's titles take their new weights at once, so the lens aims at
 *   the destination's box as it is once the new value shows. A click the
 *   item vetoes sends the lens back at once; otherwise the lens waits for the
 *   value to come back (a parent may adopt it later, after renders that still
 *   show the old one), and goes back only if the slide settles without it.
 * - At the lift the selected colour snaps to the segment nearest the finger,
 *   the one the lift commits, even where the hysteresis had kept it on a
 *   neighbour just past a boundary.
 * - A cancelled touch (the page took it to scroll) puts the lens back.
 *
 * Reduced Motion (`design:reduced-motion`): nothing lifts, chases, travels
 * or scales. The lens never lifts under a finger; every change hands the
 * animator an entrance at the new segment, so its Reduce Motion cross-fade
 * lands the lens there and fades it in (a touch release fades on any pointer),
 * while the radiogroup's ::after, painted with the surface that was on
 * screen, fades out where it is on the same clock. A pressed segment's dim
 * fades on the animator's Reduce Motion fade, whatever its roles say.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/SegmentedControl/SegmentedControl.tsx (the pseudo-elements)
 * - /packages/core/src/SegmentedControl/SegmentedControlItem.tsx (title and icon markers)
 * - /packages/core/src/SegmentedControl/useSegmentedTouchTracking.ts
 * - /packages/core/src/SegmentedControl/useSegmentedSelectionMotion.test.ts
 * - /packages/core/src/SegmentedControl/__tests__/SegmentedControl.interaction.browser.spec.ts
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {
  createAnimator,
  type AnimateOptions,
  type Animator,
  type MotionCurve,
  type MotionHandle,
  type MotionValues,
  type SpringTransition,
} from '../motion/animator';
import {reducedMotionFade} from '../motion/reducedMotion';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';
import {resolveMotion} from '../motion/resolveMotion';
import {
  registerSegmentedTable,
  segmentedControl,
} from '../motion/uikit/segmented';
import {registerSpringsTable, springs} from '../motion/uikit/springs';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {observeResize} from '../utils/sharedResizeObserver';
import {spacingVars} from '../theme/tokens.stylex';
import {useSegmentedTouchTracking} from './useSegmentedTouchTracking';

/** The segments, in DOM order. */
export const SEGMENT_SELECTOR = '[role="radio"][data-value]';
/**
 * The `segmented-control-item` target's pressed state, on the segment a
 * finger dims (an unselected one); its `opacity` is the dim.
 */
const PRESSED_STATE = 'data-pressed';

/**
 * The selected face moves to another segment only once the lens's center is
 * this far past the boundary: a quarter of that segment's width, at least
 * 8 px.
 */
const FACE_HYSTERESIS_RATIO = 0.25;
const FACE_HYSTERESIS_MIN_PX = 8;

/**
 * The dim the pressed state's opacity sets (SegmentedControlItem.tsx gives
 * UIKit's 0.2; a theme may retune it), or UIKit's when it cannot be read.
 */
function pressedOpacityOf(segment: HTMLElement): number {
  const view = segment.ownerDocument.defaultView;
  const opacity =
    view == null ? NaN : parseFloat(view.getComputedStyle(segment).opacity);
  return Number.isFinite(opacity)
    ? opacity
    : segmentedControl.pressedTitle.opacity;
}

/** A segment's title: the text assistive technology reads. */
export const TITLE_SELECTOR = '[data-segment-title]';
/** A segment's icon. */
export const ICON_SELECTOR = '[data-segment-icon]';

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

/** The corner radii: what the lifted lens's shadow takes from the lens. */
const RADII: ReadonlyArray<string> = [
  'border-top-left-radius',
  'border-top-right-radius',
  'border-bottom-right-radius',
  'border-bottom-left-radius',
];

/**
 * The radiogroup's two pseudo-element layers: the lens (::before) and the
 * ::after, which casts the lifted lens's shadow or, under Reduced Motion,
 * shows the surface that fades out where it is.
 */
export type Layer = 'lens' | 'after';

/** Box and visibility of a layer, besides its paint. */
export const LAYER_GEOMETRY: ReadonlyArray<string> = [
  'left',
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

/** A title's face: what a dragging finger moves between titles. */
interface TitleFace {
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
  /** The segment the lens is bound for: it lands there at rest. */
  readonly segment: HTMLElement;
  /**
   * The lens's layout box: the segment's, so it lands at translate 0 from
   * the segment and scale 1, the segment's own size.
   */
  readonly box: Box;
  /**
   * The segment whose surface the lens shows, hidden there meanwhile: the
   * selected one. A touch moves the lens before the new value comes back,
   * so until then this is still the old selection.
   */
  hidden: HTMLElement;
  /** The track's layout size when the box was measured. */
  readonly trackSize: {readonly width: number; readonly height: number};
}

/** A finger's touch, from landing to letting go. */
interface Touch {
  /** The track's geometry when the finger landed (read once). */
  readonly toTrackX: (clientX: number) => number;
  readonly boxes: ReadonlyMap<HTMLElement, Box>;
  /** The segment the finger landed on, if any (the tracker's begin target). */
  readonly origin: HTMLElement | null;
  /** Whether it landed on the selected segment (it carries the lens). */
  readonly carriesLens: boolean;
  /** The segment under the finger now (the tracker's highlight). */
  under: HTMLElement | null;
  /** Whether the press is on (at once, or after a scroller's delay). */
  isPressed: boolean;
  /** The selected title's face and an unselected one, read at landing. */
  readonly faces: {
    readonly selected: TitleFace;
    readonly unselected: TitleFace;
  } | null;
}

/**
 * The motion a release starts once its commit's click has run: on the
 * destination's box as it is when the new value shows (the titles' new
 * weights move the segments), or on the box measured at landing while the
 * value has not come back.
 */
interface Pending {
  readonly destination: HTMLElement;
  /** The destination's box when the finger landed. */
  readonly box: Box;
  /** The lifted lens settles there; otherwise it slides from `from`. */
  readonly isLifted: boolean;
  /** The selected segment's box: where a tap's slide starts. */
  readonly from: Box | null;
}

function cssCubicBezier(points: ReadonlyArray<number>): string {
  return `cubic-bezier(${points.join(', ')})`;
}

function faceOf(element: HTMLElement): TitleFace {
  const style = getComputedStyle(element);
  return {color: style.color, fontWeight: style.fontWeight};
}

/**
 * A hidden segment's own inline declarations (its `style`) for the properties
 * `hideSurface` overrides: value and priority, restored by `showSurface`.
 */
const ownSurface = new WeakMap<
  HTMLElement,
  ReadonlyArray<readonly [property: string, value: string, priority: string]>
>();

function hideSurface(segment: HTMLElement): void {
  if (!ownSurface.has(segment)) {
    ownSurface.set(
      segment,
      HIDDEN_SURFACE.map(([property]) => [
        property,
        segment.style.getPropertyValue(property),
        segment.style.getPropertyPriority(property),
      ]),
    );
  }
  for (const [property, value] of HIDDEN_SURFACE) {
    segment.style.setProperty(property, value, 'important');
  }
}

/** Gives a hidden segment its surface back, its own inline values included. */
function showSurface(segment: HTMLElement): void {
  const own = ownSurface.get(segment);
  if (own == null) {
    return;
  }
  ownSurface.delete(segment);
  for (const [property, value, priority] of own) {
    if (value === '') {
      segment.style.removeProperty(property);
    } else {
      segment.style.setProperty(property, value, priority);
    }
  }
}

/**
 * Paints `layer` with `segment`'s computed surface. Every value is read
 * before any is written: a write to the track's style makes the next read
 * from a computed style recompute it, so interleaving them restyled the
 * control once per property.
 */
function paintLayer(
  track: HTMLElement,
  layer: Layer,
  segment: HTMLElement,
): void {
  const style = getComputedStyle(segment);
  const values = SURFACE_PROPERTIES.map(property =>
    style.getPropertyValue(property),
  );
  SURFACE_PROPERTIES.forEach((property, index) => {
    track.style.setProperty(layerVariable(layer, property), values[index]);
  });
}

/** Copies the lens's paint onto the ::after. */
function copyLensPaint(track: HTMLElement): void {
  for (const property of SURFACE_PROPERTIES) {
    track.style.setProperty(
      layerVariable('after', property),
      track.style.getPropertyValue(layerVariable('lens', property)),
    );
  }
}

/**
 * Paints the ::after as the lens's shadow: the lens's corners, no fill and
 * no border, and the theme's elevation shadow (the stylesheet's default for
 * an unset box-shadow, in SegmentedControl.tsx).
 */
function paintShadow(track: HTMLElement): void {
  for (const property of SURFACE_PROPERTIES) {
    track.style.removeProperty(layerVariable('after', property));
  }
  for (const property of RADII) {
    track.style.setProperty(
      layerVariable('after', property),
      track.style.getPropertyValue(layerVariable('lens', property)),
    );
  }
}

/** Lays `layer` out on `box` and shows it. */
function placeLayer(track: HTMLElement, layer: Layer, box: Box): void {
  track.style.setProperty(layerVariable(layer, 'left'), `${box.x}px`);
  track.style.setProperty(layerVariable(layer, 'top'), `${box.y}px`);
  track.style.setProperty(layerVariable(layer, 'width'), `${box.width}px`);
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
 * The scale an ancestor transform applies to the track's client rects. The
 * lens lays out untransformed. `offsetWidth` is rounded to whole pixels, so a
 * fractional track width reads as a scale a little off 1 with no transform at
 * all; only a real transform moves it further than that rounding can.
 */
function scaleOf(track: HTMLElement, rect: DOMRect): number {
  if (track.offsetWidth <= 0 || rect.width <= 0) {
    return 1;
  }
  return Math.abs(rect.width - track.offsetWidth) <= 1
    ? 1
    : rect.width / track.offsetWidth;
}

/** Boxes relative to the track's padding box. */
function boxesIn(track: HTMLElement): (element: HTMLElement) => Box {
  const trackRect = track.getBoundingClientRect();
  const scale = scaleOf(track, trackRect);
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

/** Maps a client x to the track's padding-box x, read once per touch. */
function trackXIn(track: HTMLElement): (clientX: number) => number {
  const rect = track.getBoundingClientRect();
  const scale = scaleOf(track, rect);
  return clientX => (clientX - rect.left) / scale - track.clientLeft;
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

/** Whether two boxes are the same to a quarter of a pixel. */
function isSameBox(a: Box, b: Box): boolean {
  return (
    Math.abs(a.x - b.x) < 0.25 &&
    Math.abs(a.y - b.y) < 0.25 &&
    Math.abs(a.width - b.width) < 0.25 &&
    Math.abs(a.height - b.height) < 0.25
  );
}

/** The scale that lifts a lens resting on `box` (UIKit adds, not scales). */
/**
 * A length token's value in px on `element`, as its theme sets it (a `px` or
 * `rem` length), or `fallback` when it is not one.
 */
function lengthTokenPx(
  element: Element | null,
  token: string,
  fallback: number,
): number {
  const name = /^var\((--[^,)\s]+)/.exec(token)?.[1];
  const view = element?.ownerDocument.defaultView;
  if (element == null || name == null || view == null) {
    return fallback;
  }
  const raw = view.getComputedStyle(element).getPropertyValue(name).trim();
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(raw);
  if (match == null) {
    return fallback;
  }
  const value = parseFloat(match[1]);
  if (match[2] === 'px') {
    return value;
  }
  const root = parseFloat(
    view.getComputedStyle(element.ownerDocument.documentElement).fontSize,
  );
  return value * (Number.isFinite(root) && root > 0 ? root : 16);
}

/**
 * How much a finger lifts the lens, px added to its resting size: twice the
 * theme's `--spacing-3` across and twice its `--spacing-2` down (UIKit's
 * 24 × 16 pt at the default spacing), so a theme's spacing retunes it.
 */
function liftGrowthOf(element: Element | null): {
  width: number;
  height: number;
} {
  return {
    width:
      2 *
      lengthTokenPx(
        element,
        spacingVars['--spacing-3'],
        segmentedControl.liftGrowth.width / 2,
      ),
    height:
      2 *
      lengthTokenPx(
        element,
        spacingVars['--spacing-2'],
        segmentedControl.liftGrowth.height / 2,
      ),
  };
}

function lifted(
  box: Box,
  growth: {readonly width: number; readonly height: number},
): MotionValues {
  return {
    scaleX: (box.width + growth.width) / box.width,
    scaleY: (box.height + growth.height) / box.height,
  };
}

/** The values the lens's shadow moves with it: its geometry, not opacity. */
function geometryOf(values: MotionValues): MotionValues {
  const {opacity: _opacity, ...geometry} = values;
  return geometry;
}

/**
 * A tap's lift as one curve: from `from` (with `velocity`) up toward `peak`
 * on the lift spring, then from wherever that is at `hang` s back down to
 * `rest` on the same spring, keeping its velocity. The lens's scale rests at
 * 1; its shadow's opacity rests at 0.
 */
function liftThenDown(
  liftSpring: SpringDescription,
  from: number,
  peak: number,
  velocity: number,
  hang: number,
  rest = 1,
): MotionCurve {
  const spring = toSpring(liftSpring);
  const up = solveSpring(spring, {from, to: peak, velocity});
  const down = solveSpring(spring, {
    from: up.value(hang),
    to: rest,
    velocity: up.velocity(hang),
  });
  // Settled to a ten-thousandth of the lens's size: under 0.02 px.
  const tail = Math.min(down.settleTime(1e-4), 4);
  const duration = hang + tail;
  return {
    duration,
    // Exactly the resting value at the end, so the hand-back is exact.
    at: t =>
      t >= duration ? rest : t <= hang ? up.value(t) : down.value(t - hang),
    velocity: t =>
      t >= duration ? 0 : t <= hang ? up.velocity(t) : down.velocity(t - hang),
  };
}

function isEnabledSegment(segment: HTMLElement): boolean {
  return (
    !segment.hasAttribute('disabled') &&
    segment.getAttribute('aria-disabled') !== 'true'
  );
}

function titleOf(segment: HTMLElement): HTMLElement | null {
  return segment.querySelector<HTMLElement>(TITLE_SELECTOR);
}

/** What a press dims on a segment: its title and icon, as UIKit's label and image. */
export interface SegmentedSelectionMotionOptions {
  /** The animator's clock (ms, document timeline); `performance.now()` by default. */
  readonly now?: () => number;
  /**
   * The animator for the radiogroup's ::after (the lifted lens's shadow, or
   * the surface that fades out under Reduced Motion); one of its own by
   * default.
   */
  readonly afterAnimator?: Animator;
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
  private carried: Carried | null = null;
  /**
   * Segments whose surface the lens carried until a change turned it
   * elsewhere. They stay surface-hidden until it lands: a tap's press is
   * still fading on such a segment, and its paint would cover the lens (which
   * sits under the segments' backgrounds) while the lens is still crossing it.
   */
  private readonly abandoned = new Set<HTMLElement>();
  /** The segment whose title a press on it dims (the lens is elsewhere). */
  private pressedTitle: HTMLElement | null = null;
  /** Each segment's running dim or return (its title and icon). */
  private readonly titleDims = new Map<HTMLElement, Animation[]>();
  /** The segment showing the selected face under a dragging finger. */
  private facedSegment: HTMLElement | null = null;
  /** The frame request that keeps the face on the lens while it is carried. */
  private lensFrame: number | null = null;
  /** Titles wearing another face for the drag (inline weight and color). */
  private readonly faceOverrides = new Set<HTMLElement>();
  /** The motions the hand-back waits for. */
  private readonly running = new Set<MotionHandle>();
  /** A finger holds the lens up. */
  private isLifted = false;
  private touch: Touch | null = null;
  /**
   * The value a touch already moved the lens to: the selection change that
   * follows (the controlled value coming back) re-aims the lens.
   */
  private committed: string | null = null;
  /**
   * The commit's click ran without a veto: the lens waits for the value
   * until the slide settles.
   */
  private isAwaitingValue = false;
  /** The motion a release starts once its commit's click has run. */
  private pending: Pending | null = null;
  /** What the ::after shows: the lens's shadow, the leaving surface, or nothing. */
  private afterRole: 'shadow' | 'leaving' | null = null;
  /** Bumped by every leaving fade; a finished fade clears only its own. */
  private leaving = 0;

  private readonly now: () => number;
  /** The ::after: the lens's shadow, or the surface fading out. */
  private readonly after: Animator;

  constructor(
    private readonly animator: Animator = createAnimator(null, {
      pseudoElement: '::before',
    }),
    options: SegmentedSelectionMotionOptions = {},
  ) {
    // The chase plays the shared role `springs.fingerTracking`, and the
    // slide, the lift and the pressed title play the segmented roles
    // (`spec:AST-094` FR4): registered before the first animation
    // (idempotent; nothing registers on import).
    registerSpringsTable();
    registerSegmentedTable();
    this.now = options.now ?? defaultNow;
    this.after =
      options.afterAnimator ??
      createAnimator(null, {pseudoElement: '::after', initial: {opacity: 0}});
  }

  /** Attaches the radiogroup whose pseudo-elements are the lens (null detaches). */
  attachTrack(element: HTMLElement | null): void {
    if (element !== this.track) {
      this.settle();
    }
    this.track = element;
    this.animator.attach(element);
    this.after.attach(element);
  }

  /** True while the lens carries the selected surface. */
  get isSliding(): boolean {
    return this.carried != null;
  }

  /** The segment that commits `value`, if the track has one. */
  segmentFor(track: HTMLElement, value: string): HTMLElement | null {
    return (
      segmentsOf(track).find(segment => segment.dataset.value === value) ?? null
    );
  }

  /** The selection moved from `from` to `to`; the DOM already shows `to`. */
  select(track: HTMLElement, from: string, to: string): void {
    if (this.track !== track) {
      return;
    }
    const origin = this.segmentFor(track, from);
    const destination = this.segmentFor(track, to);
    const isTouchCommit = this.committed === to;
    // The commit's own styles take over from a drag's borrowed faces.
    this.clearFaces();
    this.committed = null;
    this.isAwaitingValue = false;
    if (isTouchCommit) {
      if (this.pending?.destination === destination && destination != null) {
        // Adopted during the click: the lens moves now, on the box the
        // destination has with the new value shown.
        this.startPending(destination, boxesIn(track)(destination));
      }
      // The new selection now paints the surface the lens carries, and its
      // titles' weights may have moved the segments since the lens set off.
      const carried = this.carried;
      if (carried != null && carried.segment === destination) {
        if (carried.hidden !== destination) {
          showSurface(carried.hidden);
          paintLayer(track, 'lens', destination);
          hideSurface(destination);
          carried.hidden = destination;
        }
        this.reaim(track, destination);
      }
      return;
    }
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
    const from_ = this.carried == null ? boxOf(origin as HTMLElement) : null;
    if (this.animator.reducedMotion() !== 'off') {
      this.crossFadeTo(destination, to_, from_, destination, false);
      return;
    }
    const at = this.carry(destination, to_, from_, destination);
    // A programmatic or keyboard change: the whole box on the slide spring.
    this.springLens(
      {x: 0, scaleX: 1, scaleY: 1},
      this.springFrom({x: 0, scaleX: 1, scaleY: 1}, 'selection'),
      {at},
    );
  }

  /**
   * A finger landed on `origin`, the segment the action-group tracker
   * resolved for it (null: none): the track's geometry and title faces, read
   * once.
   */
  begin(track: HTMLElement, origin: HTMLElement | null): void {
    const segments = segmentsOf(track);
    const boxOf = boxesIn(track);
    const boxes = new Map(segments.map(segment => [segment, boxOf(segment)]));
    const toTrackX = trackXIn(track);
    const selected =
      segments.find(
        segment => segment.getAttribute('aria-checked') === 'true',
      ) ?? null;
    const carriesLens = origin != null && origin === selected;
    const selectedTitle = selected != null ? titleOf(selected) : null;
    // An enabled segment's unselected face: a disabled title has its own.
    const other = segments.find(
      segment => segment !== selected && isEnabledSegment(segment),
    );
    const otherTitle = other != null ? titleOf(other) : null;
    const faces =
      selectedTitle != null && otherTitle != null
        ? {selected: faceOf(selectedTitle), unselected: faceOf(otherTitle)}
        : null;
    this.touch = {
      toTrackX,
      boxes,
      origin,
      carriesLens,
      faces,
      under: origin,
      isPressed: false,
    };
  }

  /**
   * The segment under the finger changed (the tracker's highlight; null
   * between or off the segments). A carried lens's selected face moves there
   * at once; otherwise the pressed title's dim does, once the press is on.
   */
  highlight(segment: HTMLElement | null): void {
    const touch = this.touch;
    if (touch == null) {
      return;
    }
    touch.under = segment;
    if (!touch.carriesLens && touch.isPressed) {
      this.pressTitle(segment);
    }
    // A carried lens's selected face follows the lens, not the finger
    // (followLens).
  }

  /**
   * The press is on: at touch-down, or once a scroller's content-touch
   * delay has run out. Lifts the lens when the finger is on the selected
   * segment, casting the theme's elevation shadow.
   */
  lift(): void {
    const touch = this.touch;
    if (touch == null) {
      return;
    }
    touch.isPressed = true;
    if (!touch.carriesLens) {
      // The lens stays on the selected segment; the pressed title dims.
      this.pressTitle(touch.under);
      return;
    }
    // Reduced Motion: a lift is a scale, which nothing may play (and which
    // has no fade of its own): the lens stays where it is.
    if (
      touch.origin == null ||
      this.isLifted ||
      this.animator.reducedMotion() !== 'off'
    ) {
      return;
    }
    const box = touch.boxes.get(touch.origin) as Box;
    if (!isLaidOut(box)) {
      return;
    }
    const at = this.carry(touch.origin, box, null, touch.origin);
    this.isLifted = true;
    const peak = lifted(box, liftGrowthOf(this.track));
    this.springLens(peak, this.springFrom(peak, 'lift'), {at});
    this.trackHandle(
      this.after.animate(
        {opacity: 1},
        {spring: segmentedControl.liftSpring},
        {at},
      ),
    );
  }

  /** The finger moved to `clientX`. Only a lens it carries follows. */
  drag(clientX: number): void {
    const touch = this.touch;
    if (touch == null) {
      return;
    }
    if (!touch.carriesLens) {
      // The press is on as soon as the finger moves (a scroller's delay
      // ends there); its dim follows the tracker's highlight.
      this.lift();
      return;
    }
    // A drag that starts before the press is on (a scroller's delay) lifts
    // the lens as it takes the touch.
    this.lift();
    this.chase(clientX);
    this.followLens();
  }

  /**
   * The selected face follows the lifted lens: the segment the lens's
   * presented center is over, with hysteresis around each boundary (a
   * quarter of the segment's width, at least 8 px), so a finger resting on a
   * boundary never flips it back and forth. It runs every frame while a
   * lifted lens is carried, so the face keeps up as the lens settles under a
   * still finger.
   */
  private followLens(): void {
    const touch = this.touch;
    const carried = this.carried;
    if (
      touch == null ||
      !touch.carriesLens ||
      !this.isLifted ||
      carried == null ||
      touch.origin == null
    ) {
      this.lensFrame = null;
      return;
    }
    const lensCenter = this.presented(carried.box, this.now()).center;
    const spans = [...touch.boxes.entries()]
      .filter(([segment]) => isEnabledSegment(segment))
      .sort((a, b) => a[1].x - b[1].x);
    const current = this.facedSegment ?? touch.origin;
    const at = spans.findIndex(([segment]) => segment === current);
    if (at >= 0) {
      const edge = (i: number) =>
        (spans[i][1].x + spans[i][1].width + spans[i + 1][1].x) / 2;
      let next = at;
      while (next + 1 < spans.length && lensCenter > edge(next)) {
        next += 1;
      }
      while (next > 0 && lensCenter < edge(next - 1)) {
        next -= 1;
      }
      if (next !== at) {
        const boundary = next > at ? edge(at) : edge(at - 1);
        const hysteresis = Math.max(
          FACE_HYSTERESIS_MIN_PX,
          FACE_HYSTERESIS_RATIO * spans[next][1].width,
        );
        if (Math.abs(lensCenter - boundary) >= hysteresis) {
          const segment = spans[next][0];
          this.showFaceAt(segment === touch.origin ? null : segment);
        }
      }
    }
    const view = this.track?.ownerDocument.defaultView;
    if (this.lensFrame == null && view != null) {
      this.lensFrame = view.requestAnimationFrame(() => {
        this.lensFrame = null;
        this.followLens();
      });
    }
  }

  /** The lifted lens's center chases the finger at `clientX`. */
  private chase(clientX: number): void {
    const touch = this.touch;
    const carried = this.carried;
    if (touch == null || carried == null) {
      return;
    }
    const centers = [...touch.boxes.values()].map(center);
    const reach = segmentedControl.dragOvershoot;
    const target = Math.min(
      Math.max(touch.toTrackX(clientX), Math.min(...centers) - reach),
      Math.max(...centers) + reach,
    );
    // The center chases the finger; the size stays lifted. Each chase starts
    // at the call (an explicit start): a call from rest waits for the
    // browser to start it, and on Android Chrome, whose touch moves arrive
    // once a frame, the next move came before that start was known, so every
    // move started the chase from rest again and the lens stuck to its
    // segment until the finger stopped (or followed it, when the start came
    // in time).
    const at = this.now();
    this.springLens(
      {x: target - center(carried.box)},
      this.springFrom({x: target - center(carried.box)}, 'tracking'),
      {at},
    );
  }

  /**
   * The finger let go on `target`, the segment the tracker resolved for it
   * (null: none, or a disabled one). Moves the lens there and returns its
   * value when it is not the selected one (the tracker's lift commits it
   * through its click), else null.
   */
  release(target: HTMLElement | null): string | null {
    const touch = this.touch;
    this.touch = null;
    if (touch == null) {
      return null;
    }
    const selected =
      [...touch.boxes.keys()].find(
        segment => segment.getAttribute('aria-checked') === 'true',
      ) ?? null;
    // A disabled segment never commits: the lens settles back on the
    // selection.
    const destination =
      (target != null && isEnabledSegment(target) ? target : null) ?? selected;
    if (destination == null) {
      this.releaseTitle();
      this.clearFaces();
      this.unlift();
      return null;
    }
    const box = touch.boxes.get(destination) as Box;
    const value =
      destination !== selected ? (destination.dataset.value ?? null) : null;
    // The pressed title comes back on the lift's clock; a drag's borrowed
    // face stays only if the lift commits (the commit takes it over).
    this.releaseTitle();
    if (value == null) {
      this.clearFaces();
    }
    const isLifted = touch.carriesLens && this.isLifted;
    this.committed = value;
    this.isAwaitingValue = false;
    if (value == null) {
      if (isLifted) {
        // The lifted lens settles back on the selection and comes down.
        this.moveLensTo(destination, box, selected ?? destination);
      }
      return null;
    }
    // The commit follows at once, through the segment's click; the lens
    // moves once it has run, on the box the destination has then. A lifted
    // lens settles there; a tap (or a drag that started elsewhere) slides
    // there from the selected segment, lifted for the first part of the way.
    if (isLifted || selected != null) {
      this.pending = {
        destination,
        box,
        isLifted,
        from:
          !isLifted && selected != null
            ? (touch.boxes.get(selected) as Box)
            : null,
      };
    }
    return value;
  }

  /**
   * The commit's click for `value` has run. A cancelled click (the item's
   * `onClick` vetoed it) sends the lens back at once; otherwise the lens
   * waits for the value, which a parent may adopt later.
   */
  clicked(track: HTMLElement, value: string, isCancelled: boolean): void {
    if (this.committed !== value) {
      // Adopted during the click, or superseded.
      return;
    }
    if (isCancelled) {
      this.pending = null;
      this.decline(track, value);
      return;
    }
    this.isAwaitingValue = true;
    // React may render the click's change only once the event that
    // dispatched it is over (a click inside a touch handler is batched with
    // it): give it that turn. Adopted then, the lens has already moved on
    // the new box; otherwise it heads for the box measured at landing and
    // re-aims when the value comes back.
    queueMicrotask(() => {
      if (this.committed === value && this.pending != null) {
        this.startPending(this.selectedIn(track));
      }
    });
  }

  /**
   * The value the finger let go on was not adopted (the item's `onClick`
   * vetoed it, or a controlled parent kept its value): the lens goes back to
   * the selected segment, and the next change to that value slides as any
   * change does.
   */
  decline(track: HTMLElement, value: string): void {
    if (this.committed !== value) {
      return;
    }
    this.committed = null;
    this.isAwaitingValue = false;
    this.pending = null;
    this.clearFaces();
    const selected =
      segmentsOf(track).find(
        segment => segment.getAttribute('aria-checked') === 'true',
      ) ?? null;
    if (selected == null || this.carried == null) {
      this.settle();
      return;
    }
    const box = boxesIn(track)(selected);
    if (!isLaidOut(box)) {
      this.settle();
      return;
    }
    this.moveLensTo(selected, box, selected);
  }

  /** The touch was taken away (the page scrolled): the lens goes back. */
  cancel(): void {
    const touch = this.touch;
    this.touch = null;
    this.pressTitle(null);
    this.clearFaces();
    if (
      touch == null ||
      !touch.carriesLens ||
      touch.origin == null ||
      !this.isLifted
    ) {
      // Nothing was lifted: nothing to put back.
      return;
    }
    const box = touch.boxes.get(touch.origin) as Box;
    this.moveLensTo(touch.origin, box, touch.origin);
  }

  /** Hands the surface back to its segment now and hides the lens. */
  settle(): void {
    this.endLeaving();
    this.isLifted = false;
    this.pending = null;
    const carried = this.carried;
    if (carried == null) {
      return;
    }
    this.carried = null;
    this.running.clear();
    this.animator.stop();
    this.after.stop();
    showSurface(carried.hidden);
    for (const segment of this.abandoned) {
      showSurface(segment);
    }
    this.abandoned.clear();
    if (this.track != null) {
      clearLayer(this.track, 'lens');
      clearLayer(this.track, 'after');
    }
    this.afterRole = null;
  }

  /**
   * The control resized. The lens aims at boxes measured when its motion
   * began, so it hands the surface back rather than land somewhere stale,
   * unless the track still has the size it had then (the change itself
   * resized it: a title takes its new weight, and a content-sized control
   * follows, and the box was measured after that) or a finger holds it.
   */
  resized(track: HTMLElement): void {
    const carried = this.carried;
    // A finger holding the lens reflows the titles itself (the selected face
    // moves to the title under it): the lens follows the finger, and the
    // commit measures the destination again.
    if (carried == null || this.touch != null) {
      return;
    }
    if (
      Math.abs(track.offsetWidth - carried.trackSize.width) < 0.5 &&
      Math.abs(track.offsetHeight - carried.trackSize.height) < 0.5
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
    this.touch = null;
    if (this.lensFrame != null) {
      this.track?.ownerDocument.defaultView?.cancelAnimationFrame(
        this.lensFrame,
      );
      this.lensFrame = null;
    }
    this.committed = null;
    this.isAwaitingValue = false;
    this.clearFaces();
    this.pressedTitle?.removeAttribute(PRESSED_STATE);
    this.pressedTitle = null;
    for (const animations of this.titleDims.values()) {
      for (const animation of animations) {
        animation.cancel();
      }
    }
    this.titleDims.clear();
    this.settle();
  }

  /** The selected segment, as the DOM shows it now. */
  private selectedIn(track: HTMLElement): HTMLElement | null {
    return (
      segmentsOf(track).find(
        segment => segment.getAttribute('aria-checked') === 'true',
      ) ?? null
    );
  }

  /**
   * Starts the motion the release left pending: on `box` (the destination's
   * box now) or the box measured at landing, showing `paint`'s surface (the
   * selected segment's).
   */
  private startPending(paint: HTMLElement | null, box?: Box): void {
    const pending = this.pending;
    this.pending = null;
    if (pending == null) {
      return;
    }
    const to = box ?? pending.box;
    const surface = this.carried?.hidden ?? paint ?? pending.destination;
    if (pending.isLifted) {
      this.moveLensTo(pending.destination, to, surface);
    } else if (pending.from != null) {
      this.slideLifted(pending.destination, to, pending.from, surface);
    }
  }

  /**
   * Aims the lens at `destination`'s box as it is now: a value adopted
   * after its click (mid-flight) moves the segments with its titles' new
   * weights.
   */
  private reaim(track: HTMLElement, destination: HTMLElement): void {
    const carried = this.carried;
    if (carried == null) {
      return;
    }
    const box = boxesIn(track)(destination);
    if (!isLaidOut(box) || isSameBox(box, carried.box)) {
      return;
    }
    this.moveLensTo(destination, box, carried.hidden);
  }

  /**
   * Binds the lens for `segment` with `box` as its layout box, showing
   * `paint`'s surface (the selected segment's), keeping what is on screen:
   * from `from` (a segment's resting box) when nothing was carried, else
   * from the presented geometry, re-based onto the new box with the
   * velocities it had. The lens's shadow rides on it.
   */
  private carry(
    segment: HTMLElement,
    box: Box,
    from: Box | null,
    paint: HTMLElement,
  ): number | undefined {
    const track = this.track;
    if (track == null) {
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
        this.abandoned.add(previous.hidden);
      }
      // A segment abandoned mid-flight still has its surface hidden: read
      // its paint with it shown.
      if (this.abandoned.has(paint)) {
        showSurface(paint);
      }
      paintLayer(track, 'lens', paint);
      hideSurface(paint);
      this.abandoned.delete(paint);
    }
    placeLayer(track, 'lens', box);
    this.carried = {
      segment,
      box,
      hidden: paint,
      trackSize: {width: track.offsetWidth, height: track.offsetHeight},
    };
    // Opaque, whatever a Reduce Motion fade left.
    this.animator.set({...start, opacity: 1});
    if (this.afterRole !== 'leaving') {
      // The shadow is laid out with the lens and moves on its curves; it
      // shows only while the lens is lifted (its opacity).
      if (this.afterRole !== 'shadow') {
        paintShadow(track);
        this.afterRole = 'shadow';
        this.after.set({opacity: 0});
      }
      placeLayer(track, 'after', box);
      this.after.set(start);
    }
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
          : springs.fingerTracking;
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

  /** Springs the lens, and the shadow riding on it, toward `values`. */
  private springLens(
    values: MotionValues,
    transition: SpringTransition,
    options?: AnimateOptions,
  ): void {
    this.trackHandle(this.animator.animate(values, transition, options));
    if (this.afterRole === 'shadow') {
      this.after.animate(geometryOf(values), transition, options);
    }
  }

  /** The lens's presented center and size, from the animator. */
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

  /** The lens settles on `segment` and comes down. */
  private moveLensTo(segment: HTMLElement, box: Box, paint: HTMLElement): void {
    this.isLifted = false;
    if (!isLaidOut(box)) {
      this.settle();
      return;
    }
    if (this.animator.reducedMotion({touchRelease: true}) !== 'off') {
      // A touch released it (or declined its commit): it fades on any
      // pointer.
      this.crossFadeTo(segment, box, null, this.carried?.hidden ?? paint, true);
      return;
    }
    const at = this.carry(segment, box, null, this.carried?.hidden ?? paint);
    this.springLens({x: 0}, this.springFrom({x: 0}, 'selection'), {at});
    this.springLens(
      {scaleX: 1, scaleY: 1},
      this.springFrom({scaleX: 1, scaleY: 1}, 'lift'),
      {at},
    );
    this.trackHandle(
      this.after.animate(
        {opacity: 0},
        {spring: segmentedControl.liftSpring},
        {at},
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
    if (this.animator.reducedMotion({touchRelease: true}) !== 'off') {
      // A tap's release: no lift, no travel; it fades on any pointer.
      this.crossFadeTo(
        segment,
        box,
        this.carried == null ? from : null,
        this.carried?.hidden ?? paint,
        true,
      );
      return;
    }
    const at = this.carry(
      segment,
      box,
      this.carried == null ? from : null,
      this.carried?.hidden ?? paint,
    );
    this.springLens({x: 0}, this.springFrom({x: 0}, 'selection'), {at});
    // Up on the lift spring and, after the hang, back down on it: one curve
    // known in advance, so the compositor brings the lens down on time even
    // while the main thread is busy. The lift's spring and hang are UIKit's
    // measured values, read through their internal roles.
    const peak = lifted(box, liftGrowthOf(this.track));
    const liftSpring = segmentedControl.liftSpring;
    const hang =
      resolveMotion(this.track, segmentedControl, 'tapLiftHangMs') / 1000;
    const velocityX = this.velocity.scaleX ?? 0;
    const velocityY = this.velocity.scaleY ?? 0;
    this.velocity = {};
    const curves = {
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
    };
    this.trackHandle(this.animator.play(curves, {at}));
    if (this.afterRole === 'shadow') {
      // The shadow rises and falls with the lift, on the same clock.
      this.trackHandle(
        this.after.play(
          {
            ...curves,
            opacity: liftThenDown(
              liftSpring,
              this.after.get('opacity'),
              1,
              this.after.getVelocity('opacity'),
              hang,
              0,
            ),
          },
          {at},
        ),
      );
    }
  }

  /**
   * Reduced Motion (design:reduced-motion): the lens lands on `segment` and
   * fades in there (handed to the animator as an entrance), while the surface
   * on screen (the lens when it was carried, else `from`'s resting surface)
   * fades out where it is on the same clock. Whether anything fades is the
   * animator's call: on a fine pointer both change at once, unless a touch
   * released the change (`touchRelease`).
   */
  private crossFadeTo(
    segment: HTMLElement,
    box: Box,
    from: Box | null,
    paint: HTMLElement,
    touchRelease: boolean,
  ): void {
    const track = this.track;
    if (track == null) {
      return;
    }
    // What is on screen before the lens is rebound.
    let leaving: Box | null = null;
    let opacity = 1;
    const previous = this.carried;
    if (previous != null) {
      const now = this.now();
      const presented = this.presented(previous.box, now);
      leaving = {
        x: presented.center - presented.width / 2,
        y: previous.box.y,
        width: presented.width,
        height: previous.box.height,
      };
      opacity = this.animator.get('opacity', now);
    } else if (from != null) {
      leaving = from;
    }
    this.isLifted = false;
    this.endLeaving();
    // No lift, so no shadow: the ::after shows the surface fading out.
    this.after.stop();
    clearLayer(track, 'after');
    this.afterRole = null;
    const fades =
      leaving != null &&
      opacity > 0 &&
      this.animator.reducedMotion({touchRelease}) === 'crossfade';
    if (fades) {
      this.leave(track, previous != null, paint, leaving as Box, opacity, box);
    }
    const at = this.carry(segment, box, from, paint);
    this.velocity = {};
    this.trackHandle(
      this.animator.animate(
        {x: 0, scaleX: 1, scaleY: 1},
        {spring: segmentedControl.selectionSpring},
        {at, crossfadeAs: 'entrance', touchRelease},
      ),
    );
    if (fades) {
      this.fadeLeaving(box, leaving as Box, at, touchRelease);
    }
  }

  /**
   * Paints the ::after with the surface on screen (the lens's paint, or
   * `paint`'s resting surface) where it is (`from`, at `opacity`).
   */
  private leave(
    track: HTMLElement,
    fromLens: boolean,
    paint: HTMLElement,
    from: Box,
    opacity: number,
    box: Box,
  ): void {
    if (fromLens) {
      copyLensPaint(track);
    } else {
      paintLayer(track, 'after', paint);
    }
    placeLayer(track, 'after', {...from, y: box.y, height: box.height});
    this.afterRole = 'leaving';
    this.after.set({x: 0, scaleX: 1, scaleY: 1, opacity});
  }

  /**
   * The ::after fades out where it is while the lens fades in on `box`:
   * handed to the animator as a leaving travel, it fades on the same Reduce
   * Motion clock and lands only once it is invisible.
   */
  private fadeLeaving(
    box: Box,
    from: Box,
    at: number | undefined,
    touchRelease: boolean,
  ): void {
    const id = ++this.leaving;
    const handle = this.after.animate(
      {x: center(box) - center(from), opacity: 0},
      {spring: segmentedControl.selectionSpring},
      {at, touchRelease},
    );
    void handle.finished.then(() => {
      if (this.leaving === id) {
        this.endLeaving();
      }
    });
  }

  private endLeaving(): void {
    if (this.afterRole !== 'leaving') {
      return;
    }
    this.afterRole = null;
    this.leaving++;
    this.after.stop();
    if (this.track != null) {
      clearLayer(this.track, 'after');
    }
  }

  private unlift(): void {
    this.isLifted = false;
    if (this.carried == null) {
      return;
    }
    if (this.animator.reducedMotion() !== 'off') {
      // A scale has no fade of its own: it lands at once.
      this.animator.set({scaleX: 1, scaleY: 1});
      if (this.afterRole === 'shadow') {
        this.after.set({scaleX: 1, scaleY: 1, opacity: 0});
      }
      return;
    }
    this.springLens(
      {scaleX: 1, scaleY: 1},
      this.springFrom({scaleX: 1, scaleY: 1}, 'lift'),
    );
    if (this.afterRole === 'shadow') {
      this.trackHandle(
        this.after.animate({opacity: 0}, {spring: segmentedControl.liftSpring}),
      );
    }
  }

  /**
   * Waits for `handle`; the surface goes back when nothing is left. A
   * touch's value still waiting to come back when the motion settles goes
   * back instead: the settled slide bounds the wait.
   */
  private trackHandle(handle: MotionHandle): void {
    this.running.add(handle);
    void handle.finished.then(() => {
      this.running.delete(handle);
      if (this.running.size > 0 || this.isLifted || this.touch != null) {
        return;
      }
      const committed = this.committed;
      if (this.isAwaitingValue && committed != null && this.track != null) {
        this.decline(this.track, committed);
        return;
      }
      if (this.committed == null) {
        this.settle();
      }
    });
  }

  /**
   * Moves the press's dim to `segment` (none for null): the title it leaves
   * comes back, `segment`'s dims, each on the dim's clock from the opacity on
   * screen. The selected segment and a disabled one never dim.
   */
  private pressTitle(segment: HTMLElement | null): void {
    const next =
      segment != null &&
      segment.getAttribute('aria-checked') !== 'true' &&
      isEnabledSegment(segment)
        ? segment
        : null;
    if (next === this.pressedTitle) {
      return;
    }
    if (this.pressedTitle != null) {
      this.setPressed(this.pressedTitle, false, 'fade');
    }
    this.pressedTitle = next;
    if (next != null) {
      this.setPressed(next, true, 'fade');
    }
  }

  /**
   * Puts `segment` in or out of the `segmented-control-item` target's pressed
   * state and fades it there from what it shows now: dimmed to the state's
   * opacity (the theme's, UIKit's 0.2 by default), or back to 1.
   */
  private setPressed(
    segment: HTMLElement,
    isPressed: boolean,
    clock: 'fade' | 'lift',
  ): void {
    const view = segment.ownerDocument.defaultView;
    const shown =
      view == null ? NaN : parseFloat(view.getComputedStyle(segment).opacity);
    for (const animation of this.titleDims.get(segment) ?? []) {
      animation.cancel();
    }
    this.titleDims.delete(segment);
    if (isPressed) {
      segment.setAttribute(PRESSED_STATE, 'pressed');
    } else {
      segment.removeAttribute(PRESSED_STATE);
    }
    const to = isPressed ? pressedOpacityOf(segment) : 1;
    this.fadeTitle(segment, to, clock, Number.isFinite(shown) ? shown : 1);
  }

  /** The finger let go: the pressed title comes back on the lift's clock. */
  private releaseTitle(): void {
    const pressed = this.pressedTitle;
    this.pressedTitle = null;
    if (pressed != null) {
      this.setPressed(pressed, false, 'lift');
    }
  }

  /**
   * Fades what a press dims on `segment` (its title and icon) to `to`, from
   * the opacity on screen.
   */
  private fadeTitle(
    segment: HTMLElement,
    to: number,
    clock: 'fade' | 'lift',
    from: number,
  ): void {
    for (const animation of this.titleDims.get(segment) ?? []) {
      animation.cancel();
    }
    this.titleDims.delete(segment);
    // The pressed segment fades as a whole: it is an unselected one, which
    // paints no surface of its own under a finger, so its content is all it
    // shows.
    const targets = [segment];
    if (typeof segment.animate !== 'function') {
      return;
    }
    // UIKit's measured clock and curve, read through their internal roles
    // (`segmented.pressedTitle.*`); under Reduced Motion the animator's fade
    // (design:reduced-motion DR4).
    const {pressedTitle} = segmentedControl;
    const timing = this.reducedFade(segment, clock === 'lift') ?? {
      duration: resolveMotion(
        segment,
        pressedTitle,
        clock === 'fade' ? 'fadeMs' : 'liftMs',
      ),
      easing: cssCubicBezier(
        resolveMotion(
          segment,
          clock === 'fade' ? pressedTitle.fadeCurve : pressedTitle.liftCurve,
        ),
      ),
    };
    const animations = targets.map(target => {
      return target.animate([{opacity: from}, {opacity: to}], {
        ...timing,
        fill: 'forwards',
      });
    });
    this.titleDims.set(segment, animations);
    if (to === 1) {
      // Back at rest: the content's own style takes over again.
      animations[0].finished.then(
        () => {
          if (this.titleDims.get(segment) === animations) {
            this.titleDims.delete(segment);
            for (const animation of animations) {
              animation.cancel();
            }
          }
        },
        () => {
          // Replaced by a newer fade, which owns the content now.
        },
      );
    }
  }

  /**
   * Gives `segment`'s title the selected face and the selected segment's
   * title an unselected one (none for null or the selected segment), at once.
   */
  private showFaceAt(segment: HTMLElement | null): void {
    const touch = this.touch;
    const selected = touch?.origin ?? null;
    if (segment === this.facedSegment) {
      return;
    }
    this.clearFaces();
    if (
      touch?.faces == null ||
      selected == null ||
      segment == null ||
      segment === selected
    ) {
      return;
    }
    const title = titleOf(segment);
    const selectedTitle = titleOf(selected);
    if (title == null || selectedTitle == null) {
      return;
    }
    this.wearFace(title, touch.faces.selected);
    this.wearFace(selectedTitle, touch.faces.unselected);
    this.facedSegment = segment;
  }

  /**
   * Mid-drag the face is the colour alone: a weight swap would change the
   * titles' widths, move the segments under the finger and the lens, and
   * shake the boundary. The commit's own styles give the new weight at the
   * lift.
   */
  private wearFace(title: HTMLElement, face: TitleFace): void {
    title.style.color = face.color;
    this.faceOverrides.add(title);
  }

  /** Every title back to its own face. */
  private clearFaces(): void {
    for (const title of this.faceOverrides) {
      title.style.removeProperty('color');
    }
    this.faceOverrides.clear();
    this.facedSegment = null;
  }

  /**
   * The Reduce Motion fade for a fade this controller plays itself (a dim),
   * from the person's settings as the animator reads them: null when motion
   * is not reduced, duration 0 when it changes at once.
   */
  private reducedFade(
    element: HTMLElement,
    touchRelease: boolean,
  ): {duration: number; easing: string} | null {
    return reducedMotionFade(element, {touchRelease});
  }
}

/**
 * Wires `SegmentedSelectionMotion` to a SegmentedControl: every change of
 * `value` while `isEnabled` slides the selection, in the commit that shows the
 * new value (no frame shows it unanimated), and a finger's touch drives the
 * lens while `isTracking`.
 */
export function useSegmentedSelectionMotion(
  trackRef: RefObject<HTMLElement | null>,
  value: string,
  isEnabled: boolean,
  isTracking: boolean,
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

  // The lens aims at boxes measured when its motion began: if the control
  // resizes under it, hand the surface back rather than land somewhere stale.
  useEffect(() => {
    const track = trackRef.current;
    if (!isEnabled || track == null) {
      motion.settle();
      return;
    }
    return observeResize(track, () => motion.resized(track));
  }, [isEnabled, motion, trackRef]);

  useEffect(() => () => motion.stop(), [motion]);

  // Under a finger the control tracks the touch itself and commits the
  // segment nearest the finger at the lift, through that segment's click.
  useSegmentedTouchTracking(trackRef, motion, isEnabled && isTracking);
}
