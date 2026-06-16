// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSTextInput component and types from TextInput.tsx
 * @output Exports XDSTextInput, XDSTextInputProps, XDSTextInputSize, XDSTextInputStatus, XDSTextInputStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TextInput/TextInput.doc.mjs
 */

export {XDSTextInput} from './XDSTextInput';
export type {
  XDSTextInputProps,
  XDSTextInputType,
  XDSTextInputSize,
  XDSTextInputStatus,
  XDSTextInputStatusType,
} from './XDSTextInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTextInput as TextInput,
} from '.';
export type {
  XDSTextInputProps as TextInputProps,
  XDSTextInputSize as TextInputSize,
  XDSTextInputStatus as TextInputStatus,
  XDSTextInputStatusType as TextInputStatusType,
  XDSTextInputType as TextInputType,
} from '.';
// <compat-aliases:end>
