// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {createRef} from 'react';
import {act, render, waitFor} from '@testing-library/react';
import {$getRoot, $isTextNode} from 'lexical';
import {RichTextEditor, type RichTextEditorRef} from './RichTextEditor';
import {RichTextView} from './RichTextView';
import {markdownToEditorStateJSON} from './markdownSerializers';

/** Each deletion's text and the tags inside it, outermost first. */
function deletions(root: Element): Array<{text: string; tags: string}> {
  return [...root.querySelectorAll('del')].map(deletion => {
    const tags: Array<string> = [];
    for (
      let element = deletion.firstElementChild;
      element != null;
      element = element.firstElementChild
    ) {
      tags.push(element.tagName.toLowerCase());
    }
    return {text: deletion.textContent ?? '', tags: tags.join('>')};
  });
}

describe('struck-through text (spec:AST-061 FR7)', () => {
  it('is a deletion around the strong, emphasis, and link text Lexical draws', async () => {
    const value = markdownToEditorStateJSON(
      'Keep ~~plain~~, **~~bold~~**, *~~italic~~*, [~~link~~](https://example.com), and `~~literal~~`.\n',
    );
    const {container} = render(
      <>
        <div data-surface="editor">
          <RichTextEditor label="Notes" defaultValue={value} />
        </div>
        <div data-surface="view">
          <RichTextView value={value} />
        </div>
      </>,
    );
    for (const surface of ['editor', 'view']) {
      const root = container.querySelector(`[data-surface="${surface}"]`);
      if (root == null) {
        throw new Error(`No ${surface}`);
      }
      await waitFor(() =>
        expect(deletions(root)).toEqual([
          {text: 'plain', tags: 'span'},
          {text: 'bold', tags: 'strong'},
          {text: 'italic', tags: 'em'},
          {text: 'link', tags: 'span'},
        ]),
      );
      // The link keeps its deletion inside it; text that only looks struck
      // inside code is code.
      expect(root.querySelector('a del')?.textContent).toBe('link');
      expect(root.querySelector('del a')).toBeNull();
      expect(
        [...root.querySelectorAll('code')].some(
          code =>
            code.textContent === '~~literal~~' && code.closest('del') == null,
        ),
      ).toBe(true);
      // No element gives up its own role for the deletion.
      expect(root.querySelector('[role="deletion"]')).toBeNull();
    }
  });

  it('adds and removes the deletion as the mark changes, and keeps updating the text', async () => {
    const ref = createRef<RichTextEditorRef>();
    const {container} = render(
      <RichTextEditor
        label="Notes"
        ref={ref}
        defaultValue={markdownToEditorStateJSON('**plain**\n')}
      />,
    );
    const editor = await waitFor(() => {
      const instance = ref.current?.getEditor();
      expect(instance).toBeTruthy();
      return instance;
    });
    const update = async (change: () => void) => {
      await act(async () => {
        editor?.update(change, {discrete: true});
      });
    };
    const text = () => $getRoot().getAllTextNodes()[0];
    await update(() => {
      const node = text();
      if ($isTextNode(node)) {
        node.toggleFormat('strikethrough');
      }
    });
    await waitFor(() =>
      expect(deletions(container)).toEqual([{text: 'plain', tags: 'strong'}]),
    );
    // Lexical keeps updating its own element inside the deletion.
    await update(() => {
      const node = text();
      if ($isTextNode(node)) {
        node.setTextContent('plain and more');
      }
    });
    await waitFor(() =>
      expect(deletions(container)).toEqual([
        {text: 'plain and more', tags: 'strong'},
      ]),
    );
    expect(ref.current?.getMarkdown()).toBe('**~~plain and more~~**\n');
    await update(() => {
      const node = text();
      if ($isTextNode(node)) {
        node.toggleFormat('strikethrough');
      }
    });
    await waitFor(() => expect(deletions(container)).toEqual([]));
    expect(container.querySelector('strong')?.textContent).toBe(
      'plain and more',
    );
    // Struck code is a deletion around Lexical's code element.
    await update(() => {
      const node = text();
      if ($isTextNode(node)) {
        node.setFormat('code');
        node.toggleFormat('strikethrough');
      }
    });
    await waitFor(() =>
      expect(deletions(container)).toEqual([
        {text: 'plain and more', tags: 'code>span'},
      ]),
    );
  });
});
