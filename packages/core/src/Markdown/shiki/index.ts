// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Optional lazy Shiki semantic-fence plugin and configuration types
 * @position Public `@astryxdesign/core/Markdown/shiki` subpath
 */

export {
  createMarkdownShikiPlugin,
  markdownShikiDefaultLanguages,
  markdownShikiPlugin,
} from './shiki';
export type {
  MarkdownShikiCodeBlockProps,
  MarkdownShikiData,
  MarkdownShikiDiagnostic,
  MarkdownShikiDiagnosticCode,
  MarkdownShikiLanguages,
  MarkdownShikiNode,
  MarkdownShikiPluginOptions,
} from './shiki';
