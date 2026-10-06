// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {render, waitFor} from '@testing-library/react';
import {createRef} from 'react';
import {createHeadlessEditor} from '@lexical/headless';
import {
  BOLD_STAR,
  ITALIC_STAR,
  UNORDERED_LIST,
  type Transformer,
} from '@lexical/markdown';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isElementNode,
} from 'lexical';
import {DEFAULT_NODES} from './editorNodes';
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';
import {splitMarkdownChunks} from './markdownSource';
import {RichTextEditor, type RichTextEditorRef} from './RichTextEditor';
import {RichTextEditorAutoLinkPlugin} from './RichTextEditorAutoLinkPlugin';

/**
 * The conformance corpus for spec:AST-062. Each document must come back byte
 * for byte from a no-op round trip, whatever RichText makes of it.
 */
const CORPUS: Record<string, string> = {
  empty: '',
  whitespaceOnly: '   \n\n\t\n',
  singleParagraphNoNewline: 'Plain paragraph',
  singleParagraphNewline: 'Plain paragraph\n',
  extraTrailingNewlines: 'Paragraph\n\n\n',
  leadingBlankLines: '\n\n# Title\n\nBody\n',
  trailingSpacesOnLines: 'Line with trailing spaces   \n\nNext   \n',
  crlf: '# Title\r\n\r\nFirst paragraph\r\nsoft break\r\n',
  byteOrderMark: '\uFEFF# Title\n\nBody\n',
  atxClosingHashes: '# Title #\n\n## Section ##\n',
  setextHeadings: 'Title\n=====\n\nSection\n-------\n',
  emphasisVariants:
    '*em* and _em_, **strong** and __strong__, ***both*** and ~~struck~~\n',
  inlineCodeBackticks: 'Use `code` and `` a`b `` here\n',
  links:
    '[inline](https://example.com) and [titled](https://example.com "Title") and <https://example.com/auto>\n',
  referenceLinks:
    'See [the docs][docs] and [docs].\n\n[docs]: https://example.com/docs "Docs"\n',
  bareUrl: 'Visit https://example.com/status today\n',
  hardBreaks: 'Two spaces  \nand a backslash\\\nend\n',
  softBreaks: 'One line\nsame paragraph\nstill same\n',
  blockquote: '> Quote line one\nlazy continuation\n>\n> > nested quote\n',
  nestedListsTwoSpace: '- Parent\n  - Child\n    - Grandchild\n- Sibling\n',
  nestedListsThreeSpace: '1. First\n   1. Nested\n2. Second\n',
  nestedListsFourSpace: '- Parent\n    - Child\n',
  listMarkers: '* star\n+ plus\n- dash\n',
  orderedStartAndParen: '3. three\n4. four\n\n1) paren\n2) paren\n',
  looseList: '- loose one\n\n- loose two\n',
  taskList: '- [ ] open\n- [x] done\n',
  fenceInfoAndMeta:
    '```ts title="retry.ts" {2}\nconst x = 1;\n\nconst y = 2;\n```\n',
  tildeFence: '~~~python\nprint("hi")\n~~~\n',
  longerFence: '````md\n```js\nnested();\n```\n````\n',
  unclosedFence: '```\nnever closed\n\nstill code',
  indentedCode: 'Paragraph\n\n    indented code\n    more\n',
  thematicBreaks: 'Above\n\n***\n\n___\n\n- - -\n\nBelow\n',
  escapes:
    '\\# not a heading\n\n\\*not italic\\* and \\_not\\_ and \\\\ backslash\n',
  characterReferences: 'Entities: &amp; &copy; &#169; &#x1F600; &nbsp;\n',
  htmlBlock: '<div align="center">\n  <b>HTML</b>\n</div>\n\nAfter\n',
  htmlInlineAndComment: 'Inline <kbd>Ctrl</kbd> and <!-- comment -->\n',
  footnote: 'Claim.[^1]\n\n[^1]: The footnote.\n',
  frontMatterLike: '---\ntitle: Notes\n---\n\nBody\n',
  unicodeAndRtl: 'Emoji 🎉 and עברית mixed with English\n',
  malformedEmphasis: '**unclosed strong and *unclosed em\n',
  malformedLink: '[no destination] and [broken](\n',
  tabsAndMixedIndent: '\t- tab list\n  \t- mixed\n',
  mixedDocument:
    '# Release notes\n\nIntro with **bold** and a [link](https://example.com).\n\n- One\n  - Two\n\n```ts\nconst a = 1;\n```\n\n> Quote\n\nEnd\n',
};

