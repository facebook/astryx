// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * ComponentPreviewTheme.
 *
 * @input component preview chrome and preview content from the docsite
 * @output children rendered under the neutral preview theme with the current mode
 * @position Component detail previews — wraps the preview container as well as
 * the component so their backgrounds, borders, and content tokens match.
 */

import {type ReactNode} from 'react';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {registerIcons} from '@astryxdesign/core/Icon';
import {useThemeMode} from '../../app/providers';

// Register theme icons at module load time so the globalIconRegistry is
// consistent between SSR and client hydration. Without this, the server's
// module-level registry may already have Lucide icons (from a warm process),
// while the client starts with default icons — causing an SVG strokeWidth
// mismatch for any Icon that renders before Theme's render-time registerIcons call.
if (neutralTheme.icons) {
  registerIcons(neutralTheme.icons);
}

export function ComponentPreviewTheme({children}: {children: ReactNode}) {
  const {mode} = useThemeMode();

  return (
    <Theme theme={neutralTheme} mode={mode}>
      {children}
    </Theme>
  );
}
