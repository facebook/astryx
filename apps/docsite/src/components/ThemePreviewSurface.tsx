// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * ThemePreviewSurface — the live preview "window" for one theme.
 *
 * Renders the same content as the dedicated /themes/<slug> detail page
 * (the live ThemeShowcasePreview "Studio" app + the real-world
 * ThemeCardShowcase) at true scale inside the framed, internally-
 * scrollable surface (shared TemplatePreviewSurface.module.css `.frame`).
 * Used by the theme preview dialog (ThemePreviewDialog) — the themes
 * analog of TemplatePreviewSurface.
 */

import * as stylex from '@stylexjs/stylex';
import {XDSCard} from '@xds/core/Card';
import {XDSVStack} from '@xds/core/Layout';
import {XDSTheme} from '@xds/core/theme';
import type {XDSDefinedTheme} from '@xds/core/theme';
import {useThemeMode} from '../app/providers';
import {ThemeShowcasePreview} from './ThemeShowcasePreview';
import {ThemeCardShowcase} from './ThemeCardShowcase';
import {getThemeImages} from './themeImages';
import css from './TemplatePreviewSurface.module.css';

const styles = stylex.create({
  // Inner content column — padded off the frame edges and stacked the
  // same way the /themes/<slug> detail page lays out its preview card
  // and card showcase.
  content: {
    paddingBlock: 'var(--spacing-6)',
    paddingInline: 'var(--spacing-6)',
  },
  // Mirrors ThemePackagePage's preview card: capped at the "wide
  // content" 1200px max-width, centered, painting the theme's own
  // body background so the preview reads as a real themed app.
  previewCard: {
    overflow: 'hidden',
    maxWidth: 1200,
    width: '100%',
    marginInline: 'auto',
    backgroundColor: 'var(--color-background-body)',
  },
  // Real-world card showcase block — sits OUTSIDE the live preview
  // card (on the docsite chrome) and matches the preview card's
  // 1200px max-width so the two visually align.
  showcaseBlock: {
    width: '100%',
    maxWidth: 1200,
    marginInline: 'auto',
  },
});

export function ThemePreviewSurface({theme}: {theme: XDSDefinedTheme}) {
  const {mode} = useThemeMode();
  // Resolve the product image set for this theme (falls back to
  // neutral if the theme doesn't have its own set yet).
  const images = getThemeImages(theme.name);

  return (
    <div className={css.frame}>
      <XDSVStack gap={8} xstyle={styles.content}>
        {/* Live themed "Studio" app — the same preview shown on the
            dedicated theme page, wrapped in the theme so it reads as
            a real themed surface on the theme's body color. */}
        <XDSTheme theme={theme} mode={mode}>
          <XDSCard
            padding={0}
            variant="transparent"
            xstyle={styles.previewCard}>
            <ThemeShowcasePreview images={images} />
          </XDSCard>
        </XDSTheme>

        {/* Real-world card showcase — renders on the docsite's own
            chrome (outside the themed preview card) and flips
            light/dark in sync with the preview above via mode. */}
        <div {...stylex.props(styles.showcaseBlock)}>
          <ThemeCardShowcase theme={theme} images={images} mode={mode} />
        </div>
      </XDSVStack>
    </div>
  );
}
