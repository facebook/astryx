// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavigationStackTouch.ts
 * @input core's gesture recognizers and touch resolver
 *   (`@astryxdesign/core/gestures/experimental`), the UIKit table
 *   (`@astryxdesign/core/motion/experimental`) and navigationTransition.ts
 *   for the release math
 * @output useBackSwipes: UIKit's two back swipes, from the leading screen
 *   edge and from anywhere in the content (iOS 26), driving a stack through
 *   BackSwipeStack
 * @position NavigationStack's touch layer, imported in one place
 *   (NavigationStack.tsx): what only a finger needs lives here, so a desktop
 *   build can swap this module out
 *
 * The swipes are touch behaviour: one model under any finger (a coarse
 * primary pointer), Android and iOS alike; a mouse goes back with the bar's
 * button and the browser's history. A swipe is tracked 1:1 and released by
 * UIKit's rule: it finishes when progress plus 0.35 s of the release
 * velocity (the mean of the pan's last three velocities) passes half.
 *
 * In a browser tab the screen's leading edge is the browser's own back
 * swipe (iOS Safari keeps it, AST-094 FR22): the edge swipe only runs in a
 * home-screen web app (`navigator.standalone`), and the content swipe
 * ignores touches that start in that edge band. Server render and first
 * paint assume a tab.
 */

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import {
  PanGestureRecognizer,
  ScreenEdgePanGestureRecognizer,
  useGestureRecognizer,
} from '@astryxdesign/core/internal/touch';
import {navigation, UIKIT_GESTURES} from '@astryxdesign/core/internal/motion';
import {useTouchPresentation} from '@astryxdesign/core/internal/touch';
import {
  popVelocity,
  progressFromTravel,
  shouldFinishPop,
} from './navigationTransition';

/** What a back swipe reads from the stack and drives in it. */
export interface BackSwipeStack {
  /** The cards' width in CSS px. */
  width(): number;
  /** The stack's writing direction. */
  direction(): 'ltr' | 'rtl';
  /** The screens a pop moves between, or null when there is nothing to pop. */
  screens(): {top: string; under: string} | null;
  /** Stops whatever moves and returns the progress to continue from. */
  grab(top: string, under: string): number;
  /** Puts both screens at a progress (0: the top at rest, 1: popped). */
  setProgress(progress: number, top: string, under: string): void;
  /** The progress the screens are at now. */
  progress(): number;
  /**
   * The finger lifted (or the swipe was cancelled): commit the pop, or
   * spring back, at the release velocity in widths per second.
   */
  release(top: string, under: string, finish: boolean, velocity: number): void;
}

/** Whether the page runs as a home-screen web app never changes while it runs. */
const subscribeToNothing = () => () => {};

/**
 * The content swipe claims a sideways drag at the pan's own threshold, while
 * the browser can still be told no (it stops asking once its own slop has
 * passed), but moves nothing until UIKit's 27 px: the travel in between is
 * a dead zone.
 */
const CONTENT_CLAIM_PX = UIKIT_GESTURES.pan.hysteresis.value;
const CONTENT_DEAD_ZONE_PX = Math.max(
  0,
  navigation.contentPopHysteresis - CONTENT_CLAIM_PX,
);

/** A web app opened from the home screen, where no browser back swipe exists. */
function isStandaloneWebApp(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (navigator as Navigator & {standalone?: boolean}).standalone === true
  );
}

/** Whether a touch starting at client x is in the leading screen-edge band. */
function startsInEdgeBand(x: number, direction: 'ltr' | 'rtl'): boolean {
  const band = UIKIT_GESTURES.screenEdgePan.edgeRegion.value;
  return direction === 'rtl'
    ? typeof window !== 'undefined' && x >= window.innerWidth - band
    : x <= band;
}

/**
 * The stack's back swipes: the edge swipe on `containerRef`, the content
 * swipe on `cardsRef`, both driving the stack `stackRef` holds (read at each
 * touch event, so it always sees the latest render). They run under a finger
 * while `isEnabled` (the stack can pop and allows interactive pops).
 */
