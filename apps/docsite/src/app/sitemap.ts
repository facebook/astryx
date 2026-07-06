// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sitemap.ts
 *
 * Dynamic sitemap for the docsite. Next.js serves this at /sitemap.xml and
 * regenerates it on every build, so the URL set tracks the same generated
 * registries that drive the routes themselves — add a component, doc topic,
 * template, or blog post and it appears in the sitemap with no manual edit.
 *
 * Mirrors the `generateStaticParams` of each dynamic route so the sitemap and
 * the actual rendered pages never drift:
 *   - /components/[name]   ← flattenComponentSidebarEntries()
 *   - /docs/[topic]        ← docTopics + non-theme packages
 *   - /templates/[slug]    ← templates
 *   - /blog/[slug]         ← blogPosts
 *
 * @output MetadataRoute.Sitemap consumed by Next.js to emit /sitemap.xml
 */

import type {MetadataRoute} from 'next';
import {cacheLife} from 'next/cache';
import {SITE_URL} from '../lib/siteConfig';
import {flattenComponentSidebarEntries} from '../components/componentSidebarData';
import {docTopics} from '../generated/docsRegistry';
import {packages} from '../generated/packageRegistry';
import {templates} from '../generated/templateRegistry';
import {blogPosts} from '../generated/blogRegistry';

// Theme packages don't get a /docs/[topic] reference page (see the docs route's
// own filter); keep the sitemap aligned with what actually renders.
function isThemePackage(name: string): boolean {
  return name.includes('theme-');
}

function url(path: string): string {
  return new URL(path, SITE_URL).toString();
}

async function getLastModified(): Promise<Date> {
  'use cache';
  cacheLife('days');
  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = await getLastModified();

  // Static, hand-authored pages. `priority` is a relative hint to crawlers;
  // the home page and primary galleries rank highest.
  const staticEntries: MetadataRoute.Sitemap = [
    {url: url('/'), changeFrequency: 'weekly', priority: 1},
    {url: url('/components'), changeFrequency: 'weekly', priority: 0.9},
    {url: url('/docs'), changeFrequency: 'weekly', priority: 0.9},
    {url: url('/templates'), changeFrequency: 'weekly', priority: 0.8},
    {url: url('/themes'), changeFrequency: 'weekly', priority: 0.8},
    {url: url('/blog'), changeFrequency: 'weekly', priority: 0.8},
    {url: url('/changelog'), changeFrequency: 'weekly', priority: 0.6},
    {url: url('/community'), changeFrequency: 'monthly', priority: 0.5},
    {url: url('/playground'), changeFrequency: 'monthly', priority: 0.6},
  ];

  const componentEntries: MetadataRoute.Sitemap =
    flattenComponentSidebarEntries().map(c => ({
      url: url(`/components/${c.name}`),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

  const docTopicEntries: MetadataRoute.Sitemap = [
    ...docTopics.map(d => d.topic),
    ...packages
      .filter(p => !isThemePackage(p.name))
      .map(p => p.name.replace('@astryxdesign/', '')),
  ].map(topic => ({
    url: url(`/docs/${topic}`),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const templateEntries: MetadataRoute.Sitemap = templates.map(t => ({
    url: url(`/templates/${t.slug}`),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map(p => ({
    url: url(`/blog/${p.slug}`),
    // Use the post's own publish date as lastModified when present.
    lastModified: p.date ? new Date(p.date) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [
    ...staticEntries,
    ...componentEntries,
    ...docTopicEntries,
    ...templateEntries,
    ...blogEntries,
  ];
}
