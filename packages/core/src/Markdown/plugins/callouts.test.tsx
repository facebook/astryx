// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file callouts.test.tsx
 * @input Complete and streaming fenced callouts with rich Markdown children
 * @output Syntax, nesting, rendering, fallback, accessibility, and convergence evidence
 * @position Acceptance tests for the first-party Markdown callouts plugin
 */

import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown} from '../Markdown';
import {
  createIncrementalState,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownAstInternal,
  parseMarkdownIncremental,
} from '../parser';
import {createMarkdownPlugin, type MarkdownPluginEntry} from './protocol';
import {markdownCalloutsPlugin} from './callouts';

const RICH_SOURCE = [
  ':::warning Check this first',
  'Read **the guide** and [open the docs](/docs).',
  '',
  '- First item',
  '- Second item',
  '',
  '```text',
  ':::danger stays code',
  ':::',
  '```',
  ':::',
].join('\n');

describe('markdownCalloutsPlugin', () => {
  it('parses every variant, default titles, custom titles, and CRLF', () => {
    const source = [
      ':::note\r\nNote body\r\n:::',
      ':::tip Custom tip\r\nTip body\r\n:::',
      ':::warning\r\nWarning body\r\n:::',
      ':::danger Stop now\r\nDanger body\r\n:::',
    ].join('\r\n\r\n');
    const root = parseMarkdownAst(source, {plugins: [markdownCalloutsPlugin]});

    expect(root.children).toHaveLength(4);
    expect(root.children.map(node => node.type)).toEqual([
      'extension',
      'extension',
      'extension',
      'extension',
    ]);
    expect(root.children).toMatchObject([
      {data: {variant: 'note', title: 'Note'}},
      {data: {variant: 'tip', title: 'Custom tip'}},
      {data: {variant: 'warning', title: 'Warning'}},
      {data: {variant: 'danger', title: 'Stop now'}},
    ]);
  });

  it('parses rich children, nested callouts, and ignores fence-looking code', () => {
    const source = [
      ':::note Outer',
      'Before.',
      '',
      ':::tip Inner',
      '**Nested** content.',
      ':::',
      '',
      '```text',
      ':::danger not a callout',
      ':::',
      '```',
      ':::',
    ].join('\n');
    const root = parseMarkdownAst(source, {
      plugins: [markdownCalloutsPlugin],
      sourceRanges: true,
    });

    expect(root.children).toHaveLength(1);
    expect(root.children[0]).toMatchObject({
      type: 'extension',
      data: {variant: 'note', title: 'Outer'},
      position: {start: {offset: 0}, end: {offset: source.length}},
      children: [
        {type: 'paragraph'},
        {
          type: 'extension',
          data: {variant: 'tip', title: 'Inner'},
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'strong',
                  children: [{type: 'text', value: 'Nested'}],
                },
                {type: 'text', value: ' content.'},
              ],
            },
          ],
        },
        {type: 'code', value: ':::danger not a callout\n:::'},
      ],
    });
  });

  it('renders rich content without creating a live region', () => {
    render(
      <Markdown plugins={[markdownCalloutsPlugin]}>{RICH_SOURCE}</Markdown>,
    );
    const callout = screen.getByRole('complementary', {
      name: 'Warning: Check this first',
    });

    expect(callout).toHaveAttribute('data-markdown-callout', 'warning');
    expect(callout).toContainElement(
      screen.getByRole('link', {name: 'open the docs'}),
    );
    expect(callout.querySelectorAll('li')).toHaveLength(2);
    expect(callout.querySelector('code')).toHaveTextContent(
      ':::danger stays code:::',
    );
    expect(callout).not.toHaveAttribute('role', 'alert');
    expect(callout).not.toHaveAttribute('role', 'status');

    const html = renderToString(
      <Markdown plugins={[markdownCalloutsPlugin]}>{RICH_SOURCE}</Markdown>,
    );
    expect(html).toContain('aria-label="Warning: Check this first"');
    expect(html).toContain('data-markdown-callout="warning"');
    expectTypeOf(markdownCalloutsPlugin).toMatchTypeOf<MarkdownPluginEntry>();
  });

  it('keeps incomplete final source literal and converges when streaming closes', () => {
    const source = [':::note Streamed', 'Body', ':::'].join('\n');
    const incomplete = parseMarkdownAst(source.slice(0, -3), {
      plugins: [markdownCalloutsPlugin],
    });
    expect(incomplete.children[0]).toMatchObject({type: 'paragraph'});

    for (let end = 1; end < source.length; end++) {
      const snapshot = parseMarkdownAstInternal(
        source.slice(0, end),
        {plugins: [markdownCalloutsPlugin]},
        false,
      );
      expect(snapshot).toEqual(
        parseMarkdownAstInternal(
          source.slice(0, end),
          {plugins: [markdownCalloutsPlugin]},
          false,
        ),
      );
    }
    expect(
      parseMarkdownAstInternal(
        source,
        {plugins: [markdownCalloutsPlugin]},
        false,
      ),
    ).toEqual(parseMarkdownAst(source, {plugins: [markdownCalloutsPlugin]}));
  });

  it('keeps an open multi-paragraph callout in the incremental tail', () => {
    const partial = [
      ':::note Streamed',
      'First paragraph.',
      '',
      'Second paragraph.',
    ].join('\n');
    const complete = `${partial}\n:::`;
    const state = createIncrementalState();

    parseMarkdownIncremental(partial, state, {
      plugins: [markdownCalloutsPlugin],
    });
    expect(state.settledText).toBe('');

    expect(
      parseMarkdownIncremental(complete, state, {
        plugins: [markdownCalloutsPlugin],
      }),
    ).toEqual(parseMarkdown(complete, {plugins: [markdownCalloutsPlugin]}));
  });

  it('rejects a later plugin that rewrites callout children', () => {
    const source = [':::note', 'Keep this.', ':::'].join('\n');
    const baseline = parseMarkdownAst(source, {
      plugins: [markdownCalloutsPlugin],
    });
    const intruder = createMarkdownPlugin({
      name: 'callout-intruder',
      apiVersion: 1,
      transform(root) {
        const first = root.children[0];
        if (first?.type !== 'extension' || !Array.isArray(first.children)) {
          return root;
        }
        return {...root, children: [{...first, children: []}]};
      },
    });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(
      parseMarkdownAst(source, {
        plugins: [markdownCalloutsPlugin, intruder],
      }),
    ).toEqual(baseline);
    expect(warning).toHaveBeenCalled();
    warning.mockRestore();
  });

  it('does not claim invalid variants or callout-looking text inside built-ins', () => {
    const source = [
      ':::custom',
      'Body',
      ':::',
      '',
      '> :::note quote',
      '> Body',
      '> :::',
      '',
      '    :::note indented code',
    ].join('\n');

    expect(
      parseMarkdownAst(source, {plugins: [markdownCalloutsPlugin]}),
    ).toEqual(parseMarkdownAst(source));
  });
});
