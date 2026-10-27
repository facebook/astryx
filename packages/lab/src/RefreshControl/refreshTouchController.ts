// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file refreshTouchController.ts
 * @input The refresh's state (refreshModel.ts), shared with the wiring and
 *   driven through its dispatch; the pull's mapping (refreshPull.ts); the
 *   foundation (gesture recognizers, compositor animator, the UIKit tables it
 *   animates with, root scroll styles) through core's internal module paths
 * @output useRefreshTouchController: the refresh control's touch layer (the
 *   pull, the inset, the indicator and every motion) and the refs that attach
 *   it
 * @position Internal to RefreshControl. useRefreshControl.ts is its one import
 *   site: everything a pull drives lives here, in one module a page loads
 *   only with the control (`architecture:component-style-authoring` INV6).
 *
 * The pull (UIKit's refresh pull, measured; see refreshPull.ts):
 * - RefreshPullRecognizer reads a downward pull at the top without taking the
 *   touch, and the content is translated by the overscroll UIKit shows for
 *   that travel: one write per move, no React render. The scroll owner's
 *   `overscroll-behavior-y` is `none` while it is within one viewport of its
 *   top, so the browser draws no rubber band (and Safari's own page reload
 *   never fires) where the pull is drawn instead. Scrolling stays native.
 * - The pull triggers with the finger down; the refresh starts (spin,
 *   announcement, `onRefresh`). Releasing settles onto the refreshing inset
 *   (or back to the top) on the scroll view's bounce, on the compositor.
 * - The end slides the content up by the inset over `refreshControl.endMs`
 *   on UIKit's ease-in-out, over the indicator held at the top (the content's
 *   edge covers it) while the title fades out over `refreshControl.exitMs`;
 *   or, when the control has scrolled out of view, drops the inset and the
 *   matching scroll offset in one task (no motion).
 * - A programmatic begin (controlled `isRefreshing`, or `refresh()`) adds the
 *   inset with no visible motion, as `beginRefreshing()` does.
 *
 * Every pointer pulls, under any primary pointer (`spec:AST-094` FR43): a
 * drag at the top, with the same mapping, trigger, settle and drawing; a pen
 * or a mouse pull clears the text selection its drag started. A trackpad's
 * or a wheel's scroll does not pull. The top edge follows the touch presentation
 * (`useTouchPresentation`: a coarse primary pointer, one touch model on iOS
 * and Android alike): only there does the pull take the page's overscroll
 * near the top and replace the browser's own pull to refresh (Safari's and
 * Chrome's reload). Under a fine pointer a programmatic refresh only reports
 * busy and announces itself: no inset, no indicator.
 *
 * The settle and the trigger turn hand their table springs to the animator.
 * The end's curve is `timing.curves.move`, one of spec:AST-094 FR4's internal
 * roles, read with `resolveMotion` the way the animator reads roles; every
 * other value is a table constant, read as it is.
 *
 * Main-thread note: finger tracking runs on the main thread here (the browser
 * has no refresh pull of its own to ride); every release, settle, spin and
 * end runs on the compositor. The animator gives the content its compositor
 * layer from the pull's first move (each `set` promotes), so the layer exists
 * before the settle starts.
 *
 * SYNC: When modified, update:
 * - /packages/lab/src/RefreshControl/useRefreshControl.ts
 * - /packages/lab/src/RefreshControl/useRefreshControl.test.tsx
 * - /packages/lab/src/RefreshControl/RefreshControl.tsx
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefCallback,
} from 'react';
import {claimRootScrollStyle} from '@astryxdesign/core/internal/touch';
import type {PointerKind} from '@astryxdesign/core/internal/touch';
import {useGestureRecognizer} from '@astryxdesign/core/internal/touch';
import type {MotionCurve} from '@astryxdesign/core/internal/motion';
import {cubicBezier} from '@astryxdesign/core/internal/motion';
import {resolveMotion} from '@astryxdesign/core/internal/motion';
import {solveSpring, toSpring} from '@astryxdesign/core/internal/motion';
import {refreshControl} from '@astryxdesign/core/internal/motion';
import {scroll} from '@astryxdesign/core/internal/motion';
import {registerTimingTable, timing} from '@astryxdesign/core/internal/motion';
import {useAnimator} from '@astryxdesign/core/internal/motion';
import {RefreshPullRecognizer} from './RefreshPullRecognizer';
import {
  REFRESH_REVEAL_VAR,
  REFRESH_SPIN_STEP_VAR,
  REFRESH_SPINNING_ATTRIBUTE,
} from './refreshIndicator';
import type {RefreshEvent, RefreshState} from './refreshModel';
import {
  endMotion,
  modeAfterTrigger,
  pullOverscroll,
  pullTravel,
  REFRESH_HEIGHT,
  releaseTarget,
  revealProgress,
  triggerDistance,
  type PullMode,
} from './refreshPull';

