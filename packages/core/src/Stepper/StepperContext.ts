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

import {createContext, use, type RefCallback} from 'react';

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
   * Dev-mode index registration and compact-navigation metadata. Each Step
   * calls this on mount with its `step` index and disabled state. The Stepper
   * tracks the set, warns if two Steps share an index, and keeps compact
   * previous/next controls from selecting disabled steps. Returns a cleanup
   * function to call on unmount.
   */
  registerStep: (index: number, isDisabled: boolean) => () => void;
  /**
   * How many steps have registered. Needed to know how much width each one is
   * getting, and to tell the last step from the rest without counting
   * children — which would couple the stepper to how they were grouped.
   *
   * Internal: not part of the public API.
   */
  stepCount: number;
  /**
   * True once the stepper is too narrow to give every step a legible label, at
   * which point the steps drop theirs and the stepper names the current one
   * below the track instead. Always false when vertical, which gives every
   * label a row of its own and never runs out of room.
   *
   * Decided by the parent because it depends on how much width there is and
   * how many steps are dividing it, and neither is knowable from inside a
   * single step.
   *
   * Internal: not part of the public API.
   */
  isCompact: boolean;
  /**
   * Where the current step draws itself once the labels have gone. The
   * stepper owns the row — it is outside the `<ol>`, so that the list keeps
   * exactly the children it was given and the on-track connectors can go on
   * reading their own `:first-child`/`:last-child` position — and the active
   * step fills it through a portal.
   *
   * A portal rather than the step handing its label up through this context:
   * an indicator can be any node, so a registered copy would either go stale
   * or change identity on every render and re-register forever. Rendered in
   * place, it is the same node the step already built, kept live by the same
   * render that built it.
   *
   * Null until the row exists, which is never on a stepper wide enough not to
   * need one.
   *
   * Internal: not part of the public API.
   */
  summarySlot: HTMLElement | null;
  /** CSS length whose resolved value sets the compact per-step threshold. */
  minimumStepWidth: number | string;
  /** Ref for the first Step's invisible CSS-length measurement element. */
  minStepWidthMeasureRef: RefCallback<HTMLDivElement>;
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
