// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from ToggleButton.tsx and ToggleButtonGroup.tsx
 * @output Exports ToggleButton, ToggleButtonGroup, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {ToggleButton} from './ToggleButton';
export type {ToggleButtonProps} from './ToggleButton';

export {ToggleButtonGroup} from './ToggleButtonGroup';
export type {
  ToggleButtonGroupProps,
  ToggleButtonGroupSingleProps,
  ToggleButtonGroupMultipleProps,
} from './ToggleButtonGroup';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ToggleButton as XDSToggleButton,
  ToggleButtonGroup as XDSToggleButtonGroup,
} from '.';
export type {
  ToggleButtonGroupMultipleProps as XDSToggleButtonGroupMultipleProps,
  ToggleButtonGroupProps as XDSToggleButtonGroupProps,
  ToggleButtonGroupSingleProps as XDSToggleButtonGroupSingleProps,
  ToggleButtonProps as XDSToggleButtonProps,
} from '.';
// <compat-aliases:end>
