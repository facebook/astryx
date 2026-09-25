// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file entityReferences.test.tsx
 * @input Ordered entity matchers across multiple source grammars and Markdown contexts
 * @output Ordering, transform, rendering, validation, SSR, and streaming evidence
 * @position Acceptance tests for configurable first-party entity references
 */

import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {describe, expect, expectTypeOf, it, vi} from 'vitest';
import {Markdown} from '../Markdown';
import {
  createIncrementalState,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
} from '../parser';
import type {MarkdownPluginEntry} from './protocol';
import {
  markdownEntityReferencesPlugin,
  type MarkdownEntityReference,
  type MarkdownEntityReferenceMatcher,
} from './entityReferences';

const catalog = new Map<string, MarkdownEntityReference>([
  ['ada', {id: 'ada', label: 'Ada Lovelace', href: '/people/ada'}],
  ['compiler', {id: 'compiler', label: 'Compiler'}],
]);

const plugin = markdownEntityReferencesPlugin({
  matchers: [
    {
      pattern: /@\{([^{}\r\n]+)\}/g,
      requiredSubstrings: ['@{'],
      resolve: match => catalog.get(match[1]) ?? null,
    },
    {
      pattern: /\bD(\d+)\b/g,
      requiredSubstrings: ['D'],
      resolve: match => ({
        id: `D${match[1]}`,
        label: `Diff D${match[1]}`,
        href: `/diff/${match[1]}`,
      }),
    },
  ],
  render: reference =>
    reference.href == null ? (
      <strong data-markdown-entity-reference={reference.id}>
        {reference.label}
      </strong>
    ) : (
      <a href={reference.href} data-markdown-entity-reference={reference.id}>
        {reference.label}
      </a>
    ),
});

