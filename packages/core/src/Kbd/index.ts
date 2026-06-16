// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Imports XDSKbd component and types
 * @output Exports public API for @xds/core Kbd
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSKbd} from './XDSKbd';
export type {XDSKbdProps} from './XDSKbd';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSKbd as Kbd,
} from '.';
export type {
  XDSKbdProps as KbdProps,
} from '.';
// <compat-aliases:end>
