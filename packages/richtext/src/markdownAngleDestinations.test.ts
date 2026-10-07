// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {createHeadlessEditor} from '@lexical/headless';
import {$createLinkNode} from '@lexical/link';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isTextNode,
} from 'lexical';
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

type Json = Record<string, unknown>;

/** Each link's URL and title, as RichText imports it. */
function richLinks(
  markdown: string,
): Array<{url: string; title: string | null}> {
  const links: Array<{url: string; title: string | null}> = [];
  const visit = (node: Json) => {
    if (node.type === 'link') {
      links.push({
        url: node.url as string,
        title: (node.title as string | null | undefined) ?? null,
      });
    }
    ((node.children as Json[]) ?? []).forEach(visit);
  };
  visit((JSON.parse(markdownToEditorStateJSON(markdown)) as {root: Json}).root);
  return links;
}

/** Each link's URL, as core reads it. */
function coreUrls(markdown: string): string[] {
  const urls: string[] = [];
  const visit = (node: Json) => {
    if (node.type === 'link') {
      urls.push(node.url as string);
    }
    ((node.children as Json[]) ?? []).forEach(visit);
  };
  (parseInlineAst(markdown) as unknown as Json[]).forEach(visit);
  return urls;
}

function newEditor() {
  return createHeadlessEditor({
    nodes: [...DEFAULT_NODES],
    onError(error) {
      throw error;
    },
  });
}

describe('angle-bracket link destinations (CommonMark 0.31 §6.3)', () => {
  it.each([
    'See [c](<https://e.com/a b>) here',
    'See [c](<https://e.com/a b> "t") here',
    'See [c](<https://e.com/x>) here',
    'See [c](<a b>) and [d](https://e.com) here',
  ])('reads %j with the address core reads, and round-trips it', markdown => {
    expect(richLinks(markdown).map(({url}) => url)).toEqual(coreUrls(markdown));
    expect(
      editorStateJSONToMarkdown(markdownToEditorStateJSON(`${markdown}\n`)),
    ).toBe(`${markdown}\n`);
  });

  it('keeps the title of an angle-bracket destination', () => {
    expect(richLinks('[c](<a b> "t")')).toEqual([{url: 'a b', title: 't'}]);
  });

  it('writes an address holding a space in angle brackets after an edit, so it reads back', () => {
    const editor = newEditor();
    importMarkdownKeepingSource(editor, 'See [c](<https://e.com/a b>) here\n', [
      ...DEFAULT_TRANSFORMERS,
    ]);
    editor.update(
      () => {
        const last = $getRoot().getAllTextNodes().at(-1);
        if (!$isTextNode(last)) {
          throw new Error('No text');
        }
        last.setTextContent(' there');
      },
      {discrete: true},
    );
    const exported = editor
      .getEditorState()
      .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
    expect(exported).toBe('See [c](<https://e.com/a b>) there\n');
    expect(richLinks(exported)).toEqual([
      {url: 'https://e.com/a b', title: null},
    ]);
  });

  it('writes a link made in the editor with a space in its address so it reads back', () => {
    const editor = newEditor();
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createLinkNode('https://e.com/a b').append($createTextNode('c')),
            ),
          );
      },
      {discrete: true},
    );
    const exported = editor
      .getEditorState()
      .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
    expect(exported).toBe('[c](<https://e.com/a b>)');
    expect(richLinks(exported)).toEqual([
      {url: 'https://e.com/a b', title: null},
    ]);
  });

  it('still refuses an unsafe address in angle brackets', () => {
    expect(richLinks('[x](<javascript:alert(1)>)')).toEqual([]);
    expect(richLinks('[x](<data: text/html,hi>)')).toEqual([]);
  });
});

describe('angle-bracket destination edges', () => {
  it('reads `<b>c>` as a destination as it stands, as core does', () => {
    const markdown = '[a](<b>c>)';
    expect(richLinks(markdown).map(({url}) => url)).toEqual(coreUrls(markdown));
  });

  it('reads an escaped bracket inside the angle brackets as part of the address', () => {
    expect(richLinks('[a](<a \\<b>)')).toEqual([{url: 'a <b', title: null}]);
  });

  it('writes an address holding a space and brackets so it reads back', () => {
    const editor = newEditor();
    editor.update(
      () => {
        $getRoot()
          .clear()
          .append(
            $createParagraphNode().append(
              $createLinkNode('a <b c>').append($createTextNode('x')),
            ),
          );
      },
      {discrete: true},
    );
    const exported = editor
      .getEditorState()
      .read(() => $exportMarkdownKeepingSource([...DEFAULT_TRANSFORMERS]));
    expect(exported).toBe('[x](<a \\<b c\\>>)');
    expect(richLinks(exported)).toEqual([{url: 'a <b c>', title: null}]);
  });

  it.each([
    '[x](<javascript:x \\<y>)',
    '[x](<data: text/html \\<b\\>>)',
    '[x](<JavaScript:a b>)',
  ])('still refuses the unsafe address in %j', markdown => {
    expect(richLinks(markdown)).toEqual([]);
  });
});
