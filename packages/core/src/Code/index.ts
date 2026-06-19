// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Code component source
 * @output Exports Code and its props type
 * @position Entry point for @xds/core/Code subpath export
 */

export {Code, type CodeProps} from './Code';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Code as XDSCode,
} from '.';
export type {
  CodeProps as XDSCodeProps,
} from '.';
// <compat-aliases:end>
