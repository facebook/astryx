// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSNumberInput component and types from XDSNumberInput.tsx
 * @output Exports XDSNumberInput, XDSNumberInputProps, XDSNumberInputSize, XDSNumberInputStatus, XDSNumberInputStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/NumberInput/NumberInput.doc.mjs
 */

export {XDSNumberInput} from './XDSNumberInput';
export type {
  XDSNumberInputProps,
  XDSNumberInputSize,
  XDSNumberInputStatus,
  XDSNumberInputStatusType,
} from './XDSNumberInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSNumberInput as NumberInput,
} from '.';
export type {
  XDSNumberInputProps as NumberInputProps,
  XDSNumberInputSize as NumberInputSize,
  XDSNumberInputStatus as NumberInputStatus,
  XDSNumberInputStatusType as NumberInputStatusType,
} from '.';
// <compat-aliases:end>
