// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSCheckboxInput component and types from XDSCheckboxInput.tsx
 * @output Exports XDSCheckboxInput, XDSCheckboxInputProps, XDSCheckboxInputSize
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/CheckboxInput/CheckboxInput.doc.mjs
 */

export {XDSCheckboxInput} from './XDSCheckboxInput';
export type {
  XDSCheckboxInputProps,
  XDSCheckboxInputSize,
} from './XDSCheckboxInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCheckboxInput as CheckboxInput,
} from '.';
export type {
  XDSCheckboxInputProps as CheckboxInputProps,
  XDSCheckboxInputSize as CheckboxInputSize,
} from '.';
// <compat-aliases:end>
