// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file SearchFieldTouch.ts
 * @input The animator and `uikit.search` (`@astryxdesign/core/motion/
 *   experimental`), the touch resolver, onPresentedFrame and
 *   searchFieldModel.ts
 * @output useSearchFieldMotion: SearchField's touch layer. It places the
 *   field's parts (the lift, the narrowing middle, the trailing end, the close
 *   button) and, under a finger, plays UIKit's activation and cancel on one
 *   clock from the first presented frame; under a mouse or a trackpad the
 *   parts take their places at once
 * @position SearchField's one touch-layer module, imported only by
 *   SearchField.tsx, so a desktop build can swap it and the size report can
 *   measure it
 *
 * SYNC: When modified, update SearchField.tsx and searchFieldModel.ts.
 */

import {useCallback, useLayoutEffect, useRef, type RefObject} from 'react';
import {useTouchPresentation} from '@astryxdesign/core/gestures/experimental';
import {isRtlElement} from '@astryxdesign/core/hooks';
import {
  uikit,
  useAnimator,
  type Animator,
  type MotionCurve,
  type MotionHandle,
} from '@astryxdesign/core/motion/experimental';
import {onPresentedFrame} from '../presentedFrame';
import {
  activationTiming,
  easedCurve,
  heldCurve,
  poseFor,
  remainingFraction,
  type SearchFieldGeometry,
  type SearchFieldPose,
} from './searchFieldModel';

const {search} = uikit;

/** The refs SearchField puts on the parts the touch layer moves. */
export interface SearchFieldMotion {
  rootRef: (element: HTMLElement | null) => void;
  middleRef: (element: HTMLElement | null) => void;
  endRef: (element: HTMLElement | null) => void;
  closeRef: (element: HTMLElement | null) => void;
}

/**
 * SearchField's touch layer: the parts' poses, and UIKit's activation under
 * a finger (a coarse primary pointer, on every touch device). Reduced motion
 * is the animator's: under a finger it turns the travel into a cross-fade
 * (`design:reduced-motion` DR2).
 */
