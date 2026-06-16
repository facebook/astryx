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
