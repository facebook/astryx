// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports TextInput component and types from TextInput.tsx
 * @output Exports TextInput, TextInputProps, TextInputSize, TextInputStatus, TextInputStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TextInput/TextInput.doc.mjs
 */

export {TextInput} from './TextInput';
export type {
  TextInputProps,
  TextInputType,
  TextInputSize,
  TextInputStatus,
  TextInputStatusType,
} from './TextInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  TextInput as XDSTextInput,
} from '.';
export type {
  TextInputProps as XDSTextInputProps,
  TextInputSize as XDSTextInputSize,
  TextInputStatus as XDSTextInputStatus,
  TextInputStatusType as XDSTextInputStatusType,
  TextInputType as XDSTextInputType,
} from '.';
// <compat-aliases:end>
