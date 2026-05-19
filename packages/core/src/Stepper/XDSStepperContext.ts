// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSStepperContext.ts
 * @input Uses React createContext/useContext
 * @output Exports XDSStepperContext, useXDSStepperContext, and context types
 * @position Context for XDSStepper <-> XDSStep communication
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs
 * - /packages/core/src/Stepper/index.ts
 */

import {createContext, useContext} from 'react';

export type XDSStepperOrientation = 'horizontal' | 'vertical';

export interface XDSStepperContextValue {
  activeStep: number;
  orientation: XDSStepperOrientation;
  isNonLinear: boolean;
  onStepClick: ((index: number) => void) | null;
}

export const XDSStepperContext = createContext<XDSStepperContextValue | null>(
  null,
);

export function useXDSStepperContext(): XDSStepperContextValue {
  const ctx = useContext(XDSStepperContext);
  if (ctx == null) {
    throw new Error(
      'useXDSStepperContext must be used within XDSStepper. ' +
        'Wrap your XDSStep in <XDSStepper>.',
    );
  }
  return ctx;
}
