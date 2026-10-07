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
import {
  editorStateJSONToMarkdown,
  markdownToEditorStateJSON,
} from './markdownSerializers';

type Json = Record<string, unknown>;

const FORMATS: ReadonlyArray<readonly [number, string]> = [
  [1, 'strong'],
  [2, 'emphasis'],
  [4, 'delete'],
  [16, 'code'],
];

/** Each run of text with the marks around it, as RichText imports it. */
function richText(markdown: string): string[] {
  const runs: string[] = [];
  const visit = (node: Json) => {
    if (node.type === 'text') {
      const format = node.format as number;
      const marks = FORMATS.filter(([bit]) => (format & bit) !== 0)
        .map(([, name]) => name)
        .join('+');
      runs.push(`${node.text as string}|${marks}`);
    }
    ((node.children as Json[]) ?? []).forEach(visit);
  };
  visit((JSON.parse(markdownToEditorStateJSON(markdown)) as {root: Json}).root);
  return runs;
}

/** The same, as core Markdown reads it. */
function core(markdown: string): string[] {
  const runs: string[] = [];
  const visit = (node: Json, marks: string[]) => {
    if (node.type === 'text') {
      runs.push(`${node.value as string}|${[...marks].sort(order).join('+')}`);
    } else if (node.type === 'inlineCode') {
      runs.push(
        `${node.value as string}|${[...marks, 'code'].sort(order).join('+')}`,
      );
    } else {
      const next = ['strong', 'emphasis', 'delete'].includes(
        node.type as string,
      )
        ? [...marks, node.type as string]
        : marks;
      ((node.children as Json[]) ?? []).forEach(child => visit(child, next));
    }
  };
  const order = (a: string, b: string) =>
    FORMATS.findIndex(([, name]) => name === a) -
    FORMATS.findIndex(([, name]) => name === b);
  (parseMarkdownAst(markdown).children as unknown as Json[]).forEach(node =>
    visit(node, []),
  );
  return runs;
}

describe('code spans read before the marks around them (CommonMark 0.31 §6.1)', () => {
  it.each([
    '~~a~~ ~~`c`~~',
    '*a* **b `c` d**',
    '*a* *`code`*',
    '**bold `code` more**',
    '`a*b*c` and *x*',
    '``a`b`` and ~~`x`~~',
    'A `\\[x\\]` span',
  ])('reads %j as core does, and round-trips it', markdown => {
    expect(richText(markdown)).toEqual(core(markdown));
    expect(
      editorStateJSONToMarkdown(markdownToEditorStateJSON(`${markdown}\n`)),
    ).toBe(`${markdown}\n`);
  });

  it('reads code in table cells, with an escaped pipe as a pipe', () => {
    const markdown =
      '| a | b |\n| --- | --- |\n| ~~x~~ ~~`c`~~ | `p \\| q` |\n';
    expect(richText(markdown)).toEqual([
      'a|',
      'b|',
      'x|delete',
      ' |',
      'c|delete+code',
      'p | q|code',
    ]);
    expect(editorStateJSONToMarkdown(markdownToEditorStateJSON(markdown))).toBe(
      markdown,
    );
  });

  it('keeps the marks around code through an edit', () => {
    const editor = createHeadlessEditor({
      nodes: [...DEFAULT_NODES],
      onError(error) {
        throw error;
      },
    });
    importMarkdownKeepingSource(editor, '*a* **b `c` d** end\n', [
      ...DEFAULT_TRANSFORMERS,
    ]);
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
    expect(richText(exported)).toEqual(core('*a* **b `c` d** end!'));
  });
});

/** Each link's URL with its text runs and their marks, as RichText imports it. */
function richLinks(markdown: string): Array<{url: string; runs: string[]}> {
  const links: Array<{url: string; runs: string[]}> = [];
  const visit = (node: Json, link: {url: string; runs: string[]} | null) => {
    if (node.type === 'link') {
      const entry = {url: node.url as string, runs: [] as string[]};
      links.push(entry);
      ((node.children as Json[]) ?? []).forEach(child => visit(child, entry));
      return;
    }
    if (node.type === 'text' && link != null) {
      const format = node.format as number;
      link.runs.push(
        `${node.text as string}|${(format & 16) !== 0 ? 'code' : ''}`,
      );
    }
    ((node.children as Json[]) ?? []).forEach(child => visit(child, link));
  };
  visit(
    (JSON.parse(markdownToEditorStateJSON(markdown)) as {root: Json}).root,
    null,
  );
  return links;
}

describe('code spans in link text', () => {
  it('shows a refused link holding code whole, as core shows it', () => {
    const markdown = 'See [`x`](javascript:y) now';
    expect(richLinks(markdown)).toEqual([]);
    // Plain text with no marks on either surface, however it is split.
    const plain = (runs: string[]): string =>
      runs.map(run => run.replace(/\|$/, '')).join('');
    expect(richText(markdown).every(run => run.endsWith('|'))).toBe(true);
    expect(plain(richText(markdown))).toBe(plain(core(markdown)));
    expect(plain(core(markdown))).toBe('See [`x`](javascript:y) now');
  });

  it('still links a safe destination, with its code as code', () => {
    expect(richLinks('See [`x`](https://example.com) now')).toEqual([
      {url: 'https://example.com', runs: ['x|code']},
    ]);
  });
});
