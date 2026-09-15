// Copyright (c) Meta Platforms, Inc. and affiliates.

import {render, screen} from '@testing-library/react';
import {describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown} from './Markdown';
import {
  createIncrementalState,
  parseInline,
  parseMarkdown,
  parseMarkdownIncremental,
} from './parser';
import type {InlineNode} from './parser';
import {createMarkdownPlugin} from './plugins';
import type {
  MarkdownExtensionNode,
  MarkdownSyntaxPluginDefinition,
  MarkdownTokenizerInput,
} from './plugins';
import {parseOutlineFromMarkdown} from '../Outline/parseOutlineFromMarkdown';

type MentionNode = MarkdownExtensionNode<
  'mentions',
  'mention',
  {readonly label: string},
  'inline'
>;

type CalloutNode = MarkdownExtensionNode<
  'callouts',
  'callout',
  {readonly body: string},
  'block'
>;

const mentionDefinition = {
  name: 'mentions',
  apiVersion: 1,
  parseKey: 'mention-v1',
  syntax: {
    inline: [
      {
        startsWith: ['@{'],
        maxSpan: 80,
        tokenize({source, offset, end, isFinal}) {
          const close = source.indexOf('}', offset + 2);
          if (close < 0 || close >= end) {
            return isFinal ? {status: 'no-match'} : {status: 'defer'};
          }
          return {
            status: 'match',
            end: close + 1,
            node: {
              type: 'extension',
              plugin: 'mentions',
              name: 'mention',
              display: 'inline',
              data: {label: source.slice(offset + 2, close)},
            },
          };
        },
      },
    ],
    toText: node => node.data.label,
  },
  renderers: {
    mention: ({node}) => (
      <strong data-testid="mention">@{node.data.label}</strong>
    ),
  },
} satisfies MarkdownSyntaxPluginDefinition<'mentions', MentionNode>;

const mentionPlugin = createMarkdownPlugin<'mentions', MentionNode>(
  mentionDefinition,
);

const calloutDefinition = {
  name: 'callouts',
  apiVersion: 1,
  parseKey: 'callout-v1',
  syntax: {
    block: [
      {
        startsWith: [':::note'],
        maxSpan: 240,
        tokenize({source, offset, end, isFinal}) {
          const close = source.indexOf('\n:::', offset + 7);
          if (close < 0 || close + 4 > end) {
            return isFinal ? {status: 'no-match'} : {status: 'defer'};
          }
          return {
            status: 'match',
            end: close + 4,
            node: {
              type: 'extension',
              plugin: 'callouts',
              name: 'callout',
              display: 'block',
              data: {body: source.slice(offset + 7, close).trim()},
            },
          };
        },
      },
    ],
  },
  renderers: {
    callout: ({node}) => (
      <aside aria-label="Note" data-testid="callout">
        {node.data.body}
      </aside>
    ),
  },
} satisfies MarkdownSyntaxPluginDefinition<'callouts', CalloutNode>;

const calloutPlugin = createMarkdownPlugin<'callouts', CalloutNode>(
  calloutDefinition,
);

const textPlugin = createMarkdownPlugin({
  name: 'issues',
  apiVersion: 1,
  text: [
    {
      pattern: /BUG-\d+/g,
      render: match => <mark data-testid="issue">{match[0]}</mark>,
    },
  ],
});

const fencePlugin = createMarkdownPlugin({
  name: 'terminal',
  apiVersion: 1,
  fences: [
    {
      languages: ['terminal'],
      mode: 'passive',
      render: ({source, language, meta, mode}) => ({
        status: 'enhance',
        content: (
          <figure data-testid="terminal">
            <figcaption>{`${language} · ${mode} · ${meta}`}</figcaption>
            <pre>{source}</pre>
          </figure>
        ),
      }),
    },
  ],
});

