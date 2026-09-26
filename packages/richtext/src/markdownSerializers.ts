// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file markdownSerializers.ts
 * @input Uses @lexical/headless (createHeadlessEditor), @lexical/markdown
 *   ($convertFromMarkdownString / $convertToMarkdownString), and the shared
 *   DEFAULT_NODES set.
 * @output Standalone Markdown <-> serialized EditorState helpers:
 *   markdownToEditorStateJSON, editorStateJSONToMarkdown.
 * @position Re-exported from RichTextEditor/index.ts and the @astryxdesign/richtext
 *   barrel. Complements the ref's getMarkdown() by working WITHOUT a mounted
 *   editor (e.g. to produce a `defaultValue` from Markdown on the server).
 *
 * SYNC: When modified, update:
 * - /packages/richtext/src/index.ts (exports)
 * - /packages/richtext/src/RichTextEditor.doc.mjs (usage notes)
 * - /packages/richtext/src/RichTextEditor.test.tsx (tests)
 *
 * NOTE: `@lexical/headless`, `@lexical/markdown`, and `lexical` are OPTIONAL
 * peer dependencies (this is a canary lab module). Install them to use these
 * helpers. `@lexical/headless` runs Lexical without a DOM, so these work in
 * Node / SSR contexts.
 */

import {createHeadlessEditor} from '@lexical/headless';
import {
  TRANSFORMERS,
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type Transformer,
} from '@lexical/markdown';
import {DEFAULT_NODES} from './editorNodes';
import type {Klass, LexicalNode} from 'lexical';

/** Options shared by the Markdown serializer helpers. */
export interface MarkdownSerializerOptions {
  /**
   * Markdown transformers to use. Defaults to the standard `@lexical/markdown`
   * `TRANSFORMERS`. Pass the same array you give `RichTextEditor`'s
   * `transformers` prop so content round-trips consistently.
   */
  transformers?: ReadonlyArray<Transformer>;
  /**
   * Extra Lexical nodes to register beyond the default OSS set, mirroring the
   * editor's `nodes` prop. Required for custom node types to serialize.
   */
  nodes?: ReadonlyArray<Klass<LexicalNode>>;
}

function createSerializerEditor(nodes?: ReadonlyArray<Klass<LexicalNode>>) {
  return createHeadlessEditor({
    namespace: 'astryx-editor-serializer',
    nodes: nodes ? [...DEFAULT_NODES, ...nodes] : [...DEFAULT_NODES],
    onError(error: Error) {
      throw error;
    },
  });
}

/**
 * Convert a Markdown string to a serialized Lexical `EditorState` JSON string
 * — the same shape `RichTextEditor`'s `defaultValue` expects. Runs headless
 * (no DOM), so it is safe in Node / SSR.
 *
 * @example
 * ```
 * const value = markdownToEditorStateJSON('# Title\n\nHello');
 * <RichTextEditor label="Notes" defaultValue={value} />
 * ```
 */
export function markdownToEditorStateJSON(
  markdown: string,
  options: MarkdownSerializerOptions = {},
): string {
  const {transformers = TRANSFORMERS, nodes} = options;
  const editor = createSerializerEditor(nodes);
  editor.update(
    () => {
      $convertFromMarkdownString(markdown, [...transformers]);
    },
    {discrete: true},
  );
  return JSON.stringify(editor.getEditorState().toJSON());
}

/**
 * Convert a serialized Lexical `EditorState` JSON string (e.g. the value
 * produced by `RichTextEditor`'s `onChange` or `defaultValue`) to a Markdown
 * string. Runs headless (no DOM), so it is safe in Node / SSR.
 *
 * @example
 * ```
 * const md = editorStateJSONToMarkdown(savedJson);
 * ```
 */
export function editorStateJSONToMarkdown(
  editorStateJSON: string,
  options: MarkdownSerializerOptions = {},
): string {
  const {transformers = TRANSFORMERS, nodes} = options;
  const editor = createSerializerEditor(nodes);
  const state = editor.parseEditorState(editorStateJSON);
  return state.read(() => $convertToMarkdownString([...transformers]));
}
