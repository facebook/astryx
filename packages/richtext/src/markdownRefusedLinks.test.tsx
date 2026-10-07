// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {render, waitFor} from '@testing-library/react';
import {createHeadlessEditor} from '@lexical/headless';
import {$getRoot, $isTextNode} from 'lexical';
import {parseInlineAst} from '@astryxdesign/core/Markdown/parser';
import {DEFAULT_NODES} from './editorNodes';
import {DEFAULT_TRANSFORMERS} from './markdownTable';
import {
  $exportMarkdownKeepingSource,
  importMarkdownKeepingSource,
} from './markdownSource';
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';
import {RichTextView} from './RichTextView';

type Json = Record<string, unknown>;

/** The paragraph's links and its text, as RichText imports it. */
function imported(markdown: string): {links: string[]; text: string} {
  const links: string[] = [];
  let text = '';
  const visit = (node: Json) => {
    if (node.type === 'link' || node.type === 'autolink') {
      links.push(node.url as string);
    }
    if (node.type === 'text') {
      text += node.text as string;
    }
    ((node.children as Json[]) ?? []).forEach(visit);
  };
  visit((JSON.parse(markdownToEditorStateJSON(markdown)) as {root: Json}).root);
  return {links, text};
}

/** The text core Markdown shows for an inline line. */
function coreText(markdown: string): string {
  const flat = (node: Json): string =>
    node.type === 'text'
      ? (node.value as string)
      : ((node.children as Json[]) ?? []).map(flat).join('');
  return (parseInlineAst(markdown) as unknown as Json[]).map(flat).join('');
}

describe('links core refuses (spec:AST-061 FR7)', () => {
  it.each([
    'Go [here](javascript:alert(1)) now',
    'Go [here](JavaScript:alert(1)) now',
    'Go [here](&#106;avascript:alert(1)) now',
    'Go [here](vbscript:msgbox) now',
    'Go [here](data:text/html,hi) now',
    'Go **[here](javascript:alert(1))** now',
  ])('imports %j as its source text, as core shows it', markdown => {
    const {links, text} = imported(markdown);
    expect(links).toEqual([]);
    expect(text).toBe(coreText(markdown));
  });

  it('still links a safe destination beside a refused one', () => {
    const {links, text} = imported(
      '[bad](javascript:x) and [good](https://example.com)',
    );
    expect(links).toEqual(['https://example.com']);
    expect(text).toBe('[bad](javascript:x) and good');
  });

  it('round-trips a refused link byte for byte, and keeps it text through an edit', () => {
    const markdown = 'Go [here](javascript:alert(1)) now\n';
    expect(editorStateJSONToMarkdown(markdownToEditorStateJSON(markdown))).toBe(
      markdown,
    );
    const editor = createHeadlessEditor({
      nodes: [...DEFAULT_NODES],
      onError(error) {
        throw error;
      },
    });
    importMarkdownKeepingSource(editor, markdown, [...DEFAULT_TRANSFORMERS]);
    editor.update(
      () => {
        const last = $getRoot().getAllTextNodes().at(-1);
        if (!$isTextNode(last)) {
          throw new Error('No text');
        }
        last.setTextContent(`${last.getTextContent()}!`);
      },
      {discrete: true},
    );
    const exported = editor
      .getEditorState()
      .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
    expect(imported(exported)).toEqual({
      links: [],
      text: 'Go [here](javascript:alert(1)) now!',
    });
  });

  it('renders no anchor for it', async () => {
    const {container} = render(
      <RichTextView
        value={markdownToEditorStateJSON('Go [here](javascript:alert(1)) now')}
      />,
    );
    await waitFor(() =>
      expect(container.textContent).toContain('[here](javascript:alert(1))'),
    );
    expect(container.querySelector('a')).toBeNull();
  });
});
