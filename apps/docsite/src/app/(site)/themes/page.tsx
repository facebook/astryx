// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Themes page — /themes
 *
 * Single canonical surface for browsing every XDS theme. Renders the
 * full live ThemePackagePage (sidebar picker + themed preview
 * mockup + card showcase), seeded with the Neutral theme as the
 * default selection.
 *
 * There used to be a per-theme dynamic route at /themes/<name> that
 * deep-linked to individual themes, but it was removed in favor of
 * this single state-driven surface — the sidebar picker on
 * ThemePackagePage lets users sweep through every theme without
 * leaving the page. SearchPalette and other internal theme entry
 * points now link here directly.
 */

import {notFound} from 'next/navigation';
import {XDSSection} from '@xds/core/Section';
import {packages} from '../../../generated/packageRegistry';
import {themeObjects} from '../../../generated/themeRegistry';
import {ThemePackagePage} from '../../../components/ThemePackagePage';

// Default seed for the page — the picker opens with this theme
// selected on first visit. Neutral is the most restrained / brand-
// neutral theme in the gallery, so it sets a calm baseline before
// users browse into the more expressive themes (Y2K, Butter, etc.).
const DEFAULT_THEME_PACKAGE = '@xds/theme-neutral';

export default function ThemesPage() {
  const pkg = packages.find(p => p.name === DEFAULT_THEME_PACKAGE);
  const theme = themeObjects[DEFAULT_THEME_PACKAGE];
  if (!pkg || !theme) {
    // Defensive: only fires if the @xds/theme-neutral package is
    // ever removed from the workspace, which would break the entire
    // themes section anyway.
    notFound();
  }

  return (
    <XDSSection maxWidth="lg" padding={6}>
      <ThemePackagePage packageName={pkg.name} theme={theme} />
    </XDSSection>
  );
}
