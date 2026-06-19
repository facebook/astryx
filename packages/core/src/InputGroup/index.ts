// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from InputGroup.tsx, InputGroupText.tsx, InputGroupContext.ts
 * @output Exports InputGroup, InputGroupText, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {InputGroup} from './InputGroup';
export type {InputGroupProps, InputGroupSize} from './InputGroup';

export {InputGroupText} from './InputGroupText';
export type {InputGroupTextProps} from './InputGroupText';

export {useInputGroup} from './InputGroupContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  InputGroup as XDSInputGroup,
  InputGroupText as XDSInputGroupText,
  useInputGroup as useXDSInputGroup,
} from '.';
export type {
  InputGroupProps as XDSInputGroupProps,
  InputGroupSize as XDSInputGroupSize,
  InputGroupTextProps as XDSInputGroupTextProps,
} from '.';
// <compat-aliases:end>
