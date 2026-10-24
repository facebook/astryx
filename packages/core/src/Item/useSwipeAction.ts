// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useSwipeAction.ts
 * @input Per side, the panel parts that move (callback refs; the row root
 *   is their parent); the gesture foundation (PanGestureRecognizer) and the
 *   compositor animator; the UIKit constants table and swipeRelease.ts
 * @output Exports useSwipeAction — the gesture and the motion behind Item's
 *   `swipeActions` — and swipeParts, where every moving part sits for a
 *   travel (where a release lands is swipeRelease.ts)
 * @position Internal to Item, through ItemSwipeLayer (the only module that
 *   imports it, loaded on demand); tested through Item.test.tsx and
 *   useSwipeAction.test.ts
 *
 * A UIKit list swipe: drag a row sideways and the side's panel is uncovered.
 * Under `reveal` a fast release goes the way it moves and a slow one rests
 * the row open past half the open width, with every entry tappable. A drag
 * on past the confirm point confirms a full swipe: the row runs ahead to
 * UIKit's confirmation offset and the outermost entry covers the space, and
 * letting go there fires it; backing out undoes the look, and a swipe that
 * backed out closes. Under `commit` only a confirmed full swipe fires, and
 * nothing rests (swipeRelease.ts). After an entry fires the row springs back,
 * or holds out when the entry has `hasRemoval`.
 *
 * Touch only (the recognizer's pointer types), by pointer type rather than
 * by breakpoint: a mouse has the row's own controls and a keyboard has the
 * verb already; the gesture is an accelerator for a verb the row exposes
 * elsewhere, never the only way to reach one.
 *
 * The pan is the gesture foundation's, published as `Item.swipe` so an app
 * can relate its own recognizers to it. It claims the touch after 8 px of
 * sideways travel (a drag more vertical than horizontal belongs to the
 * scroller and fails it), toward a side with entries or on a row that is open
 * or moving: a browser commits to scrolling a touch at about 10 px, so the
 * row must claim before that. In the iOS idiom the swipe itself begins where
 * UIKit's does, after 25 px, from 0, and in between the row carries on as it
 * was. The foundation tells the browser (`touch-action: pan-y pinch-zoom`, `touchmove`
 * cancelled only while the pan owns the touch, the click the browser
 * synthesizes swallowed) and leaves a pinch to the page: a second finger
 * before the claim fails the pan, after it is ignored.
 *
 * On iOS an open row (resting, or settling to rest open: UIKit counts a row
 * open from the release that opens it) closes on a pointer landing outside
 * it, on a scroll of anything that holds it, on Escape with focus inside it,
 * and on a tap on its own content. That tap activates nothing on the row, as
 * in UIKit: a foundation tap recognizer takes it at the lift, so the browser
 * never clicks. Outside iOS a resting row closes on a pointer landing outside
 * it and on Escape, as it always has, and a tap on its content clicks the
 * row.
 *
 * Motion is UIKit's, on the compositor. Every move of the finger starts a
 * spring toward the finger's offset from the row's presentation value and
 * velocity, so the row trails a moving finger and catches up when it stops;
 * the release starts the same spring toward where the row lands, still from
 * the presentation velocity. A finger that lands on a moving row catches it
 * where it is. The row's root translates; each side's panel is a window over
 * the row's resting box (translated back by the travel, so it stays put and
 * clips to that box), a track inside it that moves with the row (so it paints
 * exactly the space the row vacates, in the outermost entry's colour), and
 * the entries inside the track, translated back again so they stay pinned at
 * the outer edge; past the open width they ride the row and the track's
 * colour stretches the outermost entry out to the outer edge. The animators
 * share one clock, and every curve is an affine image of the root's or one
 * of the full swipe's (the outermost entry's slide and the others' fade, on
 * the same spring): they cannot drift apart, nothing lays out, and they keep
 * moving while the main thread is busy. A drag costs no React render; the
 * claim, the confirming and the landing each cost one.
 *
 * All of that is iOS's idiom (`idiom`, from useTouchIdiom). Outside iOS
 * (Android, any finger outside iOS) the row keeps the swipe it had before,
 * on the same gesture and compositor parts, until a Material variant exists:
 * it moves from the touch-down, follows the finger one for one, settles on
 * CSS's `ease-out` over 200 ms (at once under Reduce Motion, as before), and
 * a release past the commit point or a fling fires (DEFAULT_SWIPE in
 * swipeRelease.ts).
 *
 * Directions are logical: `leading` is uncovered by a drag toward the inline
 * end and sits at the inline start, `trailing` the reverse, read against the
 * root's computed `direction` when the pan begins, so under `dir="rtl"` the
 * finger, the uncovered edge and the panel agree.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type {KeyboardEvent as ReactKeyboardEvent} from 'react';
