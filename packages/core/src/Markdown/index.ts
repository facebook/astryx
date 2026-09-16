// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, parser functions, transform helpers, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

export {createMarkdownTextTransform} from './textTransform';
export type {
  MarkdownTextTransformContext,
  MarkdownTextTransformOptions,
} from './textTransform';
export {createMarkdownFenceTransform} from './semanticFence';
export type {
  MarkdownFenceContext,
  MarkdownFenceNode,
  MarkdownFenceTransformOptions,
} from './semanticFence';
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
  MarkdownAstPoint,
  MarkdownAstDataValue,
  MarkdownAstPosition,
  MarkdownAstNodeBase,
  MarkdownAstExtensionNode,
  MarkdownAstText,
  MarkdownAstInlineCode,
  MarkdownAstInlineMath,
  MarkdownAstLink,
  MarkdownAstImage,
  MarkdownAstCitation,
  MarkdownAstBreak,
  MarkdownAstPhrasingContent,
  MarkdownAstHeading,
  MarkdownAstParagraph,
  MarkdownAstCode,
  MarkdownAstMath,
  MarkdownAstBlockquote,
  MarkdownAstList,
  MarkdownAstListItem,
  MarkdownAstTable,
  MarkdownAstTableRow,
  MarkdownAstTableCell,
  MarkdownAstThematicBreak,
  MarkdownAstBlockContent,
  MarkdownAstRoot,
  MarkdownAstNodeMap,
  MarkdownAstNode,
} from './ast';

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