describe('Markdown plugins', () => {
  it('keeps omitted and empty plugin lists on identical rendered output', () => {
    const source = '# Heading\n\nPlain **text**.';
    const withoutPlugins = render(<Markdown>{source}</Markdown>);
    const baseline = withoutPlugins.container.innerHTML;
    withoutPlugins.unmount();
    const withEmptyPlugins = render(<Markdown plugins={[]}>{source}</Markdown>);
    expect(withEmptyPlugins.container.innerHTML).toBe(baseline);
  });

  it('infers extension nodes while preserving the no-plugin unions', () => {
    const nodes = parseInline('Hello @{Ada}', {
      plugins: [mentionPlugin] as const,
    });
    expectTypeOf(nodes).toEqualTypeOf<InlineNode<MentionNode>[]>();
    expect(nodes).toEqual([
      {type: 'text', content: 'Hello '},
      {
        type: 'extension',
        plugin: 'mentions',
        name: 'mention',
        display: 'inline',
        data: {label: 'Ada'},
        source: '@{Ada}',
      },
    ]);
    expectTypeOf(parseInline('Hello')).toEqualTypeOf<InlineNode[]>();
  });

  it('keeps built-in code and link children protected while allowing emphasis', () => {
    const nodes = parseInline('**@{Ada}** [@{Grace}](/people) `@{Linus}`', {
      plugins: [mentionPlugin] as const,
    });
    expect(nodes[0]).toMatchObject({
      type: 'bold',
      children: [{type: 'extension', data: {label: 'Ada'}}],
    });
    expect(nodes[2]).toMatchObject({
      type: 'link',
      children: [{type: 'text', content: '@{Grace}'}],
    });
    expect(nodes[4]).toEqual({type: 'code', content: '@{Linus}'});
  });

  it('parses block extensions only at the top level', () => {
    const blocks = parseMarkdown(
      ':::note\nShip safely.\n:::\n\n> :::note\n\n- :::note',
      {plugins: [calloutPlugin] as const},
    );
    expect(blocks[0]).toMatchObject({
      type: 'extension',
      display: 'block',
      data: {body: 'Ship safely.'},
    });
    expect(blocks[1]).toMatchObject({type: 'blockquote'});
    expect(blocks[2]).toMatchObject({type: 'list'});
  });

  it('reserves incomplete syntax until an incremental parse is finalized', () => {
    const state = createIncrementalState();
    expect(
      parseMarkdownIncremental('Hello @{Ada', state, {
        plugins: [mentionPlugin] as const,
      }),
    ).toEqual([
      {type: 'paragraph', children: [{type: 'text', content: 'Hello '}]},
    ]);
    const terminal = parseMarkdownIncremental('Hello @{Ada', state, {
      plugins: [mentionPlugin] as const,
      isFinal: true,
    });
    expect(terminal).toEqual(
      parseMarkdown('Hello @{Ada', {plugins: [mentionPlugin] as const}),
    );
  });

  it('invalidates settled output for citation and syntax identity changes', () => {
    const citationState = createIncrementalState();
    parseMarkdownIncremental('See [one].\n\nNext', citationState, {
      sourceIds: new Set(['one']),
    });
    expect(
      parseMarkdownIncremental('See [one].\n\nNext', citationState, {
        sourceIds: new Set<string>(),
      })[0],
    ).toEqual({
      type: 'paragraph',
      children: [{type: 'text', content: 'See [one].'}],
    });

    const changedPlugin = createMarkdownPlugin<'mentions', MentionNode>({
      ...mentionDefinition,
      parseKey: 'mention-v2',
      syntax: {
        ...mentionDefinition.syntax,
        toText: (node: MentionNode) => `person-${node.data.label}`,
      },
    });
    const syntaxState = createIncrementalState();
    parseMarkdownIncremental('# @{Ada}\n\nNext', syntaxState, {
      plugins: [mentionPlugin] as const,
    });
    const reparsed = parseMarkdownIncremental('# @{Ada}\n\nNext', syntaxState, {
      plugins: [changedPlugin] as const,
      isFinal: true,
    });
    expect(reparsed[0].type).toBe('heading');
  });

  it('renders syntax, text, and semantic fences together', () => {
    render(
      <Markdown plugins={[mentionPlugin, textPlugin, fencePlugin]}>
        {'Hello @{Ada} — BUG-42\n\n```terminal demo\npnpm test\n```'}
      </Markdown>,
    );
    expect(screen.getByTestId('mention')).toHaveTextContent('@Ada');
    expect(screen.getByTestId('issue')).toHaveTextContent('BUG-42');
    expect(screen.getByTestId('terminal')).toHaveTextContent(
      'terminal · passive · demo',
    );
    expect(screen.getByTestId('terminal')).toHaveTextContent('pnpm test');
  });

  it('warns when an equivalent plugin list is recreated', () => {
    const plugin = createMarkdownPlugin({
      name: 'unstable-list-test',
      apiVersion: 1,
      text: [{pattern: /BUG-\d+/g, render: match => match[0]}],
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const view = render(<Markdown plugins={[plugin]}>BUG-42</Markdown>);

    view.rerender(<Markdown plugins={[plugin]}>BUG-42</Markdown>);

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('keep the list stable'),
    );
    warn.mockRestore();
  });

  it('preserves plugin order for overlapping text claims across flag groups', () => {
    const first = createMarkdownPlugin({
      name: 'first-text-claim',
      apiVersion: 1,
      text: [
        {
          pattern: /BUG-\d+/g,
          render: match => <mark data-testid="first-claim">{match[0]}</mark>,
        },
      ],
    });
    const second = createMarkdownPlugin({
      name: 'second-text-claim',
      apiVersion: 1,
      text: [
        {
          pattern: /bug-42/gi,
          render: match => <mark data-testid="second-claim">{match[0]}</mark>,
        },
      ],
    });

    render(<Markdown plugins={[first, second]}>BUG-42</Markdown>);

    expect(screen.getByTestId('first-claim')).toHaveTextContent('BUG-42');
    expect(screen.queryByTestId('second-claim')).toBeNull();
  });

  it('preserves regular-expression backreferences on the compatible path', () => {
    const repeatedWord = createMarkdownPlugin({
      name: 'repeated-word',
      apiVersion: 1,
      text: [
        {
          pattern: /\b(\w+)\s+\1\b/g,
          render: match => <mark data-testid="repeated-word">{match[0]}</mark>,
        },
      ],
    });

    render(<Markdown plugins={[repeatedWord]}>go go now</Markdown>);

    expect(screen.getByTestId('repeated-word')).toHaveTextContent('go go');
  });

  it('keeps canonical text contributions out of link children and preserves legacy traversal', () => {
    const legacy = {
      pattern: /BUG-\d+/g,
      render: (match: RegExpMatchArray) => <i>{match[0]}</i>,
    };
    const pluginList = [textPlugin];
    const {rerender} = render(
      <Markdown plugins={pluginList}>{'[BUG-1](/issue)'}</Markdown>,
    );
    expect(screen.queryByTestId('issue')).toBeNull();
    rerender(
      <Markdown plugins={pluginList} inlinePlugins={[legacy]}>
        {'[BUG-1](/issue)'}
      </Markdown>,
    );
    expect(screen.getByRole('link').querySelector('i')).not.toBeNull();
  });

  it('keeps the released custom code renderer ahead of fence plugins', () => {
    render(
      <Markdown
        plugins={[fencePlugin]}
        components={{
          code: ({code}) => <div data-testid="custom-code">{code}</div>,
        }}>
        {'```terminal\nhello\n```'}
      </Markdown>,
    );
    expect(screen.getByTestId('custom-code')).toHaveTextContent('hello');
    expect(screen.queryByTestId('terminal')).toBeNull();
  });

  it('falls back locally when canonical callbacks throw', () => {
    const failing = createMarkdownPlugin({
      name: 'failing',
      apiVersion: 1,
      text: [
        {
          pattern: /keep me/g,
          render: () => {
            throw new Error('boom');
          },
        },
      ],
      fences: [
        {
          languages: ['broken'],
          render: () => {
            throw new Error('boom');
          },
        },
      ],
    });
    const error = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Markdown plugins={[failing]}>
        {'keep me\n\n```broken\ncopy me\n```\n\nafter'}
      </Markdown>,
    );
    expect(screen.getByText('keep me')).toBeInTheDocument();
    expect(screen.getByText('copy me')).toBeInTheDocument();
    expect(screen.getByText('after')).toBeInTheDocument();
    error.mockRestore();
  });

  it('does not reparse syntax when live decoration state changes', () => {
    let tokenizations = 0;
    const countedMention = createMarkdownPlugin<'mentions', MentionNode>({
      ...mentionDefinition,
      parseKey: 'counted-v1',
      syntax: {
        ...mentionDefinition.syntax,
        inline: [
          {
            ...mentionDefinition.syntax.inline[0],
            tokenize(input: MarkdownTokenizerInput) {
              tokenizations++;
              return mentionDefinition.syntax.inline[0].tokenize(input);
            },
          },
        ] as const,
      },
    });
    const decoration = (id: string) =>
      createMarkdownPlugin({
        name: `decoration-${id}`,
        apiVersion: 1,
        decorations: [
          {
            id,
            range: {start: 0, end: 12},
            appearance: 'highlight' as const,
            tone: 'info' as const,
            label: `Decoration ${id}`,
          },
        ],
      });

    const view = render(
      <Markdown plugins={[countedMention]}>{'Hello @{Ada}'}</Markdown>,
    );
    const initialTokenizations = tokenizations;
    view.rerender(
      <Markdown plugins={[countedMention, decoration('b')]}>
        {'Hello @{Ada}'}
      </Markdown>,
    );

    expect(initialTokenizations).toBeGreaterThan(0);
    expect(tokenizations).toBe(initialTokenizations);
    expect(screen.getByLabelText('Decoration b')).toBeInTheDocument();

    view.rerender(
      <Markdown plugins={[countedMention]}>{'Hello @{Ada}'}</Markdown>,
    );
    expect(tokenizations).toBe(initialTokenizations);
    expect(screen.queryByLabelText('Decoration b')).toBeNull();
  });

  it('segments block-extension decorations without re-running syntax', () => {
    const source = [
      '```text',
      ':::note',
      'protected',
      ':::',
      '```',
      '',
      ':::note',
      'Decorated callout',
      ':::',
      '',
      'After',
    ].join('\n');
    const calloutStart = source.lastIndexOf(':::note');
    const decorated = createMarkdownPlugin({
      name: 'callout-decoration',
      apiVersion: 1,
      decorations: [
        {
          id: 'callout-range',
          range: {
            start: calloutStart,
            end: source.indexOf('\n\n', calloutStart),
          },
          appearance: 'highlight',
          tone: 'info',
          label: 'Decorated callout range',
        },
      ],
    });

    render(<Markdown plugins={[calloutPlugin, decorated]}>{source}</Markdown>);

    const wrapper = screen.getByLabelText('Decorated callout range');
    expect(wrapper).toHaveTextContent('Decorated callout');
    expect(wrapper).not.toHaveTextContent('protected');
    expect(wrapper).not.toHaveTextContent('After');
  });

  it('composes source-range decorations without changing the AST', () => {
    const decorated = createMarkdownPlugin({
      name: 'review-notes',
      apiVersion: 1,
      decorations: [
        {
          id: 'review-1',
          range: {start: 0, end: 5},
          appearance: 'highlight',
          tone: 'warning',
          label: 'Review this paragraph',
        },
      ],
    });
    const before = parseMarkdown('Hello world');
    const {container} = render(
      <Markdown plugins={[decorated]}>Hello world</Markdown>,
    );
    expect(
      container.querySelector('[data-markdown-decoration="review-1"]'),
    ).toHaveAttribute('aria-label', 'Review this paragraph');
    expect(parseMarkdown('Hello world')).toEqual(before);
  });

  it('uses the same extension projection and collision allocator in Markdown and Outline', () => {
    const source = '# @{Ada}\n\n# Ada\n\n# Ada-1';
    const options = {plugins: [mentionPlugin] as const};
    const outline = parseOutlineFromMarkdown(source, options);
    const {container} = render(
      <Markdown plugins={options.plugins}>{source}</Markdown>,
    );
    expect(outline.map(item => item.id)).toEqual(['ada', 'ada-1', 'ada-1-1']);
    expect(
      [...container.querySelectorAll('h1')].map(heading => heading.id),
    ).toEqual(outline.map(item => item.id));
  });
});
