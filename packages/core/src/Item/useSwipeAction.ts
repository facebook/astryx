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
 *   imports it); tested through Item.test.tsx and useSwipeAction.test.ts
 *
 * A UIKit list swipe: drag a row sideways and the side's panel is uncovered.
 * Under `reveal` a fast release goes the way it moves and a slow one rests
 * the row open past half the open width, with every entry tappable; a
 * release past the commit point fires the outermost entry. Under `commit` a
 * release past the commit point slides the row out and fires the outermost
 * entry, and nothing rests (swipeRelease.ts). The outermost entry fires
 * once the row's content has left its box, at once when the release is
 * already past that edge: UIKit calls the handler at the lift, and firing
 * when the content is gone means a row its app removes at once never
 * vanishes mid-slide. After an entry fires the row springs back, or holds out
 * when the entry has `hasRemoval`. Any other release springs back.
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
 * row must claim before that. The swipe itself begins where UIKit's does,
 * after 25 px, from 0, and in between the row carries on as it was. The pan
 * reads each touch's pointer, as `spec:AST-057` says: a finger swipes the row
 * whatever the primary pointer and a mouse never starts it, one rule on every
 * device. The foundation tells the browser (`touch-action: pan-y
 * pinch-zoom`, `touchmove` cancelled only while the pan owns the touch, the
 * click the browser synthesizes swallowed) and leaves a pinch to the page: a
 * second finger that lands before the claim fails the one-finger pan and
 * leaves its touch to the browser's pinch, and once the row has claimed its
 * finger a second finger leaves the swipe going (spec:AST-094 FR10).
 *
 * Motion is UIKit's, on the compositor. Every move of the finger starts a
 * spring toward the finger's offset from the row's presentation value and
 * velocity, so the row trails a moving finger and catches up when it stops;
 * the release starts the same spring toward where the row lands, still from
 * the presentation velocity. A finger that lands on a moving row catches it
 * where it is. The row's root translates; each side's panel is a window over
 * the row's resting box (translated back by the travel, so it stays put and
 * clips to that box), a track inside it that moves with the row (so it clips
 * the entries to exactly the space the row vacates), and each entry inside
 * the track, translated back again so the entries stay pinned at the outer
 * edge; the outermost entry's colour, painted beside it, fills the rest out
 * to that edge. The entries move as one block with no wrapper around them
 * (minimal DOM, `architecture:component-style-authoring` INV7): every entry
 * plays the same curve. One clock, every curve an affine image of the
 * root's: they cannot drift apart, nothing lays out, and they keep moving
 * while the main thread is busy. A drag costs no React render; the
 * claim, the arming and the landing each cost one.
 *
 * The gesture reads each touch's pointer: a finger swipes the row on every
 * device, whatever the primary pointer, and a mouse never does.
 *
 * Under Reduce Motion (`design:reduced-motion`) the finger's own drag is
 * direct manipulation and follows it one for one, but nothing a release or
 * a close starts travels or springs: the row lands at the bottom of an
 * opacity dip (DR2).
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
  type MotionHandle,
} from '../motion/animator';
import type {SpringDescription} from '../motion/spring';
import {reducedMotionFade} from '../motion/reducedMotion';
import {swipeActions as SWIPE} from '../motion/uikit/swipeActions';
import {commitPoint, resistedTravel, resolveRelease} from './swipeRelease';

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
  /**
   * Each entry, pinned at the outer edge inside the track: the ref for the
   * entry with `key` (its React key), stable per key.
   */
  entry: (key: string) => (element: HTMLElement | null) => void;
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
  /** The side's entries at their natural widths together: how far the row opens. */
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

/** The longest a slide-out takes to leave the row's box (ms): beyond it, never. */
const SLIDE_OUT_HORIZON_MS = 3000;

/**
 * When `animator`, on the curve it now plays, first carries the row to
 * `edge` (physical px) or past it, in ms after `start`: 0 when it is there
 * already, null when it never gets there. The animator reads its own curve
 * back analytically.
 */
