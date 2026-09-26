// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.ts
 * @input Markdown source, parser options, and optional plugins
 * @output Server-safe prepared Markdown document API and types
 * @position Public subpath entry point: `@astryxdesign/core/Markdown/document`
 */

export {prepareMarkdownDocument} from '../preparedDocument';
export type {
  PreparedMarkdownDocument,
  PreparedMarkdownOutlineItem,
  PrepareMarkdownDocumentOptions,
} from '../preparedDocument';
