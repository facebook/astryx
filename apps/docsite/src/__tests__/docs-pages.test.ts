// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  guideNamespacePages,
  mergeFlatTopics,
  namespaceCategory,
  namespacePage,
  nestPages,
  sectionAnchors,
} from '../../scripts/docs-pages.mjs';
import {buildOutline} from '../components/docs/docOutline';
import type {DocSection} from '../generated/docsRegistry';

const section = (title: string, text = `${title} text.`) => ({
  title,
  content: [{type: 'prose', text}],
});

/** The flat topic as the site had it before the split. */
const widgetsBefore = {
  topic: 'widgets',
  title: 'Widgets',
  description: 'Pick and place widgets.',
  category: 'foundations',
  sections: [
    section('Overview'),
    section('Sizes'),
    section('Best Practices'),
    section('Theming'),
  ],
};

type Guide = {route: string; title: string; category: string | null};

/**
 * A docs reader shaped like the CLI docs API after `widgets` became a root
 * namespace of two guides: `docs(route)` reads one guide, and
 * `docs(route, undefined, {depth: 'all', detail: 'full'})` reads the
 * namespace with every guide's compiled sections.
 */
function splitReader(
  guides: Array<Guide & {sections: ReturnType<typeof section>[]}>,
) {
  return async (
    route?: string,
    _section?: string,
    options: {depth?: number | 'all'} = {},
  ) => {
    const guide = guides.find(g => g.route === route);
    if (guide) {
      return {
        type: 'docs.detail',
        data: {
          title: guide.title,
          category: guide.category,
          sections: guide.sections,
        },
      };
    }
    if (route === 'widgets' && options.depth === 'all') {
      return {
        type: 'docs.node',
        data: {
          route: 'widgets',
          kind: 'namespace',
          title: 'Widgets',
          summary: 'Pick and place widgets.',
          content: [],
          slots: [
            {
              name: 'guides',
              title: 'Guides',
              children: guides.map(g => ({
                route: g.route,
                kind: 'generic',
                title: g.title,
                sections: g.sections,
              })),
            },
          ],
        },
      };
    }
    throw new Error(`unexpected read ${route}`);
  };
}

describe('a flat topic split into a docs-tree namespace', () => {
  const guides = [
    {
      route: 'widgets/basics',
      title: 'Basics',
      category: 'foundations',
      sections: widgetsBefore.sections.slice(0, 2),
    },
    {
      route: 'widgets/advanced',
      title: 'Advanced',
      category: 'foundations',
      sections: widgetsBefore.sections.slice(2),
    },
  ];

  it('keeps one page at the old slug, in the same group, with the same sections', async () => {
    const result = await namespacePage(splitReader(guides), 'widgets');
    expect(result?.page).toEqual(widgetsBefore);
  });

  it('sends each guide slug to its section on that page', async () => {
    const result = await namespacePage(splitReader(guides), 'widgets');
    expect(result?.redirects).toEqual({
      'widgets-basics': '/docs/widgets#overview',
      'widgets-advanced': '/docs/widgets#best-practices',
    });
  });

  it('has no page for a level whose children are not placed under it', async () => {
    const read = async () => ({
      type: 'docs.node',
      data: {
        route: 'unorganized',
        kind: 'namespace',
        title: 'Unorganized',
        content: [],
        slots: [
          {
            name: 'topics',
            children: [{route: 'color', kind: 'generic', sections: []}],
          },
        ],
      },
    });
    expect(await namespacePage(read, 'unorganized')).toBeNull();
  });
});

describe('a page for part of a namespace', () => {
  const nested = async (
    route?: string,
    _section?: string,
    options: {depth?: number | 'all'} = {},
  ) => {
    const guideNode = (r: string, title: string) => ({
      route: r,
      kind: 'generic',
      title,
      sections: [section(title)],
    });
    if (route === 'kit/guides' && options.depth === 'all') {
      return {
        type: 'docs.node',
        data: {
          route: 'kit/guides',
          kind: 'namespace',
          title: 'Guides',
          summary: 'Kit guides.',
          content: [],
          slots: [
            {
              name: 'guides',
              children: [
                guideNode('kit/guides/start', 'Start'),
                {
                  route: 'kit/guides/docs',
                  kind: 'namespace',
                  title: 'Docs',
                  content: [],
                  slots: [
                    {
                      name: 'guides',
                      children: [guideNode('kit/guides/docs/write', 'Write')],
                    },
                  ],
                },
              ],
            },
          ],
        },
      };
    }
    return {type: 'docs.detail', data: {category: 'guide', sections: []}};
  };

  it('takes its own slug and title, leaves out what another page holds, and redirects older slugs', async () => {
    const result = await namespacePage(nested, 'kit/guides', {
      slug: 'kit-guide',
      title: 'Kit Guide',
      except: ['kit/guides/docs'],
      aliases: ['kit-overview'],
    });
    expect(result?.page).toMatchObject({
      topic: 'kit-guide',
      title: 'Kit Guide',
      category: 'guide',
    });
    const page = result?.page as {sections: Array<{title: string}>};
    expect(page.sections.map(s => s.title)).toEqual(['Start']);
    expect(result?.redirects).toEqual({
      'kit-guides-start': '/docs/kit-guide#start',
      'kit-guides': '/docs/kit-guide',
      'kit-overview': '/docs/kit-guide',
    });
  });

  it('shows under the page it names as parent, at its place there', async () => {
    const result = await namespacePage(nested, 'kit/guides', {
      parent: 'kit',
      order: 2,
    });
    expect(result?.page).toMatchObject({
      topic: 'kit-guides',
      parent: 'kit',
      order: 2,
    });
  });
});

