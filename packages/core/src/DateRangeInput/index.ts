// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateRangeInput component exports
 * @output Re-exports XDSDateRangeInput and types
 * @position Package entry point for DateRangeInput
 */

export {XDSDateRangeInput} from './XDSDateRangeInput';
export type {
  XDSDateRangeInputProps,
  XDSDateRangeInputSize,
  XDSDateRangeInputStatus,
  XDSDateRangeInputStatusType,
  XDSDateRange,
  XDSDateRangePreset,
} from './XDSDateRangeInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSDateRangeInput as DateRangeInput,
} from '.';
export type {
  XDSDateRangeInputProps as DateRangeInputProps,
  XDSDateRangeInputSize as DateRangeInputSize,
  XDSDateRangeInputStatus as DateRangeInputStatus,
  XDSDateRangeInputStatusType as DateRangeInputStatusType,
  XDSDateRange as DateRange,
  XDSDateRangePreset as DateRangePreset,
} from '.';
// <compat-aliases:end>
