// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Dedicated theme page — /themes/<name>
 *
 * Each XDS theme (@xds/theme-*) gets a canonical page on the themes
 * side of the site that hosts the full live ThemeShowcasePreview
 * (top nav + hero + product grid + table + components). The
 * light/dark mode toggle lives in the page header beside the
 * Install button so the preview surface stays uncluttered. This is
 * the destination for the "Preview" affordance on the /themes
 * gallery cards.
 *
 * This is the canonical URL per theme. Theme entry points (gallery
 * cards, sidebar, search) link here directly.
 */

import {notFound} from 'next/navigation';
import {XDSSection} from '@xds/core/Section';
import {packages} from '../../../../generated/packageRegistry';
import {themeObjects} from '../../../../generated/themeRegistry';
import {ThemePackagePage} from '../../../../components/ThemePackagePage';

function slugToPackageName(slug: string): string {
  return `@xds/theme-${slug}`;
}

export function generateStaticParams() {
  return packages
    .filter(p => p.name.startsWith('@xds/theme-'))
    .map(p => ({name: p.name.replace('@xds/theme-', '')}));
}

export default async function ThemePage({
  params,
}: {
  params: Promise<{name: string}>;
}) {
  const {name: slug} = await params;
  const pkgName = slugToPackageName(slug);
  const pkg = packages.find(p => p.name === pkgName);
  const theme = themeObjects[pkgName];
  if (!pkg || !theme) {
    notFound();
  }

  // Vanity title: strip the trailing " Theme" suffix from displayName
  // so the title reads as a brand-style wordmark ("Neutral", "Butter",
  // "Y2K") rather than the redundant "Neutral Theme" on a page that's
  // already, by definition, about a theme. Falls back to displayName
  // verbatim if the suffix isn't present (e.g. legacy entries).
  const vanityTitle = pkg.displayName.replace(/\s*Theme$/i, '').trim();

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <ThemePackagePage
        title={vanityTitle || pkg.displayName}
        packageName={pkg.name}
        description={pkg.description}
        version={pkg.version}
        readme={pkg.readme}
        theme={theme}
      />
    </XDSSection>
  );
}
