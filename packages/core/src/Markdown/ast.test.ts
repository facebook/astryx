// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  createIncrementalState,
  parseMarkdown,
  parseMarkdownAst,
} from './parser';

describe('canonical Markdown AST', () => {
  it('uses MDAST-aligned names and fields for every built-in structure', () => {
    const ast = parseMarkdownAst(
      '# Title\n\n**bold** and *emphasis* with `code` and [link](/docs).\n\n- item\n\n| A | B |\n| - | - |\n| 1 | 2 |\n\n```ts\nconst value = 1;\n```\n\n---',
    );

    expect(ast).toMatchObject({
      type: 'root',
      children: [
        {
          type: 'heading',
          depth: 1,
          children: [{type: 'text', value: 'Title'}],
        },
        {
          type: 'paragraph',
          children: [
            {type: 'strong'},
            {type: 'text'},
            {type: 'emphasis'},
            {type: 'text'},
            {type: 'inlineCode', value: 'code'},
            {type: 'text'},
            {type: 'link', url: '/docs'},
            {type: 'text', value: '.'},
          ],
        },
        {
          type: 'list',
          ordered: false,
          children: [{type: 'listItem'}],
        },
        {
          type: 'table',
          align: [null, null],
          children: [
            {
              type: 'tableRow',
              children: [{type: 'tableCell'}, {type: 'tableCell'}],
            },
            {
              type: 'tableRow',
              children: [{type: 'tableCell'}, {type: 'tableCell'}],
            },
          ],
        },
        {type: 'code', lang: 'ts', value: 'const value = 1;'},
        {type: 'thematicBreak'},
      ],
    });
  });

  it('represents remaining built-ins without legacy aliases', () => {
    const ast = parseMarkdownAst(
      '> quote\n\n![Block](/block.png)\n\nParagraph ![Inline](/inline.png) [src] $x$  \nnext\n\n$$\ny\n$$',
      {math: true, sourceIds: new Set(['src'])},
    );

    expect(ast.children).toMatchObject([
      {
        type: 'blockquote',
        children: [
          {type: 'paragraph', children: [{type: 'text', value: 'quote'}]},
        ],
      },
      {type: 'image', url: '/block.png', alt: 'Block'},
      {
        type: 'paragraph',
        children: [
          {type: 'text', value: 'Paragraph '},
          {type: 'image', url: '/inline.png', alt: 'Inline'},
          {type: 'text', value: ' '},
          {type: 'citation', sourceId: 'src'},
          {type: 'text', value: ' '},
          {type: 'inlineMath', value: 'x'},
          {type: 'break'},
          {type: 'text', value: 'next'},
        ],
      },
      {type: 'math', value: 'y'},
    ]);
    expect(parseMarkdownAst('```\nplain\n```').children[0]).toEqual({
      type: 'code',
      lang: null,
      value: 'plain',
    });
    expect(parseMarkdown('```\nplain\n```')[0]).toEqual({
      type: 'codeblock',
      language: 'plaintext',
      content: 'plain',
    });
  });

  it('keeps source provenance canonical while projecting the released range', () => {
    const source = '# Heading\n\nParagraph';
    const ast = parseMarkdownAst(source, {sourceRanges: true});
    const legacy = parseMarkdown(source, {sourceRanges: true});

    expect(ast.children[0].position).toEqual({
      start: {offset: 0},
      end: {offset: 9},
    });
    expect(legacy[0]).toEqual({
      type: 'heading',
      level: 1,
      children: [{type: 'text', content: 'Heading'}],
      range: {start: 0, end: 9},
    });
    expect('position' in legacy[0]).toBe(false);
  });

  it('preserves optional legacy keys and insertion order exactly', () => {
    const [image, list] = parseMarkdown('![Alt](/image.png)\n\n- item');

    expect(Object.keys(image)).toEqual(['type', 'alt', 'src']);
    expect(Object.keys(list)).toEqual([
      'type',
      'ordered',
      'start',
      'delimiter',
      'loose',
      'items',
    ]);
    if (list.type !== 'list') {
      throw new Error('Expected list');
    }
    expect(Object.keys(list.items[0])).toEqual(['checked', 'children']);
    expect(list).toStrictEqual({
      type: 'list',
      ordered: false,
      start: undefined,
      delimiter: undefined,
      loose: undefined,
      items: [
        {
          checked: undefined,
          children: [
            {
              type: 'paragraph',
              children: [{type: 'text', content: 'item'}],
            },
          ],
        },
      ],
    });
  });

  it('does not expose canonical fields through released parser results', () => {
    const state = createIncrementalState();
    const blocks = parseMarkdown('# Heading\n\nParagraph');

    expect(blocks[0]).toEqual({
      type: 'heading',
      level: 1,
      children: [{type: 'text', content: 'Heading'}],
    });
    expect('depth' in blocks[0]).toBe(false);
    expect(state.settledBlocks).toEqual([]);
  });
});
