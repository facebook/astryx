// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

export {Stepper} from './Stepper';
export type {StepperProps} from './Stepper';

export {Step} from './Step';
export type {StepProps, StepIndicatorPreset} from './Step';

export type {StepStatus} from './StepStatus';

export type {
  StepperOrientation,
  StepperIndicatorPosition,
} from './StepperContext';

// DEPRECATED — removal at the next major.
//
// Neither name is a supported extension point. A Stepper's context is built
// entirely from the props the caller passed it, so the hook hands back only
// what the call site already has; the two fields that were genuinely new to it
// — the connector-fill choreography and the dev-mode step registry — are
// Stepper's own coordination and are no longer named on the public type. They
// live on `StepperCoordination`, which stays inside the module.
//
// Kept exported so the removal lands at an explicit compatibility boundary
// rather than in a patch. Custom step composition is not, and was not,
// supported through this: compose with `<Step>` and its `children`,
// `indicator`, and `endContent` slots.
//
// Protected by Stepper.public.test.ts.
export {useStepperContext} from './StepperContext';
export type {StepperContextValue} from './StepperContext';
