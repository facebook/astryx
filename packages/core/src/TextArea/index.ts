// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSTextArea component and types from XDSTextArea.tsx
 * @output Exports XDSTextArea, XDSTextAreaProps, XDSTextAreaStatus, XDSTextAreaStatusType
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TextArea/TextArea.doc.mjs
 */

export {XDSTextArea} from './XDSTextArea';
export type {
  XDSTextAreaProps,
  XDSTextAreaStatus,
  XDSTextAreaStatusType,
  XDSTextAreaSize,
} from './XDSTextArea';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTextArea as TextArea,
} from '.';
export type {
  XDSTextAreaProps as TextAreaProps,
  XDSTextAreaSize as TextAreaSize,
  XDSTextAreaStatus as TextAreaStatus,
  XDSTextAreaStatusType as TextAreaStatusType,
} from '.';
// <compat-aliases:end>
