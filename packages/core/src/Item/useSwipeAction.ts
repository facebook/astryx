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
 * the row open past half the open width, with every entry tappable; a
 * release past the commit point fires the outermost entry. Under `commit` a
 * release past the commit point slides the row out and fires the outermost
 * entry, and nothing rests (swipeRelease.ts). After an entry fires the row springs back, or holds out when the
 * entry has `hasRemoval`. Any other release springs back.
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
 * the outer edge. Four animators, one clock, every curve an affine image of
 * the root's: they cannot drift apart, nothing lays out, and they keep
 * moving while the main thread is busy. A drag costs no React render; the
 * claim, the arming and the landing each cost one.
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
import {PanGestureRecognizer, useGestureRecognizer} from '../gestures';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {isRtlElement} from '../hooks/isRtlElement';
import {
  createAnimator,
  type Animator,
  type MotionCurve,
} from '../motion/animator';
import {cubicBezier} from '../motion/bezier';
import type {SpringDescription} from '../motion/spring';
import {swipeActions as SWIPE} from '../motion/uikit';
import type {TouchIdiom} from '../utils/touchPresentation';
import {
  DEFAULT_SWIPE,
  commitPoint,
  defaultCommitPoint,
  defaultResistedTravel,
  resistedTravel,
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
  /** Past the commit point: letting go now fires the outermost entry. */
  isArmed: boolean;
}

/** Callback refs for the elements of one side's panel that move. */
export interface SwipePanelRefs {
  /** The window over the row's resting box. */
  panel: (element: HTMLElement | null) => void;
  /** The fill that moves with the row, clipped by the window. */
  track: (element: HTMLElement | null) => void;
  /** The entries, pinned at the outer edge inside the track. */
  entries: (element: HTMLElement | null) => void;
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
}

/** +1 when the side's panel is on the physical left, −1 on the right. */
export function physicalSign(side: SwipeSide, inlineSign: 1 | -1): 1 | -1 {
  return side === 'leading' ? inlineSign : inlineSign === 1 ? -1 : 1;
}

/**
 * Where every moving part sits for a travel (logical px toward the side,
 * ≥ 0), as a physical translation: the root moves by the travel, the panel
 * window cancels it (fixed over the resting box), the track moves with the
 * row, and the entries cancel the track (pinned at the outer edge, where the
 * track's painted part uncovers them).
 */
export function swipeParts(
  travel: number,
  {side, inlineSign, openWidth}: SwipeLayout,
): {root: number; panel: number; track: number; entries: number} {
  const sign = physicalSign(side, inlineSign);
  const x = sign * travel;
  return {root: x, panel: -x, track: x, entries: sign * openWidth - x};
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
}

interface Animators {
  root: Animator;
  leading: SideAnimators;
  trailing: SideAnimators;
}

interface Drag {
  layout: SwipeLayout;
  rowWidth: number;
  commitAt: number;
  /** The state the row had when the touch was claimed, for a swipe that never began. */
  previous: SwipeState;
  /** Past UIKit's threshold: the row follows the finger. */
  started: boolean;
  /** Which way the finger crossed the threshold: +1 toward the side, -1 away. */
  startSign: number;
  /** The travel the row had when the swipe began (logical, ≥ 0). */
  baseTravel: number;
  /** The finger's travel along the side, before resistance. */
  raw: number;
  isArmed: boolean;
}