/**
 * The spin as keyframes: each of the indicator's spokes in turn holds still,
 * then the rotation steps on by one spoke (the replicator's spin). Linear
 * keyframes with a near-zero jump between holds, rather than a `steps()`
 * timing function, so the browser runs it on its compositor.
 */
function spinKeyframes(spokes: number): Keyframe[] {
  const frames: Keyframe[] = [];
  const jump = 1e-4;
  for (let index = 0; index < spokes; index++) {
    const angle = (360 / spokes) * index;
    frames.push({offset: index / spokes, transform: `rotate(${angle}deg)`});
    frames.push({
      offset: (index + 1) / spokes - jump,
      transform: `rotate(${angle}deg)`,
    });
  }
  frames.push({offset: 1, transform: 'rotate(360deg)'});
  return frames;
}

/**
 * The indicator's turn, degrees: the trigger turn starts this far round and
 * springs back; the end turns this far while the indicator shrinks.
 */
const TURN_DEGREES = (refreshControl.turnRad * 180) / Math.PI;

export interface RefreshTouchControllerOptions {
  /** The pull applies: not disabled, no scroll lock (every pointer, FR43). */
  readonly isPullEnabled: boolean;
  /**
   * The pull takes the top edge (the touch presentation): near the top the
   * scroll owner's overscroll is the pull's, not the browser's.
   */
  readonly isEdgeClaimed: boolean;
  /** The state machine's state, shared with the wiring. */
  readonly model: {readonly current: RefreshState};
  /** The wiring's dispatch: the pull's events go to the state machine. */
  readonly dispatchRef: {readonly current: (event: RefreshEvent) => void};
}

export interface RefreshTouchController {
  readonly contentRef: RefCallback<HTMLElement>;
  readonly indicatorRef: RefCallback<HTMLElement>;
  readonly spinnerRef: RefCallback<HTMLElement>;
  readonly titleRef: RefCallback<HTMLElement>;
  /** A pull triggered: the spin starts with the turn; the release settles onto the inset. */
  trigger(): void;
  /** A refresh began without a pull: the inset arrives with no visible motion. */
  begin(): void;
  /** The release settles onto the inset or back to the top. */
  settle(to: 'inset' | 'top'): void;
  /** The refresh ended. */
  end(): void;
}

/** The element whose scroll moves the content, or null for the document. */
function findScrollOwner(start: HTMLElement): HTMLElement | null {
  const doc = start.ownerDocument;
  for (
    let node = start.parentElement;
    node != null && node !== doc.body && node !== doc.documentElement;
    node = node.parentElement
  ) {
    const overflowY = getComputedStyle(node).overflowY;
    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return node;
    }
  }
  return null;
}

function scrollTopOf(owner: HTMLElement | null): number {
  return owner == null ? window.scrollY : owner.scrollTop;
}

function heightOf(owner: HTMLElement | null): number {
  return owner == null ? window.innerHeight : owner.clientHeight;
}

function scrollOwnerBy(owner: HTMLElement | null, delta: number): void {
  if (delta === 0) {
    return;
  }
  if (owner == null) {
    window.scrollTo({top: window.scrollY + delta, behavior: 'instant'});
  } else {
    owner.scrollTop += delta;
  }
}

