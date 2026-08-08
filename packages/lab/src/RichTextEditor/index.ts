// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports RichTextEditor and RichTextView components and their types
 * @output Exports the RichTextEditor experimental surface
 * @position Component entry point; re-exported from @astryxdesign/lab's barrel
 *   (packages/lab/src/index.ts).
 *
 * SYNC: When modified, update this header and the editor component doc files.
 */

export {RichTextEditor} from './RichTextEditor';
export type {
  RichTextEditorProps,
  RichTextEditorRef,
  RichTextEditorStatus,
  RichTextEditorStatusType,
  RichTextEditorSize,
  Transformer,
} from './RichTextEditor';

export {RichTextView} from './RichTextView';
export type {RichTextViewProps} from './RichTextView';

export {sharedEditorTheme} from './editorTheme';

export {
  markdownToEditorStateJSON,
  editorStateJSONToMarkdown,
} from './markdownSerializers';
export type {MarkdownSerializerOptions} from './markdownSerializers';

export {
  RichTextEditorToolbar,
  RICHTEXT_ICON_KEYS,
} from './RichTextEditorToolbar';
export type {RichTextEditorToolbarProps} from './RichTextEditorToolbar';

export {
  RichTextEditorAutoLinkPlugin,
  DEFAULT_LINK_MATCHERS,
  NEW_TAB_LINK_ATTRIBUTES,
} from './RichTextEditorAutoLinkPlugin';
export type {RichTextEditorAutoLinkPluginProps} from './RichTextEditorAutoLinkPlugin';

export {
  sanitizeUrl,
  validateUrl,
  URL_MATCHER,
  EMAIL_MATCHER,
} from './linkUtils';
