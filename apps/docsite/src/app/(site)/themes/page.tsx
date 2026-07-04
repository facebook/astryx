// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Themes page — /themes
 *
 * Single canonical surface for browsing every Astryx theme. Renders the
 * full live ThemePackagePage (sidebar picker + themed preview
 * mockup + card showcase), seeded with the Neutral theme as the
 * default selection.
 *
 * The legacy per-theme route at /themes/<name> still resolves —
 * it now redirects here with ?theme=<slug>, which this page reads
 * to preselect the right theme in the sidebar so deep links from
 * docs, search, and shared URLs land on the requested theme rather
 * than the default seed.
 */

import type {Metadata} from 'next';
import {Suspense} from 'react';
import {notFound} from 'next/navigation';
import {Section} from '@astryxdesign/core/Section';
import {packages} from '../../../generated/packageRegistry';
import {themeObjects} from '../../../generated/themeRegistry';
import {ThemePackagePage} from '../../../components/ThemePackagePage';
import {pageMetadata} from '../../../lib/pageMetadata';

// Static canonical metadata for /themes. The page also accepts a `?theme=`
// param to preselect the picker, but every variant is the same surface, so the
// canonical stays the bare /themes path to avoid duplicate-URL dilution.
export const metadata: Metadata = pageMetadata({
  title: 'Themes',
  description:
    'Browse and preview every Astryx theme and see how design tokens, type, and components restyle across the gallery.',
  path: '/themes',
});

// Default seed for the page — the picker opens with this theme
// selected on first visit. Neutral is the most restrained / brand-
// neutral theme in the gallery, so it sets a calm baseline before
// users browse into the more expressive themes (Y2K, Butter, etc.).
const DEFAULT_THEME_PACKAGE = '@astryxdesign/theme-neutral';

function slugToPackageName(slug: string): string {
  return `@astryxdesign/theme-${slug}`;
}

export default function ThemesPage({
  searchParams,
}: {
  searchParams: Promise<{theme?: string | string[]}>;
}) {
  return (
    <Section maxWidth="lg" padding={6}>
      <Suspense fallback={null}>
        <SeededThemeExplorer searchParams={searchParams} />
      </Suspense>
    </Section>
  );
}

async function SeededThemeExplorer({
  searchParams,
}: {
  searchParams: Promise<{theme?: string | string[]}>;
}) {
  // ?theme=<slug> preselects the picker. Falls back to the Neutral
  // seed if the param is missing, malformed, or names a theme that
  // isn't in the registry (so a stale link doesn't 404 on us — the
  // user still lands on the explorer with a sensible default).
  const params = await searchParams;
  const rawSlug = params.theme;
  const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;

  const requestedPkgName = slug ? slugToPackageName(slug) : null;
  const requestedPkg = requestedPkgName
    ? packages.find(p => p.name === requestedPkgName)
    : undefined;
  const requestedTheme = requestedPkgName
    ? themeObjects[requestedPkgName]
    : undefined;

  // Use the requested theme if it resolved to a real package + theme
  // object; otherwise fall back to the default seed so stale links
  // still land on a usable page rather than a 404.
  const seedPkg =
    requestedPkg && requestedTheme
      ? requestedPkg
      : packages.find(p => p.name === DEFAULT_THEME_PACKAGE);
  const seedTheme =
    requestedPkg && requestedTheme
      ? requestedTheme
      : themeObjects[DEFAULT_THEME_PACKAGE];

  if (!seedPkg || !seedTheme) {
    // Defensive: only fires if the @astryxdesign/theme-neutral package is
    // ever removed from the workspace, which would break the entire
    // themes section anyway.
    notFound();
  }

  return <ThemePackagePage packageName={seedPkg.name} theme={seedTheme} />;
}
