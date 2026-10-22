// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  docAnchors,
  docGuides,
  docRedirects,
  docTopics,
  docsTreeRoutes,
} from '../generated/docsRegistry';
import type {DocLink} from '../generated/docsRegistry';
import {packages} from '../generated/packageRegistry';
import {linkifyCode} from '../components/codeLinkifiers';
import {buildOutline} from '../components/docs/docOutline';

/**
 * The twelve guides and Reference, in the order `astryx docs` lists them.
 * The sidebar follows this order, not A to Z.
 */
const GUIDES = [
  'get-started',
  'work-with-agents',
  'build-a-page',
  'find-a-component',
  'theme-your-app',
  'style-components',
  'foundations',
  'check-your-code',
  'upgrade-and-migrate',
  'translate-your-app',
  'make-an-integration',
  'fix-a-problem',
  'reference',
];

/** Foundations, as it always listed: one page per topic. */
const FOUNDATIONS = [
  ['All Tokens', 'tokens'],
  ['Color', 'color'],
  ['Elevation', 'elevation'],
  ['Icons', 'icons'],
  ['Illustrations', 'illustrations'],
  ['Motion', 'motion'],
  ['Shape', 'shape'],
  ['Spacing', 'spacing'],
  ['Typography', 'typography'],
];

/**
 * Every other topic page the site had before the docs were organized into
 * twelve guides, and the page that holds its text now. A reorganization
 * changes where a reader finds a doc, never whether an old link opens it.
 */
const PAGES_BEFORE_THE_GUIDES: Record<string, string> = {
  authoring: 'make-an-integration',
  'browser-support': 'reference-browser-support',
  'cli-component-lookups': 'find-a-component-search-and-read',
  'cli-host-entry': 'reference-host-entry',
  'getting-started': 'get-started-add-to-a-project',
  global: 'get-started-on-your-computer',
  internationalization: 'translate-your-app',
  'is-my-code-good': 'check-your-code-agent-review',
  layout: 'build-a-page',
  migration: 'upgrade-and-migrate-move-an-app',
  principles: 'get-started-principles',
  styling: 'style-components',
  'styling-libraries': 'style-components',
  'styling-overview': 'style-components-css-setup',
  theme: 'theme-your-app',
  'working-with-ai': 'work-with-agents-agent-setup',
  'use-integrations': 'find-a-component-use-integrations',
};

const pageBySlug = new Map(docTopics.map(topic => [topic.topic, topic]));

/** Every link below a guide in the sidebar. */
function allLinks(links: DocLink[]): DocLink[] {
  return links.flatMap(link => [link, ...allLinks(link.children ?? [])]);
}