/** A curve from `from` to `to` over `ms` on a cubic bézier. */
function bezierCurve(
  from: number,
  to: number,
  ms: number,
  points: readonly [number, number, number, number],
): MotionCurve {
  const ease = cubicBezier(points);
  const duration = ms / 1000;
  const at = (t: number) =>
    from + (to - from) * ease(Math.min(1, Math.max(0, t / duration)));
  return {duration, at, velocity: derivative(at, duration)};
}

function derivative(
  at: (t: number) => number,
  duration: number,
): (t: number) => number {
  const step = 1 / 1000;
  return t => {
    const a = Math.max(0, t - step);
    const b = Math.min(duration, t + step);
    return b > a ? (at(b) - at(a)) / (b - a) : 0;
  };
}

/**
 * The refresh control's touch layer. The wiring owns the state and the
 * announcements; this owns everything a finger drives.
 */
export function useRefreshTouchController({
  isPullEnabled,
  isEdgeClaimed,
  model,
  dispatchRef,
}: RefreshTouchControllerOptions): RefreshTouchController {
  // The timing table's FR4 roles, so the end's curve resolves the way the
  // animator resolves roles. Idempotent; no table registers on import.
  registerTimingTable();
  const dispatch = useCallback(
    (event: RefreshEvent) => dispatchRef.current(event),
    [dispatchRef],
  );
  const content = useAnimator();
  const indicator = useAnimator();
  const title = useAnimator();
  // The spinner turns on its own: the title beside it must not.
  const turn = useAnimator();
  const contentElement = useRef<HTMLElement | null>(null);
  const indicatorElement = useRef<HTMLElement | null>(null);
  const spinnerElement = useRef<HTMLElement | null>(null);
  const spin = useRef<Animation | null>(null);
  // Whether the content holds the refreshing inset (only under a finger).
  const hasInset = useRef(false);
  // An end waiting for the frame after its render, and that frame.
  const pendingEnd = useRef<(() => void) | null>(null);
  const endFrame = useRef<number | null>(null);
  // Counts ends: each one renders, and the slide starts after that commit.
  const [endTick, setEndTick] = useState(0);
  const cancelPendingEnd = useCallback(() => {
    pendingEnd.current = null;
    if (endFrame.current != null) {
      cancelAnimationFrame(endFrame.current);
      endFrame.current = null;
    }
  }, []);

  const owner = useRef<HTMLElement | null>(null);
  const pull = useRef<{
    travel0: number;
    scrollTop0: number;
    dimension: number;
    floor: number;
    trigger: number;
    mode: PullMode;
  }>({
    travel0: 0,
    scrollTop0: 0,
    dimension: 1,
    floor: 0,
    trigger: triggerDistance(1),
    mode: 'reveal',
  });

  // -- Indicator ------------------------------------------------------------

  const setReveal = useCallback((value: number) => {
    indicatorElement.current?.style.setProperty(
      REFRESH_REVEAL_VAR,
      String(value),
    );
  }, []);

  /**
   * No text selection while a pull runs: iOS Safari otherwise reads a slow
   * pull over text as a press-and-drag selection (the content does not
   * scroll under it, so nothing claims the touch), and a pen drag may select
   * text from its first move.
   */
  const selection = useRef<string | null>(null);
  /**
   * The text a pen's or a mouse's drag selected in the content before its
   * pull began (spec:AST-094 FR43): the pull takes the drag, so the selection
   * goes.
   */
  const clearDragSelection = useCallback(() => {
    const element = contentElement.current;
    const current = element?.ownerDocument.getSelection();
    if (element == null || current == null || current.isCollapsed) {
      return;
    }
    const anchor = current.anchorNode;
    if (anchor != null && element.contains(anchor)) {
      current.removeAllRanges();
    }
  }, []);
  /**
   * The pointer of the latest pull: under Reduce Motion a finger's release
   * cross-fades (design:reduced-motion DR2), as the animator makes any
   * release on a coarse primary pointer do; elsewhere a pen's or a mouse's
   * lands at once (DR3, spec:AST-094 FR43).
   */
  const pullPointer = useRef<PointerKind>('touch');
  const holdSelection = useCallback(() => {
    const element = contentElement.current;
    if (element == null || selection.current != null) {
      return;
    }
    selection.current = element.style.getPropertyValue('-webkit-user-select');
    element.style.setProperty('-webkit-user-select', 'none');
    element.style.setProperty('user-select', 'none');
  }, []);
  const releaseSelection = useCallback(() => {
    const element = contentElement.current;
    if (element == null || selection.current == null) {
      return;
    }
    if (selection.current === '') {
      element.style.removeProperty('-webkit-user-select');
      element.style.removeProperty('user-select');
    } else {
      element.style.setProperty('-webkit-user-select', selection.current);
      element.style.setProperty('user-select', selection.current);
    }
    selection.current = null;
  }, []);

  const stopSpin = useCallback(() => {
    spin.current?.cancel();
    spin.current = null;
  }, []);

  /**
   * The content at `y`, and the indicator pinned at the top of the scroll
   * view: it rides on the content's edge, so it moves by the inset minus `y`.
   */
  const place = useCallback(
    (y: number) => {
      content.animator.set({y});
      indicator.animator.set({y: REFRESH_HEIGHT - y});
    },
    [content.animator, indicator.animator],
  );
  const stopPlacing = useCallback(() => {
    content.animator.stop(['y']);
    indicator.animator.stop(['y']);
  }, [content.animator, indicator.animator]);

  /**
   * Puts the indicator back to opaque and unturned, writing only what changed:
   * every animator write promotes its layer for a while, and the layer's
   * release, mid-settle, would cost a layout and a paint.
   */
  const restoreIndicator = useCallback(() => {
    if (indicator.animator.get('opacity') !== 1) {
      indicator.animator.set({opacity: 1});
    }
    if (turn.animator.get('rotate') !== 0) {
      turn.animator.set({rotate: 0});
    }
    if (turn.animator.get('scale') !== 1) {
      turn.animator.set({scale: 1});
    }
    if (title.animator.get('opacity') !== 1) {
      title.animator.set({opacity: 1});
    }
  }, [indicator.animator, title.animator, turn.animator]);

  const resetIndicator = useCallback(() => {
    stopSpin();
    indicatorElement.current?.removeAttribute(REFRESH_SPINNING_ATTRIBUTE);
    indicatorElement.current?.style.removeProperty(REFRESH_SPIN_STEP_VAR);
    setReveal(0);
    restoreIndicator();
  }, [restoreIndicator, setReveal, stopSpin]);

  const startSpinning = useCallback(
    (withTurn: boolean) => {
      setReveal(1);
      if (indicator.animator.get('opacity') !== 1) {
        indicator.animator.set({opacity: 1});
      }
      indicatorElement.current?.style.setProperty(
        REFRESH_SPIN_STEP_VAR,
        String(refreshControl.spinAlphaStep),
      );
      indicatorElement.current?.setAttribute(REFRESH_SPINNING_ATTRIBUTE, '');
      const spinner = spinnerElement.current;
      if (
        spin.current == null &&
        spinner != null &&
        typeof spinner.animate === 'function'
      ) {
        spin.current = spinner.animate(
          spinKeyframes(refreshControl.indicatorSpokes),
          {
            duration: refreshControl.spinMs,
            iterations: Infinity,
            easing: 'linear',
          },
        );
      }
      // Under Reduce Motion there is no turn: the spinner starts at rest, so
      // nothing moves and nothing changes (design:reduced-motion DR1), where
      // the animator's cross-fade would blink the spinner out and back.
      if (withTurn && turn.animator.reducedMotion() === 'off') {
        turn.animator.set({rotate: TURN_DEGREES});
        turn.animator.animate(
          {rotate: 0},
          {spring: refreshControl.triggerTurnSpring, velocity: {rotate: 0}},
        );
      }
    },
    [indicator.animator, setReveal, turn.animator],
  );

  // -- Scroll owner and its top-edge policy ----------------------------------

  const edge = useRef<{
    element: HTMLElement | null;
    saved: string | null;
    releaseRoot: (() => void) | null;
  }>({element: null, saved: null, releaseRoot: null});

  const releaseEdge = useCallback(() => {
    const state = edge.current;
    if (state.element != null && state.saved != null) {
      state.element.style.overscrollBehaviorY = state.saved;
    }
    state.releaseRoot?.();
    edge.current = {element: null, saved: null, releaseRoot: null};
  }, []);

  const isPullEnabledRef = useRef(isPullEnabled);
  isPullEnabledRef.current = isPullEnabled;
  const isEdgeClaimedRef = useRef(isEdgeClaimed);
  isEdgeClaimedRef.current = isEdgeClaimed;

  /** Near the top, the browser draws no overscroll: the pull does. */
  const applyEdge = useCallback(() => {
    const current = owner.current;
    const near =
      isPullEnabledRef.current &&
      isEdgeClaimedRef.current &&
      scrollTopOf(current) < Math.max(heightOf(current), REFRESH_HEIGHT);
    const state = edge.current;
    if (!near || state.element !== current) {
      releaseEdge();
    }
    if (!near) {
      return;
    }
    if (current == null) {
      if (edge.current.releaseRoot == null) {
        edge.current = {
          element: null,
          saved: null,
          releaseRoot: claimRootScrollStyle({overscrollBehaviorY: 'none'}),
        };
      }
      return;
    }
    if (current.style.overscrollBehaviorY !== 'none') {
      // First claim, or the owner's own render replaced the value.
      edge.current = {
        element: current,
        saved: current.style.overscrollBehaviorY,
        releaseRoot: null,
      };
      current.style.overscrollBehaviorY = 'none';
    }
  }, [releaseEdge]);

  const resolveOwner = useCallback((): HTMLElement | null => {
    const element = contentElement.current;
    if (element == null) {
      return owner.current;
    }
    const next = findScrollOwner(element);
    if (next !== owner.current) {
      releaseEdge();
      owner.current = next;
    }
    return next;
  }, [releaseEdge]);

  useEffect(() => {
    // The owner and its top edge are watched only while the pull can take the
    // edge (a finger can pull): otherwise no listener is held
    // (react-component-runtime INV5); a contact re-resolves the owner.
    // The edge is claimed before a touch lands (the gesture host's listeners
    // are passive, so a claim made at touch-down could come after the
    // browser has started its own overscroll); a touch-down re-resolves the
    // owner, so no resize listener is needed.
    if (!isPullEnabled || !isEdgeClaimed) {
      releaseEdge();
      return undefined;
    }
    const update = () => {
      resolveOwner();
      applyEdge();
    };
    update();
    // A scroll container can start scrolling only after its own effects have
    // run, after this one (ScrollableArea clips its viewport until it has
    // measured it): look again once those have rendered.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(update);
    });
    // Scroll events do not bubble: read the owner's, and any ancestor's (an
    // ancestor that scrolls is a scroll owner), in the capture phase.
    const onScroll = (event: Event) => {
      const target = event.target;
      if (target === (owner.current ?? contentElement.current?.ownerDocument)) {
        applyEdge();
      } else if (
        target instanceof Element &&
        contentElement.current != null &&
        target.contains(contentElement.current)
      ) {
        update();
      }
    };
    document.addEventListener('scroll', onScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', onScroll, {capture: true});
      releaseEdge();
    };
  }, [applyEdge, isEdgeClaimed, isPullEnabled, releaseEdge, resolveOwner]);

  // -- Motion of the state machine's effects ----------------------------------

  const startSettle = useCallback(
    (to: 'inset' | 'top') => {
      const target = releaseTarget(to === 'inset');
      const from = content.animator.get('y');
      // No start time: from rest, the animator starts the settle when the
      // compositor does, so its first frame is the start of the curve. A
      // finger's release starts it as a touch release, so under Reduce Motion
      // the animator cross-fades it instead of moving it
      // (design:reduced-motion DR2); the animator does so for any release
      // where the primary pointer is coarse, and lands a pen's or a mouse's at
      // once elsewhere (DR3, spec:AST-094 FR43).
      const touchRelease = pullPointer.current === 'touch';
      content.animator.animate(
        {y: target},
        {spring: scroll.bounce, velocity: {y: 0}},
        {touchRelease},
      );
      indicator.animator.animate(
        {y: REFRESH_HEIGHT - target},
        {spring: scroll.bounce, velocity: {y: 0}},
        {touchRelease},
      );
      if (to === 'top' && !model.current.isRefreshing && from > 0) {
        // The spokes retract with the content: started in the same task, the
        // two start on the same compositor frame.
        const curve = solveSpring(toSpring(scroll.bounce), {from, to: 0});
        const {dimension} = pull.current;
        const start = revealProgress(from, dimension) || 1;
        const duration = Math.max(0.016, curve.settleTime(0.05));
        const opacity = (time: number) =>
          revealProgress(curve.value(time), dimension) / start;
        indicator.animator
          .play(
            {
              opacity: {
                duration,
                at: opacity,
                velocity: derivative(opacity, duration),
              },
            },
            {touchRelease},
          )
          .finished.then(done => {
            if (done && !model.current.isRefreshing) {
              resetIndicator();
            }
          });
      }
    },
    [content.animator, indicator.animator, resetIndicator],
  );

  const settle = useCallback(
    (to: 'inset' | 'top') => {
      if (to === 'inset') {
        hasInset.current = true;
      }
      // Started in the lift's own task: the frame right after a long task
      // carries the time it was due, so an animation started there would
      // begin in the past.
      startSettle(to);
    },
    [startSettle],
  );

  const end = useCallback(() => {
    const hadInset = hasInset.current;
    hasInset.current = false;
    if (model.current.isPulling) {
      // Under the finger: the release settles back to the top, and the
      // indicator retracts with it.
      pull.current.floor = 0;
      stopSpin();
      indicatorElement.current?.removeAttribute(REFRESH_SPINNING_ATTRIBUTE);
      indicatorElement.current?.style.removeProperty(REFRESH_SPIN_STEP_VAR);
      return;
    }
    if (!hadInset) {
      // A refresh that never showed (begun without a finger): nothing to move.
      resetIndicator();
      return;
    }
    // From rest: a settle still easing onto the inset stops where it is
    // shown. Ending over it would continue it with a fixed start time, which
    // WebKit skips past when a block follows.
    stopPlacing();
    const current = resolveOwner();
    const {animateTo, scrollBy} = endMotion(scrollTopOf(current));
    if (animateTo == null) {
      place(0);
      scrollOwnerBy(current, scrollBy);
      resetIndicator();
      return;
    }
    // The slide starts two frames after the refresh's end has rendered (the
    // app's update, the busy state): WebKit starts an animation created just
    // before a long task at the frame before it, and the first frame after a
    // long task carries the time it was due, so either way the start of the
    // slide would never show.
    pendingEnd.current = () => {
      // The spinner stays opaque while the content slides up over its gap
      // (UIKit holds it at opacity 1 for nearly the whole end).
      const from = content.animator.get('y');
      const element = contentElement.current;
      const duration = refreshControl.endMs;
      const curve = resolveMotion(element, timing.curves.move);
      // UIKit replaces the spin with the end: the indicator shrinks to almost
      // nothing as it turns, and the title fades out, over the same 0.3 s.
      // Under Reduce Motion the animator cross-fades the slide, fades the
      // spinner out where it is and shortens the title's fade
      // (design:reduced-motion DR2, DR3).
      const exit = refreshControl.exitMs;
      stopSpin();
      turn.animator.play(
        {
          rotate: bezierCurve(0, TURN_DEGREES, exit, curve),
          scale: bezierCurve(1, refreshControl.exitScale, exit, curve),
        },
        {crossfadeAs: 'exit'},
      );
      title.animator.play({opacity: bezierCurve(1, 0, exit, curve)});
      indicator.animator.play({
        y: bezierCurve(
          REFRESH_HEIGHT - from,
          REFRESH_HEIGHT - animateTo,
          duration,
          curve,
        ),
      });
      content.animator
        .play({y: bezierCurve(from, animateTo, duration, curve)})
        .finished.then(done => {
          if (done) {
            place(0);
            scrollOwnerBy(current, scrollBy);
            if (!model.current.isRefreshing) {
              resetIndicator();
            }
          }
        });
    };
    setEndTick(tick => tick + 1);
  }, [
    content.animator,
    indicator.animator,
    place,
    resetIndicator,
    resolveOwner,
    stopPlacing,
    stopSpin,
    title.animator,
    turn.animator,
  ]);

  // Plays a pending end once the refresh's end has rendered: this effect runs
  // after the commit that carries the end's tick, and the slide starts two
  // frames later. A tick rather than the rendered `isRefreshing`: a refresh
  // that begins and ends before React renders (a `refresh()` from a timer
  // whose `onRefresh` settles at once) never changes it.
  useEffect(() => {
    if (pendingEnd.current == null) {
      return;
    }
    endFrame.current = requestAnimationFrame(() => {
      endFrame.current = requestAnimationFrame(() => {
        endFrame.current = null;
        const play = pendingEnd.current;
        pendingEnd.current = null;
        play?.();
      });
    });
  }, [endTick]);
  useEffect(
    () => () => {
      if (endFrame.current != null) {
        cancelAnimationFrame(endFrame.current);
      }
    },
    [],
  );

  // -- The pull -------------------------------------------------------------

  // The pan's vertical translation where the pull starts: null until the
  // content is at its top under a finger moving down.
  const anchor = useRef<number | null>(null);
  const lastTranslation = useRef(0);
  // A settle a finger caught (it stops where it is on touch-down) resumes
  // when no pull follows.
  const resumeSettle = useCallback(() => {
    if (model.current.isPulling) {
      return;
    }
    const target = releaseTarget(model.current.isRefreshing);
    if (Math.abs(content.animator.get('y') - target) > 0.05) {
      settle(model.current.isRefreshing ? 'inset' : 'top');
    }
  }, [content.animator, model, settle]);

  const recognizer = useGestureRecognizer(
    contentElement,
    () => new RefreshPullRecognizer(),
    pan => {
      const state = model.current;
      if (pan.state === 'began' || pan.state === 'changed') {
        const translation = pan.translation().y;
        if (anchor.current == null) {
          // Not pulling yet: the browser may be scrolling the content (a drag
          // that began as a scroll). The pull starts where the content is at
          // its top under a finger moving down, in the same touch: the
          // browser keeps the finger all along, so nothing changes hands
          // (AST-094 FR14; the pan only watches, FR20).
          const current =
            pan.state === 'began' ? resolveOwner() : owner.current;
          // At `began` the finger's whole move counts, the threshold's
          // included (a slow drag begins at a translation of zero).
          const isMovingDown =
            pan.state === 'began'
              ? translation + pan.travelAtBegan.y > 0
              : translation > lastTranslation.current;
          lastTranslation.current = translation;
          if (!isMovingDown || scrollTopOf(current) > 0) {
            return;
          }
          // From rest the travel is the pan's (which leaves out its
          // hysteresis, as UIKit's does); past a scroll it starts where the
          // content ran out.
          anchor.current = pan.state === 'began' ? 0 : translation;
          pullPointer.current = pan.pointerType;
          if (pan.pointerType !== 'touch') {
            clearDragSelection();
          }
          holdSelection();
          const shown = content.animator.get('y');
          stopPlacing();
          const dimension = heightOf(current);
          const mode: PullMode = state.isRefreshing ? 'band' : 'reveal';
          pull.current = {
            dimension,
            mode,
            trigger: triggerDistance(dimension),
            floor: state.isRefreshing ? REFRESH_HEIGHT : 0,
            travel0: pullTravel(shown, dimension, mode),
            scrollTop0: scrollTopOf(current),
          };
          dispatch({type: 'pullStart'});
        }
        lastTranslation.current = translation;
        const geometry = pull.current;
        // A browser that scrolls the content back as the finger returns
        // (Chromium) takes over from the pull.
        const scrolledBack =
          scrollTopOf(owner.current) - geometry.scrollTop0 > 0.5;
        const travel = scrolledBack
          ? 0
          : geometry.travel0 + (translation - anchor.current);
        const overscroll = Math.max(
          geometry.floor,
          pullOverscroll(travel, geometry.dimension, geometry.mode),
        );
        const hadTriggered = model.current.hasTriggered;
        dispatch({type: 'pullMove', overscroll, trigger: geometry.trigger});
        if (!hadTriggered && model.current.hasTriggered) {
          // The frame after the trigger steps onto the finger (within the
          // one-to-one band).
          geometry.mode =
            geometry.mode === 'band' ? 'band' : modeAfterTrigger(travel);
        }
        place(overscroll);
        if (!model.current.isRefreshing) {
          setReveal(revealProgress(overscroll, geometry.dimension));
        }
        return;
      }
      if (pan.state !== 'ended' && pan.state !== 'cancelled') {
        return;
      }
      const wasPulling = anchor.current != null;
      anchor.current = null;
      if (!wasPulling) {
        // A scroll that never reached the top: a settle the finger caught
        // resumes.
        resumeSettle();
        return;
      }
      releaseSelection();
      dispatch({type: pan.state === 'ended' ? 'pullEnd' : 'pullCancel'});
    },
  );
  // Syncs whether the pull applies (not disabled, no scroll lock)
  // with the recognizer, an object outside React. Turned off mid-pull, it
  // reports `cancelled` to the listener above, which settles the content back
  // and ends the pull (the hook's own `isEnabled` would end it silently).
  useEffect(() => {
    recognizer.setEnabled(isPullEnabled);
  }, [isPullEnabled, recognizer]);

  useEffect(() => {
    // A finger landing on a settle in flight stops it (UIScrollView brakes);
    // if no pull follows, the settle resumes.
    recognizer.onTouchDown = () => {
      resolveOwner();
      applyEdge();
      cancelPendingEnd();
      stopPlacing();
    };
    const stopListening = recognizer.addTransitionListener(current => {
      if (current.state === 'failed') {
        resumeSettle();
      }
    });
    return () => {
      recognizer.onTouchDown = null;
      stopListening();
    };
  }, [
    applyEdge,
    cancelPendingEnd,
    recognizer,
    resolveOwner,
    resumeSettle,
    stopPlacing,
  ]);

  useEffect(
    () => () => {
      spin.current?.cancel();
      spin.current = null;
    },
    [],
  );

  const contentRef = useCallback(
    (element: HTMLElement | null) => {
      contentElement.current = element;
      content.ref(element);
    },
    [content],
  );
  const indicatorRef = useCallback(
    (element: HTMLElement | null) => {
      indicatorElement.current = element;
      indicator.ref(element);
    },
    [indicator],
  );

  const spinnerRef = useCallback(
    (element: HTMLElement | null) => {
      spinnerElement.current = element;
      turn.ref(element);
    },
    [turn],
  );

  const trigger = useCallback(() => {
    // Only a pull triggers: it settles onto the inset.
    hasInset.current = true;
    startSpinning(true);
  }, [startSpinning]);

  const begin = useCallback(() => {
    startSpinning(false);
    if (!model.current.isPulling) {
      // The inset arrives with no visible motion, as beginRefreshing().
      cancelPendingEnd();
      const current = resolveOwner();
      place(REFRESH_HEIGHT);
      scrollOwnerBy(current, REFRESH_HEIGHT);
      hasInset.current = true;
    }
  }, [cancelPendingEnd, model, place, resolveOwner, startSpinning]);

  return useMemo(
    () => ({
      contentRef,
      indicatorRef,
      spinnerRef,
      titleRef: title.ref,
      trigger,
      begin,
      settle,
      end,
    }),
    [
      begin,
      contentRef,
      end,
      indicatorRef,
      settle,
      spinnerRef,
      title.ref,
      trigger,
    ],
  );
}
