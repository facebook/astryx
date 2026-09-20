// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, parser functions, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {Markdown} from './Markdown';
export type {
  MarkdownProps,
  MarkdownSource,
  MarkdownComponents,
  MarkdownInlinePlugin,
} from './Markdown';

export {
  parseMarkdown,
  parseMarkdownIncremental,
  createIncrementalState,
  parseInline,
} from './parser';
export type {
  BlockNode,
  BlockNodeWithMath,
  MathBlockNode,
  InlineNode,
  InlineNodeWithMath,
  MathInlineNode,
  SourceRange,
  ListItemNode,
  TableCellNode,
  TableAlignment,
  ParseOptions,
  MathParseOptions,
  IncrementalState as IncrementalParseState,
} from './parser';
