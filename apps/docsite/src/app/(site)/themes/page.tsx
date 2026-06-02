// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Themes gallery — extracted from craft.
 */

'use client';

import * as stylex from '@stylexjs/stylex';
import {XDSText} from '@xds/core/Text';
import {XDSHStack, XDSVStack} from '@xds/core/Layout';
import {XDSSection} from '@xds/core/Section';
import {XDSCard} from '@xds/core/Card';
import {XDSButton} from '@xds/core/Button';
import {XDSTheme} from '@xds/core/theme';
import {
  spacingDefaults,
  radiusDefaults,
  textSizeDefaults,
} from '@xds/core/theme/tokens.stylex';
import {useThemeMode} from '../../providers';
import {packages} from '../../../generated/packageRegistry';
import {themeObjects} from '../../../generated/themeRegistry';
import {ThemeShowcaseTile} from '../../../components/ThemeShowcaseTile';

// Re-set XDS's structural tokens (spacing, radii, font sizes) back to
// the defaults exported from @xds/core. Each <XDSTheme> wrapper sets a
// full token bundle including these structural slots, which would make
// gallery cards visually inconsistent (different button heights, badge
// sizes, banner padding, etc.). Resetting only the structural tokens —
// while leaving --color-* and --font-family-* alone — keeps the
// layout uniform but lets each card showcase its true palette and
// typography. Values flow from tokens.stylex.ts so this stays in sync
// with the XDS scale automatically.
const STRUCTURAL_TOKEN_OVERRIDES: React.CSSProperties = {
  ...spacingDefaults,
  ...radiusDefaults,
  ...textSizeDefaults,
  height: '100%',
} as React.CSSProperties;

// Gallery order — themes are sorted by visual closeness, starting
// from the most restrained / brand-neutral and ending at the most
// expressive / brand-distinct. Any theme not in this list falls to
// the end (alphabetical) so the gallery never silently drops a
// newly-added theme.
const THEME_ORDER: ReadonlyArray<string> = [
  '@xds/theme-neutral',
  '@xds/theme-stone',
  '@xds/theme-gothic',
  '@xds/theme-matcha',
  '@xds/theme-y2k',
  '@xds/theme-butter',
];

const themePackages = packages
  .filter(p => p.name.includes('theme-') && p.name !== '@xds/theme-default')
  .sort((a, b) => {
    const ai = THEME_ORDER.indexOf(a.name);
    const bi = THEME_ORDER.indexOf(b.name);
    // Unknown themes go to the end, sorted alphabetically among themselves.
    if (ai === -1 && bi === -1) {
      return a.name.localeCompare(b.name);
    }
    if (ai === -1) {
      return 1;
    }
    if (bi === -1) {
      return -1;
    }
    return ai - bi;
  });

// Max viewport-px the gallery centers in. Sized for the 2-column grid:
// at full width that gives ~785px per card after the gap, fitting the
// rich theme preview composition.
const GALLERY_MAX_WIDTH = 1600;

// Minimum px-width a single card needs to render side-by-side internally
// (image + heading + type samples + swatches + actions on the left,
// input + table + controls + banners on the right). Drives the grid's
// auto-fill breakpoint: below ~2 × this value (viewport) the grid drops
// from 2 cards to 1. The tile itself stacks to a single column below
// TILE_STACK_BREAKPOINT (defined in ThemeShowcaseTile.tsx).
const CARD_MIN_WIDTH = 760;

