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
    // The Guide section as it was before the CLI integration guide and the
    // other topics were split into short guides. `styling-overview` is a
    // topic added since.
    const sidebarGuides = docTopics
      .filter(d => d.category === 'guide' && d.topic !== 'getting-started')
      .map(d => d.topic)
      .sort();
    expect(sidebarGuides).toEqual(
      [
        'authoring',
        'browser-support',
        'cli-component-lookups',
        'cli-integrations',
        'cli-writing-docs',
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

  it('opens every CLI integration guide at its section on a full page', () => {
    for (const route of docsTreeRoutes) {
      if (!route.startsWith('cli/integrations/')) continue;
      const slug = route.replaceAll('/', '-');
      expect(pageBySlug.has(slug), slug).toBe(false);
      expect(docRedirects[slug], slug).toMatch(
        /^\/docs\/cli-(integrations|writing-docs)(#|$)/,
      );
    }
    expect(docRedirects['cli-integrations-overview']).toBe(
      '/docs/cli-integrations',
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
