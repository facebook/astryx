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

export {XDSTokenizer} from './XDSTokenizer';
export type {
  XDSTokenizerProps,
  XDSTokenizerSize,
  XDSTokenizerOverflowBehavior,
  XDSTokenizerChange,
  XDSTokenizerHandle,
  XDSTokenizerStatus,
  XDSTokenizerStatusType,
} from './XDSTokenizer';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTokenizer as Tokenizer,
} from '.';
export type {
  XDSTokenizerChange as TokenizerChange,
  XDSTokenizerHandle as TokenizerHandle,
  XDSTokenizerOverflowBehavior as TokenizerOverflowBehavior,
  XDSTokenizerProps as TokenizerProps,
  XDSTokenizerSize as TokenizerSize,
  XDSTokenizerStatus as TokenizerStatus,
  XDSTokenizerStatusType as TokenizerStatusType,
} from '.';
// <compat-aliases:end>
