// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useSearchParams} from 'next/navigation';
import {Section} from '@astryxdesign/core/Section';
import {packages} from '../../../generated/packageRegistry';
import {themeObjects} from '../../../generated/themeRegistry';
import {ThemePackagePage} from '../../../components/ThemePackagePage';

// Default seed — the picker opens with Neutral, the most restrained/brand-
// neutral theme, before users browse into the expressive ones (Y2K, Butter…).
const DEFAULT_THEME_PACKAGE = '@astryxdesign/theme-neutral';

function slugToPackageName(slug: string): string {
  return `@astryxdesign/theme-${slug}`;
}

/**
 * Client seed for /themes. Reads `?theme=<slug>` on the client via
 * useSearchParams so the page is compatible with the canary STATIC EXPORT
 * build (server `await searchParams` forces dynamic rendering, which
 * output:'export' forbids). Deep links still preselect the picker — the read
 * just happens in the browser. Falls back to the Neutral seed when the param
 * is missing/malformed/unknown so stale links never 404.
 */
export function ThemesExplorer() {
  const searchParams = useSearchParams();
  const rawSlug = searchParams.get('theme');
  const slug = rawSlug ?? undefined;

  const requestedPkgName = slug ? slugToPackageName(slug) : null;
  const requestedPkg = requestedPkgName
    ? packages.find(p => p.name === requestedPkgName)
    : undefined;
  const requestedTheme = requestedPkgName
    ? themeObjects[requestedPkgName]
    : undefined;

  const seedPkg =
    requestedPkg && requestedTheme
      ? requestedPkg
      : packages.find(p => p.name === DEFAULT_THEME_PACKAGE);
  const seedTheme =
    requestedPkg && requestedTheme
      ? requestedTheme
      : themeObjects[DEFAULT_THEME_PACKAGE];

  if (!seedPkg || !seedTheme) {
    // Defensive: only if @astryxdesign/theme-neutral is removed from the
    // workspace, which would break the whole themes section anyway.
    return null;
  }

  return (
    <Section maxWidth="lg" padding={6}>
      <ThemePackagePage packageName={seedPkg.name} theme={seedTheme} />
    </Section>
  );
}
