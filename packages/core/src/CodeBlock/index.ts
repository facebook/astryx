// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from CodeBlock.tsx, Code.tsx, tokenizer.ts, highlightRanges.ts, highlightStyles.ts
 * @output Exports CodeBlock, Code components, tokenizer utilities, and highlight APIs
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/CodeBlock/CodeBlock.doc.mjs
 */

export {CodeBlock} from './CodeBlock';
export type {CodeBlockProps} from './CodeBlock';

export {Code} from '../Code';
export type {CodeProps} from '../Code';

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
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Code as XDSCode,
  CodeBlock as XDSCodeBlock,
  SYNC_TOKENIZE_THRESHOLD as XDSSYNC_TOKENIZE_THRESHOLD,
  TOKEN_TYPES as XDSTOKEN_TYPES,
} from '.';
export type {
  CodeBlockProps as XDSCodeBlockProps,
  CodeProps as XDSCodeProps,
  Token as XDSToken,
  TokenLine as XDSTokenLine,
} from '.';
// <compat-aliases:end>
