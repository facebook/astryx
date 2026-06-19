// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Button component and types from Button.tsx
 * @output Exports Button, ButtonProps, ButtonVariant
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Button/Button.doc.mjs
 */

export {Button} from './Button';
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from './Button';
export type {ButtonVariantMap} from './Button';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Button as XDSButton,
} from '.';
export type {
  ButtonProps as XDSButtonProps,
  ButtonSize as XDSButtonSize,
  ButtonVariant as XDSButtonVariant,
  ButtonVariantMap as XDSButtonVariantMap,
} from '.';
// <compat-aliases:end>