import {
  PanGestureRecognizer,
  TapGestureRecognizer,
  useGestureRecognizer,
} from '../gestures';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {isRtlElement} from '../hooks/isRtlElement';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '../motion/animator';
import {cubicBezier} from '../motion/bezier';
import {solveSpring, toSpring, type SpringDescription} from '../motion/spring';
import {swipeActions as SWIPE} from '../motion/uikit';
import type {TouchIdiom} from '../utils/touchPresentation';
import {
  DEFAULT_SWIPE,
  confirmedOffset,
  confirmPoint,
  defaultCommitPoint,
  defaultResistedTravel,
  resolveDefaultRelease,
  resolveRelease,
} from './swipeRelease';

export type SwipeSide = 'leading' | 'trailing';
export type SwipeBehavior = 'reveal' | 'commit';
export type SwipePhase =
  /** At rest, closed. */
  | 'idle'
  /** The finger drives the row. */
  | 'dragging'
  /** Springing to where the release, a tap or a close sent it. */
  | 'settling'
  /** Resting open with the side's panel tappable (`reveal` only). */
  | 'resting'
  /** Out, after an entry with `hasRemoval` fired. */
  | 'held';

export interface SwipeState {
  phase: SwipePhase;
  /** The side whose panel is uncovered, or will be. */
  side: SwipeSide;
  /** A confirmed full swipe: letting go now fires the outermost entry. */
  isArmed: boolean;
  /** Where the settle in progress lands (`settling` only). */
  landing?: 'idle' | 'resting' | 'held';
}

/**
 * The row is open: resting, or settling to rest open. UIKit counts a row open
 * from the release that opens it, not from when its spring comes to rest: an
 * open row closes on a tap on its content, a pointer outside it, a scroll or
 * Escape, and its root takes no press.
 */
export function isSwipeOpen(state: SwipeState): boolean {
  return (
    state.phase === 'resting' ||
    (state.phase === 'settling' && state.landing === 'resting')
  );
}

/** Callback refs for the elements of one side's panel that move. */
export interface SwipePanelRefs {
  /** The window over the row's resting box. */
  panel: (element: HTMLElement | null) => void;
  /** The fill that moves with the row, clipped by the window. */
  track: (element: HTMLElement | null) => void;
  /** The entries, pinned at the outer edge inside the track. */
  entries: (element: HTMLElement | null) => void;
  /** The entries other than the outermost, which fade on a confirmed full swipe. */
  inner: (element: HTMLElement | null) => void;
  /** The outermost entry, which slides to the row's edge on a confirmed full swipe. */
  outer: (element: HTMLElement | null) => void;
}

export interface UseSwipeActionOptions {
  behavior: SwipeBehavior;
  /** Which sides have entries. A drag toward a side without any never begins. */
  sides: {leading: boolean; trailing: boolean};
  /**
   * Fire the side's outermost entry. Returns whether the row holds out
   * afterwards (the entry's `hasRemoval`).
   */
  fireOutermost: (side: SwipeSide) => boolean;
  /** Whether the side's outermost entry can fire: a disabled one never confirms a full swipe. */
  canConfirm: (side: SwipeSide) => boolean;
  /**
   * Whose idiom the swipe follows (`useTouchIdiom()`): `ios` is UIKit's
   * swipe; `default` (Android, any finger outside iOS) is the row's own, as
   * it was before.
   */
  idiom?: TouchIdiom;
}

