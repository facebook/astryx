// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {createHeadlessEditor} from '@lexical/headless';
import {$getRoot} from 'lexical';
import {parseInline, parseMarkdown} from '@astryxdesign/core/Markdown/parser';
import {DEFAULT_NODES} from './editorNodes';
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';

interface SerializedNode {
  readonly type: string;
  readonly text?: string;
  readonly children?: ReadonlyArray<SerializedNode>;
}

/** The text RichText imports for a one-paragraph document. */
function richTextText(markdown: string): string {
  const {root} = JSON.parse(markdownToEditorStateJSON(markdown)) as {
    root: SerializedNode;
  };
  const texts: Array<string> = [];
  const visit = (node: SerializedNode) => {
    if (node.text != null) {
      texts.push(node.text);
    }
    node.children?.forEach(visit);
  };
  visit(root);
  return texts.join('');
}

/** The text core Markdown renders for the same paragraph. */
function markdownText(markdown: string): string {
  return parseInline(markdown)
    .map(node =>
      'content' in node
        ? String(node.content)
        : 'children' in node && Array.isArray(node.children)
          ? node.children
              .map(child => ('content' in child ? String(child.content) : ''))
              .join('')
          : '',
    )
    .join('');
}

// One table for both surfaces (spec:AST-061 DEC-5).
const CASES = [
  '&copy;',
  '&#169;',
  '&#xA9; and &#XA9;',
  'Fish &amp; chips',
  '&amp;copy;',
  '&NotEqualTilde;',
  '&unknown;',
  '&copy without a semicolon',
  '& copy;',
  '&#0; &#xD800; &#x110000;',
  '&#12345678;',
  'a&nbsp;b',
  '\\&copy; is escaped',
  '\\&#169; is escaped too',
  '\\\\&copy; follows an escaped backslash',
  'code `&copy;` stays',
];

describe('character references (spec:AST-061 FR7, DEC-5)', () => {
  it('import exactly as core Markdown renders them', () => {
    for (const source of CASES) {
      expect(richTextText(`${source}\n`), source).toBe(markdownText(source));
    }
  });

  it('stay literal in fenced code, as core Markdown keeps them', () => {
    const markdown = '```\n&copy; &#169;\n```\n';
    expect(richTextText(markdown)).toBe('&copy; &#169;');
    expect(parseMarkdown(markdown)[0]).toMatchObject({
      content: '&copy; &#169;',
    });
  });

  it('keep an untouched paragraph exact and write decoded text back so it reads the same (spec:AST-062)', () => {
    const markdown = 'A &copy; B &amp;copy; C &#169;\n';
    expect(editorStateJSONToMarkdown(markdownToEditorStateJSON(markdown))).toBe(
      markdown,
    );
    const editor = createHeadlessEditor({
      namespace: 'astryx-character-reference-test',
      nodes: [...DEFAULT_NODES],
      onError(error: Error) {
        throw error;
      },
    });
    editor.setEditorState(
      editor.parseEditorState(markdownToEditorStateJSON(markdown)),
    );
    editor.update(
      () => {
        const text = $getRoot().getAllTextNodes()[0];
        text?.setTextContent(`${text.getTextContent()}!`);
      },
      {discrete: true},
    );
    const exported = editorStateJSONToMarkdown(
      JSON.stringify(editor.getEditorState().toJSON()),
    );
    // The decoded `&copy;` text is escaped, so it does not decode again.
    expect(exported).toBe('A © B \\&copy; C ©!\n');
    expect(richTextText(exported)).toBe('A © B &copy; C ©!');
  });
});
