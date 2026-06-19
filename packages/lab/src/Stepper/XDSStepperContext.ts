// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSStepperContext.ts
 * @input Uses React createContext/use
 * @output Exports XDSStepperContext, useXDSStepperContext, and context types
 * @position Context for XDSStepper <-> XDSStep communication
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Stepper/Stepper.doc.mjs
 * - /packages/lab/src/Stepper/index.ts
 */

import {createContext, use} from 'react';

export type XDSStepperOrientation = 'horizontal' | 'vertical';
export type XDSStepperDensity = 'compact' | 'balanced' | 'spacious';

export interface XDSStepperContextValue {
  activeStep: number;
  orientation: XDSStepperOrientation;
  isNonLinear: boolean;
  onStepClick: ((index: number) => void) | null;
  density: XDSStepperDensity;
}

export const XDSStepperContext = createContext<XDSStepperContextValue | null>(
  null,
);
XDSStepperContext.displayName = 'XDSStepperContext';

export function useXDSStepperContext(): XDSStepperContextValue {
  const ctx = use(XDSStepperContext);
  if (ctx == null) {
    throw new Error(
      'useXDSStepperContext must be used within XDSStepper. ' +
        'Wrap your XDSStep in <XDSStepper>.',
    );
  }
  return ctx;
}