export interface UseSwipeActionResult {
  state: SwipeState;
  /** Attach each side's moving panel parts. */
  panelRefs: Record<SwipeSide, SwipePanelRefs>;
  /**
   * A resting panel's entry was tapped: fire it, then hold the row out
   * (`hasRemoval`) or close.
   */
  activateEntry: (fire: () => boolean) => void;
  /** Close a resting row. */
  close: () => void;
  /** Escape closes a resting row with focus inside it. */
  onKeyDown: (event: ReactKeyboardEvent) => void;
}

// =============================================================================
// Geometry (pure)
// =============================================================================

export interface SwipeLayout {
  side: SwipeSide;
  /** +1 when the inline end is to the right (LTR), −1 under RTL. */
  inlineSign: 1 | -1;
  /** The side's entries at their natural width: how far the row opens. */
  openWidth: number;
  /** The outermost entry's width. */
  outerWidth: number;
}

/** +1 when the side's panel is on the physical left, −1 on the right. */
export function physicalSign(side: SwipeSide, inlineSign: 1 | -1): 1 | -1 {
  return side === 'leading' ? inlineSign : inlineSign === 1 ? -1 : 1;
}

/**
 * Where every moving part sits for a travel (logical px toward the side,
 * ≥ 0), as a physical translation, and how far a full swipe has confirmed
 * (`confirm`, 0 or 1). The root moves by the travel, the panel window
 * cancels it (fixed over the resting box) and the track moves with the row.
 * Up to the open width the entries cancel the track, pinned at the outer
 * edge where the track's painted part uncovers them; past it they ride the
 * row, and the track's colour (the outermost entry's) fills behind them out
 * to the outer edge, so the outermost entry stretches. Confirmed, the
 * outermost entry slides to the row's edge and the others fade (`fade`): its
 * colour covers everything the row uncovered. Outside iOS (`ride` false) the
 * entries stay pinned at the outer edge at every travel, as they always were.
 */
export function swipeParts(
  travel: number,
  {side, inlineSign, openWidth, outerWidth}: SwipeLayout,
  confirm = 0,
  ride = true,
): {
  root: number;
  panel: number;
  track: number;
  entries: number;
  outer: number;
  fade: number;
} {
  const sign = physicalSign(side, inlineSign);
  const x = sign * travel;
  return {
    root: x,
    panel: -x,
    track: x,
    entries: ride
      ? sign * (openWidth - Math.min(travel, openWidth))
      : sign * openWidth - x,
    outer: sign * (openWidth - outerWidth) * confirm,
    fade: 1 - confirm,
  };
}

/** A curve's end, where the animator's own spring curves end (its settle threshold for x). */
const SETTLE_PX = 0.05;

/**
 * The travel parts' curves for one spring of the row, from its presentation
 * value and velocity (physical px, px/s) to `travel`. Every part is a
 * function of the root's curve at every instant, so they cannot drift
 * apart: the window and the track are affine images of it, and the entries
 * follow the same piecewise rule as `swipeParts`, pinned up to the open
 * width and riding the row past it, even when a spring crosses the open
 * width mid-flight.
 */
export function swipeCurves(
  layout: SwipeLayout,
  spring: SpringDescription,
  from: number,
  velocity: number,
  travel: number,
): {
  root: MotionCurve;
  panel: MotionCurve;
  track: MotionCurve;
  entries: MotionCurve;
} {
  const sign = physicalSign(layout.side, layout.inlineSign);
  const curve = solveSpring(toSpring(spring), {
    from,
    to: sign * travel,
    velocity,
  });
  const duration = curve.settleTime(SETTLE_PX);
  // The end state is the target itself, as the animator's own springs end.
  const x = (t: number) => (t >= duration ? sign * travel : curve.value(t));
  const v = (t: number) => (t >= duration ? 0 : curve.velocity(t));
  const root: MotionCurve = {duration, at: x, velocity: v};
  const {openWidth} = layout;
  return {
    root,
    panel: {duration, at: t => -x(t), velocity: t => -v(t)},
    track: root,
    entries: {
      duration,
      at: t => sign * (openWidth - Math.min(sign * x(t), openWidth)),
      velocity: t => (sign * x(t) < openWidth ? -v(t) : 0),
    },
  };
}

