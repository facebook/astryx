// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from Stepper component files
 * @output Exports XDSStepper, XDSStep and their types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Stepper/Stepper.doc.mjs
 */

export {XDSStepper} from './XDSStepper';
export type {XDSStepperProps} from './XDSStepper';

export {XDSStep} from './XDSStep';
export type {XDSStepProps} from './XDSStep';

export {useXDSStepperContext} from './XDSStepperContext';
export type {XDSStepperOrientation} from './XDSStepperContext';