export function useBackSwipes(
  containerRef: RefObject<HTMLElement | null>,
  cardsRef: RefObject<HTMLElement | null>,
  stackRef: RefObject<BackSwipeStack | null>,
  {isEnabled}: {isEnabled: boolean},
): void {
  const swipeRef = useRef<{
    start: number;
    top: string;
    under: string;
    /** The pan's last velocities in widths/s, newest last (UIKit averages 3). */
    velocities: number[];
  } | null>(null);

  const onSwipe = useCallback(
    (recognizer: PanGestureRecognizer, deadZone: number) => {
      const stack = stackRef.current;
      const screens = stack?.screens();
      if (stack == null || screens == null) {
        return;
      }
      const width = stack.width();
      const direction = stack.direction();
      switch (recognizer.state) {
        case 'began': {
          const start = stack.grab(screens.top, screens.under);
          swipeRef.current = {start, ...screens, velocities: []};
          stack.setProgress(start, screens.top, screens.under);
          break;
        }
        case 'changed': {
          const swipe = swipeRef.current;
          if (swipe == null) {
            return;
          }
          swipe.velocities.push(
            popVelocity(recognizer.velocity().x, width, direction),
          );
          const along =
            (direction === 'rtl' ? -1 : 1) * recognizer.translation().x;
          // Back past where it started, the screen follows with resistance
          // (progressFromTravel).
          const travel = along - deadZone;
          stack.setProgress(
            progressFromTravel(
              swipe.start,
              (direction === 'rtl' ? -1 : 1) * travel,
              width,
              direction,
            ),
            swipe.top,
            swipe.under,
          );
          break;
        }
        case 'ended':
        case 'cancelled': {
          const swipe = swipeRef.current;
          swipeRef.current = null;
          if (swipe == null) {
            return;
          }
          const p = stack.progress();
          // UIKit's release velocity: the mean of the pan's last three
          // velocities, the lift's own update included. A pause keeps it.
          let v = 0;
          if (recognizer.state === 'ended') {
            swipe.velocities.push(
              popVelocity(recognizer.velocity().x, width, direction),
            );
            const recent = swipe.velocities.slice(
              -navigation.interactivePopVelocitySamples,
            );
            v = recent.reduce((sum, value) => sum + value, 0) / recent.length;
          }
          stack.release(
            swipe.top,
            swipe.under,
            recognizer.state === 'ended' && shouldFinishPop(p, v),
            v,
          );
          break;
        }
        default:
          break;
      }
    },
    [stackRef],
  );

  const isTouch = useTouchPresentation().isTouch;
  const browserOwnsEdge = useSyncExternalStore(
    subscribeToNothing,
    () => !isStandaloneWebApp(),
    () => true,
  );
  const browserOwnsEdgeRef = useRef(browserOwnsEdge);
  browserOwnsEdgeRef.current = browserOwnsEdge;
  const edge = useGestureRecognizer(
    containerRef,
    () =>
      new ScreenEdgePanGestureRecognizer({
        edges: ['leading'],
        // Published, so app code can relate to it (gestureNamed).
        name: 'NavigationStack.backSwipe',
      }),
    recognizer => onSwipe(recognizer, 0),
    {isEnabled: isTouch && isEnabled && !browserOwnsEdge},
  );
  // iOS 26's back swipe from anywhere in the content. It waits for the edge
  // swipe to fail, which a touch outside the edge band does at once.
  const content = useGestureRecognizer(
    cardsRef,
    () =>
      new PanGestureRecognizer({
        name: 'NavigationStack.contentBackSwipe',
        direction: 'right',
        hysteresis: CONTENT_CLAIM_PX,
        maximumNumberOfTouches: 1,
        // A horizontal scroller under the finger that can still scroll
        // that way keeps the drag (UIKit's scroll views do).
        scrollEdge: true,
        shouldReceiveTouch: (_recognizer, touch) =>
          !(
            browserOwnsEdgeRef.current &&
            startsInEdgeBand(
              touch.startX,
              stackRef.current?.direction() ?? 'ltr',
            )
          ),
      }).requireToFail(edge),
    recognizer => onSwipe(recognizer, CONTENT_DEAD_ZONE_PX),
    {isEnabled: isTouch && isEnabled},
  );
  // The content swipe pops toward the trailing edge: rightward unless RTL.
  useLayoutEffect(() => {
    content.direction =
      stackRef.current?.direction() === 'rtl' ? 'left' : 'right';
  }, [content, stackRef]);
}