describe('a page of one guide', () => {
  const codemods = {
    title: 'Codemods',
    description: 'Add a codemod.',
    category: 'guide',
    sections: [section('Add a codemod')],
  };
  const read = async (route?: string) => {
    if (route === 'kit/codemods') {
      return {type: 'docs.detail', data: codemods};
    }
    throw new Error(`unexpected read ${route}`);
  };

  it('takes the guide text at the route slug', async () => {
    const result = await namespacePage(read, 'kit/codemods', {
      parent: 'kit',
      order: 4,
    });
    expect(result).toEqual({
      page: {
        topic: 'kit-codemods',
        title: 'Codemods',
        description: 'Add a codemod.',
        category: 'guide',
        sections: codemods.sections,
        parent: 'kit',
        order: 4,
      },
      redirects: {},
    });
  });
});

describe('guideNamespacePages', () => {
  it('leaves out of each page what the other pages hold, in list order', () => {
    const pages = guideNamespacePages('cli');
    const overview = pages.find(page => page.route === 'cli/integrations');
    const others = pages.filter(page => page !== overview);
    expect(overview?.except.sort()).toEqual(
      others.map(page => page.route).sort(),
    );
    expect(others.every(page => page.parent === 'cli-integrations')).toBe(true);
    expect(pages.map(page => page.order)).toEqual(pages.map((_, i) => i));
  });
});

describe('nestPages', () => {
  it('puts the Authoring Reference after the pages under CLI Integrations', () => {
    const topics = nestPages([
      {topic: 'cli-integrations'},
      {topic: 'cli-integrations-ship', parent: 'cli-integrations', order: 7},
      {topic: 'authoring'},
    ]);
    const authoring = topics.find(topic => topic.topic === 'authoring');
    expect(authoring?.parent).toBe('cli-integrations');
    expect(authoring?.order).toBeGreaterThan(7);
  });

  it('fails when a parent is not a top-level page', () => {
    expect(() => nestPages([{topic: 'a', parent: 'missing'}])).toThrow(
      'not a top-level page',
    );
    expect(() =>
      nestPages([
        {topic: 'a'},
        {topic: 'b', parent: 'a'},
        {topic: 'c', parent: 'b'},
      ]),
    ).toThrow('not a top-level page');
  });
});

describe('namespaceCategory', () => {
  it('prefers the namespace, then foundations only when every guide is', () => {
    expect(namespaceCategory('guide', ['foundations'])).toBe('guide');
    expect(namespaceCategory(null, ['foundations', 'foundations'])).toBe(
      'foundations',
    );
    expect(namespaceCategory(null, ['foundations', 'guide'])).toBe('guide');
    expect(namespaceCategory(null, [null])).toBe('guide');
  });
});

describe('mergeFlatTopics', () => {
  const flat = (topic: string, titles: string[]) => ({
    topic,
    title: topic,
    description: '',
    category: 'guide',
    sections: titles.map(t => section(t)),
  });

  it('shows the theme split on one theme page', () => {
    const {topics, redirects} = mergeFlatTopics([
      flat('theme', ['Wrap your app in a theme']),
      flat('use-a-theme', ['Wrap your app in a theme', 'Dark mode']),
      flat('author-a-theme', ['Custom themes']),
      flat('color', ['Overview']),
    ]);
    expect(topics.map(t => t.topic)).toEqual(['theme', 'color']);
    expect(topics[0].sections.map((s: {title: string}) => s.title)).toEqual([
      'Wrap your app in a theme',
      'Dark mode',
      'Custom themes',
    ]);
    expect(redirects).toEqual({
      'use-a-theme': '/docs/theme#wrap-your-app-in-a-theme',
      'author-a-theme': '/docs/theme#custom-themes',
    });
  });

  it('leaves the topics alone before the split', () => {
    const before = [flat('theme', ['Dark mode']), flat('tokens', ['Color'])];
    expect(mergeFlatTopics(before)).toEqual({topics: before, redirects: {}});
  });

  it('keeps token data off the site', () => {
    const {topics, redirects} = mergeFlatTopics([flat('token-tables', ['A'])]);
    expect(topics).toEqual([]);
    expect(redirects).toEqual({'token-tables': '/docs/tokens'});
  });
});

describe('sectionAnchors', () => {
  it('matches the page outline, repeats and heading blocks included', () => {
    const sections = [
      {
        title: 'Overview',
        content: [{type: 'heading', text: 'Overview'}],
      },
      section('Overview'),
      section('Best Practices'),
      section('Best practices'),
    ];
    expect(sectionAnchors(sections)).toEqual(
      buildOutline(sections as DocSection[]).sectionIds,
    );
  });
});
