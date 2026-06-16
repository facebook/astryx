// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSToggleButton.tsx and XDSToggleButtonGroup.tsx
 * @output Exports XDSToggleButton, XDSToggleButtonGroup, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSToggleButton} from './XDSToggleButton';
export type {XDSToggleButtonProps} from './XDSToggleButton';

export {XDSToggleButtonGroup} from './XDSToggleButtonGroup';
export type {
  XDSToggleButtonGroupProps,
  XDSToggleButtonGroupSingleProps,
  XDSToggleButtonGroupMultipleProps,
} from './XDSToggleButtonGroup';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSToggleButton as ToggleButton,
  XDSToggleButtonGroup as ToggleButtonGroup,
} from '.';
export type {
  XDSToggleButtonGroupMultipleProps as ToggleButtonGroupMultipleProps,
  XDSToggleButtonGroupProps as ToggleButtonGroupProps,
  XDSToggleButtonGroupSingleProps as ToggleButtonGroupSingleProps,
  XDSToggleButtonProps as ToggleButtonProps,
} from '.';
// <compat-aliases:end>
