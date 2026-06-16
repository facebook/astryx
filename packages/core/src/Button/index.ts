// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSButton component and types from XDSButton.tsx
 * @output Exports XDSButton, XDSButtonProps, XDSButtonVariant
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Button/Button.doc.mjs
 */

export {XDSButton} from './XDSButton';
export type {
  XDSButtonProps,
  XDSButtonVariant,
  XDSButtonSize,
} from './XDSButton';
export type {XDSButtonVariantMap} from './XDSButton';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSButton as Button,
} from '.';
export type {
  XDSButtonProps as ButtonProps,
  XDSButtonSize as ButtonSize,
  XDSButtonVariant as ButtonVariant,
  XDSButtonVariantMap as ButtonVariantMap,
} from '.';
// <compat-aliases:end>
