// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports CheckboxInput component and types from CheckboxInput.tsx
 * @output Exports CheckboxInput, CheckboxInputProps, CheckboxInputSize
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/CheckboxInput/CheckboxInput.doc.mjs
 */

export {CheckboxInput} from './CheckboxInput';
export type {
  CheckboxInputProps,
  CheckboxInputSize,
} from './CheckboxInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  CheckboxInput as XDSCheckboxInput,
} from '.';
export type {
  CheckboxInputProps as XDSCheckboxInputProps,
  CheckboxInputSize as XDSCheckboxInputSize,
} from '.';
// <compat-aliases:end>
