// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports FileInput component and types from FileInput.tsx
 * @output Exports FileInput, FileInputProps, FileInputStatus, FileInputStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/FileInput/FileInput.doc.mjs
 */

export {FileInput} from './FileInput';
export type {
  FileInputProps,
  FileInputStatus,
  FileInputStatusType,
} from './FileInput';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  FileInput as XDSFileInput,
} from '.';
export type {
  FileInputProps as XDSFileInputProps,
  FileInputStatus as XDSFileInputStatus,
  FileInputStatusType as XDSFileInputStatusType,
} from '.';
// <compat-aliases:end>