function roundTrip(
  markdown: string,
  transformers?: Array<Transformer>,
): string {
  return editorStateJSONToMarkdown(
    markdownToEditorStateJSON(markdown, {transformers}),
    {transformers},
  );
}

/** Applies an edit to the imported state and exports it again. */
function editAndExport(
  markdown: string,
  edit: () => void,
  transformers?: Array<Transformer>,
): string {
  const editor = createHeadlessEditor({
    namespace: 'astryx-markdown-source-test',
    nodes: [...DEFAULT_NODES],
    onError(error: Error) {
      throw error;
    },
  });
  editor.setEditorState(
    editor.parseEditorState(
      markdownToEditorStateJSON(markdown, {transformers}),
    ),
  );
  editor.update(edit, {discrete: true});
  return editorStateJSONToMarkdown(
    JSON.stringify(editor.getEditorState().toJSON()),
    {transformers},
  );
}

function $appendToBlock(index: number, text: string): void {
  const block = $getRoot().getChildren()[index];
  if (!$isElementNode(block)) {
    throw new Error(`block ${index} is not an element`);
  }
  const textNode = block.getAllTextNodes()[0];
  textNode.setTextContent(textNode.getTextContent() + text);
}

function $appendToBlockContaining(needle: string, text: string): void {
  const index = $getRoot()
    .getChildren()
    .findIndex(block => block.getTextContent().includes(needle));
  $appendToBlock(index, text);
}

