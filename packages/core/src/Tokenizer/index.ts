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
/**
 * The touch surface with the pointer test skipped, so a story or a
 * handset-only app can render it directly. `Tokenizer` is the one to use: it
 * picks this surface itself wherever the primary pointer is a finger.
 */
export {TouchTokenizerField as TokenizerTouchSurface} from './TouchTokenizerField';
export type {
  TokenizerProps,
  TokenizerSize,
  TokenizerOverflowBehavior,
  TokenizerChange,
  TokenizerHandle,
  TokenizerStatus,
  TokenizerStatusType,
} from './Tokenizer';