describe('route resolution', () => {
  it('has a short landing page per guide, in reading order, and Foundations as before', () => {
    expect(docGuides.map(guide => guide.topic)).toEqual(GUIDES);
    for (const guide of docGuides) {
      expect(guide.promise, guide.topic).toMatch(/^[A-Z].+\.$/);
      expect(guide.command, guide.topic).toMatch(/^npx @astryxdesign\/cli /);
      expect(guide.children.length, guide.topic).toBeGreaterThan(0);
      for (const link of allLinks(guide.children)) {
        expect(pageBySlug.has(link.href.slice('/docs/'.length)), link.href).toBe(
          true,
        );
      }
      if (guide.topic === 'foundations') continue;
      expect(guide.href, guide.topic).toBe(`/docs/${guide.topic}`);
      const page = pageBySlug.get(guide.topic);
      // A landing page links to its children instead of pasting their text.
      expect(page?.children?.length, guide.topic).toBeGreaterThan(0);
      expect(page?.sections.length ?? 0, guide.topic).toBeLessThanOrEqual(1);
      for (const child of guide.children) {
        expect(child.href, child.title).toMatch(
          new RegExp(`^/docs/${guide.topic}-`),
        );
      }
    }
  });

  it('keeps Foundations as it was: one page per topic, in the same order', () => {
    const foundations = docGuides.find(guide => guide.topic === 'foundations');
    expect(foundations?.href).toBeNull();
    expect(
      foundations?.children.map(child => [
        child.title,
        child.href.slice('/docs/'.length),
      ]),
    ).toEqual(FOUNDATIONS);
    for (const [, slug] of FOUNDATIONS) {
      expect(pageBySlug.get(slug)?.category, slug).toBe('foundations');
      expect(pageBySlug.get(slug)?.children, slug).toBeUndefined();
      expect(docRedirects[slug], slug).toBeUndefined();
    }
  });

  it.each(Object.entries(PAGES_BEFORE_THE_GUIDES))(
    '/docs/%s opens the %s page',
    (slug, target) => {
      expect(pageBySlug.has(slug), `${slug} is still a page`).toBe(false);
      expect(docRedirects[slug], slug).toMatch(
        new RegExp(`^/docs/${target}(#|$)`),
      );
    },
  );

  it('sends the old Build a page section anchors to the page that holds them', () => {
    const anchors = docAnchors['build-a-page'] ?? {};
    for (const [anchor, page] of [
      ['scaffold', 'build-a-page-scaffold'],
      ['shell', 'build-a-page-scaffold'],
      ['structure', 'build-a-page-structure'],
      ['headers-and-footers', 'build-a-page-headers-and-footers'],
      ['side-panels', 'build-a-page-side-panels'],
      ['responsive-contract', 'build-a-page-responsive'],
    ]) {
      expect(anchors[anchor], anchor).toMatch(new RegExp(`^/docs/${page}(#|$)`));
    }
    for (const href of Object.values(anchors)) {
      const [, target, anchor] = /^\/docs\/([^#]+)(?:#(.+))?$/.exec(href) ?? [];
      const page = pageBySlug.get(target);
      expect(page, href).toBeDefined();
      if (anchor) {
        expect(buildOutline(page?.sections ?? []).sectionIds).toContain(anchor);
      }
    }
  });

  it('shows the full theme text on the Theme your app pages', () => {
    const titles = ['theme-your-app-use-a-theme', 'theme-your-app-author-a-theme']
      .flatMap(slug => pageBySlug.get(slug)?.sections.map(s => s.title) ?? []);
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

  it('opens every integration guide on its own page, from each older slug too', () => {
    let guides = 0;
    for (const route of docsTreeRoutes) {
      if (!route.startsWith('make-an-integration/')) {
        continue;
      }
      const slug = route.replaceAll('/', '-');
      if (!pageBySlug.has(slug)) {
        continue;
      }
      guides++;
      const rest = slug.slice('make-an-integration-'.length);
      // The slugs from when the guides sat under authoring and cli/integrations.
      for (const old of [`authoring-${rest}`, `cli-integrations-${rest}`]) {
        expect(docRedirects[old], old).toBe(`/docs/${slug}`);
      }
    }
    expect(guides).toBeGreaterThan(40);
    for (const old of ['cli-integrations', 'cli-integrations-overview']) {
      expect(docRedirects[old], old).toBe('/docs/make-an-integration');
    }
    expect(docRedirects['cli-writing-docs']).toBe(
      '/docs/make-an-integration-building-blocks-docs',
    );
  });

  it('opens global mode on its own page, from its older slugs too', () => {
    const href = '/docs/get-started-on-your-computer';
    expect(pageBySlug.get('get-started-on-your-computer')?.children?.length).toBeGreaterThan(0);
    for (const old of ['global', 'cli-global', 'cli-install-once']) {
      expect(docRedirects[old], old).toBe(href);
    }
    for (const route of docsTreeRoutes) {
      if (!route.startsWith('get-started/on-your-computer/')) {
        continue;
      }
      const slug = route.replaceAll('/', '-');
      expect(pageBySlug.has(slug), slug).toBe(true);
      const old = `global-${route.slice('get-started/on-your-computer/'.length)}`;
      expect(docRedirects[old], old).toBe(`/docs/${slug}`);
    }
  });

  it('shows commands that reach the CLI: npx @astryxdesign/cli, and plain astryx in the global mode pages', () => {
    const start = pageBySlug.get('get-started-add-to-a-project')!;
    expect(JSON.stringify(start.sections)).toContain('npx @astryxdesign/cli');
    // The global mode pages are read by someone who installed the CLI.
    const global = JSON.stringify(
      pageBySlug.get('get-started-on-your-computer-install-once')?.sections,
    );
    expect(global).toContain('npm i -g @astryxdesign/cli');
    expect(global).not.toContain('npx @astryxdesign/cli docs');
  });

  it('keeps /docs/cli the CLI package page', () => {
    expect(pageBySlug.has('cli')).toBe(false);
    expect(docRedirects.cli).toBeUndefined();
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

  it('redirects each old slug to a page, or a section of one, never to another redirect', () => {
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

  it('opens a guide below a guide on its own page', () => {
    expect(linkifyCode('astryx docs build-a-page/side-panels')).toBe(
      '/docs/build-a-page-side-panels',
    );
    expect(linkifyCode('astryx docs build-a-page')).toBe('/docs/build-a-page');
  });

  it('links every doc page from `astryx docs <slug>`', () => {
    for (const {topic} of docTopics) {
      expect(linkifyCode(`astryx docs ${topic}`)).toBe(`/docs/${topic}`);
    }
  });
});
