// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSFileInput component and types from XDSFileInput.tsx
 * @output Exports XDSFileInput, XDSFileInputProps, XDSFileInputStatus, XDSFileInputStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/FileInput/FileInput.doc.mjs
 */

export {XDSFileInput} from './XDSFileInput';
export type {
  XDSFileInputProps,
  XDSFileInputStatus,
  XDSFileInputStatusType,
} from './XDSFileInput';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSFileInput as FileInput,
} from '.';
export type {
  XDSFileInputProps as FileInputProps,
  XDSFileInputStatus as FileInputStatus,
  XDSFileInputStatusType as FileInputStatusType,
} from '.';
// <compat-aliases:end>
