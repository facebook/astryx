// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports Kbd component and types
 * @output Exports public API for @xds/core Kbd
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {Kbd} from './Kbd';
export type {KbdProps} from './Kbd';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Kbd as XDSKbd,
} from '.';
export type {
  KbdProps as XDSKbdProps,
} from '.';
// <compat-aliases:end>
