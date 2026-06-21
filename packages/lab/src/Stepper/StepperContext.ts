// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file StepperContext.ts
 * @input Uses React createContext/use
 * @output Exports StepperContext, useStepperContext, and context types
 * @position Context for Stepper <-> Step communication
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Stepper/Stepper.doc.mjs
 * - /packages/lab/src/Stepper/index.ts
 */

import {createContext, use} from 'react';

export type StepperOrientation = 'horizontal' | 'vertical';
export type StepperDensity = 'compact' | 'balanced' | 'spacious';

export interface StepperContextValue {
  activeStep: number;
  orientation: StepperOrientation;
  isNonLinear: boolean;
  onStepClick: ((index: number) => void) | null;
  density: StepperDensity;
}

export const StepperContext = createContext<StepperContextValue | null>(
  null,
);
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
