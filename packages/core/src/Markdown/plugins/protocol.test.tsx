// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file protocol.test.tsx
 * @input Syntax, immutable transform, renderer, parser, and Outline plugin APIs
 * @output Regression coverage for ordering, typing, fallback, identity, and rendering
 * @position Focused acceptance tests for the core Markdown plugin protocol
 */

import {PassThrough} from 'node:stream';
import {renderToPipeableStream, renderToString} from 'react-dom/server';
import {act, render, screen} from '@testing-library/react';
import {describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown} from '../Markdown';
import {
  createIncrementalState,
  parseInline,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
} from '../parser';
import type {InlineNode} from '../parser';
import {createMarkdownPlugin, isMarkdownExtensionNode} from './protocol';
import {visitMarkdownNodes} from '../ast';
import type {
  MarkdownBlockContainerExtensionNode,
  MarkdownExtensionNode,
  MarkdownInlineContainerExtensionNode,
  MarkdownSyntaxPluginDefinition,
  MarkdownTokenizerInput,
  MarkdownTransformPluginDefinition,
} from './protocol';
import {parseOutlineFromMarkdown} from '../../Outline/parseOutlineFromMarkdown';

type MentionNode = MarkdownExtensionNode<
  'mentions',
  'mention',
  {readonly label: string},
  'inline'
>;

type HighlightNode = MarkdownInlineContainerExtensionNode<
  'highlights',
  'highlight',
  Record<string, never>
>;

type BrokenMentionNode = MarkdownExtensionNode<
  'broken-mentions',
  'mention',
  {readonly label: string},
  'inline'
>;

function ThrowingRendererChild(): never {
  throw new Error('broken renderer child');
}

type InvalidSyntaxNode = MarkdownExtensionNode<
  'invalid-syntax',
  'mention',
  {readonly label: string},
  'inline'
>;

type BadgeNode = MarkdownExtensionNode<
  'badges',
  'badge',
  {readonly label: string},
  'inline'
>;

type CalloutNode = MarkdownBlockContainerExtensionNode<
  'callouts',
  'callout',
  {readonly label: string}
>;

const mentionDefinition = {
  name: 'mentions',
  apiVersion: 1,
  parseKey: 'v1',
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
  },
  renderers: {
    mention: {
      render: ({node}) => <span data-testid="mention">@{node.data.label}</span>,
      toText: node => `@${node.data.label}`,
    },
  },
} satisfies MarkdownSyntaxPluginDefinition<'mentions', MentionNode>;

const mentionPlugin = createMarkdownPlugin<'mentions', MentionNode>(
  mentionDefinition,
);

const highlightDefinition = {
  name: 'highlights',
  apiVersion: 1,
  parseKey: 'v1',
  syntax: {
    inline: [
      {
        startsWith: ['=='],
        maxSpan: 120,
        tokenize({source, offset, end, isFinal}) {
          const close = source.indexOf('==', offset + 2);
          if (close < 0 || close + 2 > end) {
            return isFinal ? {status: 'no-match'} : {status: 'defer'};
          }
          return {
            status: 'match',
            end: close + 2,
            node: {
              type: 'extension',
              plugin: 'highlights',
              name: 'highlight',
              display: 'inline',
              data: {},
            },
            children: {start: offset + 2, end: close},
          };
        },
      },
    ],
  },
  renderers: {
    highlight: {
      content: 'phrasing',
      render: ({children}) => <mark data-testid="highlight">{children}</mark>,
    },
  },
} satisfies MarkdownSyntaxPluginDefinition<'highlights', HighlightNode>;

const highlightPlugin = createMarkdownPlugin<'highlights', HighlightNode>(
  highlightDefinition,
);

const calloutDefinition = {
  name: 'callouts',
  apiVersion: 1,
  parseKey: 'v1',
  syntax: {
    block: [
      {
        startsWith: [':::note'],
        maxSpan: 500,
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
              data: {label: 'Note'},
            },
            children: {start: offset + 8, end: close},
          };
        },
      },
    ],
  },
  renderers: {
    callout: {
      content: 'flow',
      render: ({node, children}) => (
        <aside aria-label={node.data.label} data-testid="callout">
          {children}
        </aside>
      ),
    },
  },
} satisfies MarkdownSyntaxPluginDefinition<'callouts', CalloutNode>;

const calloutPlugin = createMarkdownPlugin<'callouts', CalloutNode>(
  calloutDefinition,
);

const badgeDefinition = {
  name: 'badges',
  apiVersion: 1,
  transform(root) {
    return {
      ...root,
      children: root.children.map(block =>
        block.type === 'paragraph'
          ? {
              ...block,
              children: [
                ...block.children,
                {
                  type: 'extension' as const,
                  plugin: 'badges' as const,
                  name: 'badge' as const,
                  display: 'inline' as const,
                  data: {label: 'New'},
                },
              ],
            }
          : block,
      ),
    };
  },
  renderers: {
    badge: {
      render: ({node}) => <mark data-testid="badge">{node.data.label}</mark>,
      toText: node => node.data.label,
    },
  },
} satisfies MarkdownTransformPluginDefinition<'badges', BadgeNode>;

const badgePlugin = createMarkdownPlugin<'badges', BadgeNode>(badgeDefinition);

