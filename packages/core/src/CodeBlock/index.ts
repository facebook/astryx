// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

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
