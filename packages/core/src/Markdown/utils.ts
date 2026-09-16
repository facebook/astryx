// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file utils.ts
 * @output Server-safe exports for Markdown parsing, plugin construction, and AST traversal
 * @position Subpath entry point: `@astryxdesign/core/Markdown/utils`
 */

export {createMarkdownPlugin, isMarkdownExtensionNode} from './plugins';
export type {
  MarkdownPluginData,
  MarkdownExtensionNode,
  MarkdownTokenizerInput,
  MarkdownTokenizeResult,
  MarkdownSyntaxContribution,
  MarkdownSyntaxCapability,
  MarkdownTransformContext,
  MarkdownTransform,
  MarkdownExtensionRenderer,
  MarkdownExtensionRenderers,
  MarkdownSyntaxPluginDefinition,
  MarkdownTransformPluginDefinition,
  MarkdownPluginDefinition,
  MarkdownPluginEntry,
  MarkdownNodeOf,
  MarkdownExtensionsOf,
} from './plugins';
export {visitMarkdownNodes} from './ast';
export type {
  MarkdownAstExtensionNode,
  MarkdownAstPhrasingContent,
  MarkdownAstBlockContent,
  MarkdownAstRoot,
  MarkdownAstNodeMap,
  MarkdownAstNode,
} from './ast';

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
