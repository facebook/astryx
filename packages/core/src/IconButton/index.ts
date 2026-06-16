// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSIconButton component and types from XDSIconButton.tsx
 * @output Exports XDSIconButton, XDSIconButtonProps
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/IconButton/IconButton.doc.mjs
 */

export {XDSIconButton} from './XDSIconButton';
export type {XDSIconButtonProps} from './XDSIconButton';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSIconButton as IconButton,
} from '.';
export type {
  XDSIconButtonProps as IconButtonProps,
} from '.';
// <compat-aliases:end>
