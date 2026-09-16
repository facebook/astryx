// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Markdown.public.test.ts
 * @input Imports Markdown parser, plugin factory, visitor, and node types from the public barrel
 * @output Compile-time compatibility coverage for legacy, math-enabled, and plugin results
 * @position Public API test guarding @astryxdesign/core/Markdown
 */

import {describe, expectTypeOf, it} from 'vitest';
import {
  createIncrementalState,
  createMarkdownPlugin,
  parseInline,
  parseMarkdown,
  parseMarkdownIncremental,
  visitMarkdownNodes,
} from './index';
import type {
  BlockNode,
  BlockNodeWithMath,
  InlineNode,
  InlineNodeWithMath,
  MarkdownExtensionNode,
  MarkdownSyntaxPluginDefinition,
  ParseOptions,
} from './index';

function assertNever(value: never): never {
  throw new Error(`Unexpected node: ${JSON.stringify(value)}`);
}

// Existing exhaustive consumers must not gain a new case when they do not opt
// into math parsing. These functions fail to compile if the legacy unions widen.
function legacyInlineText(node: InlineNode): string {
  switch (node.type) {
    case 'text':
    case 'code':
      return node.content;
    case 'bold':
    case 'italic':
    case 'strikethrough':
    case 'link':
      return node.children.map(legacyInlineText).join('');
    case 'image':
      return node.alt;
    case 'citation':
      return node.sourceId;
    case 'break':
      return '\n';
    default:
      return assertNever(node);
  }
}

function legacyBlockText(node: BlockNode): string {
  switch (node.type) {
    case 'heading':
    case 'paragraph':
      return node.children.map(legacyInlineText).join('');
    case 'codeblock':
      return node.content;
    case 'blockquote':
      return node.children.map(legacyBlockText).join('\n');
    case 'list':
      return node.items
        .flatMap(item => item.children.map(legacyBlockText))
        .join('\n');
    case 'table':
      return [...node.headers, ...node.rows.flat()]
        .flatMap(cell => cell.children.map(legacyInlineText))
        .join(' ');
    case 'image':
      return node.alt;
    case 'hr':
      return '';
    default:
      return assertNever(node);
  }
}

describe('Markdown public parser types', () => {
  it('keeps default and legacy parser calls on the legacy unions', () => {
    expectTypeOf(parseInline('plain')).toEqualTypeOf<InlineNode[]>();
    expectTypeOf(parseInline('plain', new Set<string>())).toEqualTypeOf<
      InlineNode[]
    >();
    expectTypeOf(parseMarkdown('plain')).toEqualTypeOf<BlockNode[]>();
    expectTypeOf(parseMarkdown('plain', {math: false})).toEqualTypeOf<
      BlockNode[]
    >();
    const annotatedOptions: ParseOptions = {autolink: 'gfm'};
    expectTypeOf(parseInline('plain', annotatedOptions)).toEqualTypeOf<
      InlineNode[]
    >();
    expectTypeOf(parseMarkdown('plain', annotatedOptions)).toEqualTypeOf<
      BlockNode[]
    >();
    expectTypeOf(
      parseMarkdownIncremental(
        'plain',
        createIncrementalState(),
        annotatedOptions,
      ),
    ).toEqualTypeOf<BlockNode[]>();
    expectTypeOf(
      parseMarkdownIncremental('plain', createIncrementalState()),
    ).toEqualTypeOf<BlockNode[]>();
    expectTypeOf(createIncrementalState().settledBlocks).toEqualTypeOf<
      BlockNode[]
    >();
    expectTypeOf(legacyInlineText).returns.toBeString();
    expectTypeOf(legacyBlockText).returns.toBeString();
  });

  it('rejects ambiguous math options and structurally forged state', () => {
    function compileOnlyGuards() {
      const dynamicOptions: {math: boolean} = {math: true};
      // @ts-expect-error callers must narrow to ParseOptions or MathParseOptions
      parseMarkdown('$$x$$', dynamicOptions);

      const structuralState = {
        prevInput: '',
        settledText: '',
        settledBlocks: [] as BlockNode[],
        settledUpTo: 0,
      };
      // @ts-expect-error math caches must come from createIncrementalState<true>()
      parseMarkdownIncremental('$$x$$', structuralState, {math: true});
    }

    expectTypeOf(compileOnlyGuards).toBeFunction();
  });

  it('types direct and incremental math opt-ins with explicit math unions', () => {
    const inline = parseInline('$x$', {math: true});
    const direct = parseMarkdown('$$x$$', {math: true});
    const incremental = parseMarkdownIncremental(
      '$$x$$',
      createIncrementalState<true>(),
      {math: true},
    );

    // A state carries the same node contract as the parser result it caches.
    // @ts-expect-error math parsing requires a math-enabled incremental state
    parseMarkdownIncremental('$$x$$', createIncrementalState(), {math: true});

    expectTypeOf(inline).toEqualTypeOf<InlineNodeWithMath[]>();
    expectTypeOf(direct).toEqualTypeOf<BlockNodeWithMath[]>();
    expectTypeOf(incremental).toEqualTypeOf<BlockNodeWithMath[]>();
    expectTypeOf(createIncrementalState<true>().settledBlocks).toEqualTypeOf<
      BlockNodeWithMath[]
    >();
    expectTypeOf<
      Extract<InlineNodeWithMath, {type: 'math'}>['value']
    >().toBeString();
    expectTypeOf<
      Extract<BlockNodeWithMath, {type: 'math'}>['value']
    >().toBeString();
  });

  it('exports typed plugin construction and node-kind visitors', () => {
    type PublicNode = MarkdownExtensionNode<
      'public-demo',
      'token',
      {readonly label: string},
      'inline'
    >;
    const definition = {
      name: 'public-demo',
      apiVersion: 1,
      parseKey: 'v1',
      syntax: {
        inline: [
          {
            startsWith: ['::'],
            maxSpan: 20,
            tokenize: () => ({status: 'no-match'}) as const,
          },
        ],
      },
      renderers: {
        token: {
          render: () => null,
          toText: node => node.data.label,
        },
      },
    } satisfies MarkdownSyntaxPluginDefinition<'public-demo', PublicNode>;
    const plugin = createMarkdownPlugin<'public-demo', PublicNode>(definition);
    const nodes = parseInline('plain', {plugins: [plugin] as const});

    expectTypeOf(nodes).toEqualTypeOf<InlineNode<PublicNode>[]>();
    expectTypeOf(visitMarkdownNodes).toBeFunction();
  });
});
