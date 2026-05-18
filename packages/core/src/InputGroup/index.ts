// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSInputGroup.tsx, XDSInputGroupText.tsx, XDSInputGroupContext.ts
 * @output Exports XDSInputGroup, XDSInputGroupText, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSInputGroup} from './XDSInputGroup';
export type {XDSInputGroupProps, XDSInputGroupSize} from './XDSInputGroup';

export {XDSInputGroupText} from './XDSInputGroupText';
export type {XDSInputGroupTextProps} from './XDSInputGroupText';

export {useXDSInputGroup} from './XDSInputGroupContext';
