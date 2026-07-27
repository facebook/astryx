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
  RichTextEditorStatus,
  RichTextEditorStatusType,
  RichTextEditorSize,
} from './RichTextEditor';

export {RichTextView} from './RichTextView';
export type {RichTextViewProps} from './RichTextView';

export {sharedEditorTheme} from './editorTheme';
