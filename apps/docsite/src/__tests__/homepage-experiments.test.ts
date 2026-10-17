// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Homepage experiment contract tests.
 * @input Pure variant configuration plus route and crawler source files
 * @output Guards the control, `/e1`, and `/e2` treatments and keeps experiments unlinked
 * @position Focused regression coverage for direct-route homepage experiments
 */

import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {describe, expect, it, vi} from 'vitest';

vi.mock('next/cache', () => ({cacheLife: () => {}}));
import {GITHUB_REPO} from '../constants';
import {
  CORE_PACKAGE_URL,
  HOME_PAGE_VARIANTS,
} from '../app/(site)/_landing/homePageVariants';
import sitemap from '../app/sitemap';
import {metadata as experimentMetadata} from '../app/(site)/(experiments)/layout';

const ROOT = resolve(import.meta.dirname, '..');
const source = (path: string) => readFileSync(resolve(ROOT, path), 'utf8');

describe('homepage experiments', () => {
  it('keeps the public homepage on the current treatment', () => {
    expect(HOME_PAGE_VARIANTS.control).toEqual({
      primaryHref: '/docs/getting-started',
      supportingContent: 'frameworks',
    });
  });

  it('changes only the supporting line on /e1', () => {
    expect(HOME_PAGE_VARIANTS.e1).toEqual({
      primaryHref: HOME_PAGE_VARIANTS.control.primaryHref,
      supportingContent: 'install-and-source',
    });
    expect(CORE_PACKAGE_URL).toBe(
      'https://www.npmjs.com/package/@astryxdesign/core',
    );
  });

  it('changes only the primary destination on /e2', () => {
    expect(HOME_PAGE_VARIANTS.e2).toEqual({
      primaryHref: GITHUB_REPO,
      supportingContent: HOME_PAGE_VARIANTS.control.supportingContent,
    });
  });

  it('renders every route through one shared homepage implementation', () => {
    expect(source('app/(site)/page.tsx')).toContain(
      '<HomePage variant="control" />',
    );
    expect(source('app/(site)/(experiments)/e1/page.tsx')).toContain(
      '<HomePage variant="e1" />',
    );
    expect(source('app/(site)/(experiments)/e2/page.tsx')).toContain(
      '<HomePage variant="e2" />',
    );
  });

  it('keeps experiment routes unlinked and out of search indexes', async () => {
    const urls = (await sitemap()).map(entry => new URL(entry.url).pathname);
    expect(urls).not.toContain('/e1');
    expect(urls).not.toContain('/e2');
    expect(experimentMetadata.robots).toEqual({
      index: false,
      follow: false,
    });
  });
});
