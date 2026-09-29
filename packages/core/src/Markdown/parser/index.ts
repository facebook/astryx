// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Markdown source and public parser options
 * @output Server-safe legacy and canonical Markdown parser entry points and types
 * @position Public subpath entry point: `@astryxdesign/core/Markdown/parser`
 */

export {
  createIncrementalState,
  parseInline,
  parseInlineAst,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
} from '../parser';
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
} from '../parser';
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
} from '../ast';