function timeToPass(
  animator: Animator,
  start: number,
  edge: number,
): number | null {
  const sign = Math.sign(edge) || 1;
  const reached = (t: number) =>
    animator.get('x', start + t) * sign >= Math.abs(edge);
  if (reached(0)) {
    return 0;
  }
  for (let t = 1; t <= SLIDE_OUT_HORIZON_MS; t += 1) {
    if (reached(t)) {
      return t;
    }
  }
  return null;
}

/**
 * What started a settle: a touch drag ending (its release, or the browser
 * taking the touch), or anything else (Escape, a pointer outside, a tapped
 * entry, a tap on the content, a scroll).
 */
type SettleCause = 'release' | 'other';

// =============================================================================
// The hook
// =============================================================================

const IDLE_STATE: SwipeState = {isArmed: false, phase: 'idle', side: 'leading'};

/** Below this the row is at rest, closed. */
const AT_REST_PX = 0.5;

interface SideAnimators {
  panel: Animator;
  track: Animator;
  entries: EntryAnimators;
}

/**
 * A side's entries, each its own moving element on the same motion, so they
 * move as one block with no wrapper around them.
 */
interface EntryAnimators {
  /** The callback ref for the entry with `key`, stable per key. */
  ref: (key: string) => (element: HTMLElement | null) => void;
  /** The entries' animators, in the order they mounted. */
  members: () => Animator[];
  /** Where the entries are (they share it); at rest before any has mounted. */
  get: (property: 'x' | 'opacity', time?: number) => number;
  set: Animator['set'];
  animate: (...args: Parameters<Animator['animate']>) => void;
  play: (...args: Parameters<Animator['play']>) => void;
  /** Their natural widths together: how far the row opens. */
  width: () => number;
}

function createEntries(): EntryAnimators {
  const byKey = new Map<string, Animator>();
  const refs = new Map<string, (element: HTMLElement | null) => void>();
  const any = (): Animator | undefined => byKey.values().next().value;
  return {
    ref: key => {
      let ref = refs.get(key);
      if (ref == null) {
        ref = element => {
          const current = byKey.get(key);
          if (element == null) {
            current?.dispose();
            byKey.delete(key);
          } else if (current != null) {
            current.attach(element);
          } else {
            // A new entry joins the block where the others are.
            const animator = createAnimator(null);
            const other = any();
            if (other != null) {
              animator.set({x: other.get('x'), opacity: other.get('opacity')});
            }
            byKey.set(key, animator);
            animator.attach(element);
          }
        };
        refs.set(key, ref);
      }
      return ref;
    },
    members: () => [...byKey.values()],
    get: (property, time) =>
      any()?.get(property, time) ?? (property === 'opacity' ? 1 : 0),
    set: values => {
      for (const animator of byKey.values()) {
        animator.set(values);
      }
    },
    animate: (...args) => {
      for (const animator of byKey.values()) {
        animator.animate(...args);
      }
    },
    play: (...args) => {
      for (const animator of byKey.values()) {
        animator.play(...args);
      }
    },
    width: () => {
      let width = 0;
      for (const animator of byKey.values()) {
        width += animator.element?.offsetWidth ?? 0;
      }
      return width;
    },
  };
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
    entries: createEntries(),
    panel: createAnimator(null),
    track: createAnimator(null),
  };
}

