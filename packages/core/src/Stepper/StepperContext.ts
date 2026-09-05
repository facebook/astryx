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
