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
  BlockNode,
  ListItemNode,
  TableCellNode,
  TableAlignment,
  IncrementalState,
} from './parser';
