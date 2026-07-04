// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the shared page-metadata helper and per-page coverage.
 *
 * Verifies that pageMetadata() produces a plain title (the root layout template
 * appends "· Astryx"), a self-referencing canonical, and branded social cards,
 * and that the generated registries carry the fields the dynamic routes feed
 * into it, so component and doc pages get unique, non-empty metadata instead
 * of the inherited site default.
 *
 * Run: pnpm -F @astryxdesign/docsite test
 */

import {describe, it, expect} from 'vitest';
import {pageMetadata} from '../lib/pageMetadata';
import {SITE_NAME} from '../lib/siteConfig';
import {components} from '../generated/componentRegistry';
import {docTopics} from '../generated/docsRegistry';

const allComponents = Object.values(components).flat();

describe('pageMetadata', () => {
  const meta = pageMetadata({
    title: 'Button',
    description: 'Triggers an action when clicked.',
    path: '/components/Button',
    type: 'article',
  });

  it('passes the plain title through (root template adds the brand)', () => {
    expect(meta.title).toBe('Button');
  });

  it('sets a self-referencing canonical URL', () => {
    expect(meta.alternates?.canonical).toBe('/components/Button');
  });

  it('brands the OpenGraph + Twitter titles to match the tab', () => {
    expect(meta.openGraph?.title).toBe(`Button · ${SITE_NAME}`);
    expect(meta.twitter?.title).toBe(`Button · ${SITE_NAME}`);
  });

  it('carries the OpenGraph url and type', () => {
    expect(meta.openGraph?.url).toBe('/components/Button');
    expect((meta.openGraph as {type?: string}).type).toBe('article');
  });

  it('re-states the branded social image on both cards', () => {
    expect(JSON.stringify(meta.openGraph?.images)).toContain('Astryx-Banner');
    expect(JSON.stringify(meta.twitter?.images)).toContain('Astryx-Banner');
  });

  it('defaults the OpenGraph type to website', () => {
    const website = pageMetadata({
      title: 'Themes',
      description: 'Browse every theme.',
      path: '/themes',
    });
    expect((website.openGraph as {type?: string}).type).toBe('website');
  });
});

describe('dynamic-route metadata coverage', () => {
  it('every component has a display name to title the page', () => {
    for (const c of allComponents) {
      expect(c.displayName.length).toBeGreaterThan(0);
    }
  });

  it('every doc topic has a non-empty title and description', () => {
    for (const t of docTopics) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });

  it('produces a unique canonical URL per component', () => {
    const canonicals = allComponents.map(
      c =>
        pageMetadata({
          title: c.displayName,
          description: c.description || `The ${c.displayName} component.`,
          path: `/components/${c.name}`,
        }).alternates?.canonical,
    );
    expect(new Set(canonicals).size).toBe(canonicals.length);
  });
});
