// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {parseMarkdown, parseMarkdownAst} from './parser';

describe('Markdown footnote parsing', () => {
  it('preserves reference and definition source when footnotes are omitted', () => {
    expect(parseMarkdown('Body[^note].\n\n[^note]: Definition.')).toEqual([
      {
        type: 'paragraph',
        children: [{type: 'text', content: 'Body[^note].'}],
      },
      {
        type: 'paragraph',
        children: [{type: 'text', content: '[^note]: Definition.'}],
      },
    ]);
  });

  it('preserves the released first-closing-bracket grammar by default', () => {
    expect(parseMarkdown('[a [b](c)')).toEqual([
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            href: 'c',
            children: [{type: 'text', content: 'a [b'}],
          },
        ],
      },
    ]);
    for (const source of ['[foo [bar]](/u)', '![a [b] c](/i.png)']) {
      expect(parseMarkdown(source)).toEqual([
        {type: 'paragraph', children: [{type: 'text', content: source}]},
      ]);
    }

    const reference = parseMarkdown('[x]: /destination\n\n[a [x] b][x]');
    expect(reference).toEqual([
      {
        type: 'paragraph',
        children: [
          {type: 'text', content: '[a '},
          {
            type: 'link',
            href: '/destination',
            children: [{type: 'text', content: 'x'}],
          },
          {type: 'text', content: ' b]'},
          {
            type: 'link',
            href: '/destination',
            children: [{type: 'text', content: 'x'}],
          },
        ],
      },
    ]);
  });

  it('parses resolved references and top-level definitions when enabled', () => {
    expect(
      parseMarkdownAst('Body[^note].\n\n[^note]: A **strong** note.', {
        footnotes: 'github',
      }),
    ).toMatchObject({
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'Body'},
            {
              type: 'footnoteReference',
              identifier: 'note',
              label: 'note',
            },
            {type: 'text', value: '.'},
          ],
        },
        {
          type: 'footnoteDefinition',
          identifier: 'note',
          label: 'note',
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', value: 'A '},
                {
                  type: 'strong',
                  children: [{type: 'text', value: 'strong'}],
                },
                {type: 'text', value: ' note.'},
              ],
            },
          ],
        },
      ],
    });
  });

  it('projects explicit footnote-enabled legacy result families', () => {
    expect(
      parseMarkdown('Body[^note].\n\n[^note]: Definition.', {
        footnotes: 'github',
      }),
    ).toEqual([
      {
        type: 'paragraph',
        children: [
          {type: 'text', content: 'Body'},
          {
            type: 'footnoteReference',
            identifier: 'note',
            label: 'note',
          },
          {type: 'text', content: '.'},
        ],
      },
      {
        type: 'footnoteDefinition',
        identifier: 'note',
        label: 'note',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', content: 'Definition.'}],
          },
        ],
      },
    ]);
  });

  it('normalizes labels and leaves duplicate definitions literal', () => {
    const result = parseMarkdown(
      'One[^CAFÉ   note].\n\n[^café note]: First.\n\n[^CAFÉ NOTE]: Second.',
      {footnotes: 'github'},
    );

    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [
          {type: 'text', content: 'One'},
          {
            type: 'footnoteReference',
            identifier: 'café note',
            label: 'CAFÉ   note',
          },
          {type: 'text', content: '.'},
        ],
      },
      {
        type: 'footnoteDefinition',
        identifier: 'café note',
        label: 'café note',
        children: [
          {
            type: 'paragraph',
            children: [{type: 'text', content: 'First.'}],
          },
        ],
      },
      {
        type: 'paragraph',
        children: [{type: 'text', content: '[^CAFÉ NOTE]: Second.'}],
      },
    ]);
  });

  it('resolves mid-paragraph colons and preserves escaped labels', () => {
    const result = parseMarkdown(
      'Body[^a\\]b]: detail.\n\n[^a\\]b]: Definition.',
      {footnotes: 'github'},
    );

    expect(result[0]).toMatchObject({
      type: 'paragraph',
      children: [
        {type: 'text', content: 'Body'},
        {
          type: 'footnoteReference',
          identifier: 'a]b',
          label: 'a\\]b',
        },
        {type: 'text', content: ': detail.'},
      ],
    });
    expect(result[1]).toMatchObject({
      type: 'footnoteDefinition',
      identifier: 'a]b',
      label: 'a\\]b',
    });
  });

  it('uses the first valid definition and keeps earlier empty declarations literal', () => {
    const result = parseMarkdown(
      'Body[^note].\n\n[^note]:   \n\n[^NOTE]: Valid definition.',
      {footnotes: 'github'},
    );

    expect(result[0]).toMatchObject({
      type: 'paragraph',
      children: [
        {type: 'text', content: 'Body'},
        {type: 'footnoteReference', identifier: 'note'},
        {type: 'text', content: '.'},
      ],
    });
    expect(result[1]).toMatchObject({
      type: 'paragraph',
      children: [{type: 'text', content: '[^note]:   '}],
    });
    expect(result[2]).toMatchObject({
      type: 'footnoteDefinition',
      label: 'NOTE',
      children: [
        {
          type: 'paragraph',
          children: [{type: 'text', content: 'Valid definition.'}],
        },
      ],
    });
  });

  it('keeps unresolved, escaped, protected, and nested declarations literal', () => {
    const result = parseMarkdown(
      [
        'Unresolved[^missing] and escaped \\[^note] and `[^note]`.',
        '',
        '[label](/target)',
        '',
        '> [^nested]: Not a definition.',
        '',
        '- [^listed]: Not a definition.',
        '',
        '[^note]: Definition with [^note] literal.',
      ].join('\n'),
      {footnotes: 'github'},
    );

    expect(result[0]).toEqual({
      type: 'paragraph',
      children: [
        {
          type: 'text',
          content: 'Unresolved[^missing] and escaped ',
        },
        {type: 'text', content: '[^note] and '},
        {type: 'code', content: '[^note]'},
        {type: 'text', content: '.'},
      ],
    });
    expect(result[1]).toMatchObject({
      type: 'paragraph',
      children: [
        {
          type: 'link',
          href: '/target',
          children: [{type: 'text', content: 'label'}],
        },
      ],
    });
    expect(result[2]).toMatchObject({
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [{type: 'text', content: '[^nested]: Not a definition.'}],
        },
      ],
    });
    expect(result[3]).toMatchObject({
      type: 'list',
      items: [
        {
          children: [
            {
              type: 'paragraph',
              children: [
                {type: 'text', content: '[^listed]: Not a definition.'},
              ],
            },
          ],
        },
      ],
    });
    expect(result[4]).toMatchObject({
      type: 'footnoteDefinition',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'text',
              content: 'Definition with [^note] literal.',
            },
          ],
        },
      ],
    });
  });

  it('does not resolve references from declarations nested in list items', () => {
    const source = [
      'Reference[^nested].',
      '',
      '- list item',
      '',
      '  [^nested]: Nested declaration.',
    ].join('\n');
    const result = parseMarkdown(source, {footnotes: 'github'});

    expect(JSON.stringify(result)).not.toContain('"type":"footnoteReference"');
    expect(JSON.stringify(result)).not.toContain('"type":"footnoteDefinition"');
    expect(JSON.stringify(result)).toContain('Reference[^nested].');
    expect(JSON.stringify(result)).toContain('[^nested]: Nested declaration.');
  });

  it('parses two-space and tab continuations with internal blank lines', () => {
    const result = parseMarkdown(
      [
        'Text[^multi].',
        '',
        '[^multi]: First paragraph.',
        '  continued.',
        '',
        '  Second **paragraph**.',
        '\t- nested item',
        '',
        'After.',
      ].join('\n'),
      {footnotes: 'github'},
    );

    expect(result[1]).toMatchObject({
      type: 'footnoteDefinition',
      identifier: 'multi',
      children: [
        {
          type: 'paragraph',
          children: [{type: 'text', content: 'First paragraph.\ncontinued.'}],
        },
        {
          type: 'paragraph',
          children: [
            {type: 'text', content: 'Second '},
            {type: 'bold'},
            {type: 'text', content: '.'},
          ],
        },
        {type: 'list', ordered: false},
      ],
    });
    expect(result[2]).toMatchObject({type: 'paragraph'});
  });

  it('does not let definitions interrupt paragraphs or escape opaque blocks', () => {
    const result = parseMarkdown(
      [
        'Paragraph',
        '[^late]: still paragraph',
        '',
        '```md',
        '[^code]: fenced',
        '```',
        '',
        '$$',
        '[^math]: display',
        '$$',
      ].join('\n'),
      {footnotes: 'github', math: true},
    );

    expect(result).toEqual([
      {
        type: 'paragraph',
        children: [
          {type: 'text', content: 'Paragraph\n[^late]: still paragraph'},
        ],
      },
      {
        type: 'codeblock',
        language: 'md',
        content: '[^code]: fenced',
      },
      {type: 'math', value: '[^math]: display'},
    ]);
  });

  it('preserves source ranges for definition blocks', () => {
    const source = 'Body[^a].\r\n\r\n[^a]: First.\r\n  Continued.';
    const result = parseMarkdown(source, {
      footnotes: 'github',
      sourceRanges: true,
    });

    expect(result[1]).toMatchObject({
      type: 'footnoteDefinition',
      range: {
        start: source.indexOf('[^a]:'),
        end: source.length,
      },
    });
  });
});