describe('Markdown source preservation (spec:AST-062)', () => {
  it('has at least 30 corpus documents', () => {
    expect(Object.keys(CORPUS).length).toBeGreaterThanOrEqual(30);
  });

  it.each(Object.entries(CORPUS))(
    'splits %s into chunks that join back to the input',
    (_name, markdown) => {
      const chunks = splitMarkdownChunks(markdown);
      const joined = chunks
        .map(chunk => chunk.leading + chunk.content + chunk.trailing)
        .join('');
      expect(chunks.length === 0 ? markdown.trim() : joined).toBe(
        chunks.length === 0 ? '' : markdown,
      );
    },
  );

  it.each(Object.entries(CORPUS))(
    'returns %s byte for byte from a no-op round trip (FR1)',
    (_name, markdown) => {
      expect(roundTrip(markdown)).toBe(markdown);
    },
  );

  it('keeps every untouched block when the first, a middle, or the last block changes (FR2)', () => {
    const source =
      '# Title\n\nFirst  paragraph\n\n- One\n  - Two\n\n\\# escaped\n\nLast &#169;\n';
    expect(editAndExport(source, () => $appendToBlock(0, ' edited'))).toBe(
      '# Title edited\n\nFirst  paragraph\n\n- One\n  - Two\n\n\\# escaped\n\nLast &#169;\n',
    );
    const middle = editAndExport(source, () => $appendToBlock(1, ' edited'));
    expect(middle.startsWith('# Title\n\n')).toBe(true);
    expect(
      middle.endsWith('\n\n- One\n  - Two\n\n\\# escaped\n\nLast &#169;\n'),
    ).toBe(true);
    expect(middle).toContain('edited');
    const last = editAndExport(source, () => {
      const block = $getRoot().getLastChild();
      if ($isElementNode(block)) {
        block.clear();
        block.append($createTextNode('Changed last'));
      }
    });
    expect(last).toBe(
      '# Title\n\nFirst  paragraph\n\n- One\n  - Two\n\n\\# escaped\n\nChanged last\n',
    );
  });

  it('keeps every untouched block when a block is inserted or deleted (FR2)', () => {
    const source = 'Alpha  \n\n\\# Beta\n\nGamma &copy;\n';
    expect(
      editAndExport(source, () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('Inserted'));
        $getRoot().getChildren()[0].insertAfter(paragraph);
      }),
    ).toBe('Alpha  \n\nInserted\n\n\\# Beta\n\nGamma &copy;\n');
    expect(
      editAndExport(source, () => {
        $getRoot().getChildren()[1].remove();
      }),
    ).toBe('Alpha  \n\nGamma &copy;\n');
    expect(
      editAndExport(source, () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('Appended'));
        $getRoot().append(paragraph);
      }),
    ).toBe('Alpha  \n\n\\# Beta\n\nGamma &copy;\n\nAppended\n');
  });

  it('keeps unsupported source when other blocks change, and keeps its characters when it changes (FR5)', () => {
    const source =
      '<div align="center">\n  <b>HTML</b>\n</div>\n\n[docs]: https://example.com/docs\n\nEdit me\n';
    expect(
      editAndExport(source, () => $appendToBlockContaining('Edit me', ' now')),
    ).toBe(
      '<div align="center">\n  <b>HTML</b>\n</div>\n\n[docs]: https://example.com/docs\n\nEdit me now\n',
    );
    const editedHtml = editAndExport(source, () =>
      $appendToBlockContaining('HTML', ' x'),
    );
    for (const fragment of ['<div align="center">', '<b>HTML</b>', '</div>']) {
      expect(editedHtml).toContain(fragment);
    }
    expect(
      editedHtml.endsWith('\n\n[docs]: https://example.com/docs\n\nEdit me\n'),
    ).toBe(true);
  });

  it('writes a regenerated block so it imports again as what the editor showed (FR3)', () => {
    const source = '\\# not a heading\n\nKeep\n';
    const edited = editAndExport(source, () =>
      $appendToBlockContaining('not a heading', ' [x] 1. *y* &copy;'),
    );
    expect(edited).toBe(
      '\\# not a heading \\[x\\] 1. \\*y\\* \\&copy;\n\nKeep\n',
    );
    // Importing the regenerated Markdown shows the same literal text again.
    const reloaded = JSON.parse(markdownToEditorStateJSON(edited)) as {
      root: {children: Array<{type: string}>};
    };
    expect(reloaded.root.children.map(node => node.type)).toEqual([
      'paragraph',
      'paragraph',
    ]);
    expect(
      editAndExport('Lead\n', () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('1. not a list'));
        $getRoot().append(paragraph);
      }),
    ).toBe('Lead\n\n1\\. not a list\n');
  });

  it('keeps the byte order mark, leading bytes, and line endings (FR4)', () => {
    const crlf =
      '\uFEFF\r\n# Title\r\n\r\nFirst\r\nsecond line\r\n\r\nLast\r\n';
    expect(roundTrip(crlf)).toBe(crlf);
    expect(
      editAndExport(crlf, () => $appendToBlockContaining('Title', '!')),
    ).toBe('\uFEFF\r\n# Title!\r\n\r\nFirst\r\nsecond line\r\n\r\nLast\r\n');
    // The editor shows the two lines as two paragraphs, so the regenerated
    // group writes two paragraphs, in the group's CRLF style.
    expect(
      editAndExport(crlf, () => $appendToBlockContaining('First', ' one')),
    ).toBe(
      '\uFEFF\r\n# Title\r\n\r\nFirst one\r\n\r\nsecond line\r\n\r\nLast\r\n',
    );
    expect(
      editAndExport(crlf, () => {
        const paragraph = $createParagraphNode();
        paragraph.append($createTextNode('Added'));
        $getRoot().append(paragraph);
      }),
    ).toBe(
      '\uFEFF\r\n# Title\r\n\r\nFirst\r\nsecond line\r\n\r\nLast\r\n\r\nAdded\r\n',
    );
    expect(
      editAndExport(crlf, () => {
        $getRoot().getChildren()[0].remove();
      }).startsWith('\uFEFF'),
    ).toBe(true);
  });

  it('keeps a bare URL as written when the autolink plugin links it on load (FR1, FR6)', async () => {
    const markdown = 'Status at https://example.com/status today.\n\n- item\n';
    const ref = createRef<RichTextEditorRef>();
    render(
      <RichTextEditor
        label="Notes"
        ref={ref}
        defaultValue={markdownToEditorStateJSON(markdown)}
        plugins={<RichTextEditorAutoLinkPlugin />}
      />,
    );
    await waitFor(() =>
      expect(
        document.querySelector('a[href="https://example.com/status"]'),
      ).not.toBeNull(),
    );
    expect(ref.current?.getMarkdown()).toBe(markdown);
  });

  it('gives a custom transformer array the same preservation (FR6)', () => {
    const custom = [BOLD_STAR, ITALIC_STAR, UNORDERED_LIST];
    const source = '# Not a heading here\n\n- **bold** item\n  - nested\n';
    expect(roundTrip(source, custom)).toBe(source);
  });

  it('returns the authored bytes from getMarkdown() after loading imported content (FR1)', async () => {
    for (const name of [
      'mixedDocument',
      'nestedListsThreeSpace',
      'fenceInfoAndMeta',
      'escapes',
      'characterReferences',
      'crlf',
    ]) {
      const markdown = CORPUS[name];
      const ref = createRef<RichTextEditorRef>();
      const {unmount} = render(
        <RichTextEditor
          label="Notes"
          ref={ref}
          defaultValue={markdownToEditorStateJSON(markdown)}
        />,
      );
      await waitFor(() => expect(ref.current).not.toBeNull());
      expect(ref.current?.getMarkdown(), name).toBe(markdown);
      unmount();
    }
  });
});
