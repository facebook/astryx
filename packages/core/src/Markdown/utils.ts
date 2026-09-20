// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @output Server-safe re-exports of pure Markdown parser functions
 * @position Subpath entry point: `@astryxdesign/core/Markdown/utils`
 */

export {
  parseMarkdown,
  parseInline,
  parseMarkdownIncremental,
  createIncrementalState,
  trimStreamingArtifacts,
} from './parser';

export type {
  InlineNode,
  InlineNodeWithMath,
  MathInlineNode,
  BlockNode,
  BlockNodeWithMath,
  MathBlockNode,
  ListItemNode,
  TableCellNode,
  TableAlignment,
  ParseOptions,
  MathParseOptions,
  IncrementalState,
} from './parser';
