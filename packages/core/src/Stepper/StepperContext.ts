// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file StepperContext.ts
 * @input Uses React createContext/use
 * @output Exports StepperContext, useStepperContext, and context types
 * @position Context for Stepper <-> Step communication
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs
 * - /packages/core/src/Stepper/index.ts
 */

import {createContext, use} from 'react';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperDensity = 'compact' | 'balanced' | 'spacious';

/**
 * Controls where each step's indicator sits relative to the connector track.
 * - 'separated': indicator lives in the label row, distinct from the progress
 *   bar (Astryx's original layout).
 * - 'on-track': indicator is slotted *into* the connector line as a node on the
 *   track, with the label beside (vertical) or below (horizontal). Aligns with
 *   the on-track stepper design.
 */
export type StepperIndicatorPosition = 'separated' | 'on-track';

export interface StepperContextValue {
  activeStep: number;
  /**
   * The `activeStep` this stepper last rendered with, so a Step can tell
   * whether the change it is reacting to was a single step forward — the one
   * change that animates the connector fill — and which span that change
   * crossed (see the CONNECTOR FILL block in Step.tsx). Equal to `activeStep`
   * on the first render, which is what keeps a stepper that mounts mid-flow
   * from animating its way to the step it opened on.
   *
   * Internal: not part of the public API, and deliberately not a Stepper prop.
   * When the connector animates is behaviour the stepper owns, not something a
   * consumer configures.
   */
  previousActiveStep: number;
  orientation: StepperOrientation;
  isNonLinear: boolean;
  onStepClick: ((index: number) => void) | null;
  density: StepperDensity;
  indicatorPosition: StepperIndicatorPosition;
  /**
   * Dev-mode index registration. Each Step calls this on mount with its `step`
   * index. The Stepper tracks the set and warns if two Steps share the same
   * index. Returns a cleanup function to call on unmount.
   */
  registerStep: (index: number) => () => void;
}

export const StepperContext = createContext<StepperContextValue | null>(null);
StepperContext.displayName = 'StepperContext';

export function useStepperContext(): StepperContextValue {
  const ctx = use(StepperContext);
  if (ctx == null) {
    throw new Error(
      'useStepperContext must be used within Stepper. ' +
        'Wrap your Step in <Stepper>.',
    );
  }
  return ctx;
}
