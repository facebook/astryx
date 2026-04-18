/**
 * @file codeShared.tsx
 * @input Code string, language, tokenizer functions
 * @output Shared hooks and helpers for CodeBlock and CodeEditor
 * @position Shared utility; consumed by XDSCodeBlock and XDSCodeEditor
 */

import {useEffect, useMemo, useState} from 'react';
import * as React from 'react';
import {
  tokenize,
  tokenizeAsync,
  flatTokensToLines,
  SYNC_TOKENIZE_THRESHOLD,
} from './tokenizer';
import type {Token, TokenLine} from './tokenizer';

// ---------------------------------------------------------------------------
// Feature detection
// ---------------------------------------------------------------------------

export function hasHighlightAPI(): boolean {
  return (
    typeof CSS !== 'undefined' &&
    'highlights' in CSS &&
    typeof Highlight !== 'undefined'
  );
}

// ---------------------------------------------------------------------------
// Tokenizer types
// ---------------------------------------------------------------------------

/** Custom tokenizer that returns flat tokens with absolute offsets. */
export type FlatTokenizer = (
  code: string,
  language: string,
) => Array<{type: string; start: number; end: number}>;

/** Custom tokenizer that returns per-line tokens directly. */
export type LineTokenizer = (code: string, language: string) => TokenLine[];

// ---------------------------------------------------------------------------
// useTokenLines hook
// ---------------------------------------------------------------------------

/**
 * Unified sync/async tokenization hook. Returns per-line token arrays.
 *
 * - Small code (< SYNC_TOKENIZE_THRESHOLD): tokenized synchronously in useMemo
 * - Large code: tokenized asynchronously with abort support
 * - Custom tokenizers: flat tokenizers are automatically converted to per-line
 */
export function useTokenLines(
  code: string,
  language: string,
  customTokenizer?: FlatTokenizer | LineTokenizer,
): TokenLine[] {
  const [asyncTokens, setAsyncTokens] = useState<TokenLine[] | null>(null);

  const syncTokens = useMemo(() => {
    if (code.length >= SYNC_TOKENIZE_THRESHOLD) return null;
    if (customTokenizer) {
      const result = customTokenizer(code, language);
      // If the result is an array of arrays, it's already per-line
      if (result.length > 0 && Array.isArray(result[0])) {
        return result as TokenLine[];
      }
      return flatTokensToLines(
        result as Array<{type: string; start: number; end: number}>,
        code,
      );
    }
    return tokenize(code, language);
  }, [code, language, customTokenizer]);

  useEffect(() => {
    if (code.length < SYNC_TOKENIZE_THRESHOLD) return;

    const abortController = new AbortController();

    if (customTokenizer) {
      Promise.resolve().then(() => {
        if (abortController.signal.aborted) return;
        const result = customTokenizer(code, language);
        if (result.length > 0 && Array.isArray(result[0])) {
          setAsyncTokens(result as TokenLine[]);
        } else {
          setAsyncTokens(
            flatTokensToLines(
              result as Array<{type: string; start: number; end: number}>,
              code,
            ),
          );
        }
      });
    } else {
      tokenizeAsync(code, language, abortController.signal).then(tokens => {
        if (!abortController.signal.aborted) {
          setAsyncTokens(tokens);
        }
      });
    }

    return () => {
      abortController.abort();
      setAsyncTokens(null);
    };
  }, [code, language, customTokenizer]);

  return syncTokens ?? asyncTokens ?? [];
}

// ---------------------------------------------------------------------------
// Span-mode helpers
// ---------------------------------------------------------------------------

/**
 * Build span-based highlighted content for a single line.
 * Tokens with the default color type are already filtered out by
 * the tokenizer, so every token here gets a colored span.
 */
export function buildSpanLine(
  lineText: string,
  tokens: Token[],
): React.ReactNode {
  if (tokens.length === 0) {
    return lineText || '\u200b';
  }

  const parts: React.ReactNode[] = [];
  let cursor = 0;

  for (const token of tokens) {
    if (token.start > cursor) {
      parts.push(lineText.slice(cursor, token.start));
    }
    const end = Math.min(token.end, lineText.length);
    parts.push(
      <span
        key={`${token.start}-${token.type}`}
        className={`xds-token-${token.type}`}>
        {lineText.slice(token.start, end)}
      </span>,
    );
    cursor = end;
  }

  if (cursor < lineText.length) {
    parts.push(lineText.slice(cursor));
  }
  return parts.length > 0 ? parts : '\u200b';
}
