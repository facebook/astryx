// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Themes page — /themes
 *
 * Single canonical surface for browsing every Astryx theme. Renders the
 * full live ThemePackagePage (sidebar picker + themed preview mockup +
 * card showcase), seeded with the Neutral theme as the default selection.
 *
 * The legacy per-theme route at /themes/<name> still resolves — it now
 * redirects here with ?theme=<slug>, which the client ThemesExplorer reads
 * to preselect the right theme so deep links land on the requested theme
 * rather than the default seed. The param read is client-side (via
 * useSearchParams) so this page stays compatible with the canary static
 * export build; a server `await searchParams` would force dynamic rendering.
 */

import type {Metadata} from 'next';
import {Suspense} from 'react';
import {pageMetadata} from '../../../lib/pageMetadata';
import {ThemesExplorer} from './ThemesExplorer';

// Static canonical metadata for /themes. The page also accepts a `?theme=`
// param to preselect the picker, but every variant is the same surface, so the
// canonical stays the bare /themes path to avoid duplicate-URL dilution.
export const metadata: Metadata = pageMetadata({
  title: 'Themes',
  description:
    'Browse and preview every Astryx theme and see how design tokens, type, and components restyle across the gallery.',
  path: '/themes',
});

export default function ThemesPage() {
  // useSearchParams (inside ThemesExplorer) requires a Suspense boundary.
  return (
    <Suspense>
      <ThemesExplorer />
    </Suspense>
  );
}
