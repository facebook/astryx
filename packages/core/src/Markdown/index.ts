// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, parser functions, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {XDSMarkdown} from './XDSMarkdown';
export type {
  XDSMarkdownProps,
  XDSMarkdownSource,
  XDSMarkdownComponents,
  MarkdownInlinePlugin,
} from './XDSMarkdown';

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
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSMarkdown as Markdown,
} from '.';
export type {
  XDSMarkdownComponents as MarkdownComponents,
  XDSMarkdownProps as MarkdownProps,
  XDSMarkdownSource as MarkdownSource,
} from '.';
// <compat-aliases:end>
