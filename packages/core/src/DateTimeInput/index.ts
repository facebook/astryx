// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateTimeInput component exports
 * @output Re-exports DateTimeInput and types
 * @position Package entry point for DateTimeInput
 */

export {DateTimeInput} from './DateTimeInput';
export type {
  DateTimeInputProps,
  DateTimeInputSize,
  DateTimeInputHourFormat,
  DateTimeInputStatus,
  DateTimeInputStatusType,
  ISODateTimeString,
} from './DateTimeInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  DateTimeInput as XDSDateTimeInput,
} from '.';
export type {
  DateTimeInputHourFormat as XDSDateTimeInputHourFormat,
  DateTimeInputProps as XDSDateTimeInputProps,
  DateTimeInputSize as XDSDateTimeInputSize,
  DateTimeInputStatus as XDSDateTimeInputStatus,
  DateTimeInputStatusType as XDSDateTimeInputStatusType,
  ISODateTimeString as XDSISODateTimeString,
} from '.';
// <compat-aliases:end>
