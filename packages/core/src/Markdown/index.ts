// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports Markdown component, prepared document API, canonical and compatibility parser functions, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 */

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
  MarkdownAstFootnoteReference,
  MarkdownAstBreak,
  MarkdownAstPhrasingContent,
  MarkdownAstHeading,
  MarkdownAstParagraph,
  MarkdownAstCode,
  MarkdownAstMath,
  MarkdownAstFootnoteDefinition,
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
  MarkdownDocumentProps,
  MarkdownVariant,
  MarkdownSource,
  MarkdownComponents,
  MarkdownInlinePlugin,
} from './Markdown';
export {prepareMarkdownDocument} from './preparedDocument';
export type {
  PreparedMarkdownDocument,
  PreparedMarkdownOutlineItem,
  PrepareMarkdownDocumentOptions,
} from './preparedDocument';

export {
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
  createIncrementalState,
  parseInline,
  parseInlineAst,
} from './parser';
export type {
  BlockNode,
  BlockNodeWithMath,
  BlockNodeWithFootnotes,
  BlockNodeWithMathAndFootnotes,
  MathBlockNode,
  FootnoteDefinitionBlockNode,
  InlineNode,
  InlineNodeWithMath,
  InlineNodeWithFootnotes,
  InlineNodeWithMathAndFootnotes,
  MathInlineNode,
  FootnoteReferenceInlineNode,
  SourceRange,
  ListItemNode,
  TableCellNode,
  TableAlignment,
  ParseOptions,
  MathParseOptions,
  FootnoteParseOptions,
  MathFootnoteParseOptions,
  IncrementalParseOptions,
  IncrementalMathParseOptions,
  IncrementalFootnoteParseOptions,
  IncrementalMathFootnoteParseOptions,
  IncrementalState as IncrementalParseState,
} from './parser';
