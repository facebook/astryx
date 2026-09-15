// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, plugin protocol, parser functions, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {createMarkdownPlugin} from './plugins';
export type {
  MarkdownPluginData,
  MarkdownExtensionNode,
  MarkdownTokenizerInput,
  MarkdownTokenizeResult,
  MarkdownSyntaxContribution,
  MarkdownSyntaxCapability,
  MarkdownTextContribution,
  MarkdownFenceMode,
  MarkdownFenceInput,
  MarkdownFenceResult,
  MarkdownFenceContribution,
  MarkdownDecorationAppearance,
  MarkdownDecorationTone,
  MarkdownDecoration,
  MarkdownExtensionRenderers,
  MarkdownSyntaxPluginDefinition,
  MarkdownPresentationPluginDefinition,
  MarkdownPluginDefinition,
  MarkdownPluginEntry,
  MarkdownNodeOf,
  MarkdownExtensionsOf,
} from './plugins';

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
  IncrementalParseOptions,
  IncrementalMathParseOptions,
  IncrementalState as IncrementalParseState,
} from './parser';
