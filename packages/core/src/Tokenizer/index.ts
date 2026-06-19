// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Tokenizer component
 * @output Exports all Tokenizer module public API
 * @position Entry point for Tokenizer module
 *
 * SYNC: When adding new Tokenizer files, update exports here
 */

export {Tokenizer} from './Tokenizer';
export type {
  TokenizerProps,
  TokenizerSize,
  TokenizerOverflowBehavior,
  TokenizerChange,
  TokenizerHandle,
  TokenizerStatus,
  TokenizerStatusType,
} from './Tokenizer';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Tokenizer as XDSTokenizer,
} from '.';
export type {
  TokenizerChange as XDSTokenizerChange,
  TokenizerHandle as XDSTokenizerHandle,
  TokenizerOverflowBehavior as XDSTokenizerOverflowBehavior,
  TokenizerProps as XDSTokenizerProps,
  TokenizerSize as XDSTokenizerSize,
  TokenizerStatus as XDSTokenizerStatus,
  TokenizerStatusType as XDSTokenizerStatusType,
} from '.';
// <compat-aliases:end>
