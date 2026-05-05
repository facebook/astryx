'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, parser functions, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSMarkdown} from './XDSMarkdown';
export type {XDSMarkdownProps, XDSMarkdownSource, XDSMarkdownComponents, MarkdownInlinePlugin} from './XDSMarkdown';

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
