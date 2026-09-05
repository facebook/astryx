// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file StepperContext.ts
 * @input Uses React createContext/use
 * @output Exports StepperContext, the internal coordination hook, and the
 *   deprecated public hook/type
 * @position Context for Stepper <-> Step communication
 *
 * TWO SHAPES, NOT ONE.
 * `StepperCoordination` is what the provider actually carries: everything Step
 * needs from Stepper, including the connector-fill choreography and the
 * dev-mode index registry. It is deliberately NOT re-exported from `index.ts`,
 * so the seam is closed by module boundary rather than by naming convention —
 * the same reason `BusyIndicatorLane` lives outside Typeahead's barrel. An
 * `@internal` tag is a note to a reader, not a boundary: a builder reading an
 * exported declaration finds every name on it and can reasonably wire one,
 * pinning a Stepper-internal detail as permanent API.
 *
 * `StepperContextValue` is the deprecated public subset. It stays exported for
 * one compatibility window (see index.ts) and names only fields that were
 * already safe to read. Narrowing it is what stops an internal change to the
 * fill choreography from landing as a consumer type break.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs
 * - /packages/core/src/Stepper/index.ts
 * - /packages/core/src/Stepper/Stepper.public.test.ts
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

/**
 * The deprecated public read of a Stepper's context.
 *
 * Every field here is a value the caller already passed to `<Stepper>`, so
 * reading them back buys nothing a prop or the caller's own state does not
 * already give — which is why the hook is on its way out rather than being
 * grown into a composition API.
 *
 * @deprecated Not a supported extension point, and scheduled for removal in
 * the next major. Thread `activeStep` and the layout props from the state you
 * already own; see `useStepperContext`.
 */
export interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
  isNonLinear: boolean;
  onStepClick: ((index: number) => void) | null;
  density: StepperDensity;
  indicatorPosition: StepperIndicatorPosition;
}

/**
 * What the provider actually carries. Package-internal: exported from this
 * module for Stepper and Step, never from `index.ts`.
 *
 * Extends the public subset so there is exactly one object on the wire — the
 * split is a matter of which declaration a consumer can reach, not of building
 * a second value per render.
 */
export interface StepperCoordination extends StepperContextValue {
  /**
   * The `activeStep` this stepper last rendered with, so a Step can tell
   * whether the change it is reacting to was a single step forward — the one
   * change that animates the connector fill — and which span that change
   * crossed (see the CONNECTOR FILL block in Step.tsx). Equal to `activeStep`
   * on the first render, which is what keeps a stepper that mounts mid-flow
   * from animating its way to the step it opened on.
   *
   * Deliberately not a Stepper prop either. When the connector animates is
   * behaviour the stepper owns, not something a consumer configures.
   */
  previousActiveStep: number;
  /**
   * Dev-mode index registration. Each Step calls this on mount with its `step`
   * index. The Stepper tracks the set and warns if two Steps share the same
   * index. Returns a cleanup function to call on unmount.
   */
  registerStep: (index: number) => () => void;
}

export const StepperContext = createContext<StepperCoordination | null>(null);
StepperContext.displayName = 'StepperContext';

function useCoordination(hookName: string): StepperCoordination {
  const ctx = use(StepperContext);
  if (ctx == null) {
    throw new Error(
      `${hookName} must be used within Stepper. Wrap your Step in <Stepper>.`,
    );
  }
  return ctx;
}

/**
 * Stepper <-> Step coordination. Package-internal; see the header.
 */
export function useStepperCoordination(): StepperCoordination {
  return useCoordination('useStepperCoordination');
}

/**
 * Reads the enclosing Stepper's configuration.
 *
 * There is no supported use case for this: a Stepper's context is built
 * entirely from props the caller passed in, so anything it returns is already
 * in hand at the call site. Custom step composition is not supported through
 * it either — the connector fill is choreographed inside `Step`, so a
 * hand-rolled step reading this context still cannot draw a correct track.
 * Compose with `<Step>` and its `children`, `indicator`, and `endContent`
 * slots instead.
 *
 * The returned object is the live coordination value, narrowed on the way out.
 * Narrowing the *declaration* is the point — that is the surface a consumer
 * reads and builds against — so it is done in the type rather than by copying
 * fields into a fresh object on every render of every step.
 *
 * @deprecated Not a supported extension point, and scheduled for removal in
 * the next major. Thread `activeStep` and the layout props from the state you
 * already own — the state driving `<Stepper activeStep>` is the same state.
 *
 * @example
 * ```
 * // Instead of reading the context from inside a step:
 * const [activeStep, setActiveStep] = useState(0);
 * <Stepper activeStep={activeStep} onStepClick={setActiveStep}>
 *   <Step step={0} label="Details">
 *     {activeStep === 0 && <DetailsForm />}
 *   </Step>
 * </Stepper>
 * ```
 */
export function useStepperContext(): StepperContextValue {
  return useCoordination('useStepperContext');
}