// =============================================================================
// The hook
// =============================================================================

const IDLE_STATE: SwipeState = {isArmed: false, phase: 'idle', side: 'leading'};

const easeOut = cubicBezier(DEFAULT_SWIPE.settleCurve);

/** The row's own settle outside iOS: CSS's `ease-out` from `from` to `to`. */
function settleCurve(from: number, to: number): MotionCurve {
  const duration = DEFAULT_SWIPE.settleMs / 1000;
  const step = 1e-4;
  return {
    duration,
    at: t => from + (to - from) * easeOut(t / duration),
    velocity: t => {
      const a = Math.max(0, t / duration - step);
      const b = Math.min(1, t / duration + step);
      return ((to - from) * (easeOut(b) - easeOut(a))) / ((b - a) * duration);
    },
  };
}

/** Below this the row is at rest, closed. */
const AT_REST_PX = 0.5;

interface SideAnimators {
  panel: Animator;
  track: Animator;
  entries: Animator;
  inner: Animator;
  outer: Animator;
}

interface Animators {
  root: Animator;
  leading: SideAnimators;
  trailing: SideAnimators;
}

interface Drag {
  layout: SwipeLayout;
  rowWidth: number;
  /** The finger's swipe at which the full swipe confirms (iOS). */
  confirmAt: number;
  /** Outside iOS: the travel past which a release fires (DEFAULT_SWIPE). */
  commitAt: number;
  /** The side's outermost entry can fire (not disabled). */
  canConfirm: boolean;
  /** The state the row had when the touch was claimed, for a swipe that never began. */
  previous: SwipeState;
  /** Past UIKit's threshold: the row follows the finger. */
  started: boolean;
  /** Which way the finger crossed the threshold: +1 toward the side, -1 away. */
  startSign: number;
  /** The travel the row had when the swipe began (logical, ≥ 0). */
  baseTravel: number;
  /** The finger's travel along the side. */
  raw: number;
  /** Confirmed: the finger is past the confirm point. */
  isArmed: boolean;
  /** The full swipe confirmed at some point in this swipe. */
  wasConfirmed: boolean;
}

function createSide(): SideAnimators {
  return {
    entries: createAnimator(null),
    inner: createAnimator(null),
    outer: createAnimator(null),
    panel: createAnimator(null),
    track: createAnimator(null),
  };
}

function allOf(animators: Animators): Animator[] {
  return [
    animators.root,
    ...Object.values(animators.leading),
    ...Object.values(animators.trailing),
  ];
}

/**
 * The first focusable thing in the row outside its swipe panels, for focus to
 * land on when a resting panel closes under it.
 */
