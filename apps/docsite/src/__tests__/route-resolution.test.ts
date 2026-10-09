// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  docRedirects,
  docTopics,
  docsTreeRoutes,
} from '../generated/docsRegistry';
import {packages} from '../generated/packageRegistry';
import {linkifyCode} from '../components/codeLinkifiers';
import {buildOutline} from '../components/docs/docOutline';

/**
 * Every topic page the site had before the CLI's docs were split into
 * docs-tree namespaces, with its sidebar group. A split changes how agents
 * read a topic, never where a reader finds it: each slug keeps one page in the
 * same group. The CLI's integration guides were split earlier, from the CLI
 * Integrations and Writing docs pages; those two pages are back too.
 */
const PAGES_BEFORE_THE_SPLITS: Record<string, 'guide' | 'foundations'> = {
  authoring: 'guide',
  'browser-support': 'guide',
  'cli-component-lookups': 'guide',
  'cli-integrations': 'guide',
  'cli-writing-docs': 'guide',
  color: 'foundations',
  elevation: 'foundations',
  'getting-started': 'guide',
  icons: 'foundations',
  illustrations: 'foundations',
  internationalization: 'guide',
  layout: 'guide',
  migration: 'guide',
  motion: 'foundations',
  principles: 'guide',
  shape: 'foundations',
  spacing: 'foundations',
  styling: 'guide',
  'styling-libraries': 'guide',
  theme: 'guide',
  tokens: 'foundations',
  typography: 'foundations',
  'working-with-ai': 'guide',
};

const pageBySlug = new Map(docTopics.map(topic => [topic.topic, topic]));

describe('route resolution', () => {
  it.each(Object.entries(PAGES_BEFORE_THE_SPLITS))(
    '/docs/%s still has a page in the %s group',
    (slug, category) => {
      const page = pageBySlug.get(slug);
      expect(page, `/docs/${slug} lost its page`).toBeDefined();
      expect(page?.category).toBe(category);
      expect(page?.sections.length).toBeGreaterThan(0);
    },
  );

  it('keeps the layout page whole, with its old section anchors', () => {
    const layout = pageBySlug.get('layout');
    const ids = buildOutline(layout?.sections ?? []).sectionIds;
    for (const anchor of [
      'scaffold',
      'shell',
      'navigation',
      'structure',
      'headers-and-footers',
      'side-panels',
      'spacing',
      'breakpoints',
      'responsive-contract',
    ]) {
      expect(ids).toContain(anchor);
    }
  });

  it('shows the full theme text on the theme page', () => {
    const titles = pageBySlug.get('theme')?.sections.map(s => s.title) ?? [];
    for (const title of [
      'Wrap your app in a theme',
      'Available Themes',
      'Custom themes',
      'defineTheme',
      'Dark mode',
      'useTheme Hook',
    ]) {
      expect(titles).toContain(title);
    }
  });

  it('lists the guides the sidebar listed before the splits, plus new topics only', () => {
    // The top level of the Guide section as it was before the CLI integration
    // guide and the other topics were split into short guides.
    // `styling-overview` is a topic added since. Writing docs and the
    // Authoring Reference show under CLI Integrations.
    const sidebarGuides = docTopics
      .filter(
        d =>
          d.category === 'guide' && d.topic !== 'getting-started' && !d.parent,
      )
      .map(d => d.topic)
      .sort();
    expect(sidebarGuides).toEqual(
      [
        'browser-support',
        'cli-component-lookups',
        'cli-integrations',
        'internationalization',
        'layout',
        'migration',
        'principles',
        'styling',
        'styling-libraries',
        'styling-overview',
        'theme',
        'working-with-ai',
      ].sort(),
    );
  });

  it('shows the integration guide as pages under CLI Integrations, the Authoring Reference last', () => {
    const under = docTopics
      .filter(d => d.parent === 'cli-integrations')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map(d => d.title);
    expect(under).toEqual([
      'Components',
      'Templates',
      'Themes',
      'Writing docs',
      'Codemods',
      'Configuration',
      'Ship',
      'Troubleshooting',
      'Authoring Reference',
    ]);
  });

  it('opens every CLI integration guide on its page or at its section on one', () => {
    const integrationPages = new Set([
      'cli-integrations',
      ...docTopics
        .filter(d => d.parent === 'cli-integrations')
        .map(d => d.topic),
    ]);
    for (const route of docsTreeRoutes) {
      if (!route.startsWith('cli/integrations/')) {
        continue;
      }
      const slug = route.replaceAll('/', '-');
      if (pageBySlug.has(slug)) {
        expect(pageBySlug.get(slug)?.parent, slug).toBe('cli-integrations');
        continue;
      }
      const [, target] =
        /^\/docs\/([^#]+)/.exec(docRedirects[slug] ?? '') ?? [];
      expect(
        integrationPages.has(target),
        `${slug} -> ${docRedirects[slug]}`,
      ).toBe(true);
    }
    expect(docRedirects['cli-integrations-overview']).toBe(
      '/docs/cli-integrations',
    );
    expect(docRedirects['cli-integrations-docs-add-a-topic']).toBe(
      '/docs/cli-writing-docs',
    );
  });

  it('keeps /docs/cli the CLI package page', () => {
    expect(pageBySlug.has('cli')).toBe(false);
    expect(packages.some(pkg => pkg.name === '@astryxdesign/cli')).toBe(true);
  });

  it('gives no doc page the slug of a package page', () => {
    const packageSlugs = packages.map(pkg =>
      pkg.name.replace('@astryxdesign/', ''),
    );
    for (const slug of packageSlugs) {
      expect(pageBySlug.has(slug), slug).toBe(false);
    }
  });

  it('redirects each folded slug to a section of a page, never a page of its own', () => {
    for (const [slug, href] of Object.entries(docRedirects)) {
      expect(pageBySlug.has(slug), `${slug} is a page and a redirect`).toBe(
        false,
      );
      const [, target, anchor] = /^\/docs\/([^#]+)(?:#(.+))?$/.exec(href) ?? [];
      const page = pageBySlug.get(target);
      expect(page, `${slug} -> ${href}`).toBeDefined();
      if (anchor) {
        expect(buildOutline(page?.sections ?? []).sectionIds).toContain(anchor);
      }
    }
  });

  it('opens a guide under a namespace page at its section', () => {
    if (docsTreeRoutes.includes('layout/side-panels')) {
      expect(linkifyCode('astryx docs layout/side-panels')).toBe(
        '/docs/layout#side-panels',
      );
    }
    expect(linkifyCode('astryx docs layout')).toBe('/docs/layout');
  });

  it('links every doc page from `astryx docs <slug>`', () => {
    for (const {topic} of docTopics) {
      expect(linkifyCode(`astryx docs ${topic}`)).toBe(`/docs/${topic}`);
    }
  });
});