function allOf(animators: Animators): Animator[] {
  return [
    animators.root,
    ...[animators.leading, animators.trailing].flatMap(side => [
      side.panel,
      side.track,
      ...side.entries.members(),
    ]),
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
}: UseSwipeActionOptions): UseSwipeActionResult {
  const [state, setState] = useState<SwipeState>(IDLE_STATE);
  const stateRef = useRef(state);
  // Synchronizes the gesture system with the committed state: its recognizer
  // callbacks and the document listeners run outside React and read it here.
  // Idempotent: it rewrites the ref with the committed value.
  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  });
  const setSwipeState = useCallback((next: SwipeState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  // The latest options, read by listeners and completions that outlive a render.
  // Synchronizes the gesture system (recognizer callbacks, animation
  // completions, the slide-out's fire timer) with the committed options.
  const latestRef = useRef({behavior, fireOutermost, sides});
  useIsomorphicLayoutEffect(() => {
    latestRef.current = {behavior, fireOutermost, sides};
  });

  const [animators] = useState<Animators>(() => ({
    leading: createSide(),
    root: createAnimator(null),
    trailing: createSide(),
  }));
  /** The layout of the side that moved last: where the row is, and how to move it. */
  const layoutRef = useRef<SwipeLayout | null>(null);
  const dragRef = useRef<Drag | null>(null);
  /**
   * Counts the row's motions: a timer started for one motion acts only if
   * no other motion has started since (a finger caught the row, a close).
   */
  const motionRef = useRef(0);
  /** The root's motion in progress, when a spring drives it. */
  const rootMotionRef = useRef<MotionHandle | null>(null);
  /** That motion once it has started on screen (its `started` resolved). */
  const startedMotionRef = useRef<MotionHandle | null>(null);
  const fireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Releases the browser timer a slide-out set for its fire when the row
  // leaves, and drops a fire still waiting for its slide-out to start.
  useEffect(
    () => () => {
      motionRef.current += 1;
      if (fireTimerRef.current != null) {
        clearTimeout(fireTimerRef.current);
      }
    },
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
      entry: key => side.entries.ref(key),
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
      // A settle a touch drag's release started: under Reduce Motion it
      // cross-fades whatever the pointer (design:reduced-motion DR2).
      touchRelease = false,
    ): Promise<boolean> => {
      layoutRef.current = layout;
      motionRef.current += 1;
      const parts = swipeParts(travel, layout);
      const side = animators[layout.side];
      // One clock for every part. From rest no start is pinned: every call
      // from rest in this task starts when the browser commits it, together,
      // so a frame held back (iOS during a smooth scroll) delays the settle
      // instead of skipping into it. A call that continues motion on screen
      // (the next move's spring, the release, a catch: the root's motion has
      // started and not ended) starts at its own call time unless it is given
      // one, and the parts would fall out of step by the time each call
      // takes: they share one start (`at`).
      const previous = rootMotionRef.current;
      const isMoving =
        previous != null &&
        startedMotionRef.current === previous &&
        (previous.velocity('x') !== 0 ||
          previous.value('x') !== previous.value('x', Infinity));
      const options = isMoving
        ? {at: performance.now(), touchRelease}
        : {touchRelease};
      const handle = animators.root.animate({x: parts.root}, {spring}, options);
      rootMotionRef.current = handle;
      // On screen from its start: a call from rest waits for the browser's
      // commit, so until then the next call is from rest too.
      void handle.started.then(() => {
        if (rootMotionRef.current === handle) {
          startedMotionRef.current = handle;
        }
      });
      side.panel.animate({x: parts.panel}, {spring}, options);
      side.track.animate({x: parts.track}, {spring}, options);
      side.entries.animate({x: parts.entries}, {spring}, options);
      return handle.finished;
    },
    [animators],
  );

  /**
   * Every part of the side at `travel` now: the row following the finger one
   * for one under Reduce Motion.
   */
  const moveTo = useCallback(
    (layout: SwipeLayout, travel: number) => {
      layoutRef.current = layout;
      motionRef.current += 1;
      rootMotionRef.current = null;
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
      cause: SettleCause = 'other',
    ) => {
      setSwipeState({isArmed: false, phase: 'settling', side: layout.side});
      // Under Reduce Motion the animator cross-fades or lands at once
      // (design:reduced-motion); what a release started always cross-fades.
      const touchRelease = cause === 'release';
      const motion = springTo(layout, travel, SWIPE.settle, touchRelease);
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
    [setSwipeState, springTo],
  );

  /** How far out a row goes when an entry fires and the row leaves. */
  const outTravel = useCallback(
    () => (rootRef.current?.clientWidth ?? 0) + SWIPE.slideOutOvershoot,
    [rootRef],
  );

  /** The outermost entry fires as the row slides out; then it holds out or springs back. */
  const slideOutAndFire = useCallback(
    (layout: SwipeLayout, cause: SettleCause) => {
      const fire = () => {
        const holdsOut = latestRef.current.fireOutermost(layout.side);
        if (holdsOut) {
          return false;
        }
        settle(layout, 0, 'idle', undefined, cause);
        return true;
      };
      // UIKit calls the handler at the lift. The row fires once its content
      // has left its box, so a row its app removes at once never vanishes
      // mid-slide; at once when the release is already past that edge.
      const sign = physicalSign(layout.side, layout.inlineSign);
      const edge = sign * (rootRef.current?.clientWidth ?? 0);
      settle(layout, outTravel(), 'held', undefined, cause);
      const motion = motionRef.current;
      const handle = rootMotionRef.current;
      const fade = reducedMotionFade(rootRef.current, {
        touchRelease: cause === 'release',
      });
      // One pending fire at a time: a new slide-out replaces an older one's.
      if (fireTimerRef.current != null) {
        clearTimeout(fireTimerRef.current);
        fireTimerRef.current = null;
      }
      let timer: ReturnType<typeof setTimeout> | null = null;
      const fireIfStill = () => {
        if (fireTimerRef.current === timer) {
          fireTimerRef.current = null;
        }
        if (motionRef.current === motion) {
          fire();
        }
      };
      if (
        fade == null &&
        timeToPass(animators.root, performance.now(), edge) === 0
      ) {
        fireIfStill();
        return;
      }
      // Timed from when the slide-out starts on screen: one from rest waits
      // for the browser's first frame (longer on a busy page), and until then
      // the row is where it was. Under Reduce Motion the row never travels:
      // it lands out of its box at the bottom of the cross-fade, and fires
      // there; otherwise when the curve the animator plays carries it past
      // the edge, read back from the animator itself.
      void handle?.started.then(startedAt => {
        if (motionRef.current !== motion) {
          return;
        }
        const delay =
          fade != null
            ? fade.duration / 2
            : timeToPass(animators.root, startedAt, edge);
        if (delay == null) {
          return;
        }
        const wait = Math.max(0, startedAt + delay - performance.now());
        if (wait === 0) {
          fireIfStill();
          return;
        }
        timer = setTimeout(fireIfStill, wait);
        fireTimerRef.current = timer;
      });
    },
    [animators, outTravel, rootRef, settle],
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

    const layout: SwipeLayout = {
      inlineSign,
      openWidth: animators[side].entries.width(),
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
      commitAt: commitPoint(layout.openWidth, rowWidth),
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
    // UIKit's dead zone: the swipe counts from where the finger crosses it.
    const threshold = SWIPE.hysteresis;
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
    const travel = resistedTravel(raw, drag.commitAt);
    // Under Reduce Motion every animated change fades, so the row follows the
    // finger one for one instead: the finger's own drag is direct
    // manipulation (design:reduced-motion).
    if (animators.root.reducedMotion() === 'off') {
      void springTo(layout, travel, SWIPE.tracking);
    } else {
      moveTo(layout, travel);
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
    const landing = resolveRelease({
      behavior: latestRef.current.behavior,
      commitAt: drag.commitAt,
      openWidth: layout.openWidth,
      travel: drag.raw,
      velocity,
    });
    if (landing === 'perform') {
      slideOutAndFire(layout, 'release');
    } else if (landing === 'open') {
      settle(layout, layout.openWidth, 'resting', undefined, 'release');
    } else {
      settle(layout, 0, 'idle', undefined, 'release');
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
    settle(drag.layout, 0, 'idle', undefined, 'release');
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
    // `spec:AST-057` reads each event's pointer: a finger swipes the row on
    // every device and a mouse never does, so the host's fine-pointer gate
    // (`spec:AST-094` FR19) does not apply to it.
    {perEventPointer: true},
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
