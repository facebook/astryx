// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file contextMenuPressFeedback.ts
 * @input The press feedback's curve (contextMenuPressCurve.ts), the
 *   context-menu constants, the compositor animator, the trigger element
 * @output Exports useContextMenuPressFeedback (start, fail, release, hold,
 *   and end when the lifted copy takes over; driven by ContextMenu's press
 *   recognizer)
 * @position The press feedback of ContextMenu's touch invocation
 *   (contextMenuPress.ts decides; this shows it)
 *
 * On iOS 26.2 a finger resting on a view with a context menu makes a copy of
 * the view grow from its center: UIKit asks for a size that ramps linearly
 * (`contextMenu.press.feedbackRate` from the onset, a slower
 * `feedbackRateAfterCommit` after the commit), and the copy's visible size
 * chases that ramp through a spring (`feedbackSpring`), shown
 * `feedbackLatencyMs` after UIKit starts it. A finger that lifts or wanders
 * before the commit sends the size back to 1 on the same spring
 * (`returnLatencyMs` after the lift). After the commit the view stays grown
 * while the menu is up, and returns on the dismissal spring
 * (`springs.contextMenuDismiss`) when it closes.
 *
 * Here the trigger itself takes the scale (the individual `scale` property,
 * from its center), played by the compositor animator from the moment the
 * finger landed: the whole held curve is computed when the touch arrives and
 * placed on the document timeline at the touch's own timestamp, so it keeps
 * advancing every frame while the main thread is busy, and a late touch
 * event still lands it at the right point of the curve. Nothing renders and
 * nothing reads layout during the press.
 *
 * Not shown: an inline trigger (`triggerAs="span"`), which a transform does
 * not apply to, and Reduce Motion (`contextMenu.reducedMotionFeedback`).
 *
 * SYNC: When modified, update /packages/core/src/ContextMenu/ContextMenu.tsx
 */

import {useCallback, useEffect, useRef, type RefObject} from 'react';
import {createAnimator, type Animator} from '../motion/animator';
import {contextMenu, springs} from '../motion/uikit';
import {
  PRESS_FEEDBACK_START_MS,
  pressFeedbackCurve,
} from './contextMenuPressCurve';

const {feedbackSpring, returnLatencyMs} = contextMenu.press;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export interface ContextMenuPressFeedback {
  /** A finger landed at `time` (event clock, ms): play the held curve. */
  start(time: number): void;
  /** The press failed at `time`: spring back to 1 from where it is. */
  fail(time: number): void;
  /** The menu the press opened closed: return on the dismissal spring. */
  release(): void;
  /**
   * The menu showed: the feedback stops where it is. The menu's cursor anchor
   * sits inside the trigger and anchor positioning follows its transformed
   * box, so a trigger still growing would carry the open menu with it.
   */
  hold(): void;
  /**
   * The lifted preview takes over: the trigger returns to its size at once
   * (it is hidden while its preview is up).
   */
  end(): void;
}

/**
 * The press feedback of a ContextMenu trigger. `isShown` is read at each
 * press: false for an inline trigger.
 */
export function useContextMenuPressFeedback(
  triggerRef: RefObject<HTMLElement | null>,
  isShown: boolean,
): ContextMenuPressFeedback {
  const animatorRef = useRef<Animator | null>(null);
  const isShownRef = useRef(isShown);
  isShownRef.current = isShown;
  // Whether the trigger carries a scale of ours (to put back and clear).
  const isGrownRef = useRef(false);

  useEffect(
    () => () => {
      animatorRef.current?.dispose();
      animatorRef.current = null;
    },
    [],
  );

  const animatorFor = useCallback((): Animator | null => {
    const element = triggerRef.current;
    if (element == null) {
      return null;
    }
    if (animatorRef.current?.element !== element) {
      animatorRef.current?.dispose();
      animatorRef.current = createAnimator(element);
    }
    return animatorRef.current;
  }, [triggerRef]);

  // Back at 1: drop the inline scale, which would otherwise leave the trigger
  // a stacking context and a containing block for fixed descendants.
  const settleBack = useCallback((finished: Promise<boolean>) => {
    void finished.then(isDone => {
      const element = animatorRef.current?.element;
      if (isDone && element != null && isGrownRef.current) {
        isGrownRef.current = false;
        element.style.removeProperty('scale');
      }
    });
  }, []);

  const start = useCallback(
    (time: number) => {
      if (
        !isShownRef.current ||
        (prefersReducedMotion() && !contextMenu.reducedMotionFeedback)
      ) {
        return;
      }
      const animator = animatorFor();
      if (animator == null) {
        return;
      }
      isGrownRef.current = true;
      const at = time + PRESS_FEEDBACK_START_MS;
      animator.play(
        {
          scale: pressFeedbackCurve({
            from: animator.get('scaleX', at),
            velocity: animator.getVelocity('scaleX', at),
          }),
        },
        {at, reducedMotion: 'keep'},
      );
    },
    [animatorFor],
  );

  const fail = useCallback(
    (time: number) => {
      const animator = animatorRef.current;
      if (animator == null || !isGrownRef.current) {
        return;
      }
      settleBack(
        animator.animate(
          {scale: 1},
          {spring: feedbackSpring},
          {at: time + returnLatencyMs, reducedMotion: 'keep'},
        ).finished,
      );
    },
    [settleBack],
  );

  const release = useCallback(() => {
    const animator = animatorRef.current;
    if (animator == null || !isGrownRef.current) {
      return;
    }
    settleBack(
      animator.animate(
        {scale: 1},
        {spring: springs.contextMenuDismiss},
        {reducedMotion: 'keep'},
      ).finished,
    );
  }, [settleBack]);

  const hold = useCallback(() => {
    if (isGrownRef.current) {
      animatorRef.current?.stop(['scale']);
    }
  }, []);

  const end = useCallback(() => {
    const animator = animatorRef.current;
    if (animator == null || !isGrownRef.current) {
      return;
    }
    isGrownRef.current = false;
    animator.set({scale: 1});
    animator.element?.style.removeProperty('scale');
  }, []);

  return {start, fail, release, hold, end};
}
