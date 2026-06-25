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
  InlineNode,
  ListItemNode,
  TableCellNode,
  TableAlignment,
  IncrementalState as IncrementalParseState,
} from './parser';