describe('markdownEntityReferencesPlugin', () => {
  it('resolves multiple source grammars and leaves declined matches literal', () => {
    const root = parseMarkdownAst('Ask @{ada} about @{unknown} and D123.', {
      plugins: [plugin],
    });

    expect(root.children[0]).toMatchObject({
      type: 'paragraph',
      children: [
        {type: 'text', value: 'Ask '},
        {
          type: 'extension',
          plugin: 'entity-references',
          name: 'entity-reference',
          data: {id: 'ada', label: 'Ada Lovelace', href: '/people/ada'},
        },
        {type: 'text', value: ' about @{unknown} and '},
        {
          type: 'extension',
          plugin: 'entity-references',
          name: 'entity-reference',
          data: {id: 'D123', label: 'Diff D123', href: '/diff/123'},
        },
        {type: 'text', value: '.'},
      ],
    });
  });

  it('runs matchers in order and hides claimed spans from later matchers', () => {
    const calls: string[] = [];
    const ordered = markdownEntityReferencesPlugin({
      matchers: [
        {
          pattern: /\bD(\d+)\b/g,
          resolve: match => {
            calls.push(`first:${match[0]}`);
            return match[1] === '2'
              ? null
              : {id: match[0], label: `First ${match[0]}`};
          },
        },
        {
          pattern: /\bD(\d+)\b/g,
          resolve: match => {
            calls.push(`second:${match[0]}`);
            return {id: match[0], label: `Second ${match[0]}`};
          },
        },
      ],
    });

    const root = parseMarkdownAst('D1 and D2', {plugins: [ordered]});
    expect(root.children[0]).toMatchObject({
      children: [
        {type: 'extension', data: {id: 'D1', label: 'First D1'}},
        {type: 'text', value: ' and '},
        {type: 'extension', data: {id: 'D2', label: 'Second D2'}},
      ],
    });
    expect(calls).toEqual(['first:D1', 'first:D2', 'second:D2']);
  });

  it('renders linked and unlinked entities with their resolved names', () => {
    render(
      <Markdown plugins={[plugin]}>
        {'Meet @{ada}, @{compiler}, and D123.'}
      </Markdown>,
    );

    expect(screen.getByRole('link', {name: 'Ada Lovelace'})).toHaveAttribute(
      'href',
      '/people/ada',
    );
    expect(screen.getByRole('link', {name: 'Diff D123'})).toHaveAttribute(
      'href',
      '/diff/123',
    );
    expect(screen.getByText('Compiler')).toHaveAttribute(
      'data-markdown-entity-reference',
      'compiler',
    );
    expect(
      renderToString(<Markdown plugins={[plugin]}>{'@{ada}'}</Markdown>),
    ).toContain('Ada Lovelace');
    expectTypeOf(plugin).toMatchTypeOf<MarkdownPluginEntry>();
    expectTypeOf<MarkdownEntityReferenceMatcher>().toMatchTypeOf<{
      pattern: RegExp;
      resolve: (match: RegExpExecArray) => MarkdownEntityReference | null;
    }>();
  });

  it('uses the label only when no renderer is supplied and honors null', () => {
    const matcher: MarkdownEntityReferenceMatcher = {
      pattern: /@\{([^{}\r\n]+)\}/g,
      resolve: match =>
        match[1] === 'compiler' ? {id: 'compiler', label: 'Compiler'} : null,
    };
    const defaultPlugin = markdownEntityReferencesPlugin({
      matchers: [matcher],
    });
    const hiddenPlugin = markdownEntityReferencesPlugin({
      matchers: [matcher],
      render: () => null,
    });

    expect(
      renderToString(
        <Markdown plugins={[defaultPlugin]}>{'@{compiler}'}</Markdown>,
      ),
    ).toContain('Compiler');
    expect(
      renderToString(
        <Markdown plugins={[hiddenPlugin]}>{'@{compiler}'}</Markdown>,
      ),
    ).not.toContain('Compiler');
  });

  it('preserves protected contexts and text declined by every matcher', () => {
    const source = '`@{ada} D123` [@{ada} D123](/docs) @{missing}';
    expect(parseMarkdownAst(source, {plugins: [plugin]})).toEqual(
      parseMarkdownAst(source),
    );
  });

  it('is deterministic for every streaming prefix and converges when complete', () => {
    const source = 'Ask @{ada} now.';
    const state = createIncrementalState();

    for (let end = 1; end <= source.length; end++) {
      const prefix = source.slice(0, end);
      const first = parseMarkdownIncremental(prefix, state, {
        plugins: [plugin],
      });
      const repeated = parseMarkdownIncremental(prefix, state, {
        plugins: [plugin],
      });
      expect(repeated).toEqual(first);
      expect(JSON.stringify(first).includes('entity-reference')).toBe(
        prefix.includes('@{ada}'),
      );
    }

    expect(
      parseMarkdownIncremental(source, state, {plugins: [plugin]}),
    ).toEqual(parseMarkdown(source, {plugins: [plugin]}));
  });

  it('clones patterns and rejects invalid matcher configuration or results', async () => {
    const original = /@\{([^{}\r\n]+)\}/g;
    original.lastIndex = 7;
    const cloned = markdownEntityReferencesPlugin({
      matchers: [
        {
          pattern: original,
          resolve: match => ({id: match[1], label: match[1]}),
        },
      ],
    });
    parseMarkdownAst('@{ada}', {plugins: [cloned]});
    expect(original.lastIndex).toBe(7);

    expect(() => markdownEntityReferencesPlugin({matchers: []})).toThrow(
      /at least one matcher/,
    );
    expect(() =>
      markdownEntityReferencesPlugin({
        matchers: [{pattern: /D(\d+)/, resolve: () => null}],
      }),
    ).toThrow(/global flag/);

    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const baseline = parseMarkdownAst('D1');
    const invalidPlugins = [
      markdownEntityReferencesPlugin({
        matchers: [
          {pattern: /(?=D)/g, resolve: () => ({id: 'D', label: 'Diff'})},
        ],
      }),
      markdownEntityReferencesPlugin({
        matchers: [{pattern: /D1/g, resolve: () => ({id: '', label: 'Diff'})}],
      }),
      markdownEntityReferencesPlugin({
        matchers: [
          {
            pattern: /D1/g,
            resolve: () => ({
              id: 'D1',
              label: 'Diff',
              href: 'javascript:bad()',
            }),
          },
        ],
      }),
      markdownEntityReferencesPlugin({
        matchers: [
          {
            pattern: /D1/g,
            resolve: (async () => {
              throw new Error('async resolution must be consumed');
            }) as unknown as MarkdownEntityReferenceMatcher['resolve'],
          },
        ],
      }),
    ];

    for (const invalidPlugin of invalidPlugins) {
      expect(parseMarkdownAst('D1', {plugins: [invalidPlugin]})).toEqual(
        baseline,
      );
    }
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(warning).toHaveBeenCalled();
    expect(String(warning.mock.calls[0]?.[1])).toMatch(/must consume source/);
    warning.mockRestore();
  });
});
