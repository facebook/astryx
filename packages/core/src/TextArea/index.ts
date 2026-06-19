// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports TextArea component and types from TextArea.tsx
 * @output Exports TextArea, TextAreaProps, TextAreaStatus, TextAreaStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TextArea/TextArea.doc.mjs
 */

export {TextArea} from './TextArea';
export type {
  TextAreaProps,
  TextAreaStatus,
  TextAreaStatusType,
  TextAreaSize,
} from './TextArea';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  TextArea as XDSTextArea,
} from '.';
export type {
  TextAreaProps as XDSTextAreaProps,
  TextAreaSize as XDSTextAreaSize,
  TextAreaStatus as XDSTextAreaStatus,
  TextAreaStatusType as XDSTextAreaStatusType,
} from '.';
// <compat-aliases:end>
