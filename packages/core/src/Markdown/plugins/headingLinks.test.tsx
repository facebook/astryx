// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file headingLinks.test.tsx
 * @input Markdown and Outline with the first-party heading-links plugin
 * @output Identity, projection, compatibility, and custom-renderer evidence
 * @position Acceptance tests for module:Markdown/headingLinks
 */

import {render, screen} from '@testing-library/react';
import type {ReactNode} from 'react';
import {describe, expect, expectTypeOf, it, vi} from 'vitest';
import {parseOutlineFromMarkdown} from '../../Outline/parseOutlineFromMarkdown';
import {Markdown} from '../Markdown';
import {createMarkdownHeadingLinks} from './index';
import {createMarkdownPlugin} from './protocol';
import type {MarkdownPluginEntry} from './protocol';

const headingLinks = createMarkdownHeadingLinks();
const markdownPluginBrand = Symbol.for(
  '@astryxdesign/core/MarkdownPluginEntry',
);
const headingLinksConfigBrand = Symbol.for(
  '@astryxdesign/core/MarkdownHeadingLinksConfig',
);

function createBrandedSameNameEntry({
  pluginApiVersion = 1,
  config,
}: {
  readonly pluginApiVersion?: number;
  readonly config?: unknown;
}): MarkdownPluginEntry {
  const definition: Record<PropertyKey, unknown> = {
    name: 'heading-links',
    apiVersion: pluginApiVersion,
    transform: (root: {readonly type: string}) => root,
  };
  if (config !== undefined) {
    Object.defineProperty(definition, headingLinksConfigBrand, {
      configurable: false,
      enumerable: false,
      value: Object.freeze(config),
      writable: false,
    });
  }
  Object.freeze(definition);
  return Object.freeze({
    name: 'heading-links',
    apiVersion: pluginApiVersion,
    [markdownPluginBrand]: Object.freeze({
      kind: '@astryxdesign/core/MarkdownPluginEntry',
      apiVersion: pluginApiVersion,
      definition,
    }),
  }) as unknown as MarkdownPluginEntry;
}

function createConfig(
  overrides: Readonly<Record<string, unknown>> = {},
): Record<string, unknown> {
  return {
    kind: '@astryxdesign/core/MarkdownHeadingLinksConfig',
    apiVersion: 1,
    headingIdPrefix: 'ignored',
    permalinkBaseUrl: '',
    ...overrides,
  };
}

const incompatibleHeadingLinksEntries: ReadonlyArray<
  readonly [string, MarkdownPluginEntry]
> = [
  [
    'same-name plugin without module configuration',
    createMarkdownPlugin({
      name: 'heading-links',
      apiVersion: 1,
      transform: root => root,
    }),
  ],
  [
    'malformed generic envelope',
    Object.freeze({
      name: 'heading-links',
      apiVersion: 1,
    }) as unknown as MarkdownPluginEntry,
  ],
  ['older plugin protocol', createBrandedSameNameEntry({pluginApiVersion: 0})],
  ['newer plugin protocol', createBrandedSameNameEntry({pluginApiVersion: 2})],
  [
    'older module configuration',
    createBrandedSameNameEntry({config: createConfig({apiVersion: 0})}),
  ],
  [
    'newer module configuration',
    createBrandedSameNameEntry({config: createConfig({apiVersion: 2})}),
  ],
  [
    'wrong module configuration shape',
    createBrandedSameNameEntry({
      config: createConfig({headingIdPrefix: 42}),
    }),
  ],
];

