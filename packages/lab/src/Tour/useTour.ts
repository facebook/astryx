// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useTour.ts
 * @input Uses React useContext, TourContext
 * @output Exports useTour hook and UseTourReturn type
 * @position Public hook; reads the nearest Tour controller's state
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Tour/TourContext.ts
 * - /packages/lab/src/Tour/Tour.doc.mjs
 */

import {useContext} from 'react';
import {TourContext, type TourDismissSource} from './TourContext';

/**
 * Read-only view of the active Tour's state, for custom step UIs or
 * instrumentation. Returns `null` when called outside a `<Tour>`.
 */
export interface UseTourReturn {
  /** Zero-based index of the active step. */
  activeStepIndex: number;
  /** Total number of registered steps. */
  stepCount: number;
  /** Whether the active step is the first one. */
  isFirstStep: boolean;
  /** Whether the active step is the last one. */
  isLastStep: boolean;
  /** Advance to the next step (or complete on the last step). */
  next: () => void;
  /** Return to the previous step. */
  previous: () => void;
  /** Dismiss the tour with a reason. */
  dismiss: (source: TourDismissSource) => void;
}

/**
 * Access the current Tour controller state. Must be used inside a `<Tour>`;
 * returns `null` otherwise so callers can guard.
 */
export function useTour(): UseTourReturn | null {
  const ctx = useContext(TourContext);
  if (ctx == null) {
    return null;
  }
  return {
    activeStepIndex: ctx.activeStepIndex,
    stepCount: ctx.stepCount,
    isFirstStep: ctx.activeStepIndex <= 0,
    isLastStep: ctx.stepCount > 0 && ctx.activeStepIndex === ctx.stepCount - 1,
    next: ctx.onNext,
    previous: ctx.onPrevious,
    dismiss: ctx.onDismiss,
  };
}
