// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createHeadlessEditor} from '@lexical/headless';
import {$getRoot, $isTextNode} from 'lexical';
import {parseMarkdownAst} from '@astryxdesign/core/Markdown/parser';
import {DEFAULT_NODES} from './editorNodes';
import {DEFAULT_TRANSFORMERS} from './markdownTable';
import {
  $exportMarkdownKeepingSource,
  importMarkdownKeepingSource,
} from './markdownSource';
import {markdownToEditorStateJSON} from './markdownSerializers';

type Json = {type: string; text?: string; value?: string; children?: Json[]};

/** The editor's top-level blocks: their types and text. */
function richBlocks(markdown: string): string[] {
  const text = (node: Json): string =>
    node.text ?? (node.children ?? []).map(text).join('');
  return (
    JSON.parse(markdownToEditorStateJSON(markdown)) as {root: Json}
  ).root.children!.map(node => `${node.type}:${text(node)}`);
}

/** Core's top-level blocks: their types and text. */
function coreBlocks(markdown: string): string[] {
  const text = (node: Json): string =>
    node.value ?? (node.children ?? []).map(text).join('');
  return (parseMarkdownAst(markdown).children as unknown as Json[]).map(
    node => `${node.type === 'blockquote' ? 'quote' : node.type}:${text(node)}`,
  );
}

describe('a block quote marker reads as core reads it', () => {
  it.each(['>a', '>\ta', '   > a', '> a'])(
    'quotes %j, as core does',
    markdown => {
      expect(richBlocks(markdown)).toEqual(['quote:a']);
      expect(coreBlocks(markdown)).toEqual(['quote:a']);
    },
  );

  it('reads four spaces of indentation as no marker, as core does', () => {
    expect(richBlocks('    > a')).toEqual(['paragraph:    > a']);
    expect(coreBlocks('    > a')).toEqual(['paragraph:    > a']);
  });

  it('writes an edited quote back as one that reads as a quote', () => {
    const editor = createHeadlessEditor({
      nodes: [...DEFAULT_NODES],
      onError(error) {
        throw error;
      },
    });
    importMarkdownKeepingSource(editor, '>a\n', [...DEFAULT_TRANSFORMERS]);
    editor.update(
      () => {
        const last = $getRoot().getLastDescendant();
        if (!$isTextNode(last)) {
          throw new Error('No text to edit');
        }
        last.setTextContent(`${last.getTextContent()}x`);
      },
      {discrete: true},
    );
    const exported = editor
      .getEditorState()
      .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
    expect(richBlocks(exported)).toEqual(['quote:ax']);
  });
});
