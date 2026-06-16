// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports TimeInput components and types
 * @output Exports XDSTimeInput and related types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TimeInput/TimeInput.doc.mjs
 */

export {XDSTimeInput} from './XDSTimeInput';
export type {
  XDSTimeInputProps,
  XDSTimeInputSize,
  XDSTimeInputHourFormat,
  XDSTimeInputStatus,
  XDSTimeInputStatusType,
} from './XDSTimeInput';
export type {ISOTimeString} from '../utils';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTimeInput as TimeInput,
} from '.';
export type {
  XDSTimeInputHourFormat as TimeInputHourFormat,
  XDSTimeInputProps as TimeInputProps,
  XDSTimeInputSize as TimeInputSize,
  XDSTimeInputStatus as TimeInputStatus,
  XDSTimeInputStatusType as TimeInputStatusType,
} from '.';
// <compat-aliases:end>