function createSide(): SideAnimators {
  return {
    entries: createAnimator(null),
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
  const latestRef = useRef({behavior, fireOutermost, idiom, sides});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {behavior, fireOutermost, idiom, sides};
  });

  const [animators] = useState<Animators>(() => ({
    leading: createSide(),
    root: createAnimator(null),
    trailing: createSide(),
  }));
  /** The layout of the side that moved last: where the row is, and how to move it. */
  const layoutRef = useRef<SwipeLayout | null>(null);
  const dragRef = useRef<Drag | null>(null);

  // The row root: the gesture's target and the element that translates. A
  // panel is its child, and a panel's ref is set before this hook's layout
  // effects run, while a ref on the root itself is set after them.
  const rootRef = useRef<HTMLElement | null>(null);
  // The parts attach as they mount (a side's panel exists only while it has
  // entries); attaching writes where the part is now.
  const [panelRefs] = useState<Record<SwipeSide, SwipePanelRefs>>(() => {
    const refsFor = (side: SideAnimators): SwipePanelRefs => ({
      entries: element => side.entries.attach(element),
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
    ): Promise<boolean> => {
      layoutRef.current = layout;
      const parts = swipeParts(travel, layout);
      const side = animators[layout.side];
      const at = performance.now();
      // Direct manipulation and its follow-through: UIKit keeps the motion
      // under Reduce Motion.
      const options = {at, reducedMotion: SWIPE.reducedMotion};
      const handle = animators.root.animate({x: parts.root}, {spring}, options);
      side.panel.animate({x: parts.panel}, {spring}, options);
      side.track.animate({x: parts.track}, {spring}, options);
      side.entries.animate({x: parts.entries}, {spring}, options);
      return handle.finished;
    },
    [animators],
  );

  /** Every part of the side at `travel` now: a drag outside iOS, one for one. */
  const moveTo = useCallback(
    (layout: SwipeLayout, travel: number) => {
      layoutRef.current = layout;
      const parts = swipeParts(travel, layout);
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
      const parts = swipeParts(travel, layout);
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
    ) => {
      setSwipeState({isArmed: false, phase: 'settling', side: layout.side});
      const motion =
        latestRef.current.idiom === 'ios'
          ? springTo(layout, travel, SWIPE.settle)
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

  /** The outermost entry fires: out, fire, then hold out or spring back. */
  const slideOutAndFire = useCallback(
    (layout: SwipeLayout) => {
      settle(layout, outTravel(), 'held', () => {
        const holdsOut = latestRef.current.fireOutermost(layout.side);
        if (holdsOut) {
          return false;
        }
        settle(layout, 0, 'idle');
        return true;
      });
    },
    [outTravel, settle],
  );

  const close = useCallback(() => {
    const layout = layoutRef.current;
    if (stateRef.current.phase !== 'resting' || layout == null) {
      return;
    }
    const root = rootRef.current;
    if (root != null && root.contains(document.activeElement)) {
      focusRowContent(root);
    }
    settle(layout, 0, 'idle');
  }, [rootRef, settle]);

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

  // A resting row closes on a pointer landing anywhere outside it, which is
  // also how a drag on a neighbour closes it: one row rests open at a time
  // with no shared state.
  useEffect(() => {
    if (state.phase !== 'resting') {
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
    document.addEventListener('pointerdown', onOutside, true);
    return () => {
      document.removeEventListener('pointerdown', onOutside, true);
    };
  }, [close, rootRef, state.phase]);

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
      side,
    };
    const rowWidth = root.clientWidth;
    // The entries keep their place against the track only for the width they
    // were placed with; a first drag (or new entries) puts them in place now,
    // while the track still hides them.
    const sideAnimators = animators[side];
    const expected = swipeParts(travelNow(layout), layout).entries;
    if (Math.abs(sideAnimators.entries.get('x') - expected) > AT_REST_PX) {
      sideAnimators.entries.set({x: expected});
    }
    dragRef.current = {
      baseTravel: 0,
      commitAt:
        latestRef.current.idiom === 'ios'
          ? commitPoint(layout.openWidth, rowWidth)
          : defaultCommitPoint(layout.openWidth, rowWidth),
      isArmed: false,
      layout,
      previous: stateRef.current,
      raw: 0,
      rowWidth,
      started: false,
      startSign: 1,
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
      drag.isArmed = drag.baseTravel >= drag.commitAt;
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
    const isArmed = raw >= drag.commitAt;
    if (isArmed !== drag.isArmed) {
      drag.isArmed = isArmed;
      setSwipeState({isArmed, phase: 'dragging', side: layout.side});
    }
    if (isIos) {
      void springTo(layout, resistedTravel(raw, drag.commitAt), SWIPE.tracking);
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
    const landing = (
      latestRef.current.idiom === 'ios' ? resolveRelease : resolveDefaultRelease
    )({
      behavior: latestRef.current.behavior,
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

  const onKeyDown = useCallback(
    (event: ReactKeyboardEvent) => {
      if (event.key === 'Escape' && stateRef.current.phase === 'resting') {
        event.stopPropagation();
        close();
      }
    },
    [close],
  );

  return {activateEntry, close, onKeyDown, panelRefs, state};
}
