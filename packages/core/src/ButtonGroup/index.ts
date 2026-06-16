// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSButtonGroup.tsx and XDSButtonGroupContext.ts
 * @output Exports XDSButtonGroup, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSButtonGroup} from './XDSButtonGroup';
export type {XDSButtonGroupProps} from './XDSButtonGroup';

export {useXDSButtonGroup} from './XDSButtonGroupContext';
export type {
  XDSButtonGroupOrientation,
  XDSButtonGroupContextValue,
} from './XDSButtonGroupContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSButtonGroup as ButtonGroup,
  useXDSButtonGroup as useButtonGroup,
} from '.';
export type {
  XDSButtonGroupContextValue as ButtonGroupContextValue,
  XDSButtonGroupOrientation as ButtonGroupOrientation,
  XDSButtonGroupProps as ButtonGroupProps,
} from '.';
// <compat-aliases:end>
