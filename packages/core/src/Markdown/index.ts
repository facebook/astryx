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


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Markdown as XDSMarkdown,
} from '.';
export type {
  BlockNode as XDSBlockNode,
  IncrementalParseState as XDSIncrementalParseState,
  InlineNode as XDSInlineNode,
  ListItemNode as XDSListItemNode,
  MarkdownComponents as XDSMarkdownComponents,
  MarkdownInlinePlugin as XDSMarkdownInlinePlugin,
  MarkdownProps as XDSMarkdownProps,
  MarkdownSource as XDSMarkdownSource,
  TableAlignment as XDSTableAlignment,
  TableCellNode as XDSTableCellNode,
} from '.';
// <compat-aliases:end>
