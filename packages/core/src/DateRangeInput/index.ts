// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateRangeInput component exports
 * @output Re-exports DateRangeInput and types
 * @position Package entry point for DateRangeInput
 */

export {DateRangeInput} from './DateRangeInput';
export type {
  DateRangeInputProps,
  DateRangeInputSize,
  DateRangeInputStatus,
  DateRangeInputStatusType,
  DateRange,
  DateRangePreset,
} from './DateRangeInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  DateRangeInput as XDSDateRangeInput,
} from '.';
export type {
  DateRange as XDSDateRange,
  DateRangeInputProps as XDSDateRangeInputProps,
  DateRangeInputSize as XDSDateRangeInputSize,
  DateRangeInputStatus as XDSDateRangeInputStatus,
  DateRangeInputStatusType as XDSDateRangeInputStatusType,
  DateRangePreset as XDSDateRangePreset,
} from '.';
// <compat-aliases:end>
