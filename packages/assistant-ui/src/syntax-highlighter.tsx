// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file syntax-highlighter.tsx
 * @input Uses Astryx CodeBlock
 * @output Exports SyntaxHighlighter and ShikiHighlighter-compatible adapters
 * @position Isolated syntax rendering entrypoint
 */

import {CodeBlock, type CodeBlockProps} from '@astryxdesign/core/CodeBlock';

export interface SyntaxHighlighterProps extends Omit<
  CodeBlockProps,
  'code' | 'language'
> {
  code: string;
  language?: string;
}

export function SyntaxHighlighter({
  code,
  language = 'plaintext',
  width = '100%',
  ...props
}: SyntaxHighlighterProps) {
  return <CodeBlock {...props} code={code} language={language} width={width} />;
}

/**
 * Shiki-compatible package surface backed by Astryx's token-aware CodeBlock.
 * Consumers needing a Shiki grammar can pre-tokenize or replace this renderer
 * at the optional integration boundary.
 */
export const ShikiHighlighter = SyntaxHighlighter;
