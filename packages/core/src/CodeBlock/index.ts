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

export {XDSCode} from './XDSCode';
export type {XDSCodeProps} from './XDSCode';

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