const styles = stylex.create({
  // Wraps the gallery so it caps at a sane max width and centers in
  // the viewport. We do this on a plain wrapper instead of via
  // XDSSection's maxWidth prop because the section's negative-inline-
  // margin styles (used to break out of container padding elsewhere)
  // beat any margin-inline:auto we try to set on the section itself.
  //
  // 1600px is sized for the 2-column grid: at full width that gives
  // ~785px per card after the gap, which fits the rich theme preview
  // composition (image, type samples, swatches, actions on the left
  // + input, progress, controls, table, banners on the right).
  galleryWrap: {
    maxWidth: GALLERY_MAX_WIDTH,
    marginInline: 'auto',
    width: '100%',
  },
  // Custom CSS Grid in place of XDSGrid so we control the column
  // template directly. The minmax() uses min(760px, 100%) for the
  // minimum so cells shrink to fit the viewport on mobile instead
  // of forcing horizontal overflow at <760px viewport (which is
  // what XDSGrid's plain minmax(760px, ...) does).
  //
  // Max column count of 2 enforced via the calc() upper bound:
  // (100% - gap) / 2 prevents tracks from being narrower than half.
  grid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
    justifyContent: 'center',
    gridTemplateColumns: `repeat(auto-fill, minmax(min(${CARD_MIN_WIDTH}px, 100%), calc((100% - var(--spacing-4)) / 2)))`,
  },
  heroTitle: {
    textAlign: 'center' as const,
  },
  cardImage: {
    display: 'block',
    width: '100%',
    aspectRatio: '4/3',
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 'var(--radius-container)',
  },
  // Fills the gallery card cell at 100% height so the inner tile
  // (and its two columns) can stretch to match the tallest card
  // in the row. CSS Grid auto-stretches cells in the same row to
  // the tallest cell; this rule + the parent chain having
  // `height: 100%` lets the stretch propagate all the way down.
  // overflow:hidden protects against any descendant component
  // (long text, wide table cells) bleeding past the gallery card's
  // rounded edges at narrow viewports.
  previewFrame: {
    height: '100%',
    overflow: 'hidden',
  },

  // The outer XDSCard sized to fill its grid cell at full height
  // so every card in a row matches the tallest. Without this, the
  // XDSCard sizes to content and the grid stretch doesn't reach
  // the inner tile.
  cardFill: {
    height: '100%',
  },
});

export default function ThemesPage() {
  const {mode} = useThemeMode();
  return (
    <div {...stylex.props(styles.galleryWrap)}>
      <XDSSection padding={6}>
        <XDSVStack gap={10}>
          <XDSVStack gap={4} hAlign="center">
            <XDSVStack gap={2} hAlign="center">
              <XDSText type="display-2" xstyle={styles.heroTitle}>
                Themes built for different apps
              </XDSText>
              <XDSText type="body" color="secondary" xstyle={styles.heroTitle}>
                Browse pre-built themes — each a complete look spanning colors,
                typography, motion, and spacing.
                <br />
                Install one as-is, or use it as a starting point for your own.
              </XDSText>
            </XDSVStack>
            {/* Hero CTAs — two paths into theming. The primary
                "Build a custom theme" opens the theme playground
                seeded with the neutral theme so users can fork it
                and tweak tokens with instant visual feedback;
                the secondary "How theming works" sends users to
                the docs for the defineTheme + CLI wizard
                walkthrough. */}
            <XDSHStack gap={2} hAlign="center" wrap="wrap">
              <XDSButton
                variant="primary"
                size="lg"
                label="Build a custom theme"
                href="/themes/playground/neutral"
              />
              <XDSButton
                variant="secondary"
                size="lg"
                label="How theming works"
                href="/docs/theme"
              />
            </XDSHStack>
          </XDSVStack>

          <div {...stylex.props(styles.grid)}>
            {themePackages.map(pkg => {
              const theme = themeObjects[pkg.name];
              const label = pkg.displayName
                .replace(/^Theme:\s*/, '')
                .replace(/\s*Theme$/, '');
              return (
                <XDSCard
                  key={pkg.name}
                  padding={0}
                  variant="transparent"
                  xstyle={styles.cardFill}>
                  <div {...stylex.props(styles.previewFrame)}>
                    {theme ? (
                      <XDSTheme theme={theme} mode={mode}>
                        {/* Re-set structural tokens to XDS defaults
                            (see STRUCTURAL_TOKEN_OVERRIDES above) so
                            every card has identical layout / control
                            sizes. Colors and font-family slots stay
                            theme-driven. */}
                        <div style={STRUCTURAL_TOKEN_OVERRIDES}>
                          <ThemeShowcaseTile
                            label={label}
                            themeName={pkg.name}
                            description={pkg.description}
                          />
                        </div>
                      </XDSTheme>
                    ) : (
                      <div {...stylex.props(styles.cardImage)} />
                    )}
                  </div>
                </XDSCard>
              );
            })}
          </div>
        </XDSVStack>
      </XDSSection>
    </div>
  );
}
