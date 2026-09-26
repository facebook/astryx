// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Optional lazy Mermaid semantic-fence plugin and configuration types
 * @position Public `@astryxdesign/core/Markdown/mermaid` subpath
 */

export {createMarkdownMermaidPlugin, markdownMermaidPlugin} from './mermaid';
export type {
  MarkdownMermaidConfig,
  MarkdownMermaidData,
  MarkdownMermaidDiagnostic,
  MarkdownMermaidDiagnosticCode,
  MarkdownMermaidNode,
  MarkdownMermaidPluginOptions,
} from './mermaid';
