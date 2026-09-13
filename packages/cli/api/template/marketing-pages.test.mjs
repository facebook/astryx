// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Contract tests for the marketing page-template set.
 *
 * A page template earns its place by being *retrievable*: `search()` has to
 * answer the prompt-class it was written for. These tests state that contract
 * for the marketing set, and pin the authoring rules a template must satisfy to
 * score on the audit rubric (component purity, semantic tokens, doc metadata).
 *
 * The registration check runs over EVERY page template, not just the marketing
 * ones: a page on disk with no entry in the docsite's lazy-import map renders a
 * blank preview, which is invisible until someone opens the gallery.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search} from '../search/search.mjs';
import {discoverTemplates} from './template.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const cwd = REPO;
const SLOW = 30_000;

const PAGES_DIR = path.join(REPO, 'packages/cli/assets/templates/pages');
const CATEGORY_TYPE = path.join(
  REPO,
  'packages/cli/authoring/doctypes/template/type.ts',
);
const DOCSITE_REGISTRY = path.join(
  REPO,
  'apps/docsite/src/components/templateComponents.ts',
);

/** The set this issue adds, with the prompt-class each one has to answer. */
const MARKETING_PAGES = [
  {slug: 'marketing-landing', category: 'Marketing - Landing', query: 'landing page'},
  {slug: 'marketing-pricing', category: 'Marketing - Pricing', query: 'pricing page'},
  {
    slug: 'marketing-feature-sections',
    category: 'Marketing - Feature Sections',
    query: 'feature sections',
  },
  {slug: 'marketing-footer', category: 'Marketing - Footer', query: 'footer'},
];

/** @param {string} slug */
const pageSource = slug => fs.readFileSync(path.join(PAGES_DIR, slug, 'page.tsx'), 'utf8');

/**
 * Rank of a page template in a query's page-only results, or -1.
 * @param {string} query
 * @param {string} slug
 */
async function pageRank(query, slug) {
  const {data} = await search(query, {cwd, type: 'template', limit: 400});
  const pages = data.results.filter(r => r.kind === 'page');
  return pages.findIndex(p => p.name === slug);
}

describe('marketing pages — answer the prompt-class they were written for', () => {
  for (const {slug, query} of MARKETING_PAGES) {
    it(`ranks ${slug} first for "${query}"`, async () => {
      expect(await pageRank(query, slug)).toBe(0);
    }, SLOW);
  }
});

describe('marketing pages — authoring contract', () => {
  it('declares every category in the TemplateCategory taxonomy', () => {
    const taxonomy = fs.readFileSync(CATEGORY_TYPE, 'utf8');
    for (const {category} of MARKETING_PAGES) {
      expect(taxonomy).toContain(`'${category}'`);
    }
  });

  it('sets the declared category on each template doc', async () => {
    const templates = await discoverTemplates(cwd);
    for (const {slug, category} of MARKETING_PAGES) {
      const t = templates.find(x => x.dirName === slug && x.type === 'page');
      expect(t, `${slug} is not discoverable`).toBeTruthy();
      expect(t.category).toBe(category);
      expect(t.description.length).toBeGreaterThan(20);
    }
  }, SLOW);

  it('composes Astryx components instead of the raw HTML they cover', () => {
    // The audit rubric's largest dimension is component purity (30 of 100).
    // `img` is allowed: Astryx has no image primitive.
    const banned = /<(button|h[1-6]|a|input|select|textarea|table|ul|ol|li|p)[\s>]/;
    for (const {slug} of MARKETING_PAGES) {
      expect(banned.test(pageSource(slug)), `${slug} uses a raw HTML element`).toBe(false);
    }
  });

  it('uses semantic tokens, never hardcoded colors', () => {
    for (const {slug} of MARKETING_PAGES) {
      const src = pageSource(slug);
      expect(/#[0-9a-fA-F]{3,8}\b/.test(src), `${slug} hardcodes a hex color`).toBe(false);
      expect(/\brgba?\(/.test(src), `${slug} hardcodes an rgb color`).toBe(false);
    }
  });
});

describe('page templates — the gallery and the disk agree', () => {
  const registry = () => fs.readFileSync(DOCSITE_REGISTRY, 'utf8');
  const pageDirs = () =>
    fs
      .readdirSync(PAGES_DIR, {withFileTypes: true})
      .filter(e => e.isDirectory())
      .map(e => e.name);

  /**
   * Pages the overview gallery actually renders. A WIP (`isReady: false`) or
   * deliberately hidden page is staged, not shown, so it needs no entry.
   */
  const galleryVisible = () =>
    pageDirs().filter(slug => {
      const doc = fs.readFileSync(path.join(PAGES_DIR, slug, 'template.doc.mjs'), 'utf8');
      return /isReady:\s*true/.test(doc) && !/isHiddenFromOverview:\s*true/.test(doc);
    });

  it('gives every gallery-visible page a lazy-import entry', () => {
    // Without one the gallery renders a blank card, which is invisible until
    // someone opens the page.
    const reg = registry();
    expect(galleryVisible().filter(slug => !reg.includes(`pages/${slug}/page'`))).toEqual([]);
  });

  it('has no lazy-import entry pointing at a page that no longer exists', () => {
    const onDisk = new Set(pageDirs());
    const registered = [...registry().matchAll(/pages\/([a-z0-9-]+)\/page'/g)].map(m => m[1]);
    expect(registered.filter(slug => !onDisk.has(slug))).toEqual([]);
  });
});
