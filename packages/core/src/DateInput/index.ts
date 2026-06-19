// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateInput component exports
 * @output Re-exports DateInput and types
 * @position Package entry point for DateInput
 */

export {DateInput} from './DateInput';
export type {
  DateInputProps,
  DateInputSize,
  DateInputStatus,
  DateInputStatusType,
} from './DateInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  DateInput as XDSDateInput,
} from '.';
export type {
  DateInputProps as XDSDateInputProps,
  DateInputSize as XDSDateInputSize,
  DateInputStatus as XDSDateInputStatus,
  DateInputStatusType as XDSDateInputStatusType,
} from '.';
// <compat-aliases:end>