function focusRowContent(root: HTMLElement): void {
  const candidates = root.querySelectorAll<HTMLElement>(
    'button, a[href], input, [tabindex]:not([tabindex="-1"])',
  );
  for (const el of candidates) {
    if (el.closest('[data-swipe-panel]') == null) {
      el.focus();
      return;
    }
  }
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

export function useSwipeAction({
  behavior,
  sides,
  fireOutermost,
  canConfirm,
  idiom = 'default',
}: UseSwipeActionOptions): UseSwipeActionResult {
  const [state, setState] = useState<SwipeState>(IDLE_STATE);
  const stateRef = useRef(state);
  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  });
  const setSwipeState = useCallback((next: SwipeState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  // The latest options, read by listeners and completions that outlive a render.
  const latestRef = useRef({behavior, canConfirm, fireOutermost, idiom, sides});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {behavior, canConfirm, fireOutermost, idiom, sides};
  });

  const [animators] = useState<Animators>(() => ({
    leading: createSide(),
    root: createAnimator(null),
    trailing: createSide(),
  }));
  /** The layout of the side that moved last: where the row is, and how to move it. */
  const layoutRef = useRef<SwipeLayout | null>(null);
  const dragRef = useRef<Drag | null>(null);
  /** The row is open (see `isSwipeOpen`), read by listeners and recognizers. */
  const isOpen = useCallback(
    () =>
      latestRef.current.idiom === 'ios'
        ? isSwipeOpen(stateRef.current)
        : stateRef.current.phase === 'resting',
    [],
  );

  // The row root: the gesture's target and the element that translates. A
  // panel is its child, and a panel's ref is set before this hook's layout
  // effects run, while a ref on the root itself is set after them.
  const rootRef = useRef<HTMLElement | null>(null);
  // The parts attach as they mount (a side's panel exists only while it has
  // entries); attaching writes where the part is now.
  const [panelRefs] = useState<Record<SwipeSide, SwipePanelRefs>>(() => {
    const refsFor = (side: SideAnimators): SwipePanelRefs => ({
      entries: element => side.entries.attach(element),
      inner: element => side.inner.attach(element),
      outer: element => side.outer.attach(element),
      panel: element => {
        if (element?.parentElement != null) {
          rootRef.current = element.parentElement;
        }
        side.panel.attach(element);
      },
      track: element => side.track.attach(element),
    });
    return {
      leading: refsFor(animators.leading),
      trailing: refsFor(animators.trailing),
    };
  });
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    animators.root.attach(root);
    return () => {
      for (const animator of allOf(animators)) {
        animator.dispose();
      }
      // The root outlives the layer: give it back its own translation.
      root?.style.removeProperty('translate');
    };
  }, [animators, rootRef]);

  /** The row's travel on screen now, logical, on `layout`'s side. */
  const travelNow = useCallback(
    (layout: SwipeLayout): number =>
      Math.max(
        0,
        animators.root.get('x') * physicalSign(layout.side, layout.inlineSign),
      ),
    [animators],
  );

  /**
   * Spring every part of the side to `travel` on one clock, from the
   * presentation values and velocities. Resolves with the root's completion.
   */
  const springTo = useCallback(
    async (
      layout: SwipeLayout,
      travel: number,
      spring: SpringDescription,
      confirm = 0,
    ): Promise<boolean> => {
      layoutRef.current = layout;
      const parts = swipeParts(travel, layout, confirm);
      const side = animators[layout.side];
      const at = performance.now();
      // Direct manipulation and its follow-through: UIKit keeps the motion
      // under Reduce Motion.
      const options = {at, reducedMotion: SWIPE.reducedMotion};
      const curves = swipeCurves(
        layout,
        spring,
        animators.root.get('x', at),
        animators.root.getVelocity('x', at),
        travel,
      );
      const handle = animators.root.play({x: curves.root}, options);
      side.panel.play({x: curves.panel}, options);
      side.track.play({x: curves.track}, options);
      side.entries.play({x: curves.entries}, options);
      // UIKit sets the full swipe's look inside the same per-move animator.
      side.outer.animate({x: parts.outer}, {spring}, options);
      side.inner.animate({opacity: parts.fade}, {spring}, options);
      return handle.finished;
    },
    [animators],
  );

  /** Every part of the side at `travel` now: a drag outside iOS, one for one. */
  const moveTo = useCallback(
    (layout: SwipeLayout, travel: number) => {
      layoutRef.current = layout;
      const parts = swipeParts(travel, layout, 0, false);
      const side = animators[layout.side];
      animators.root.set({x: parts.root});
      side.panel.set({x: parts.panel});
      side.track.set({x: parts.track});
      side.entries.set({x: parts.entries});
    },
    [animators],
  );

  /**
   * Every part of the side to `travel` on the row's own settle outside iOS,
   * on one clock from the presentation values; at once under Reduce Motion,
   * as before. Resolves with the root's completion.
   */
  const curveTo = useCallback(
    async (layout: SwipeLayout, travel: number): Promise<boolean> => {
      layoutRef.current = layout;
      const parts = swipeParts(travel, layout, 0, false);
      const side = animators[layout.side];
      const options = {
        at: performance.now(),
        reducedMotion: 'instant' as const,
      };
      const play = (animator: Animator, to: number) =>
        animator.play({x: settleCurve(animator.get('x'), to)}, options);
      const handle = play(animators.root, parts.root);
      play(side.panel, parts.panel);
      play(side.track, parts.track);
      play(side.entries, parts.entries);
      return handle.finished;
    },
    [animators],
  );

  /**
   * Settle the row at `travel` and land in `phase`. The landing is skipped
   * when something interrupts the settle (a finger catches the row, another
   * settle starts).
   */
  const settle = useCallback(
    (
      layout: SwipeLayout,
      travel: number,
      phase: 'idle' | 'resting' | 'held',
      afterSettle?: () => boolean,
      confirm = 0,
    ) => {
      setSwipeState({
        isArmed: false,
        landing: phase,
        phase: 'settling',
        side: layout.side,
      });
      const motion =
        latestRef.current.idiom === 'ios'
          ? springTo(layout, travel, SWIPE.settle, confirm)
          : curveTo(layout, travel);
      void motion.then(finished => {
        if (!finished) {
          return;
        }
        // A settle that fires an entry may start the spring back itself; the
        // landing below is then that settle's to make.
        if (afterSettle?.() === true) {
          return;
        }
        setSwipeState(
          phase === 'idle'
            ? IDLE_STATE
            : {isArmed: false, phase, side: layout.side},
        );
      });
    },
    [curveTo, setSwipeState, springTo],
  );

  /** How far out a row goes when an entry fires and the row leaves. */
  const outTravel = useCallback(
    () =>
      (rootRef.current?.clientWidth ?? 0) +
      (latestRef.current.idiom === 'ios'
        ? SWIPE.slideOutOvershoot
        : DEFAULT_SWIPE.slideOutOvershoot),
    [rootRef],
  );

  /**
   * A confirmed full swipe: out with the outermost entry covering the row's
   * place, fire, then hold out or spring back.
   */
  const slideOutAndFire = useCallback(
    (layout: SwipeLayout) => {
      settle(
        layout,
        outTravel(),
        'held',
        () => {
          const holdsOut = latestRef.current.fireOutermost(layout.side);
          if (holdsOut) {
            return false;
          }
          settle(layout, 0, 'idle');
          return true;
        },
        1,
      );
    },
    [outTravel, settle],
  );

  const close = useCallback(() => {
    const layout = layoutRef.current;
    if (!isOpen() || layout == null) {
      return;
    }
    const root = rootRef.current;
    if (root != null && root.contains(document.activeElement)) {
      focusRowContent(root);
    }
    settle(layout, 0, 'idle');
  }, [isOpen, rootRef, settle]);

  const activateEntry = useCallback(
    (fire: () => boolean) => {
      const layout = layoutRef.current;
      if (stateRef.current.phase !== 'resting' || layout == null) {
        return;
      }
      const root = rootRef.current;
      if (root != null && root.contains(document.activeElement)) {
        focusRowContent(root);
      }
      if (fire()) {
        settle(layout, outTravel(), 'held');
      } else {
        settle(layout, 0, 'idle');
      }
    },
    [outTravel, rootRef, settle],
  );

  // An open row closes on a pointer landing anywhere outside it, which is
  // also how a drag on a neighbour closes it: one row rests open at a time
  // with no shared state. It also closes when anything scrolling it moves
  // (the list, the page), as a UIKit row closes when its table scrolls: a
  // scroll that starts on the row itself lands no pointer outside it.
  useEffect(() => {
    if (!isOpen()) {
      return undefined;
    }
    const onOutside = (event: PointerEvent) => {
      const root = rootRef.current;
      if (
        root != null &&
        event.target instanceof Node &&
        !root.contains(event.target)
      ) {
        close();
      }
    };
    const onScroll = (event: Event) => {
      const root = rootRef.current;
      const {target} = event;
      if (
        root != null &&
        (target === document ||
          (target instanceof Element && target.contains(root)))
      ) {
        close();
      }
    };
    document.addEventListener('pointerdown', onOutside, true);
    // A scroll closes the row on iOS only, as UIKit's table does.
    if (idiom === 'ios') {
      document.addEventListener('scroll', onScroll, {
        capture: true,
        passive: true,
      });
    }
    return () => {
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [close, idiom, isOpen, rootRef, state.phase]);

  // ---------------------------------------------------------------------------
  // The pan

  /** The side a drag from a closed row uncovers: toward the inline end is leading. */
  const sideFor = (dx: number, inlineSign: 1 | -1): SwipeSide =>
    dx * inlineSign > 0 ? 'leading' : 'trailing';

  // Two thresholds. The touch is claimed from the browser at `claim` px of
  // sideways travel, before a browser commits to scrolling it; the swipe
  // itself begins where UIKit's does, at `hysteresis` px, and starts from 0
  // there. In between the row does whatever it was doing (resting,
  // settling) and the browser does nothing.
  const begin = (pan: PanGestureRecognizer) => {
    const root = rootRef.current;
    if (root == null) {
      return;
    }
    const inlineSign: 1 | -1 = isRtlElement(root) ? -1 : 1;
    const x = animators.root.get('x');
    // An open or moving row continues on its side (closing it or going
    // further); a closed one takes the side the finger moves toward.
    const side: SwipeSide =
      Math.abs(x) > AT_REST_PX
        ? x * inlineSign > 0
          ? 'leading'
          : 'trailing'
        : sideFor(pan.totalTranslation().x, inlineSign);
    const entries = animators[side].entries.element;
    const layout: SwipeLayout = {
      inlineSign,
      openWidth: entries?.offsetWidth ?? 0,
      outerWidth: animators[side].outer.element?.offsetWidth ?? 0,
      side,
    };
    const rowWidth = root.clientWidth;
    // The entries keep their place against the track only for the width they
    // were placed with; a first drag (or new entries) puts them in place now,
    // while the track still hides them.
    const sideAnimators = animators[side];
    const expected = swipeParts(
      travelNow(layout),
      layout,
      0,
      latestRef.current.idiom === 'ios',
    ).entries;
    if (Math.abs(sideAnimators.entries.get('x') - expected) > AT_REST_PX) {
      sideAnimators.entries.set({x: expected});
    }
    dragRef.current = {
      baseTravel: 0,
      canConfirm: latestRef.current.canConfirm(side),
      commitAt: defaultCommitPoint(layout.openWidth, rowWidth),
      confirmAt: confirmPoint(layout.openWidth, rowWidth),
      isArmed: false,
      layout,
      previous: stateRef.current,
      raw: 0,
      rowWidth,
      started: false,
      startSign: 1,
      wasConfirmed: false,
    };
    track(pan);
  };

  const track = (pan: PanGestureRecognizer) => {
    const drag = dragRef.current;
    if (drag == null) {
      return;
    }
    const {layout} = drag;
    // The finger's travel toward the side since it landed.
    const along =
      pan.totalTranslation().x * physicalSign(layout.side, layout.inlineSign);
    const isIos = latestRef.current.idiom === 'ios';
    // UIKit's dead zone on iOS; none elsewhere, where the row has always
    // moved from the touch-down.
    const threshold = isIos ? SWIPE.hysteresis : 0;
    if (!drag.started) {
      if (Math.abs(along) < threshold) {
        return;
      }
      // The swipe begins: the row is caught where it is, and the tracking
      // spring takes over from its presentation value and velocity.
      drag.started = true;
      drag.startSign = Math.sign(along);
      drag.baseTravel = travelNow(layout);
      setSwipeState({
        isArmed: drag.isArmed,
        phase: 'dragging',
        side: layout.side,
      });
    }
    // The threshold's travel is not part of the swipe, as in UIKit: the
    // swipe counts from where the finger crossed it.
    const swipe = along - drag.startSign * threshold;
    const raw = Math.max(0, drag.baseTravel + swipe);
    drag.raw = raw;
    // On iOS the full swipe confirms on the finger's travel, not the row's
    // (which trails it on the spring), and only when the outermost entry can
    // fire; elsewhere the row is armed past its own commit point, as before.
    const isArmed = isIos
      ? drag.canConfirm && raw >= drag.confirmAt
      : raw >= drag.commitAt;
    if (isArmed !== drag.isArmed) {
      drag.isArmed = isArmed;
      drag.wasConfirmed ||= isArmed;
      setSwipeState({isArmed, phase: 'dragging', side: layout.side});
    }
    if (isIos) {
      // Confirmed, the row runs ahead of the finger to UIKit's confirmation
      // offset; backed out, it follows the finger again.
      const travel = isArmed
        ? Math.max(raw, confirmedOffset(drag.rowWidth))
        : raw;
      void springTo(layout, travel, SWIPE.tracking, isArmed ? 1 : 0);
    } else {
      moveTo(layout, defaultResistedTravel(raw, drag.commitAt));
    }
  };

  /** A claimed touch that never became a swipe: the row carries on as it was. */
  const abandon = (drag: Drag) => {
    setSwipeState(drag.previous);
  };

  const release = (pan: PanGestureRecognizer) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag == null) {
      return;
    }
    if (!drag.started) {
      abandon(drag);
      return;
    }
    const {layout} = drag;
    const velocity =
      pan.velocity().x * physicalSign(layout.side, layout.inlineSign);
    const {behavior} = latestRef.current;
    const landing =
      latestRef.current.idiom === 'ios'
        ? resolveRelease({
            behavior,
            isConfirmed: drag.isArmed,
            openWidth: layout.openWidth,
            travel: drag.raw,
            velocity,
            wasConfirmed: drag.wasConfirmed,
          })
        : resolveDefaultRelease({
            behavior,
            commitAt: drag.commitAt,
            openWidth: layout.openWidth,
            travel: drag.raw,
            velocity,
          });
    if (landing === 'perform') {
      slideOutAndFire(layout);
    } else if (landing === 'open') {
      settle(layout, layout.openWidth, 'resting');
    } else {
      settle(layout, 0, 'idle');
    }
  };

  const cancel = () => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag == null) {
      return;
    }
    if (!drag.started) {
      abandon(drag);
      return;
    }
    settle(drag.layout, 0, 'idle');
  };

  useGestureRecognizer(
    rootRef,
    () =>
      new PanGestureRecognizer({
        allowedPointerTypes: ['touch'],
        direction: 'horizontal',
        hysteresis: SWIPE.claim,
        maximumNumberOfTouches: 1,
        name: 'Item.swipe',
        shouldBegin: pan => {
          if (stateRef.current.phase === 'held') {
            return false;
          }
          if (Math.abs(animators.root.get('x')) > AT_REST_PX) {
            return true;
          }
          const root = rootRef.current;
          const inlineSign: 1 | -1 = isRtlElement(root) ? -1 : 1;
          return latestRef.current.sides[
            sideFor(pan.totalTranslation().x, inlineSign)
          ];
        },
      }),
    pan => {
      switch (pan.state) {
        case 'began':
          begin(pan);
          break;
        case 'changed':
          track(pan);
          break;
        case 'ended':
          release(pan);
          break;
        case 'cancelled':
          cancel();
          break;
        case 'possible':
        case 'failed':
          break;
      }
    },
  );

  // On iOS a tap on an open row's own content closes it and activates
  // nothing, as UIKit's dismissal does: the tap recognizes at the lift, and
  // taking the touch cancels the click it would have made. The panel's
  // entries keep their own taps, and a closed row (or any row outside iOS)
  // never offers this recognizer a touch.
  useGestureRecognizer(
    rootRef,
    () =>
      new TapGestureRecognizer({
        allowedPointerTypes: ['touch'],
        name: 'item-swipe-dismiss',
        shouldReceiveTouch: (_tap, touch) =>
          latestRef.current.idiom === 'ios' &&
          isOpen() &&
          !(
            touch.target instanceof Element &&
            touch.target.closest('[data-swipe-panel]') != null
          ),
      }),
    tap => {
      if (tap.state === 'ended') {
        close();
      }
    },
  );

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === 'Escape' && isOpen()) {
        event.stopPropagation();
        close();
      }
    },
    [close, isOpen],
  );

  return {activateEntry, close, onKeyDown, panelRefs, state};
}
