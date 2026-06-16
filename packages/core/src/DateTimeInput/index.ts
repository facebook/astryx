// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateTimeInput component exports
 * @output Re-exports XDSDateTimeInput and types
 * @position Package entry point for DateTimeInput
 */

export {XDSDateTimeInput} from './XDSDateTimeInput';
export type {
  XDSDateTimeInputProps,
  XDSDateTimeInputSize,
  XDSDateTimeInputHourFormat,
  XDSDateTimeInputStatus,
  XDSDateTimeInputStatusType,
  ISODateTimeString,
} from './XDSDateTimeInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSDateTimeInput as DateTimeInput,
} from '.';
export type {
  XDSDateTimeInputHourFormat as DateTimeInputHourFormat,
  XDSDateTimeInputProps as DateTimeInputProps,
  XDSDateTimeInputSize as DateTimeInputSize,
  XDSDateTimeInputStatus as DateTimeInputStatus,
  XDSDateTimeInputStatusType as DateTimeInputStatusType,
} from '.';
// <compat-aliases:end>
