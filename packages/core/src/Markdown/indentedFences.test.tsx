// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  createIncrementalState,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
} from './parser';

type Json = {
  type: string;
  value?: string;
  lang?: string | null;
  children?: Json[];
};

/** The document's blocks as compact markup. */
function blocks(markdown: string): string {
  const show = (node: Json): string =>
    node.type === 'text'
      ? JSON.stringify(node.value)
      : node.type === 'code'
        ? `code(${node.lang ?? ''})${JSON.stringify(node.value)}`
        : node.children == null
          ? node.type
          : `${node.type}[${node.children.map(show).join(', ')}]`;
  return (parseMarkdownAst(markdown).children as unknown as Json[])
    .map(show)
    .join(' | ');
}

describe('a code fence may be indented up to three spaces (CommonMark 0.31 §4.5)', () => {
  it.each([
    [
      'a backtick fence indented two spaces, its code losing two',
      '  ```js\n  x\n    y\n  ```',
      'code(js)"x\\n  y"',
    ],
    ['a backtick fence indented one space', ' ```\na\n ```', 'code()"a"'],
    [
      'a tilde fence indented three spaces',
      '   ~~~\n   b\n   ~~~',
      'code()"b"',
    ],
    [
      'an indented closing fence',
      '```\ncode\n  ```\nafter',
      'code()"code" | paragraph["after"]',
    ],
    [
      'an indented fence interrupting a paragraph',
      'Text\n ```\n code\n ```',
      'paragraph["Text"] | code()"code"',
    ],
    [
      'a fence in a list item, unchanged',
      '1. Step\n   ```bash\n   cmd\n   ```',
      'list[listItem[paragraph["Step"], code(bash)"cmd"]]',
    ],
  ])('reads %s', (_, markdown, expected) => {
    expect(blocks(markdown)).toBe(expected);
  });

  it('keeps a line indented four spaces inside the block, not as its closer', () => {
    expect(blocks('```\na\n    ```\nb\n```')).toBe('code()"a\\n    ```\\nb"');
  });

  it('reads a fence indented four spaces as no fence', () => {
    expect(blocks('    ```\n    x\n    ```')).not.toContain('code(');
  });

  it('collects no link definition inside an indented fence', () => {
    expect(blocks(' ```\n[x]: /u\n ```\n\n[x]')).toBe(
      'code()"[x]: /u" | paragraph["[x]"]',
    );
  });

  it('streams indented fences with blank lines to the full parse at every character', () => {
    // `d` sits at the margin after a blank line inside a fence: that blank
    // line settles nothing, since the fence is still open.
    const markdown =
      'a\n\n  ```js\n  x\n\n  y\n  ```\n\nb\n\n ~~~\n\n c\n\nd\n ~~~\n';
    for (const sourceRanges of [false, true]) {
      const state = createIncrementalState();
      let streamed = parseMarkdownIncremental('', state, {sourceRanges});
      for (let end = 1; end <= markdown.length; end++) {
        streamed = parseMarkdownIncremental(markdown.slice(0, end), state, {
          sourceRanges,
        });
      }
      expect(streamed).toEqual(parseMarkdown(markdown, {sourceRanges}));
    }
  });
});
