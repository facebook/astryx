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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSInputGroup as InputGroup,
  XDSInputGroupText as InputGroupText,
  useXDSInputGroup as useInputGroup,
} from '.';
export type {
  XDSInputGroupProps as InputGroupProps,
  XDSInputGroupSize as InputGroupSize,
  XDSInputGroupTextProps as InputGroupTextProps,
} from '.';
// <compat-aliases:end>
