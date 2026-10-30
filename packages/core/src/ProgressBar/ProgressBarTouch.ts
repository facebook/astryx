// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ProgressBarTouch.ts
 * @input Uses React (useEffect, useRef, useState), the touch presentation
 *   resolver (useTouchPresentation) and the shared resize observer
 * @output useProgressBarTouch: what the touch presentation needs from script,
 *   the share of the track a change moved (`--_progress-bar-change`), the
 *   three-step offset that keeps a return off CSS's reversing path
 *   (`--_progress-bar-flip`), and, under a finger with marks, the share of
 *   the track the fill draws at least (TOUCH_MIN_FILL_PX), measured on the
 *   track
 * @position ProgressBar's touch layer, with one import site (ProgressBar.tsx):
 *   everything ProgressBar runs in script for a finger lives here, so a
 *   desktop build can swap it for a no-op
 *
 * SYNC: When modified, update /packages/core/src/ProgressBar/ProgressBar.tsx
 * (its touch styles read these variables and the 16px minimum).
 */

import {useEffect, useRef, useState, type RefObject} from 'react';
import {observeResize} from '../utils/sharedResizeObserver';
import {useTouchPresentation} from '../utils/touchPresentation';

/** Under a finger the fill never draws shorter than this above zero. */
export const TOUCH_MIN_FILL_PX = 16;

export interface ProgressBarTouch {
  /** The fill's touch timing variables, set inline on the fill. */
  fillVars: Record<'--_progress-bar-change' | '--_progress-bar-flip', string>;
  /** The track, measured under a finger when the bar has marks. */
  trackRef: RefObject<HTMLDivElement | null>;
  /** The share of the track the fill draws (0–100), for placing marks. */
  drawnPercentage: number;
}

export function useProgressBarTouch(
  percentage: number,
  hasMarks: boolean,
): ProgressBarTouch {
  // The touch fill's duration comes from how far the value moved since the
  // last one (the model change, as UIKit measures it), held until the next
  // change so a re-render with the same value does not touch it.
  const [motion, setMotion] = useState({percentage, change: 0, flip: 0});
  const isNewValue = motion.percentage !== percentage;
  // The share of the track the value moved (0–1); CSS multiplies it by the
  // whole-track duration role. `flip` steps through three values on every
  // change (see the fill's touch transform).
  const change = isNewValue
    ? Math.abs(percentage - motion.percentage) / 100
    : motion.change;
  const flip = isNewValue ? (motion.flip + 1) % 3 : motion.flip;
  if (isNewValue) {
    setMotion({percentage, change, flip});
  }

  // Under a finger the fill draws at least TOUCH_MIN_FILL_PX long, so a mark
  // it covers there sits on the fill. That length is a share of the track's
  // width, which only layout knows: the track is measured only under a
  // finger, and only when the bar has marks.
  const {isTouch} = useTouchPresentation();
  const watchesTrack = isTouch && hasMarks;
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  useEffect(() => {
    const element = trackRef.current;
    if (!watchesTrack || element == null) {
      return;
    }
    // The shared observer; its first call (on registration) carries no
    // contentRect, so that one reads the box.
    return observeResize(element, entry => {
      setTrackWidth(
        entry.contentRect?.width ?? element.getBoundingClientRect().width,
      );
    });
  }, [watchesTrack]);
  const drawnPercentage =
    watchesTrack && percentage > 0 && trackWidth > 0
      ? Math.max(percentage, (TOUCH_MIN_FILL_PX / trackWidth) * 100)
      : percentage;

  return {
    fillVars: {
      '--_progress-bar-change': String(change),
      '--_progress-bar-flip': String(flip),
    },
    trackRef,
    drawnPercentage,
  };
}
