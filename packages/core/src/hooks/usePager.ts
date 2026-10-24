// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file usePager.ts
 * @input A viewport element (the gesture surface) and a track element (the
 *   row of pages it translates), a page count and gap, the gesture system and
 *   the motion animator
 * @output Exports `createPager` (the framework-free pager), `usePager` (its
 *   React face) and their types
 * @position Shared hook for core components that page like a UIKit paging
 *   scroll view (Carousel's paging presentation, Lightbox's viewer)
 *
 * The pager is UIKit's `isPagingEnabled` scroll view (and the scroll view
 * inside UIPageViewController) driven by the gesture system and played on the
 * compositor, not native scrolling: a native scroll-snap container on iOS is
 * a UIScrollView with the fast deceleration rate bent onto WebKit's own snap
 * target, not the paging integrator, and it cannot share a gesture with a
 * pinch.
 *
 * - A horizontal pan (axis ratio `paging.panAxisRatio`) moves the track 1:1,
 *   one `translate` write per move, no layout read and no React render; past
 *   the first or last page it follows UIKit's rubber band with d = the page
 *   width.
 * - At the lift the page is chosen with UIKit's rule (motion/paging.ts
 *   `selectPage`) and the track settles on UIKit's paging integrator from the
 *   lift position and velocity (`solvePaging`), baked into keyframes.
 * - A finger landing on a settling pager catches it `paging.catchStopMs`
 *   after the touch (as UIKit does); dragging catches it at once from the
 *   analytic value on screen.
 * - `goTo` runs `setContentOffset(_:animated:)`'s curve, cancels a drag in
 *   progress, and keeps its motion under Reduced Motion (UIKit does).
 * - Callbacks: `onIndexChange` when the target page changes: for a release,
 *   once its settle runs on the compositor (two frames after its first, so
 *   the owner's render cannot freeze the hand-off in Mobile Safari); for
 *   `goTo` and a controlled change, at once. `onSettle` when the track rests.
 *
 * Positions are content offsets in px, 0 at page 0 and growing toward later
 * pages; the track is translated by −position, or +position when the
 * viewport is right-to-left. Pages sit at index × (page width + gap); how
 * they are rendered (all of them, a window, a wrapped copy for looping) is
 * the owner's. With `loop`, indexes are unbounded ("virtual"); `index` wraps
 * them into [0, count).
 *
 * Give the current page and its neighbours their own layers
 * (`will-change: transform`): through a busy main thread, Mobile Safari
 * moves the track but cannot paint what it had not painted, and leaves the
 * unpainted part of a page that slides in blank until the thread is free
 * (iOS 26.2 simulator); a page on its own layer is painted whole before it
 * moves.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/usePager.test.ts
 * - /packages/core/src/hooks/__tests__/usePager.interaction.browser.spec.ts
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {getGestureHost, type GestureHost} from '../gestures/GestureHost';
import {LongPressGestureRecognizer} from '../gestures/LongPressGestureRecognizer';
import {
  PanGestureRecognizer,
  type PanGestureRecognizerOptions,
} from '../gestures/PanGestureRecognizer';
import {
  animatorFor,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '../motion/animator';
import {
  pagingReleaseVelocity,
  selectPage,
  solveAnimatedPageScroll,
  solvePaging,
} from '../motion/paging';
import {rubberBandClamp} from '../motion/rubberBand';
import {paging} from '../motion/uikit/paging';
import {observeResize} from '../utils/sharedResizeObserver';
import {isRtlElement} from './isRtlElement';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

/** Why the target page changed. */
export type PagerChangeReason = 'drag' | 'goTo' | 'controlled';

export interface PagerOptions {
  /** Number of pages (at least 1). */
  count: number;
  /** Space between pages, px; it shows only while a page moves. @default 0 */
  gap?: number;
  /** Pages wrap around; indexes become unbounded. @default false */
  loop?: boolean;
  /** Starting page. @default 0 */
  defaultIndex?: number;
  /**
   * The target page changed (index wrapped into [0, count)). A release
   * reports once its settle is moving; `index` has the page from the lift.
   */
  onIndexChange?: (index: number, reason: PagerChangeReason) => void;
  /**
   * The track came to rest on `index` after moving on its own (a settle, a
   * `goTo`), having last rested on `previous` (equal when it returned).
   */
  onSettle?: (index: number, previous: number) => void;
  /**
   * Called when the pan would begin, with the drag's initial physical
   * direction on screen (the same in RTL); return false to leave the touch
   * to someone else (a zoomed photo that can still pan that way).
   */
  shouldBeginPan?: (direction: 'left' | 'right') => boolean;
  /** Constructor options for the pan (e.g. `allowedPointerTypes`). */
  panOptions?: Partial<PanGestureRecognizerOptions>;
}

export interface GoToOptions {
  /** Animate with `setContentOffset(_:animated:)`'s curve. @default true */
  animated?: boolean;
  /** @default 'goTo' */
  reason?: PagerChangeReason;
}

export interface Pager {
  /** The page pan, for failure requirements and simultaneity. */
  readonly pan: PanGestureRecognizer;
  /** The target page, wrapped into [0, count). */
  readonly index: number;
  /** The target page, unbounded when looping. */
  readonly virtualIndex: number;
  /** Whether the track is moving on its own (a settle or a `goTo`). */
  readonly isSettling: boolean;
  /** Whether a finger is dragging the track. */
  readonly isDragging: boolean;
  /** The content offset on screen right now, from the curve (px). */
  presentation(): number;
  /** Move to a page (wrapped to the nearest copy when looping). */
  goTo(index: number, options?: GoToOptions): void;
  /** Update options; a smaller count clamps the target page. */
  setOptions(options: Partial<PagerOptions>): void;
  /** Attach to the elements; returns a detach function. */
  attach(viewport: HTMLElement, track: HTMLElement): () => void;
  /** Detach and stop everything (attaching again restarts it). */
  dispose(): void;
}

function mod(value: number, count: number): number {
  return ((value % count) + count) % count;
}

/** A position curve seen as the track's x (mirrored for LTR). */
function toTrackCurve(curve: MotionCurve, sign: number): MotionCurve {
  // `+ 0` turns a mirrored zero (−0) into 0.
  return {
    duration: curve.duration,
    at: t => sign * curve.at(t) + 0,
    velocity: t => sign * curve.velocity(t) + 0,
  };
}

/** What a pager runs on; tests pass their own clocked host and animator. */
export interface PagerEnvironment {
  /** The gesture host; the document's shared host by default. */
  host?: GestureHost;
  /** The track's animator; `animatorFor(track)` by default. */
  animator?: Animator;
  /** Timers for the catch delay; the window's by default. */
  setTimeout?: (callback: () => void, ms: number) => unknown;
  clearTimeout?: (handle: unknown) => void;
  /** The next animation frame; `requestAnimationFrame` by default. */
  requestFrame?: (callback: () => void) => void;
}

/**
 * Creates a pager. Attach it to its viewport and track; it measures the page
 * width there (on attach, on resize, and when a drag begins) and never reads
 * layout while a finger moves.
 */
export function createPager(
  initial: PagerOptions,
  environment: PagerEnvironment = {},
): Pager {
  const setTimer =
    environment.setTimeout ??
    ((callback: () => void, ms: number) => setTimeout(callback, ms));
  const clearTimer =
    environment.clearTimeout ??
    ((handle: unknown) =>
      clearTimeout(handle as ReturnType<typeof setTimeout>));
  const requestFrame =
    environment.requestFrame ??
    ((callback: () => void) => {
      if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(() => callback());
      } else {
        setTimer(callback, 16);
      }
    });
  let options: PagerOptions = {...initial};
  let viewport: HTMLElement | null = null;
  let trackElement: HTMLElement | null = null;
  let animator: Animator | null = null;
  let pageWidth = 0;
  let isRtl = false;

  const count = () => Math.max(1, Math.floor(options.count));
  const stride = () => pageWidth + (options.gap ?? 0);
  const sign = () => (isRtl ? 1 : -1);
  const clampIndex = (index: number) =>
    options.loop === true ? index : Math.max(0, Math.min(count() - 1, index));

  // The page the track rests on or is heading for (unbounded when looping),
  // and the one it last rested on.
  let target = clampIndex(Math.round(options.defaultIndex ?? 0));
  let settled = target;
  let settleHandle: MotionHandle | null = null;
  let settleToken = 0;
  let isDragging = false;

  // Drag state, captured when the pan begins.
  let dragStart = 0;
  let dragStartIndex = 0;
  let dragPosition = 0;
  let lastMoveTime = 0;
  let lastTranslation = 0;
  let velocityCurrent = 0;
  let velocityPrevious = 0;
  let suppressCancelSettle = false;
  let catchTimer: unknown = null;

  const pan = new PanGestureRecognizer({
    ...options.panOptions,
    direction: 'horizontal',
    axisRatio: options.panOptions?.axisRatio ?? paging.panAxisRatio,
    shouldBegin: recognizer => {
      if (options.panOptions?.shouldBegin?.(recognizer) === false) {
        return false;
      }
      const dx = recognizer.totalTranslation().x;
      const direction = dx < 0 ? 'left' : 'right';
      return options.shouldBeginPan?.(direction) ?? true;
    },
  });

  // Catches a settling track when a finger lands on it: begins on the touch
  // itself, only while the track moves on its own, alongside the pan.
  const catcher = new LongPressGestureRecognizer({
    minimumPressDuration: 0,
    allowableMovement: Number.POSITIVE_INFINITY,
    shouldBegin: () => settleHandle != null && !isDragging,
  });
  catcher.recognizeSimultaneouslyWith(pan);

  function positionToX(position: number): number {
    const x = sign() * position;
    return x === 0 ? 0 : x;
  }

  function presentation(): number {
    if (animator == null) {
      return target * stride();
    }
    return sign() * animator.get('x');
  }

  function clearCatchTimer(): void {
    if (catchTimer != null) {
      clearTimer(catchTimer);
      catchTimer = null;
    }
  }

  function stopSettle(): void {
    clearCatchTimer();
    flushReport();
    if (settleHandle != null) {
      settleToken += 1;
      settleHandle = null;
      animator?.stop(['x']);
    }
  }

  function wrapped(index: number): number {
    return options.loop === true ? mod(index, count()) : index;
  }

  // The page last reported through onIndexChange, and a report that waits
  // for a release's settle to reach the compositor.
  let reported = wrapped(target);
  let pendingReport: PagerChangeReason | null = null;
  let reportToken = 0;

  function report(reason: PagerChangeReason): void {
    pendingReport = null;
    reportToken += 1;
    const index = wrapped(target);
    if (index !== reported) {
      reported = index;
      options.onIndexChange?.(index, reason);
    }
  }

  function flushReport(): void {
    if (pendingReport != null) {
      report(pendingReport);
    }
  }

  /**
   * A release reports its page once the settle has reached the compositor
   * (two frames after its first): in Mobile Safari a main-thread block that
   * starts within about two frames of the touch freezes a motion started in
   * that touch's handler, and the owner's render of the new page is such a
   * block. UIKit tells its delegate at the lift (scrollViewWillEndDragging);
   * the page is known then too (`index`).
   */
  function setTarget(
    next: number,
    reason: PagerChangeReason,
    whenMoving = false,
  ): void {
    target = next;
    if (whenMoving) {
      pendingReport = reason;
    } else {
      report(reason);
    }
  }

  function afterFrames(frames: number, callback: () => void): void {
    if (frames <= 0) {
      callback();
      return;
    }
    requestFrame(() => afterFrames(frames - 1, callback));
  }

  function rest(): void {
    flushReport();
    const previous = settled;
    settled = target;
    options.onSettle?.(wrapped(settled), wrapped(previous));
  }

  function play(curve: MotionCurve): void {
    if (animator == null) {
      return;
    }
    const token = ++settleToken;
    const handle = animator.play(
      {x: toTrackCurve(curve, sign())},
      {reducedMotion: 'keep'},
    );
    settleHandle = handle;
    if (pendingReport != null) {
      const reportAt = reportToken;
      void handle.started.then(() =>
        afterFrames(2, () => {
          if (reportAt === reportToken) {
            flushReport();
          }
        }),
      );
    }
    void handle.finished.then(finished => {
      if (token !== settleToken) {
        return;
      }
      settleHandle = null;
      if (finished) {
        rest();
      }
    });
  }

  function settleFrom(position: number, velocity: number): void {
    const curve = solvePaging({
      from: position,
      velocity,
      to: target * stride(),
    });
    if (curve.steps === 0) {
      animator?.set({x: positionToX(target * stride())});
      rest();
      return;
    }
    play(curve);
  }

  function measure(): void {
    if (viewport == null) {
      return;
    }
    const width = viewport.clientWidth;
    isRtl = isRtlElement(viewport);
    if (width === pageWidth) {
      return;
    }
    pageWidth = width;
    // A resize lands on the target page at its new offset (a settle in
    // flight ends there), as a paging scroll view does on rotation.
    if (!isDragging) {
      stopSettle();
      animator?.set({x: positionToX(target * stride())});
      if (settled !== target) {
        rest();
      }
    }
  }

  function onPan(recognizer: PanGestureRecognizer): void {
    const state = recognizer.state;
    if (state === 'began') {
      measure();
      clearCatchTimer();
      const current = presentation();
      stopSettle();
      isDragging = true;
      dragStart = current;
      dragPosition = current;
      dragStartIndex = stride() > 0 ? Math.round(current / stride()) : target;
      lastTranslation = recognizer.translation().x;
      lastMoveTime = recognizer.trackedTouches[0]?.time ?? 0;
      velocityCurrent = recognizer.velocity().x;
      velocityPrevious = velocityCurrent;
      return;
    }
    if (state === 'changed') {
      const dx = recognizer.translation().x;
      if (dx !== lastTranslation) {
        lastTranslation = dx;
        lastMoveTime = recognizer.trackedTouches[0]?.time ?? lastMoveTime;
        velocityPrevious = velocityCurrent;
        velocityCurrent = recognizer.velocity().x;
      }
      // Finger right (dx > 0) moves content toward earlier pages in LTR.
      const raw = dragStart + sign() * dx;
      const max = (count() - 1) * stride();
      dragPosition =
        options.loop === true
          ? raw
          : rubberBandClamp(raw, 0, max, pageWidth > 0 ? pageWidth : 1);
      animator?.set({x: positionToX(dragPosition)});
      return;
    }
    if (state === 'ended' || state === 'cancelled') {
      isDragging = false;
      if (state === 'cancelled' && suppressCancelSettle) {
        suppressCancelSettle = false;
        return;
      }
      const liftTime =
        recognizer.trackedTouches[0]?.time ??
        (typeof performance === 'undefined' ? 0 : performance.now());
      const toContent = sign();
      const released =
        state === 'ended'
          ? pagingReleaseVelocity({
              current: toContent * velocityCurrent,
              previous: toContent * velocityPrevious,
              stillFor: Math.max(0, liftTime - lastMoveTime),
            })
          : {page: 0, settle: 0};
      const next = selectPage({
        position: dragPosition,
        velocity: released.page,
        stride: stride(),
        count: count(),
        startIndex: dragStartIndex,
        loop: options.loop === true,
      });
      setTarget(next, 'drag', true);
      settleFrom(dragPosition, released.settle);
    }
  }

  // While a finger holds a caught track, the browser's long-press text
  // selection and callout stay off: in UIKit the touch that stops a scroll
  // view does not reach its content.
  let savedSelection: [string, string, string] | null = null;

  function holdSelection(on: boolean): void {
    const style = trackElement?.style;
    if (style == null) {
      return;
    }
    if (on && savedSelection == null) {
      savedSelection = [
        style.getPropertyValue('user-select'),
        style.getPropertyValue('-webkit-user-select'),
        style.getPropertyValue('-webkit-touch-callout'),
      ];
      style.setProperty('user-select', 'none');
      style.setProperty('-webkit-user-select', 'none');
      style.setProperty('-webkit-touch-callout', 'none');
    } else if (!on && savedSelection != null) {
      const [userSelect, webkitUserSelect, callout] = savedSelection;
      style.setProperty('user-select', userSelect);
      style.setProperty('-webkit-user-select', webkitUserSelect);
      style.setProperty('-webkit-touch-callout', callout);
      savedSelection = null;
    }
  }

  function onCatch(recognizer: LongPressGestureRecognizer): void {
    if (recognizer.state === 'began') {
      holdSelection(true);
      clearCatchTimer();
      catchTimer = setTimer(() => {
        catchTimer = null;
        if (settleHandle != null && !isDragging) {
          stopSettle();
        }
      }, paging.catchStopMs);
      return;
    }
    if (recognizer.state === 'ended' || recognizer.state === 'cancelled') {
      holdSelection(false);
      if (catchTimer != null) {
        // Lifted before the catch took hold: the settle runs on.
        clearCatchTimer();
        return;
      }
      if (!isDragging && settleHandle == null && animator != null) {
        // Held, then lifted without dragging: settle on the nearest page.
        const position = presentation();
        const next = selectPage({
          position,
          velocity: 0,
          stride: stride(),
          count: count(),
          startIndex: stride() > 0 ? Math.round(position / stride()) : target,
          loop: options.loop === true,
        });
        setTarget(next, 'drag', true);
        settleFrom(position, 0);
      }
    }
  }

  function goTo(index: number, goToOptions: GoToOptions = {}): void {
    const {animated = true, reason = 'goTo'} = goToOptions;
    let next = Math.round(index);
    if (options.loop === true) {
      // The copy of `index` nearest the current target.
      const n = count();
      next =
        target + (((mod(next, n) - mod(target, n) + n + n / 2) % n) - n / 2);
      next = Math.round(next);
    } else {
      next = clampIndex(next);
    }
    if (isDragging) {
      suppressCancelSettle = true;
      isDragging = false;
      pan.cancel();
    }
    const from = presentation();
    stopSettle();
    setTarget(next, reason);
    const to = next * stride();
    if (!animated || animator == null || from === to) {
      animator?.set({x: positionToX(to)});
      rest();
      return;
    }
    play(solveAnimatedPageScroll({from, to}));
  }

  function setOptions(update: Partial<PagerOptions>): void {
    options = {...options, ...update};
    if (options.loop !== true && (target < 0 || target > count() - 1)) {
      goTo(clampIndex(target), {animated: false, reason: 'controlled'});
    }
  }

  let detachAll: (() => void) | null = null;

  function attach(nextViewport: HTMLElement, nextTrack: HTMLElement) {
    detachAll?.();
    viewport = nextViewport;
    trackElement = nextTrack;
    animator = environment.animator ?? animatorFor(nextTrack);
    pageWidth = 0;
    isRtl = isRtlElement(nextViewport);
    pageWidth = nextViewport.clientWidth;
    animator.set({x: positionToX(target * stride())});
    const removePanListener = pan.addListener(onPan);
    const removeCatchListener = catcher.addListener(onCatch);
    const host = environment.host ?? getGestureHost(nextViewport.ownerDocument);
    const detachPan = host.attach(nextViewport, pan);
    // The catcher sits on the track so its long-press styles (no callout,
    // no selection) stay off the pages' text: the viewport's touch-action
    // already covers the touches that land on the track.
    const detachCatch = host.attach(nextTrack, catcher, {manageStyle: false});
    const unobserve = observeResize(nextViewport, measure);
    detachAll = () => {
      unobserve();
      detachCatch();
      detachPan();
      removeCatchListener();
      removePanListener();
      stopSettle();
      holdSelection(false);
      isDragging = false;
      detachAll = null;
    };
    return () => detachAll?.();
  }

  return {
    pan,
    get index() {
      return wrapped(target);
    },
    get virtualIndex() {
      return target;
    },
    get isSettling() {
      return settleHandle != null;
    },
    get isDragging() {
      return isDragging;
    },
    presentation,
    goTo,
    setOptions,
    attach,
    dispose() {
      detachAll?.();
    },
  };
}

export interface UsePagerOptions extends PagerOptions {
  /** The gesture surface: the clipped box the pages show through. */
  viewportRef: RefObject<HTMLElement | null>;
  /** The row of pages the pager translates. */
  trackRef: RefObject<HTMLElement | null>;
  /** Controlled target page; a change animates to it (reason 'controlled'). */
  index?: number;
  /** Live toggle for the pan; turning it off mid-drag cancels the drag. */
  isPanEnabled?: boolean;
}

/**
 * A pager on two elements. Callbacks are read through a ref, so passing new
 * functions each render costs nothing; a gesture never renders.
 *
 * @example
 * ```
 * const pager = usePager({viewportRef, trackRef, count: photos.length, gap: 40,
 *   onIndexChange: setCounter});
 * <div ref={viewportRef} style={{overflow: 'hidden'}}>
 *   <div ref={trackRef} style={{display: 'flex', gap: 40}}>…pages…</div>
 * </div>
 * ```
 */
export function usePager({
  viewportRef,
  trackRef,
  index,
  isPanEnabled = true,
  ...options
}: UsePagerOptions): Pager {
  const latestRef = useRef(options);
  useIsomorphicLayoutEffect(() => {
    latestRef.current = options;
  });
  const [pager] = useState(() =>
    createPager({
      ...options,
      defaultIndex: index ?? options.defaultIndex,
      onIndexChange: (i, reason) =>
        latestRef.current.onIndexChange?.(i, reason),
      onSettle: (i, previous) => latestRef.current.onSettle?.(i, previous),
      shouldBeginPan: direction =>
        latestRef.current.shouldBeginPan?.(direction) ?? true,
    }),
  );

  const {count, gap, loop} = options;
  useIsomorphicLayoutEffect(() => {
    pager.setOptions({count, gap, loop});
  }, [pager, count, gap, loop]);

  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (viewport == null || track == null) {
      return undefined;
    }
    return pager.attach(viewport, track);
  }, [pager, viewportRef, trackRef]);

  useEffect(() => {
    pager.pan.setEnabled(isPanEnabled);
  }, [pager, isPanEnabled]);

  useEffect(() => {
    if (index != null && index !== pager.index) {
      pager.goTo(index, {reason: 'controlled'});
    }
  }, [pager, index]);

  return pager;
}
