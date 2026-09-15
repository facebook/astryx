// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @output Server-safe Markdown parser and plugin-protocol exports
 * @position Subpath entry point: `@astryxdesign/core/Markdown/utils`
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
  IncrementalParseOptions,
  IncrementalMathParseOptions,
  IncrementalState,
} from './parser';
