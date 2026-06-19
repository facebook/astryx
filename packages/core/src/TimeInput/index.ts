// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports TimeInput components and types
 * @output Exports TimeInput and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TimeInput/TimeInput.doc.mjs
 */

export {TimeInput} from './TimeInput';
export type {
  TimeInputProps,
  TimeInputSize,
  TimeInputHourFormat,
  TimeInputStatus,
  TimeInputStatusType,
} from './TimeInput';
export type {ISOTimeString} from '../utils';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  TimeInput as XDSTimeInput,
} from '.';
export type {
  ISOTimeString as XDSISOTimeString,
  TimeInputHourFormat as XDSTimeInputHourFormat,
  TimeInputProps as XDSTimeInputProps,
  TimeInputSize as XDSTimeInputSize,
  TimeInputStatus as XDSTimeInputStatus,
  TimeInputStatusType as XDSTimeInputStatusType,
} from '.';
// <compat-aliases:end>
