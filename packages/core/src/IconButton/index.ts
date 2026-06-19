// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports IconButton component and types from IconButton.tsx
 * @output Exports IconButton, IconButtonProps
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/IconButton/IconButton.doc.mjs
 */

export {IconButton} from './IconButton';
export type {IconButtonProps} from './IconButton';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  IconButton as XDSIconButton,
} from '.';
export type {
  IconButtonProps as XDSIconButtonProps,
} from '.';
// <compat-aliases:end>
