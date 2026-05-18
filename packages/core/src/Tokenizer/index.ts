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