function replaceText(value: string, replacement: string) {
  return createMarkdownPlugin({
    name: `replace-${value}-${replacement}`,
    apiVersion: 1,
    transform(root) {
      return {
        ...root,
        children: root.children.map(block =>
          block.type === 'paragraph' || block.type === 'heading'
            ? {
                ...block,
                children: block.children.map(node =>
                  node.type === 'text'
                    ? {
                        ...node,
                        value: node.value.replaceAll(value, replacement),
                      }
                    : node,
                ),
              }
            : block,
        ),
      };
    },
  });
}

describe('Markdown plugin protocol', () => {
  it('keeps omitted and explicit empty pipelines identical', () => {
    const source = '# Heading\n\nPlain **text**.';
    const omitted = render(<Markdown>{source}</Markdown>);
    const baseline = omitted.container.innerHTML;
    omitted.unmount();

    const empty = render(<Markdown plugins={[]}>{source}</Markdown>);
    expect(empty.container.innerHTML).toBe(baseline);
  });

  it('infers typed inline extensions and keeps protected contexts opaque', () => {
    const nodes = parseInline('**@{Ada}** [@{Grace}](/people) `@{Linus}`', {
      plugins: [mentionPlugin] as const,
    });
    expectTypeOf(nodes).toEqualTypeOf<InlineNode<MentionNode>[]>();
    expect(nodes[0]).toMatchObject({
      type: 'bold',
      children: [{type: 'extension', data: {label: 'Ada'}}],
    });
    expect(nodes[2]).toMatchObject({
      type: 'link',
      children: [{type: 'text', content: '@{Grace}'}],
    });
    expect(nodes[4]).toEqual({type: 'code', content: '@{Linus}'});

    const forgedProvenance = createMarkdownPlugin<'mentions', MentionNode>({
      ...mentionDefinition,
      syntax: {
        inline: [
          {
            ...mentionDefinition.syntax.inline[0],
            tokenize(input) {
              const result = mentionDefinition.syntax.inline[0].tokenize(input);
              return result.status === 'match'
                ? ({
                    ...result,
                    node: {
                      ...result.node,
                      source: 'forged',
                      position: {start: {offset: 99}, end: {offset: 100}},
                    },
                  } as never)
                : result;
            },
          },
        ],
      },
    });
    const [forgedNode] = parseInline('@{Ada}', {
      plugins: [forgedProvenance],
    });
    expect(forgedNode).toMatchObject({
      type: 'extension',
      source: '@{Ada}',
    });
    expect(forgedNode).not.toHaveProperty('position');
  });

  it('parses and renders rich Markdown inside nested extension containers', () => {
    const source = [
      'Hello @{Ada}.',
      '',
      ':::note',
      'Read ==**this**== and [the docs](/docs) with @{Grace}.',
      '',
      '- First item',
      '- Second item',
      ':::',
    ].join('\n');
    const plugins = [mentionPlugin, highlightPlugin, calloutPlugin] as const;
    const blocks = parseMarkdown(source, {plugins});

    expect(blocks[1]).toMatchObject({
      type: 'extension',
      plugin: 'callouts',
      name: 'callout',
      children: [
        {
          type: 'paragraph',
          children: [
            {type: 'text', value: 'Read '},
            {
              type: 'extension',
              plugin: 'highlights',
              name: 'highlight',
              children: [{type: 'strong'}],
            },
            {type: 'text', value: ' and '},
            {type: 'link', url: '/docs'},
            {type: 'text', value: ' with '},
            {type: 'extension', plugin: 'mentions', name: 'mention'},
            {type: 'text', value: '.'},
          ],
        },
        {type: 'list'},
      ],
    });

    const {container} = render(<Markdown plugins={plugins}>{source}</Markdown>);
    const callout = screen.getByRole('complementary', {name: 'Note'});
    expect(callout).toContainElement(screen.getByTestId('highlight'));
    expect(screen.getByText('this').tagName).toBe('STRONG');
    expect(screen.getByRole('link', {name: 'the docs'})).toHaveAttribute(
      'href',
      '/docs',
    );
    expect(callout.querySelectorAll('li')).toHaveLength(2);
    expect(screen.getAllByTestId('mention')).toHaveLength(2);
    expect(container.textContent).toContain(
      'Read this and the docs with @Grace.First itemSecond item',
    );

    const visited: string[] = [];
    visitMarkdownNodes(
      parseMarkdownAst(source, {plugins}),
      'extension',
      node => {
        visited.push(node.name);
      },
    );
    expect(visited).toEqual(['mention', 'callout', 'highlight', 'mention']);

    const serverMarkup = renderToString(
      <Markdown plugins={plugins}>{source}</Markdown>,
    );
    expect(serverMarkup).toContain('<aside');
    expect(serverMarkup).toContain('<strong');
    expect(serverMarkup).toContain('href="/docs"');
  });

  it('keeps the released heading scope while projecting inline container text', () => {
    const inlineSource = '# Before ==**after**==';
    const inlinePlugins = [highlightPlugin] as const;
    expect(
      parseOutlineFromMarkdown(inlineSource, {plugins: inlinePlugins}),
    ).toEqual([{id: 'before-after', label: 'Before after', level: 1}]);
    const inline = render(
      <Markdown plugins={inlinePlugins}>{inlineSource}</Markdown>,
    );
    expect(screen.getByRole('heading', {name: 'Before after'})).toHaveAttribute(
      'id',
      'before-after',
    );
    inline.unmount();

    const blockSource = '# Top\n\n:::note\n# Nested\n:::\n\n# Tail';
    const blockPlugins = [calloutPlugin] as const;
    expect(
      parseOutlineFromMarkdown(blockSource, {plugins: blockPlugins}),
    ).toEqual([
      {id: 'top', label: 'Top', level: 1},
      {id: 'tail', label: 'Tail', level: 1},
    ]);
    render(<Markdown plugins={blockPlugins}>{blockSource}</Markdown>);
    expect(screen.getByRole('heading', {name: 'Nested'})).not.toHaveAttribute(
      'id',
    );
  });

  it('withholds incomplete containers and converges to the full parse', () => {
    const source = ':::note\n**Streamed** content\n:::';
    const plugins = [calloutPlugin] as const;
    const state = createIncrementalState();

    expect(
      parseMarkdownIncremental(source.slice(0, -3), state, {plugins}),
    ).toEqual([]);
    expect(
      parseMarkdownIncremental(source, state, {plugins, isFinal: true}),
    ).toEqual(parseMarkdown(source, {plugins}));
  });

  it('enforces container placement and declared child shapes', () => {
    type InvalidInlineNode = MarkdownInlineContainerExtensionNode<
      'invalid-inline-container',
      'inline-box',
      Record<string, never>
    >;
    const invalidPlacement = createMarkdownPlugin<
      'invalid-inline-container',
      InvalidInlineNode
    >({
      name: 'invalid-inline-container',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: [
            {
              type: 'extension',
              plugin: 'invalid-inline-container',
              name: 'inline-box',
              display: 'inline',
              data: {},
              children: [{type: 'text', value: 'Wrong level'}],
            },
          ] as never,
        };
      },
      renderers: {
        'inline-box': {
          content: 'phrasing',
          render: ({children}) => <span>{children}</span>,
        },
      },
    });

    type InvalidFlowNode = MarkdownBlockContainerExtensionNode<
      'invalid-flow-container',
      'flow-box',
      Record<string, never>
    >;
    const invalidChildren = createMarkdownPlugin<
      'invalid-flow-container',
      InvalidFlowNode
    >({
      name: 'invalid-flow-container',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: [
            {
              type: 'extension',
              plugin: 'invalid-flow-container',
              name: 'flow-box',
              display: 'block',
              data: {},
              children: [{type: 'text', value: 'Not flow content'}],
            },
          ] as never,
        };
      },
      renderers: {
        'flow-box': {
          content: 'flow',
          render: ({children}) => <section>{children}</section>,
        },
      },
    });

    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const baseline = [
      {type: 'paragraph', children: [{type: 'text', content: 'Safe'}]},
    ];
    expect(parseMarkdown('Safe', {plugins: [invalidPlacement]})).toEqual(
      baseline,
    );
    expect(parseMarkdown('Safe', {plugins: [invalidChildren]})).toEqual(
      baseline,
    );
    warning.mockRestore();
  });

  it('validates narrowing allowlists and cardinality', () => {
    type ParagraphBoxNode = MarkdownBlockContainerExtensionNode<
      'paragraph-boxes',
      'box',
      Record<string, never>
    >;
    const paragraphBox = createMarkdownPlugin<
      'paragraph-boxes',
      ParagraphBoxNode
    >({
      name: 'paragraph-boxes',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: [
            {
              type: 'extension',
              plugin: 'paragraph-boxes',
              name: 'box',
              display: 'block',
              data: {},
              children: root.children,
            },
          ],
        };
      },
      renderers: {
        box: {
          content: {allow: ['paragraph'], min: 1, max: 1},
          render: ({children}) => (
            <section data-testid="paragraph-box">{children}</section>
          ),
        },
      },
    });

    expect(parseMarkdown('One', {plugins: [paragraphBox]})).toMatchObject([
      {
        type: 'extension',
        children: [{type: 'paragraph'}],
      },
    ]);
    expect(
      parseMarkdown('One\n\n- Two', {plugins: [paragraphBox]}),
    ).toMatchObject([{type: 'paragraph'}, {type: 'list'}]);

    expect(() =>
      createMarkdownPlugin({
        name: 'invalid-content-declaration',
        apiVersion: 1,
        transform: (root: never) => root,
        renderers: {
          paragraph: {
            render: () => null,
            toText: () => '',
          },
        },
      } as never),
    ).toThrow(/must not collide with a built-in node/);
    expect(() =>
      createMarkdownPlugin({
        name: 'invalid-content-declaration',
        apiVersion: 1,
        transform: (root: never) => root,
        renderers: {
          box: {
            content: {allow: ['text', 'paragraph']},
            render: () => null,
          },
        },
      } as never),
    ).toThrow(/mixes phrasing and flow nodes/);
    expect(() =>
      createMarkdownPlugin({
        name: 'invalid-content-declaration',
        apiVersion: 1,
        transform: (root: never) => root,
        renderers: {
          box: {
            content: {allow: ['foreign-node']},
            render: () => null,
          },
        },
      } as never),
    ).toThrow(/built-in or owned extension names/);
  });

  it('falls back to standard rendered children when a container renderer fails', () => {
    type BrokenContainerNode = MarkdownBlockContainerExtensionNode<
      'broken-container',
      'box',
      Record<string, never>
    >;
    const brokenContainer = createMarkdownPlugin<
      'broken-container',
      BrokenContainerNode
    >({
      name: 'broken-container',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: [
            {
              type: 'extension',
              plugin: 'broken-container',
              name: 'box',
              display: 'block',
              data: {},
              children: root.children,
            },
          ],
        };
      },
      renderers: {
        box: {
          content: 'flow',
          render() {
            throw new Error('broken container');
          },
        },
      },
    });
    const source = '**Readable** [link](/safe)\n\n- Item';
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const {container} = render(
      <Markdown plugins={[brokenContainer]}>{source}</Markdown>,
    );
    expect(screen.getByText('Readable').tagName).toBe('STRONG');
    expect(screen.getByRole('link', {name: 'link'})).toHaveAttribute(
      'href',
      '/safe',
    );
    expect(container.querySelector('li')).toHaveTextContent('Item');
    expect(container.textContent).not.toContain(':::');

    const serverMarkup = renderToString(
      <Markdown plugins={[brokenContainer]}>{source}</Markdown>,
    );
    expect(serverMarkup).toContain('<strong');
    expect(serverMarkup).toContain('href="/safe"');
    warning.mockRestore();
  });

  it('isolates a suspending renderer behind its node source', async () => {
    let resolved = false;
    let resolve: (() => void) | undefined;
    const pending = new Promise<void>(done => {
      resolve = () => {
        resolved = true;
        done();
      };
    });

    function AsyncMention({label}: {readonly label: string}) {
      if (!resolved) {
        // React Suspense requires throwing the pending thenable.
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw pending;
      }
      return <span data-testid="async-mention">@{label} loaded</span>;
    }

    const asyncMentionPlugin = createMarkdownPlugin<'mentions', MentionNode>({
      ...mentionDefinition,
      renderers: {
        mention: {
          render: ({node}) => <AsyncMention label={node.data.label} />,
          toText: node => `@${node.data.label}`,
        },
      },
    });

    render(
      <Markdown plugins={[asyncMentionPlugin]}>
        {'Before @{Ada} after.'}
      </Markdown>,
    );

    expect(screen.getByText('Before', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('@{Ada}', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('after.', {exact: false})).toBeInTheDocument();
    expect(screen.queryByTestId('async-mention')).not.toBeInTheDocument();

    await act(async () => resolve?.());

    expect(await screen.findByTestId('async-mention')).toHaveTextContent(
      '@Ada loaded',
    );
    expect(screen.getByText('Before', {exact: false})).toBeInTheDocument();
    expect(screen.getByText('after.', {exact: false})).toBeInTheDocument();
  });

  it('streams readable node fallback and siblings before a renderer resolves', async () => {
    let resolved = false;
    let resolve: (() => void) | undefined;
    const pending = new Promise<void>(done => {
      resolve = () => {
        resolved = true;
        done();
      };
    });

    function StreamingMention({label}: {readonly label: string}) {
      if (!resolved) {
        // React Suspense uses a thrown thenable as control flow.
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw pending;
      }
      return <span>@{label} streamed</span>;
    }

    const plugin = createMarkdownPlugin<'mentions', MentionNode>({
      ...mentionDefinition,
      renderers: {
        mention: {
          render: ({node}) => <StreamingMention label={node.data.label} />,
          toText: node => `@${node.data.label}`,
        },
      },
    });
    const destination = new PassThrough();
    destination.setEncoding('utf8');
    const chunks: string[] = [];
    destination.on('data', chunk => chunks.push(String(chunk)));
    const finished = new Promise<void>((done, reject) => {
      destination.on('end', done);
      destination.on('error', reject);
    });
    let rejectShell: (error: unknown) => void = () => {};
    const shellReady = new Promise<void>((done, reject) => {
      rejectShell = reject;
      const {pipe} = renderToPipeableStream(
        <Markdown plugins={[plugin]}>{'Before @{Ada} after.'}</Markdown>,
        {
          onShellReady() {
            pipe(destination);
            done();
          },
          onShellError(error) {
            reject(error);
          },
        },
      );
    });
    destination.on('error', error => rejectShell(error));

    await shellReady;
    await new Promise<void>(done => setImmediate(done));
    const shell = chunks.join('');
    expect(shell).toContain('Before ');
    expect(shell).toContain('@{Ada}');
    expect(shell).toContain(' after.');
    expect(shell).not.toContain('@Ada streamed');

    resolve?.();
    await finished;
    expect(chunks.join('').replaceAll('<!-- -->', '')).toContain(
      '@Ada streamed',
    );
  });

  it('rejects duplicate entries and contains invalid tokenizer output', () => {
    expect(() =>
      parseMarkdown('plain', {plugins: [mentionPlugin, mentionPlugin]}),
    ).toThrow(/duplicate name/);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const duplicate = render(
      <Markdown plugins={[mentionPlugin, mentionPlugin]}>plain</Markdown>,
    );
    expect(duplicate.getByText('plain')).toBeInTheDocument();
    duplicate.unmount();

    const invalid = createMarkdownPlugin<'invalid-syntax', InvalidSyntaxNode>({
      ...mentionDefinition,
      name: 'invalid-syntax',
      syntax: {
        inline: [
          {
            startsWith: ['@{'],
            maxSpan: 80,
            tokenize: (async () => ({status: 'no-match'})) as never,
          },
        ],
      },
      renderers: mentionDefinition.renderers,
    } as never);
    expect(parseMarkdown('Hello @{Ada}', {plugins: [invalid]})).toEqual([
      {
        type: 'paragraph',
        children: [{type: 'text', content: 'Hello @{Ada}'}],
      },
    ]);

    const malformedNode = createMarkdownPlugin({
      ...mentionDefinition,
      name: 'malformed-node',
      syntax: {
        inline: [
          {
            startsWith: ['@{'],
            maxSpan: 80,
            tokenize: ({offset}: {readonly offset: number}) =>
              ({
                status: 'match',
                end: offset + 6,
                node: {
                  type: 'extension',
                  plugin: Symbol('malformed-plugin'),
                  name: Symbol('malformed-name'),
                  display: 'inline',
                  data: {},
                },
              }) as never,
          },
        ],
      },
      renderers: mentionDefinition.renderers,
    } as never);
    expect(() =>
      parseMarkdown('Hello @{Ada}', {plugins: [malformedNode]}),
    ).not.toThrow();
    expect(parseMarkdown('Hello @{Ada}', {plugins: [malformedNode]})).toEqual([
      {
        type: 'paragraph',
        children: [{type: 'text', content: 'Hello @{Ada}'}],
      },
    ]);
    warning.mockRestore();
  });

  it('renders synthetic extension nodes introduced by transforms', () => {
    const blocks = parseMarkdown('Status: ', {plugins: [badgePlugin]});
    expect(blocks).toMatchObject([
      {
        type: 'paragraph',
        children: [
          {type: 'text', content: 'Status: '},
          {
            type: 'extension',
            plugin: 'badges',
            name: 'badge',
            data: {label: 'New'},
          },
        ],
      },
    ]);
    render(<Markdown plugins={[badgePlugin]}>Status: </Markdown>);
    expect(screen.getByTestId('badge')).toHaveTextContent('New');
  });

  it('does not enable block syntax inside blockquotes or list items', () => {
    const source = '> :::note\n> quoted\n> :::\n\n- :::note\n  listed\n  :::';
    const blocks = parseMarkdown(source, {plugins: [calloutPlugin]});
    expect(JSON.stringify(blocks)).not.toContain('"type":"extension"');
  });

  it('keeps link-definition precedence over matching block plugins', () => {
    const definitionPrefixPlugin = createMarkdownPlugin({
      name: 'definition-prefix',
      apiVersion: 1,
      parseKey: 'v1',
      syntax: {
        block: [
          {
            startsWith: ['[d]:'],
            maxSpan: 200,
            tokenize({source, offset}) {
              const close = source.indexOf('\n:::', offset);
              return close < 0
                ? {status: 'no-match' as const}
                : {
                    status: 'match' as const,
                    end: close + 4,
                    node: {
                      type: 'extension' as const,
                      plugin: 'definition-prefix' as const,
                      name: 'box' as const,
                      display: 'block' as const,
                      data: {},
                    },
                    children: {start: offset + 11, end: close},
                  };
            },
          },
        ],
      },
      renderers: {
        box: {
          content: 'flow',
          render: ({children}) => <div>{children}</div>,
        },
      },
    });

    const parsed = parseMarkdown('[d]: /docs\nInside\n:::\n\nUse [d].', {
      plugins: [definitionPrefixPlugin],
    });
    expect(JSON.stringify(parsed)).toContain('"href":"/docs"');
    expect(JSON.stringify(parsed)).not.toContain('"type":"extension"');
  });

  it('passes authored container source to discovery tokenizers', () => {
    const sourceAwarePlugin = createMarkdownPlugin({
      name: 'source-aware-boxes',
      apiVersion: 1,
      parseKey: 'v1',
      syntax: {
        block: [
          {
            startsWith: [':::box'],
            maxSpan: 500,
            tokenize({source, offset}) {
              const close = source.indexOf('\n:::', offset);
              if (
                close < 0 ||
                !source.slice(offset, close).includes('[local]: /inside')
              ) {
                return {status: 'no-match' as const};
              }
              return {
                status: 'match' as const,
                end: close + 4,
                node: {
                  type: 'extension' as const,
                  plugin: 'source-aware-boxes' as const,
                  name: 'box' as const,
                  display: 'block' as const,
                  data: {},
                },
                children: {start: offset + 7, end: close},
              };
            },
          },
        ],
      },
      renderers: {
        box: {
          content: 'flow',
          render: ({children}) => <div>{children}</div>,
        },
      },
    });
    const parsed = parseMarkdown(
      ':::box\n[local]: /inside\nUse [local].\n:::\n\nOutside [local].',
      {plugins: [sourceAwarePlugin]},
    );

    expect(parsed[0]).toMatchObject({type: 'extension'});
    expect(parsed.at(-1)).toMatchObject({
      type: 'paragraph',
      children: [{type: 'text', content: 'Outside [local].'}],
    });
  });

  it('keeps nested container discovery linear', () => {
    const tokenize = vi.fn(
      ({source, offset, isFinal}: MarkdownTokenizerInput) => {
        const firstNewline = source.indexOf('\n', offset);
        if (firstNewline < 0) {
          return isFinal
            ? {status: 'no-match' as const}
            : {status: 'defer' as const};
        }
        let depth = 1;
        let cursor = firstNewline + 1;
        while (cursor <= source.length) {
          const newline = source.indexOf('\n', cursor);
          const lineEnd = newline < 0 ? source.length : newline;
          const line = source.slice(cursor, lineEnd);
          if (line === ':::box') {
            depth++;
          } else if (line === ':::') {
            depth--;
            if (depth === 0) {
              return {
                status: 'match' as const,
                end: lineEnd,
                node: {
                  type: 'extension' as const,
                  plugin: 'linear-boxes' as const,
                  name: 'box' as const,
                  display: 'block' as const,
                  data: {},
                },
                children: {start: firstNewline + 1, end: cursor},
              };
            }
          }
          if (newline < 0) {
            break;
          }
          cursor = newline + 1;
        }
        return isFinal
          ? {status: 'no-match' as const}
          : {status: 'defer' as const};
      },
    );
    const plugin = createMarkdownPlugin({
      name: 'linear-boxes',
      apiVersion: 1,
      parseKey: 'v1',
      syntax: {
        block: [{startsWith: [':::box'], maxSpan: 10_000, tokenize}],
      },
      renderers: {
        box: {
          content: 'flow',
          render: ({children}) => <div>{children}</div>,
        },
      },
    });
    const depth = 20;
    const source = [
      ...Array.from({length: depth}, () => ':::box'),
      '[d]: /docs',
      'Use [d].',
      ...Array.from({length: depth}, () => ':::'),
    ].join('\n');

    expect(parseMarkdown(source, {plugins: [plugin]})).toHaveLength(1);
    expect(tokenize.mock.calls.length).toBeLessThanOrEqual(depth * 2 + 2);
  });

  it('runs immutable transforms in plugin order', () => {
    const first = replaceText('original', 'first');
    const second = replaceText('first', 'second');
    expect(parseMarkdown('original', {plugins: [first, second]})).toMatchObject(
      [{type: 'paragraph', children: [{type: 'text', content: 'second'}]}],
    );
    expect(parseMarkdown('original', {plugins: [second, first]})).toMatchObject(
      [{type: 'paragraph', children: [{type: 'text', content: 'first'}]}],
    );
  });

  it('accepts plugins created by a duplicate Core copy', async () => {
    vi.resetModules();
    const duplicateCore = await import('./protocol');
    const duplicatePlugin = duplicateCore.createMarkdownPlugin({
      name: 'duplicate-core-copy',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'paragraph'
              ? {
                  ...block,
                  children: block.children.map(node =>
                    node.type === 'text'
                      ? {...node, value: node.value.replace('before', 'after')}
                      : node,
                  ),
                }
              : block,
          ),
        };
      },
    });

    expect(parseMarkdown('before', {plugins: [duplicatePlugin]})).toMatchObject(
      [{type: 'paragraph', children: [{type: 'text', content: 'after'}]}],
    );

    const brand = Symbol.for('@astryxdesign/core/MarkdownPluginEntry');
    const incompatible = Object.freeze({
      name: 'incompatible-copy',
      apiVersion: 1 as const,
      [brand]: Object.freeze({
        kind: '@astryxdesign/core/MarkdownPluginEntry',
        apiVersion: 2,
        definition: Object.freeze({
          name: 'incompatible-copy',
          apiVersion: 1,
          transform: () => ({type: 'root', children: []}),
        }),
      }),
    });
    expect(() =>
      parseMarkdown('safe', {plugins: [incompatible as never]}),
    ).toThrow(/compatible createMarkdownPlugin/);
  });

  it('defuses rejected transform promises in runtime and server rendering', async () => {
    const source = 'Private source must not escape';
    const rejection = 'Private plugin rejection must not escape';
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const unhandled = vi.fn();
    process.on('unhandledRejection', unhandled);
    const rejected = createMarkdownPlugin({
      name: 'rejected-promise',
      apiVersion: 1,
      transform: (async () => Promise.reject(new Error(rejection))) as never,
    });

    try {
      expect(parseMarkdown(source, {plugins: [rejected]})).toMatchObject([
        {type: 'paragraph', children: [{type: 'text', content: source}]},
      ]);
      expect(
        renderToString(<Markdown plugins={[rejected]}>{source}</Markdown>),
      ).toContain(source);
      await new Promise(resolve => setTimeout(resolve, 0));
      expect(unhandled).not.toHaveBeenCalled();
      expect(JSON.stringify(warning.mock.calls)).not.toContain(rejection);
      expect(JSON.stringify(warning.mock.calls)).not.toContain(source);
    } finally {
      process.off('unhandledRejection', unhandled);
      warning.mockRestore();
    }
  });

  it('emits one source-free production diagnostic for plugin failure', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const source = 'Private production source';
    const thrownText = 'Private plugin-thrown text';
    const broken = createMarkdownPlugin({
      name: 'production-failure',
      apiVersion: 1,
      transform() {
        throw new Error(thrownText);
      },
    });

    try {
      parseMarkdown(source, {plugins: [broken]});
      parseMarkdown(source, {plugins: [broken]});
      expect(error).toHaveBeenCalledTimes(1);
      expect(error).toHaveBeenCalledWith(
        'Markdown: plugin "production-failure" failed in transform; rendered readable fallback.',
      );
      expect(JSON.stringify(error.mock.calls)).not.toContain(source);
      expect(JSON.stringify(error.mock.calls)).not.toContain(thrownText);
    } finally {
      error.mockRestore();
      vi.unstubAllEnvs();
    }
  });

  it('keeps the last valid tree after mutation, async, or semantic failure', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mutating = createMarkdownPlugin({
      name: 'mutating',
      apiVersion: 1,
      transform(root) {
        (root.children as unknown as unknown[]).push({type: 'thematicBreak'});
        return root;
      },
    });
    const asyncPlugin = createMarkdownPlugin({
      name: 'async',
      apiVersion: 1,
      transform: (async () =>
        Promise.resolve({type: 'root', children: []})) as never,
    });
    const headingChange = createMarkdownPlugin({
      name: 'heading-change',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'heading' ? {...block, depth: 6 as const} : block,
          ),
        };
      },
    });

    for (const plugin of [mutating, asyncPlugin, headingChange]) {
      expect(parseMarkdown('# Safe', {plugins: [plugin]})).toEqual([
        {
          type: 'heading',
          level: 1,
          children: [{type: 'text', content: 'Safe'}],
        },
      ]);
    }
    warning.mockRestore();
  });

  it('allows source heading removal and synthetic headings without changing surviving depth', () => {
    const addHeading = createMarkdownPlugin({
      name: 'add-heading',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: [
            ...root.children,
            {
              type: 'heading' as const,
              depth: 2 as const,
              children: [{type: 'text' as const, value: 'Generated'}],
            },
          ],
        };
      },
    });

    const removeHeading = createMarkdownPlugin({
      name: 'remove-heading',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.filter(block => block.type !== 'heading'),
        };
      },
    });

    expect(parseMarkdown('# Source', {plugins: [addHeading]})).toMatchObject([
      {type: 'heading', level: 1},
      {type: 'heading', level: 2, children: [{content: 'Generated'}]},
    ]);
    expect(
      parseMarkdown('# Removed\n\nSurviving body.', {
        plugins: [removeHeading],
      }),
    ).toMatchObject([
      {
        type: 'paragraph',
        children: [{type: 'text', content: 'Surviving body.'}],
      },
    ]);
  });

  it('rejects unsafe destinations, forged provenance, and foreign deletion', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const unsafeDestination = createMarkdownPlugin({
      name: 'unsafe-destination',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'paragraph'
              ? {
                  ...block,
                  children: [
                    {
                      type: 'link' as const,
                      url: 'javascript:alert(1)',
                      children: [{type: 'text' as const, value: 'unsafe'}],
                    },
                  ],
                }
              : block,
          ),
        };
      },
    });
    const nestedLink = createMarkdownPlugin({
      name: 'nested-link',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'paragraph'
              ? {
                  ...block,
                  children: [
                    {
                      type: 'link' as const,
                      url: '/outer',
                      children: [
                        {
                          type: 'strong' as const,
                          children: [
                            {
                              type: 'link' as const,
                              url: '/inner',
                              children: [
                                {type: 'text' as const, value: 'nested'},
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                }
              : block,
          ),
        };
      },
    });
    const forgedSource = createMarkdownPlugin<'badges', BadgeNode>({
      ...badgeDefinition,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'paragraph'
              ? {
                  ...block,
                  children: [
                    ...block.children,
                    {
                      type: 'extension' as const,
                      plugin: 'badges' as const,
                      name: 'badge' as const,
                      display: 'inline' as const,
                      data: {label: 'forged'},
                      source: 'forged',
                    },
                  ],
                }
              : block,
          ),
        };
      },
    } as MarkdownTransformPluginDefinition<'badges', BadgeNode>);
    const deleteForeign = createMarkdownPlugin({
      name: 'delete-foreign',
      apiVersion: 1,
      transform(root) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'paragraph'
              ? {
                  ...block,
                  children: block.children.filter(
                    astNode => astNode.type !== 'extension',
                  ),
                }
              : block,
          ),
        };
      },
    });

    expect(parseMarkdown('Safe', {plugins: [unsafeDestination]})).toMatchObject(
      [{type: 'paragraph', children: [{type: 'text', content: 'Safe'}]}],
    );
    expect(parseMarkdown('Safe', {plugins: [nestedLink]})).toMatchObject([
      {type: 'paragraph', children: [{type: 'text', content: 'Safe'}]},
    ]);
    const identityReplacement = replaceText('missing', 'unchanged');
    expect(
      parseMarkdown('![pic](data:image/png;base64,abc)', {
        plugins: [identityReplacement],
      }),
    ).toMatchObject([{type: 'image', src: 'data:image/png;base64,abc'}]);
    expect(
      parseMarkdown('[empty]()', {plugins: [identityReplacement]}),
    ).toMatchObject([
      {type: 'paragraph', children: [{type: 'link', href: ''}]},
    ]);
    expect(parseMarkdown('Safe', {plugins: [forgedSource]})).toMatchObject([
      {type: 'paragraph', children: [{type: 'text', content: 'Safe'}]},
    ]);
    expect(
      parseMarkdown('@{Ada}', {plugins: [mentionPlugin, deleteForeign]}),
    ).toMatchObject([
      {
        type: 'paragraph',
        children: [{type: 'extension', plugin: 'mentions', name: 'mention'}],
      },
    ]);
    warning.mockRestore();
  });

  it('narrows visitor callbacks by node kind', () => {
    const plugin = createMarkdownPlugin({
      name: 'typed-visitor',
      apiVersion: 1,
      transform(root) {
        visitMarkdownNodes(root, 'heading', heading => {
          expectTypeOf(heading.depth).toEqualTypeOf<1 | 2 | 3 | 4 | 5 | 6>();
        });
        visitMarkdownNodes(root, 'extension', extension => {
          if (
            isMarkdownExtensionNode<MentionNode>(
              extension,
              'mentions',
              'mention',
            )
          ) {
            expectTypeOf(extension.data.label).toBeString();
          }
        });
        return root;
      },
    });
    expect(parseMarkdown('# Heading', {plugins: [plugin]})).toHaveLength(1);
  });

  it('keeps syntax identity independent from live transforms', () => {
    let tokenizations = 0;
    const pluginWithTransform = (replacement: string) =>
      createMarkdownPlugin<'mentions', MentionNode>({
        ...mentionDefinition,
        transform(root) {
          tokenizations += 0;
          return {
            ...root,
            children: root.children.map(block =>
              block.type === 'paragraph'
                ? {
                    ...block,
                    children: block.children.map(node =>
                      node.type === 'text'
                        ? {
                            ...node,
                            value: node.value.replace('Tail', replacement),
                          }
                        : node,
                    ),
                  }
                : block,
            ),
          };
        },
        syntax: {
          inline: [
            {
              ...mentionDefinition.syntax.inline[0],
              tokenize(input) {
                tokenizations++;
                return mentionDefinition.syntax.inline[0].tokenize(input);
              },
            },
          ],
        },
      });
    const state = createIncrementalState();
    parseMarkdownIncremental('@{Ada}\n\nTail', state, {
      plugins: [pluginWithTransform('First')],
    });
    const before = tokenizations;
    const updated = parseMarkdownIncremental('@{Ada}\n\nTail', state, {
      plugins: [pluginWithTransform('Second')],
    });
    expect(tokenizations).toBe(before);
    expect(updated.at(-1)).toMatchObject({
      type: 'paragraph',
      children: [{type: 'text', content: 'Second'}],
    });
  });

  it('preserves settled identities when finalizing deferred syntax', () => {
    const state = createIncrementalState();
    const streaming = parseMarkdownIncremental('First\n\n@{', state, {
      plugins: [mentionPlugin],
    });
    const firstBlock = streaming[0];
    const final = parseMarkdownIncremental('First\n\n@{', state, {
      plugins: [mentionPlugin],
      isFinal: true,
    });

    expect(final[0]).toBe(firstBlock);
    expect(final[1]).toMatchObject({
      type: 'paragraph',
      children: [{type: 'text', content: '@{'}],
    });
  });

  it('uses transformed heading text for both Markdown and Outline', () => {
    const plugin = replaceText('Draft', 'Final');
    const source = '# Draft';
    const outline = parseOutlineFromMarkdown(source, {plugins: [plugin]});
    render(<Markdown plugins={[plugin]}>{source}</Markdown>);

    expect(outline).toEqual([{id: 'final', label: 'Final', level: 1}]);
    expect(screen.getByRole('heading', {name: 'Final'})).toHaveAttribute(
      'id',
      'final',
    );
  });

  it('passes matching transform finality to Markdown-derived outlines', () => {
    const plugin = createMarkdownPlugin({
      name: 'finality-label',
      apiVersion: 1,
      transform(root, context) {
        return {
          ...root,
          children: root.children.map(block =>
            block.type === 'heading'
              ? {
                  ...block,
                  children: [
                    {
                      type: 'text' as const,
                      value: context.isFinal ? 'Final' : 'Draft',
                    },
                  ],
                }
              : block,
          ),
        };
      },
    });

    expect(
      parseOutlineFromMarkdown('# Pending', {
        plugins: [plugin],
        isFinal: false,
      }),
    ).toEqual([{id: 'draft', label: 'Draft', level: 1}]);
    expect(
      parseOutlineFromMarkdown('# Pending', {
        plugins: [plugin],
        isFinal: true,
      }),
    ).toEqual([{id: 'final', label: 'Final', level: 1}]);
  });

  it('falls back to readable source when an extension renderer throws', () => {
    const broken = createMarkdownPlugin<'broken-mentions', BrokenMentionNode>({
      ...mentionDefinition,
      name: 'broken-mentions',
      syntax: {
        inline: [
          {
            ...mentionDefinition.syntax.inline[0],
            tokenize(input) {
              const result = mentionDefinition.syntax.inline[0].tokenize(input);
              return result.status === 'match'
                ? {
                    ...result,
                    node: {...result.node, plugin: 'broken-mentions' as const},
                  }
                : result;
            },
          },
        ],
      },
      renderers: {
        mention: {
          render() {
            throw new Error('broken renderer');
          },
          toText: node => `@${node.data.label}`,
        },
      },
    });
    const descendant = createMarkdownPlugin<
      'broken-mentions',
      BrokenMentionNode
    >({
      ...mentionDefinition,
      name: 'broken-mentions',
      syntax: {
        inline: [
          {
            ...mentionDefinition.syntax.inline[0],
            tokenize(input) {
              const result = mentionDefinition.syntax.inline[0].tokenize(input);
              return result.status === 'match'
                ? {
                    ...result,
                    node: {...result.node, plugin: 'broken-mentions' as const},
                  }
                : result;
            },
          },
        ],
      },
      renderers: {
        mention: {
          render: () => <ThrowingRendererChild />,
          toText: node => `@${node.data.label}`,
        },
      },
    });
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(
      renderToString(<Markdown plugins={[broken]}>{'Hello @{Ada}'}</Markdown>),
    ).toContain('@{Ada}');
    expect(
      renderToString(
        <Markdown plugins={[descendant]}>{'Hello @{Ada}'}</Markdown>,
      ),
    ).toContain('@{Ada}');
    render(<Markdown plugins={[broken]}>{'Hello @{Ada}'}</Markdown>);
    expect(screen.getByText(/@\{Ada\}/)).toBeInTheDocument();
    warning.mockRestore();
    error.mockRestore();
  });
});
