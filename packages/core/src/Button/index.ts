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
