// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input XDSCode component source
 * @output Exports XDSCode and its props type
 * @position Entry point for @xds/core/Code subpath export
 */

export {XDSCode, type XDSCodeProps} from './XDSCode';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCode as Code,
} from '.';
export type {
  XDSCodeProps as CodeProps,
} from '.';
// <compat-aliases:end>
