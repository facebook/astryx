'use client';

/**
 * @file index.ts
 * @output Exports CodeBlock and Code components, tokenizer, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSCodeBlock} from './XDSCodeBlock';
export type {XDSCodeBlockProps} from './XDSCodeBlock';

export {XDSCode} from './XDSCode';
export type {XDSCodeProps} from './XDSCode';

export {tokenize, tokenizeAsync, SYNC_TOKENIZE_THRESHOLD} from './tokenizer';
export type {Token} from './tokenizer';
