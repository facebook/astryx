// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Token component
 * @output Exports all Token module public API
 * @position Entry point for Token module
 *
 * SYNC: When adding new Token files, update exports here
 */

export {XDSToken} from './XDSToken';
export type {XDSTokenProps, XDSTokenColor, XDSTokenSize} from './XDSToken';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export type {
  XDSTokenColor as TokenColor,
  XDSTokenProps as TokenProps,
  XDSTokenSize as TokenSize,
} from '.';
// <compat-aliases:end>
