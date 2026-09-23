// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file entityReferences.test.tsx
 * @input Configured and unknown `@{id}` references across Markdown contexts
 * @output Transform, rendering, accessibility, SSR, and streaming evidence
 * @position Acceptance tests for configurable first-party entity references
 */

import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {describe, expect, expectTypeOf, it} from 'vitest';
import {Markdown} from '../Markdown';
import {
  createIncrementalState,
  parseMarkdown,
  parseMarkdownAst,
  parseMarkdownIncremental,
} from '../parser';
import type {MarkdownPluginEntry} from './protocol';
import {createMarkdownEntityReferencesPlugin} from './entityReferences';

const plugin = createMarkdownEntityReferencesPlugin({
  references: [
    {id: 'ada', label: 'Ada Lovelace', href: '/people/ada'},
    {id: 'compiler', label: 'Compiler'},
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

describe('createMarkdownEntityReferencesPlugin', () => {
  it('replaces configured references and leaves unknown ones literal', () => {
    const root = parseMarkdownAst('Ask @{ada} about @{unknown}.', {
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
        {type: 'text', value: ' about @{unknown}.'},
      ],
    });
  });

  it('renders linked and unlinked entities with their configured names', () => {
    render(
      <Markdown plugins={[plugin]}>{'Meet @{ada} and @{compiler}.'}</Markdown>,
    );

    expect(screen.getByRole('link', {name: 'Ada Lovelace'})).toHaveAttribute(
      'href',
      '/people/ada',
    );
    expect(screen.getByText('Compiler')).toHaveAttribute(
      'data-markdown-entity-reference',
      'compiler',
    );
    expect(
      renderToString(<Markdown plugins={[plugin]}>{'@{ada}'}</Markdown>),
    ).toContain('Ada Lovelace');
    expectTypeOf(plugin).toMatchTypeOf<MarkdownPluginEntry>();
  });

  it('preserves code, links, and unconfigured text', () => {
    const source = '`@{ada}` [@{ada}](/docs) @{missing}';
    expect(parseMarkdownAst(source, {plugins: [plugin]})).toEqual(
      parseMarkdownAst(source),
    );
  });

  it('stays literal until complete and converges through incremental parsing', () => {
    const source = 'Ask @{ada} now.';
    const state = createIncrementalState();
    const partial = parseMarkdownIncremental('Ask @{ada', state, {
      plugins: [plugin],
    });
    expect(JSON.stringify(partial)).not.toContain('entity-reference');

    const complete = parseMarkdownIncremental(source, state, {
      plugins: [plugin],
    });
    expect(JSON.stringify(complete)).toContain('entity-reference');
    expect(complete).toEqual(parseMarkdown(source, {plugins: [plugin]}));
  });

  it('rejects invalid and duplicate configuration', () => {
    expect(() =>
      createMarkdownEntityReferencesPlugin({
        references: [{id: '', label: 'Empty'}],
      }),
    ).toThrow(/non-empty single-line id and label/);
    expect(() =>
      createMarkdownEntityReferencesPlugin({
        references: [{id: 'unsafe', label: 'Unsafe', href: 'javascript:bad()'}],
      }),
    ).toThrow(/non-empty single-line id and label/);
    expect(() =>
      createMarkdownEntityReferencesPlugin({
        references: [
          {id: 'same', label: 'One'},
          {id: 'same', label: 'Two'},
        ],
      }),
    ).toThrow(/Duplicate Markdown entity reference/);
  });
});