export function useSearchFieldMotion({
  fieldRef,
  isActive,
  lift,
}: {
  fieldRef: RefObject<HTMLDivElement | null>;
  isActive: boolean;
  lift: number;
}): SearchFieldMotion {
  const rootAnimator = useAnimator();
  const middleAnimator = useAnimator();
  const endAnimator = useAnimator();
  const closeAnimator = useAnimator();
  const {isTouch} = useTouchPresentation();
  const animates = useCallback(() => isTouch, [isTouch]);

  const fieldHeight = search.stacked.fieldHeight;
  const geometry = useCallback((): SearchFieldGeometry => {
    const field = fieldRef.current;
    return {
      restWidth: field?.getBoundingClientRect().width ?? 0,
      height: fieldHeight,
      lift,
      isRtl: isRtlElement(field),
    };
  }, [fieldHeight, lift]);

  const presented = useCallback(
    (): SearchFieldPose => ({
      y: rootAnimator.animator.get('y'),
      middleScale: middleAnimator.animator.get('scaleX'),
      endX: endAnimator.animator.get('x'),
      closeX: closeAnimator.animator.get('x'),
      closeOpacity: closeAnimator.animator.get('opacity'),
    }),
    [rootAnimator, middleAnimator, endAnimator, closeAnimator],
  );

  const place = useCallback(
    (pose: SearchFieldPose) => {
      rootAnimator.animator.set({y: pose.y});
      middleAnimator.animator.set({scaleX: pose.middleScale});
      endAnimator.animator.set({x: pose.endX});
      closeAnimator.animator.set({x: pose.closeX, opacity: pose.closeOpacity});
    },
    [rootAnimator, middleAnimator, endAnimator, closeAnimator],
  );

  // The state the parts last settled toward (null before the first
  // layout), and whether a move is still playing.
  const settledRef = useRef<boolean | null>(null);
  const isAnimating = useRef(false);
  useLayoutEffect(() => {
    const target = isActive;
    if (settledRef.current === null || !animates()) {
      // First layout, or a mouse or trackpad: take the places at once.
      settledRef.current = target;
      place(poseFor(target, geometry()));
      // The parts now hold their places: the CSS form of the active pose
      // (for a server render) steps aside in the same task.
      rootAnimator.animator.element?.setAttribute(
        'data-search-field-placed',
        '',
      );
      return;
    }
    if (settledRef.current === target && !isAnimating.current) {
      place(poseFor(target, geometry()));
      return;
    }
    settledRef.current = target;
    isAnimating.current = true;
    let cancelled = false;
    const run = () => {
      const shape = geometry();
      const to = poseFor(target, shape);
      const from = poseFor(!target, shape);
      const current = presented();
      // The clock and curve under the field's theme, read as the move starts.
      const timing = activationTiming(rootAnimator.animator.element);
      const duration = timing.seconds * remainingFraction(current, from, to);
      // Under reduced motion the animator plays its cross-fade for these.
      const options = {};
      const handles = [
        play(
          rootAnimator.animator,
          {y: easedCurve(current.y, to.y, duration, timing.ease)},
          options,
        ),
        play(
          middleAnimator.animator,
          {
            scaleX: easedCurve(
              current.middleScale,
              to.middleScale,
              duration,
              timing.ease,
            ),
          },
          options,
        ),
        play(
          endAnimator.animator,
          {x: easedCurve(current.endX, to.endX, duration, timing.ease)},
          options,
        ),
        play(
          closeAnimator.animator,
          {
            x: easedCurve(current.closeX, to.closeX, duration, timing.ease),
            // Cancel slides the close button out at the opacity it has and
            // removes it at the end, as UIKit does.
            opacity: target
              ? easedCurve(
                  current.closeOpacity,
                  to.closeOpacity,
                  duration,
                  timing.ease,
                )
              : heldCurve(current.closeOpacity, to.closeOpacity, duration),
          },
          options,
        ),
      ];
      const playing = handles.filter(
        (handle): handle is MotionHandle => handle != null,
      );
      void Promise.all(playing.map(handle => handle.finished)).then(results => {
        if (cancelled || !results.every(Boolean)) {
          return;
        }
        isAnimating.current = false;
      });
    };
    // The move starts on the first frame the page presents after this
    // commit, fresh (onPresentedFrame): Mobile Safari brings the keyboard up
    // with no frame for ~150 ms after the focus, and a motion created before
    // that stall would jump a third of the way when frames resume. A host
    // that moves with the field (a navigation bar) starts through the same
    // helper, so both start on the same frame.
    const win = rootAnimator.animator.element?.ownerDocument.defaultView;
    let cancelStart = () => {};
    if (win == null) {
      run();
    } else {
      cancelStart = onPresentedFrame(win, run);
    }
    return () => {
      cancelled = true;
      cancelStart();
    };
    // `geometry` changes with `lift`; a lift change while settled re-places
    // the field through the same path.
  }, [
    isActive,
    animates,
    geometry,
    place,
    presented,
    rootAnimator,
    middleAnimator,
    endAnimator,
    closeAnimator,
  ]);

  // A resize while settled (the window turning, a host relaying out) moves
  // the narrowed end to the new width at once.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    const Observer = field?.ownerDocument.defaultView?.ResizeObserver;
    if (field == null || Observer == null) {
      return;
    }
    const observer = new Observer(() => {
      if (!isAnimating.current && settledRef.current !== null) {
        place(poseFor(settledRef.current, geometry()));
      }
    });
    observer.observe(field);
    return () => observer.disconnect();
  }, [geometry, place]);

  return {
    rootRef: rootAnimator.ref,
    middleRef: middleAnimator.ref,
    endRef: endAnimator.ref,
    closeRef: closeAnimator.ref,
  };
}

/**
 * Plays the given curves. A curve that does not move is put in place instead
 * (`set`), which also ends whatever that property was still playing (a
 * cancel's held opacity that a re-activation keeps at 1 would otherwise drop
 * to 0 when the cancel's clock ends); an animation with no visible change
 * would also run on the main thread in Chromium.
 */
function play(
  animator: Animator,
  curves: Partial<Record<'x' | 'y' | 'scaleX' | 'opacity', MotionCurve>>,
  options: {at?: number},
): MotionHandle | null {
  const moving: typeof curves = {};
  for (const [key, curve] of Object.entries(curves) as [
    keyof typeof curves,
    MotionCurve,
  ][]) {
    if (Math.abs(curve.at(curve.duration) - curve.at(0)) > 1e-6) {
      moving[key] = curve;
    } else {
      animator.set({[key]: curve.at(0)});
    }
  }
  if (Object.keys(moving).length === 0) {
    return null;
  }
  return animator.play(moving, options);
}
