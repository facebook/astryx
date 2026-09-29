// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Safe ANSI semantic-fence plugin, theme palette, and configuration types
 * @position Public `@astryxdesign/core/Markdown/ansi` subpath
 */

export {
  createMarkdownAnsiPlugin,
  markdownAnsiDefaultPalette,
  markdownAnsiPlugin,
} from './ansi';
export type {
  MarkdownAnsiCodeBlockProps,
  MarkdownAnsiColorName,
  MarkdownAnsiData,
  MarkdownAnsiNode,
  MarkdownAnsiPalette,
  MarkdownAnsiPluginOptions,
} from './ansi';
