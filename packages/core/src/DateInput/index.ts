// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input DateInput component exports
 * @output Re-exports XDSDateInput and types
 * @position Package entry point for DateInput
 */

export {XDSDateInput} from './XDSDateInput';
export type {
  XDSDateInputProps,
  XDSDateInputSize,
  XDSDateInputStatus,
  XDSDateInputStatusType,
} from './XDSDateInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSDateInput as DateInput,
} from '.';
export type {
  XDSDateInputProps as DateInputProps,
  XDSDateInputSize as DateInputSize,
  XDSDateInputStatus as DateInputStatus,
  XDSDateInputStatusType as DateInputStatusType,
} from '.';
// <compat-aliases:end>