describe('createMarkdownHeadingLinks', () => {
  it('returns an ordinary public plugin entry', () => {
    expectTypeOf(headingLinks).toMatchTypeOf<MarkdownPluginEntry<never>>();
  });

  it('carries its namespace across a duplicate compatible Core copy', async () => {
    vi.resetModules();
    const duplicateCore = await import('./headingLinks');
    const portableEntry = duplicateCore.createMarkdownHeadingLinks({
      headingIdPrefix: 'portable',
    });
    const source = '> # Nested\n\n# Root';

    render(<Markdown plugins={[portableEntry]}>{source}</Markdown>);

    expect(screen.getByRole('heading', {name: 'Nested'})).toHaveAttribute(
      'id',
      'portable--nested',
    );
    expect(screen.getByRole('heading', {name: 'Root'})).toHaveAttribute(
      'id',
      'portable--root',
    );
    expect(
      parseOutlineFromMarkdown(source, {plugins: [portableEntry]}),
    ).toEqual([{id: 'portable--root', label: 'Root', level: 1}]);
  });

  it.each(incompatibleHeadingLinksEntries)(
    'fails soft for %s across Markdown and Outline',
    (_label, incompatibleEntry) => {
      const source = '> # Nested\n\n# Root';
      const {container} = render(
        <Markdown plugins={[incompatibleEntry]}>{source}</Markdown>,
      );
      const [nested, root] = screen.getAllByRole('heading');

      expect(nested).not.toHaveAttribute('id');
      expect(root).toHaveAttribute('id', 'root');
      expect(container.querySelector('button, a[href*="#"]')).toBeNull();
      expect(
        parseOutlineFromMarkdown(source, {plugins: [incompatibleEntry]}),
      ).toEqual([{id: 'root', label: 'Root', level: 1}]);
    },
  );

  it('does not treat another valid plugin as heading-links configuration', () => {
    const otherPlugin = createMarkdownPlugin({
      name: 'other-plugin',
      apiVersion: 1,
      transform: root => root,
    });
    render(
      <Markdown plugins={[otherPlugin]}>{'> # Nested\n\n# Root'}</Markdown>,
    );
    const [nested, root] = screen.getAllByRole('heading');

    expect(nested).not.toHaveAttribute('id');
    expect(root).toHaveAttribute('id', 'root');
  });

  it('projects a stable id for every semantic heading level without permalink UI', () => {
    render(
      <Markdown plugins={[headingLinks]}>
        {Array.from(
          {length: 6},
          (_, index) => `${'#'.repeat(index + 1)} Level ${index + 1}`,
        ).join('\n\n')}
      </Markdown>,
    );

    for (let level = 1; level <= 6; level += 1) {
      expect(
        screen.getByRole('heading', {level, name: `Level ${level}`}),
      ).toHaveAttribute('id', `level-${level}`);
    }
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('shares one depth-first allocator while Outline remains root-only', () => {
    const source = '> # Quoted\n\n# Quoted';
    const {container} = render(
      <Markdown plugins={[headingLinks]}>{source}</Markdown>,
    );
    const [nested, topLevel] = screen.getAllByText('Quoted');

    expect(container.querySelector('blockquote')).toContainElement(nested);
    expect(nested).toHaveAttribute('id', 'quoted');
    expect(topLevel).toHaveAttribute('id', 'quoted-1');
    expect(parseOutlineFromMarkdown(source, {plugins: [headingLinks]})).toEqual(
      [{id: 'quoted-1', label: 'Quoted', level: 1}],
    );
  });

  it('reserves emitted ids across natural numeric-suffix collisions', () => {
    render(
      <Markdown plugins={[headingLinks]}>
        {'# Foo\n\n# Foo\n\n# Foo-1'}
      </Markdown>,
    );
    expect(screen.getAllByRole('heading').map(heading => heading.id)).toEqual([
      'foo',
      'foo-1',
      'foo-1-1',
    ]);
    expect(
      parseOutlineFromMarkdown('# Foo-1\n\n# Foo\n\n# Foo', {
        plugins: [headingLinks],
      }).map(item => item.id),
    ).toEqual(['foo-1', 'foo', 'foo-2']);
  });

  it('normalizes Unicode letters and numbers while stripping emoji', () => {
    render(
      <Markdown plugins={[headingLinks]}>
        {'# Ｈｅｌｌｏ Привет 你好 😄 １２３'}
      </Markdown>,
    );
    expect(screen.getByRole('heading')).toHaveAttribute(
      'id',
      'hello-привет-你好-123',
    );
  });

  it('uses a stable section fallback when the label has no slug text', () => {
    render(
      <Markdown plugins={[headingLinks]} sources={{cite: {title: 'Citation'}}}>
        {'# [cite]'}
      </Markdown>,
    );
    expect(screen.getByRole('heading')).toHaveAttribute('id', 'section');
  });

  it('uses a caller-owned namespace across Markdown and Outline', () => {
    const source = '# Overview\n\n## Details';
    const namespaced = createMarkdownHeadingLinks({
      headingIdPrefix: 'article',
    });
    const {container} = render(
      <Markdown id="article" plugins={[namespaced]}>
        {source}
      </Markdown>,
    );

    expect(container.firstElementChild).toHaveAttribute('id', 'article');
    expect(screen.getAllByRole('heading').map(heading => heading.id)).toEqual([
      'article--overview',
      'article--details',
    ]);
    expect(parseOutlineFromMarkdown(source, {plugins: [namespaced]})).toEqual([
      {id: 'article--overview', label: 'Overview', level: 1},
      {id: 'article--details', label: 'Details', level: 2},
    ]);
  });

  it('rejects a non-string namespace', () => {
    expect(() =>
      createMarkdownHeadingLinks({headingIdPrefix: 42 as unknown as string}),
    ).toThrow(/headingIdPrefix must be a string/);
  });

  it('gives custom heading renderers ids at every depth without imposing anatomy', () => {
    const received: (string | undefined)[] = [];
    const {container} = render(
      <Markdown
        plugins={[headingLinks]}
        components={{
          heading: ({children, id}: {children: ReactNode; id?: string}) => {
            received.push(id);
            return <h2 id={id}>{children}</h2>;
          },
        }}>
        {'> # Nested\n\n# Root'}
      </Markdown>,
    );

    expect(received).toEqual(['nested', 'root']);
    expect(container.querySelectorAll('h2')).toHaveLength(2);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('preserves released no-plugin identity and nested-heading behavior', () => {
    render(<Markdown>{'> # Nested\n\n# Root'}</Markdown>);
    const [nested, root] = screen.getAllByRole('heading');

    expect(nested).not.toHaveAttribute('id');
    expect(root).toHaveAttribute('id', 'root');
    expect(screen.queryByRole('link')).toBeNull();
  });
});
