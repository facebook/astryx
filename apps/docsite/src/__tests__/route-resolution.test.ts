// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  docGuides,
  docRedirects,
  docTopics,
  docsTreeRoutes,
} from '../generated/docsRegistry';
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

/**
 * Every topic page the site had before the docs were organized into twelve
 * guides, and the guide page that holds its text now. A reorganization
 * changes where a reader finds a doc, never whether an old link opens it.
 */
const PAGES_BEFORE_THE_GUIDES: Record<string, string> = {
  authoring: 'make-an-integration',
  'browser-support': 'reference',
  'cli-component-lookups': 'find-a-component',
  'cli-host-entry': 'reference',
  color: 'foundations',
  elevation: 'foundations',
  'getting-started': 'get-started',
  global: 'get-started',
  icons: 'foundations',
  illustrations: 'foundations',
  internationalization: 'translate-your-app',
  'is-my-code-good': 'check-your-code',
  layout: 'build-a-page',
  migration: 'upgrade-and-migrate',
  motion: 'foundations',
  principles: 'foundations',
  shape: 'foundations',
  spacing: 'foundations',
  styling: 'style-components',
  'styling-libraries': 'style-components',
  'styling-overview': 'style-components',
  theme: 'theme-your-app',
  tokens: 'foundations',
  typography: 'foundations',
  'working-with-ai': 'work-with-agents',
  'use-integrations': 'find-a-component',
};

const pageBySlug = new Map(docTopics.map(topic => [topic.topic, topic]));

describe('route resolution', () => {
  it('has one page per guide, in reading order, and no other doc page', () => {
    expect(docGuides.map(guide => guide.topic)).toEqual(GUIDES);
    expect([...pageBySlug.keys()].sort()).toEqual([...GUIDES].sort());
    for (const guide of docGuides) {
      const page = pageBySlug.get(guide.topic);
      expect(page?.sections.length, guide.topic).toBeGreaterThan(0);
      expect(guide.promise, guide.topic).toMatch(/^[A-Z].+\.$/);
      expect(guide.command, guide.topic).toMatch(/^npx @astryxdesign\/cli /);
    }
    // Each of the twelve guides offers up to three children on the home page.
    for (const guide of docGuides.slice(0, 12)) {
      expect(guide.children.length, guide.topic).toBeGreaterThan(0);
      expect(guide.children.length, guide.topic).toBeLessThanOrEqual(3);
      for (const child of guide.children) {
        expect(child.href, child.title).toMatch(
          new RegExp(`^/docs/${guide.topic}(#|$)`),
        );
      }
    }
  });

  it.each(Object.entries(PAGES_BEFORE_THE_GUIDES))(
    '/docs/%s opens the %s page',
    (slug, guide) => {
      expect(pageBySlug.has(slug), `${slug} is still a page`).toBe(false);
      expect(docRedirects[slug], slug).toMatch(
        new RegExp(`^/docs/${guide}(#|$)`),
      );
    },
  );

  it('keeps the old layout section anchors on the Build a page page', () => {
    const page = pageBySlug.get('build-a-page');
    const ids = buildOutline(page?.sections ?? []).sectionIds;
    for (const anchor of [
      'scaffold',
      'shell',
      'navigation',
      'structure',
      'headers-and-footers',
      'side-panels',
      'breakpoints',
      'responsive-contract',
    ]) {
      expect(ids).toContain(anchor);
    }
  });

  it('shows the full theme text on the Theme your app page', () => {
    const titles =
      pageBySlug.get('theme-your-app')?.sections.map(s => s.title) ?? [];
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

  it('opens every integration guide at its section, from each older slug too', () => {
    let guides = 0;
    for (const route of docsTreeRoutes) {
      if (!route.startsWith('make-an-integration/')) {
        continue;
      }
      guides++;
      const slug = route.replaceAll('/', '-');
      const rest = slug.slice('make-an-integration-'.length);
      expect(pageBySlug.has(slug), slug).toBe(false);
      expect(docRedirects[slug], slug).toMatch(
        /^\/docs\/make-an-integration(#|$)/,
      );
      // The slugs from when the guides sat under authoring and cli/integrations.
      for (const old of [`authoring-${rest}`, `cli-integrations-${rest}`]) {
        expect(docRedirects[old], old).toBe(docRedirects[slug]);
      }
    }
    expect(guides).toBeGreaterThan(40);
    for (const old of ['cli-integrations', 'cli-integrations-overview']) {
      expect(docRedirects[old], old).toBe('/docs/make-an-integration');
    }
    expect(docRedirects['cli-writing-docs']).toBe(
      docRedirects['make-an-integration-building-blocks-docs'],
    );
  });

  it('opens global mode on the Get started page, from its older slugs too', () => {
    const href = docRedirects['get-started-on-your-computer'];
    expect(href).toMatch(/^\/docs\/get-started#/);
    for (const old of ['global', 'cli-global', 'cli-install-once']) {
      expect(docRedirects[old], old).toBe(href);
    }
    for (const route of docsTreeRoutes) {
      if (!route.startsWith('get-started/on-your-computer/')) {
        continue;
      }
      const slug = route.replaceAll('/', '-');
      expect(docRedirects[slug], slug).toMatch(/^\/docs\/get-started#/);
      const old = `global-${route.slice('get-started/on-your-computer/'.length)}`;
      expect(docRedirects[old], old).toBe(docRedirects[slug]);
    }
  });

  it('shows commands that reach the CLI: npx @astryxdesign/cli, and plain astryx in the global mode sections', () => {
    const start = pageBySlug.get('get-started')!;
    const text = JSON.stringify(start.sections);
    expect(text).toContain('npx @astryxdesign/cli');
    // The global mode sections are read by someone who installed the CLI.
    const anchors = buildOutline(start.sections).sectionIds;
    const at = anchors.indexOf(
      (docRedirects['get-started-on-your-computer'] ?? '').split('#')[1],
    );
    expect(at).toBeGreaterThan(0);
    const global = JSON.stringify(start.sections.slice(at));
    expect(global).toContain('npm i -g @astryxdesign/cli');
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

  it('opens a guide under a guide page at its section', () => {
    expect(linkifyCode('astryx docs build-a-page/side-panels')).toBe(
      '/docs/build-a-page#side-panels',
    );
    expect(linkifyCode('astryx docs build-a-page')).toBe('/docs/build-a-page');
  });

  it('links every doc page from `astryx docs <slug>`', () => {
    for (const {topic} of docTopics) {
      expect(linkifyCode(`astryx docs ${topic}`)).toBe(`/docs/${topic}`);
    }
  });
});
