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
 * - A horizontal pan moves the track 1:1, one `translate` write per move, no
 *   layout read and no React render; past the first or last page it follows
 *   UIKit's rubber band with d = the page width. Which drags are the pager's
 *   follows UIKit: inside a scroll view, the dominant axis
 *   (`paging.nestedPanAxisRatio`, the tie to the pager), claimed early so
 *   Safari never scrolls the page for a drag the pager took; inside a sheet
 *   (an enclosing vertical pan takes part in the touch), within
 *   atan(1 ÷ `paging.panAxisRatio`) of horizontal, and neither between that
 *   and 45°.
 * - At the lift the page is chosen with UIKit's rule (motion/paging.ts
 *   `selectPage`) and the track settles on UIKit's paging integrator from the
 *   lift position and velocity (`solvePaging`), baked into keyframes.
 * - A finger landing on a settling pager catches it `paging.catchStopMs`
 *   after the touch (as UIKit does); dragging catches it at once from the
 *   analytic value on screen.
 * - `goTo` runs `setContentOffset(_:animated:)`'s curve and cancels a drag
 *   in progress.
 * - Reduce Motion (design:reduced-motion): the drag still follows the
 *   finger; after the lift nothing travels. A release's settle is a touch
 *   release (a 200 ms cross-fade on any pointer); `goTo` cross-fades on a
 *   coarse pointer and lands at once on any other.
 * - Callbacks: `onIndexChange` when the target page changes: for a release,
 *   once its settle runs on the compositor (two frames after the frame it
 *   started in, so
 *   the owner's render cannot freeze the hand-off in Mobile Safari); for
 *   `goTo`, at once; never for a controlled change (the owner's own).
 *   `onSettle` when the track rests.
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
import {ScrollViewPanGestureRecognizer} from '../gestures/ScrollViewPanGestureRecognizer';
import type {Point} from '../gestures/types';
import {
  animatorFor,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '../motion/animator';
import {
  pagingSettleVelocity,
  selectPage,
  solveAnimatedPageScroll,
  solvePaging,
} from '../motion/paging';
import {resolveMotion} from '../motion/resolveMotion';
import type {SpringDescription} from '../motion/spring';
import {rubberBandClamp, rubberBandUnclamp} from '../motion/rubberBand';
import {paging, registerPagingTable} from '../motion/uikit/paging';
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
   * A controlled move (the `index` prop, or a `count` that clamps the page)
   * is the owner's own and is not reported.
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
/**
 * The distance a drag travels before the pager claims it, under the 10–11 px
 * at which WebKit claims a slow drag for the page (the gesture system's early
 * claim, PanGestureRecognizer `claimDistance`).
 */
const PAGER_CLAIM_DISTANCE = 5;

/**
 * The pager's pan: a scroll view's (ScrollViewPanGestureRecognizer), so its
 * release velocity is the one UIScrollView hands `scrollViewWillEndDragging`
 * (but after a silent hold; spec:AST-100 FR2).
 * Inside a scroll view it takes UIKit's rule: a drag is the
 * pager's when its dominant axis is horizontal (`paging.nestedPanAxisRatio`,
 * the tie included) and the page's otherwise, and the pager cancels its moves
 * from `PAGER_CLAIM_DISTANCE`, since Safari gives the page no scroll for a
 * touch once one of its moves was cancelled. Inside a sheet, which the arena
 * shows as an enclosing vertical pan taking part in the touch, it keeps the
 * sheet's rule (`axisRatio`, `paging.panAxisRatio`): neither moves between
 * atan(1 ÷ that) and 45°.
 */
class PagerPanGestureRecognizer extends ScrollViewPanGestureRecognizer {
  private hasEnclosingVerticalPan(): boolean {
    for (const other of this.arena?.involvedRecognizers ?? []) {
      if (
        other !== this &&
        other instanceof PanGestureRecognizer &&
        (other.direction === 'vertical' ||
          other.direction === 'up' ||
          other.direction === 'down')
      ) {
        return true;
      }
    }
    return false;
  }

  protected override classify(translation: Point): 'begin' | 'fail' | 'wait' {
    const decided = super.classify(translation);
    if (decided !== 'wait' || this.hasEnclosingVerticalPan()) {
      return decided;
    }
    const along = Math.abs(translation.x);
    const across = Math.abs(translation.y);
    if (along === 0 && across === 0) {
      return 'wait';
    }
    return along >= paging.nestedPanAxisRatio * across ? 'begin' : 'fail';
  }

  override claimsEarly(): boolean {
    return !this.hasEnclosingVerticalPan() && super.claimsEarly();
  }
}

/**
 * The settle catcher: a zero-duration long press that only stops the settle.
 * It never claims the touch, so a vertical swipe or a pinch that starts on a
 * settling track still reaches the page, as UIKit hands the outer scroll view
 * a vertical drag after the paging view's content stopped.
 */
class SettleCatcher extends LongPressGestureRecognizer {
  override get claimsTouches(): boolean {
    return false;
  }
}

export function createPager(
  initial: PagerOptions,
  environment: PagerEnvironment = {},
): Pager {
  // The settle's roles, before the first motion resolves one.
  registerPagingTable();
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
  let suppressCancelSettle = false;
  let catchTimer: unknown = null;
  // Whether the finger now holding the track stopped a settle (not one that
  // ended on its own inside the catch window).
  let caughtSettle = false;

  const pan = new PagerPanGestureRecognizer({
    claimDistance: PAGER_CLAIM_DISTANCE,
    ...options.panOptions,
    // Published, so app code can relate its own recognizers to the paging
    // pan (gesture delegates); instances are told apart by their element.
    name: 'Carousel.pager',
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
  const catcher = new SettleCatcher({
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
      // A controlled move (the owner's `index`, or a `count` that clamps the
      // page) is the owner's own change: it is not reported back.
      if (reason !== 'controlled') {
        options.onIndexChange?.(index, reason);
      }
    }
  }

  function flushReport(): void {
    if (pendingReport != null) {
      report(pendingReport);
    }
  }

  /**
   * A release reports its page once the settle has reached the compositor
   * (two frames after the frame it started in): in Mobile Safari a
   * main-thread block that
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

  /**
   * Runs `callback` in the `frames`-th animation frame after the frame a
   * motion started in; called when its start resolves. WebKit resolves an
   * animation's start inside that frame's rendering update, before the
   * frame's animation-frame callbacks, and no task runs inside a rendering
   * update: a first frame that runs before a task queued at the resolution
   * is the start's own frame, and does not count. (Timestamps cannot tell:
   * WebKit stamps that frame's callbacks 0–4 ms after the animation's start
   * time, measured, as far apart as two frames at 240 Hz.) Where the start
   * resolves after its frame, as in Chromium, the task runs before the next
   * frame, or the report comes a frame later, never earlier.
   */
  function afterFramesPastStart(frames: number, callback: () => void): void {
    let isPastStartFrame = false;
    setTimer(() => {
      isPastStartFrame = true;
    }, 0);
    const onFrame = (left: number) => {
      const remaining = isPastStartFrame ? left - 1 : left;
      isPastStartFrame = true;
      if (remaining <= 0) {
        callback();
        return;
      }
      requestFrame(() => onFrame(remaining));
    };
    requestFrame(() => onFrame(frames));
  }

  function rest(): void {
    flushReport();
    const previous = settled;
    settled = target;
    options.onSettle?.(wrapped(settled), wrapped(previous));
  }

  /**
   * Plays `curve` on the track. Under Reduce Motion the animator replaces the
   * travel (design:reduced-motion): a settle a touch drag's release starts
   * (`touchRelease`) cross-fades on any pointer; `goTo` cross-fades on a
   * coarse pointer and lands at once on any other.
   */
  function play(curve: MotionCurve, touchRelease = false): void {
    if (animator == null) {
      return;
    }
    follow(animator.play({x: toTrackCurve(curve, sign())}, {touchRelease}));
  }

  /** The settle on a theme's spring (`--motion-paging-settle`). */
  function springTo(
    position: number,
    velocity: number,
    spring: SpringDescription,
  ): void {
    if (animator == null) {
      return;
    }
    // The integrator starts the content at stepsPerSecond / 1000 of the
    // finger's speed; a theme's spring starts it the same way.
    const start = (velocity * paging.integrator.stepsPerSecond) / 1000;
    // Only a release settles on a spring: a touch release (see `play`).
    follow(
      animator.animate(
        {x: positionToX(position)},
        {spring, velocity: {x: sign() * start}},
        {touchRelease: true},
      ),
    );
  }

  function follow(handle: MotionHandle): void {
    const token = ++settleToken;
    settleHandle = handle;
    if (pendingReport != null) {
      const reportAt = reportToken;
      void handle.started.then(() =>
        afterFramesPastStart(2, () => {
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

  /** The settle after a finger lifts (a release, or a hold let go). */
  function settleFrom(position: number, velocity: number): void {
    const to = target * stride();
    // A theme that retunes the settle hands it a spring; without one the
    // settle runs UIKit's integrator itself.
    const spring = resolveMotion(viewport, paging, 'settle');
    if (spring !== paging.settle) {
      if (position === to && velocity === 0) {
        animator?.set({x: positionToX(to)});
        rest();
        return;
      }
      springTo(to, velocity, spring);
      return;
    }
    const curve = solvePaging({from: position, velocity, to});
    if (curve.steps === 0) {
      animator?.set({x: positionToX(to)});
      rest();
      return;
    }
    play(curve, true);
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
      // A track caught past an end is shown rubber-banded: the drag starts
      // from its unbanded position, so the first move keeps it under the
      // finger.
      dragStart =
        options.loop === true
          ? current
          : rubberBandUnclamp(
              current,
              0,
              (count() - 1) * stride(),
              pageWidth > 0 ? pageWidth : 1,
            );
      dragPosition = current;
      dragStartIndex = stride() > 0 ? Math.round(current / stride()) : target;
      return;
    }
    if (state === 'changed') {
      const dx = recognizer.translation().x;
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
      // The release velocity of a scroll view's pan (spec:AST-100's one
      // filter, read as UIScrollView reads it). A finger still for more than
      // 40 ms before the lift releases at 0 (FR2), where UIScrollView keeps
      // the speed. The content moves against the finger in LTR (sign()).
      const velocity = state === 'ended' ? sign() * recognizer.velocity().x : 0;
      const next = selectPage({
        position: dragPosition,
        velocity,
        stride: stride(),
        count: count(),
        startIndex: dragStartIndex,
        loop: options.loop === true,
      });
      setTarget(next, 'drag', true);
      settleFrom(dragPosition, pagingSettleVelocity(velocity));
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
      caughtSettle = false;
      catchTimer = setTimer(() => {
        catchTimer = null;
        if (settleHandle != null && !isDragging) {
          stopSettle();
          caughtSettle = true;
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
      const wasCaught = caughtSettle;
      caughtSettle = false;
      if (
        wasCaught &&
        !isDragging &&
        settleHandle == null &&
        animator != null
      ) {
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
    play(
      solveAnimatedPageScroll({
        from,
        to,
        durationMs: resolveMotion(
          viewport,
          paging.animatedScroll,
          'durationMs',
        ),
        curve: resolveMotion(viewport, paging.animatedScroll, 'curve'),
      }),
    );
  }

  function setOptions(update: Partial<PagerOptions>): void {
    const wasLooping = options.loop === true;
    const previousStride = stride();
    options = {...options, ...update};
    if (options.loop !== true && (target < 0 || target > count() - 1)) {
      // Turning `loop` off keeps the page shown; a smaller `count` clamps.
      const shown = wasLooping ? mod(target, count()) : target;
      goTo(clampIndex(shown), {animated: false, reason: 'controlled'});
      return;
    }
    if (stride() !== previousStride && !isDragging) {
      // A new gap: the target page at its new offset (a settle ends there).
      const wasSettling = settleHandle != null;
      stopSettle();
      animator?.set({x: positionToX(target * stride())});
      if (wasSettling || settled !== target) {
        rest();
      }
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

  // Synchronizes the pager (the track's animation and the gesture host) with
  // these props. A clamp it causes is not reported back (reason 'controlled').
  const {count, gap, loop} = options;
  useIsomorphicLayoutEffect(() => {
    pager.setOptions({count, gap, loop});
  }, [pager, count, gap, loop]);

  // Attaches the pager to the viewport and track nodes, and again whenever
  // either node is replaced: it runs after every commit and does nothing while
  // the nodes stay the same.
  const attachedRef = useRef<{
    viewport: HTMLElement | null;
    track: HTMLElement | null;
    detach: (() => void) | null;
  }>({viewport: null, track: null, detach: null});
  useIsomorphicLayoutEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const attached = attachedRef.current;
    if (viewport === attached.viewport && track === attached.track) {
      return;
    }
    attached.detach?.();
    attached.viewport = viewport;
    attached.track = track;
    attached.detach =
      viewport != null && track != null ? pager.attach(viewport, track) : null;
  });
  useIsomorphicLayoutEffect(
    () => () => {
      attachedRef.current.detach?.();
      attachedRef.current = {viewport: null, track: null, detach: null};
    },
    [pager],
  );

  // Synchronizes the pan recognizer (the gesture host) with isPanEnabled.
  useEffect(() => {
    pager.pan.setEnabled(isPanEnabled);
  }, [pager, isPanEnabled]);

  // Synchronizes the pager's animation with a controlled index. The move is
  // the owner's own, so it is not reported back through onIndexChange.
  useEffect(() => {
    if (index != null && index !== pager.index) {
      pager.goTo(index, {reason: 'controlled'});
    }
  }, [pager, index]);

  return pager;
}
