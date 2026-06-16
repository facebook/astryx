// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from XDSCodeBlock.tsx, XDSCode.tsx, tokenizer.ts, highlightRanges.ts, highlightStyles.ts
 * @output Exports XDSCodeBlock, XDSCode components, tokenizer utilities, and highlight APIs
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/CodeBlock/CodeBlock.doc.mjs
 */

export {XDSCodeBlock} from './XDSCodeBlock';
export type {XDSCodeBlockProps} from './XDSCodeBlock';

export {XDSCode} from '../Code';
export type {XDSCodeProps} from '../Code';

export {
  tokenize,
  tokenizeAsync,
  tokenizeStreaming,
  flatTokensToLines,
  SYNC_TOKENIZE_THRESHOLD,
} from './tokenizer';
export type {Token, TokenLine} from './tokenizer';

export {
  applyHighlightRangesChunked,
  applyHighlightRangesBatch,
  applyHighlightRangesFlat,
  cleanupRanges,
} from './highlightRanges';
export {ensureHighlightStyles, TOKEN_TYPES} from './highlightStyles';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCode as Code,
  XDSCodeBlock as CodeBlock,
} from '.';
export type {
  XDSCodeBlockProps as CodeBlockProps,
  XDSCodeProps as CodeProps,
} from '.';
// <compat-aliases:end>
