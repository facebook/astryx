// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports NumberInput component and types from NumberInput.tsx
 * @output Exports NumberInput, NumberInputProps, NumberInputSize, NumberInputStatus, NumberInputStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/NumberInput/NumberInput.doc.mjs
 */

export {NumberInput} from './NumberInput';
export type {
  NumberInputProps,
  NumberInputSize,
  NumberInputStatus,
  NumberInputStatusType,
} from './NumberInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  NumberInput as XDSNumberInput,
} from '.';
export type {
  NumberInputProps as XDSNumberInputProps,
  NumberInputSize as XDSNumberInputSize,
  NumberInputStatus as XDSNumberInputStatus,
  NumberInputStatusType as XDSNumberInputStatusType,
} from '.';
// <compat-aliases:end>
