// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from ButtonGroup.tsx and ButtonGroupContext.ts
 * @output Exports ButtonGroup, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {ButtonGroup} from './ButtonGroup';
export type {ButtonGroupProps} from './ButtonGroup';

export {useButtonGroup} from './ButtonGroupContext';
export type {
  ButtonGroupOrientation,
  ButtonGroupContextValue,
} from './ButtonGroupContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  ButtonGroup as XDSButtonGroup,
  useButtonGroup as useXDSButtonGroup,
} from '.';
export type {
  ButtonGroupContextValue as XDSButtonGroupContextValue,
  ButtonGroupOrientation as XDSButtonGroupOrientation,
  ButtonGroupProps as XDSButtonGroupProps,
} from '.';
// <compat-aliases:end>
