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

export {Token} from './Token';
export type {TokenProps, TokenColor, TokenSize} from './Token';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Token as XDSToken,
} from '.';
export type {
  TokenColor as XDSTokenColor,
  TokenProps as XDSTokenProps,
  TokenSize as XDSTokenSize,
} from '.';
// <compat-aliases:end>
