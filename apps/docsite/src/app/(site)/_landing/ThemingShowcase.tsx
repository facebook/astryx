// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import * as stylex from '@stylexjs/stylex';
import {Text, Heading} from '@xds/core/Text';
import {HStack, VStack} from '@xds/core/Stack';
import {Card} from '@xds/core/Card';
import {Carousel} from '@xds/core/Carousel';
import {Button} from '@xds/core/Button';
import {Theme} from '@xds/core/theme';
import {
  spacingDefaults,
  radiusDefaults,
  textSizeDefaults,
} from '@xds/core/theme/tokens.stylex';
import {packages} from '../../../generated/packageRegistry';
import {themeObjects} from '../../../generated/themeRegistry';
import {ThemeShowcaseTile} from '../../../components/ThemeShowcaseTile';

// Gallery order — mirrors the dedicated /themes page (most restrained
// → most expressive). Keeps the landing showcase consistent with the
// deeper gallery so users encounter the same identity ordering. Any
// theme not in this list falls to the end (alphabetical) so a newly
// added theme always shows up rather than silently disappearing.
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

// Re-set XDS's structural tokens (spacing, radii, font sizes) back to
// the defaults exported from @xds/core. Each <Theme> wrapper sets a
// full token bundle including these structural slots, which would make
// gallery tiles visually inconsistent (different button heights, badge
// sizes, banner padding). Resetting only the structural tokens — while
// leaving --color-* and --font-family-* alone — keeps the layout uniform
// but lets each tile showcase its true palette and typography.
const STRUCTURAL_TOKEN_OVERRIDES: React.CSSProperties = {
  ...spacingDefaults,
  ...radiusDefaults,
  ...textSizeDefaults,
  height: '100%',
};

// Per-slide width inside the carousel. Each tile renders its
// internal 2-column composition (image + identity + swatches on the
// left; input + table + controls + banners on the right), which
// needs ~700px+ to read well — below 800px the tile collapses to a
// single internal column via its own TILE_STACK_BREAKPOINT, which
// makes content render too tall and look squished. 800 sits right
// at that breakpoint so every tile renders in its desktop 2-up
// internal layout, and on a typical 1280–1440px desktop you get
// the active tile + a clean peek of the next one on the right.
const CARD_WIDTH = 800;

// Per-slide height. Carousel uses `align-items: center` on its
// scroller, so without an explicit height each slide sizes to its
// content and tiles render at visibly different heights based on
// which theme is showing. 620px chosen empirically as the smallest
// height that fits all themes' right-column content without clipping
// at base XDS sizing.
const CARD_HEIGHT = 620;

// Horizontal gutter that defines the page's content rim. The
// header row's content (title + links) starts at this offset from
// the viewport edge, and the carousel scroller is padded by this
// same value on the leading side so the first tile lines up with
// the heading text above it. Used via the --theming-gutter CSS
// variable set on the showcase root below, so the header row and
// the carousel's nested scroller dom both read the same value.
// Aligns the carousel's content rail (heading + buttons + first
// tile leading edge) with the standard 1200px-wide section
// column used by every other landing-page section (Features,
// About, Discover) and the community page. PAGE_GUTTER matches
// the showcaseOverlay's paddingInline (--spacing-6 = 24px), so
// at viewports narrower than the 1200px column the carousel
// content sits flush with the same 24px page rim as the other
// sections.
const PAGE_GUTTER = 24;
const CONTENT_MAX_WIDTH = 1200;
// At wide viewports, the gutter resolves to the empty space
// between the viewport edge and the centered 1200px content
// column — same horizontal start as the other 1200px-centered
// sections on the page (FeaturesShowcase, AboutShowcase, etc.).
// At narrower viewports, the max() clamp kicks in and pads the
// content by PAGE_GUTTER from the viewport edge so things don't
// touch the screen rim.
const CONTENT_GUTTER_FORMULA = `max(${PAGE_GUTTER}px, calc((100vw - ${CONTENT_MAX_WIDTH}px) / 2))`;

const styles = stylex.create({
  // Section root — adds breathing room above the heading so the
  // showcase doesn't feel cramped against whatever sits above it
  // (on the docsite landing that's the sticky hero block).
  section: {
    paddingBlockStart: 'var(--spacing-12)',
  },

  // Header row — title on the left, "Explore all themes" /
  // "Create a custom theme" links on the right. Full-bleed so it
  // sits on the same horizontal axis as the carousel; inline
  // padding-start matches the carousel scroller's padding-start
  // (CONTENT_GUTTER_FORMULA) so the heading text's leading edge
  // sits on the same vertical line as the first carousel tile's
  // leading edge below.
  //
  // marginInline trick bleeds the row past whatever parent
  // padding the showcase is mounted under (the docsite landing's
  // `showcaseOverlay` adds padding-inline: var(--spacing-6) which
  // would otherwise indent the row).
  //
  // padding-inline-end uses the same formula so the links cluster
  // sits at the symmetric inset from the right viewport edge.
  //
  // Below 720px viewport the row collapses to a vertical stack so
  // the buttons drop below the description instead of getting
  // squeezed beside it.
  headerRow: {
    width: '100vw',
    marginInline: 'calc(50% - 50vw)',
    paddingInlineStart: CONTENT_GUTTER_FORMULA,
    paddingInlineEnd: CONTENT_GUTTER_FORMULA,
    boxSizing: 'border-box',
    flexDirection: {
      default: 'row',
      '@media (max-width: 720px)': 'column',
    },
    alignItems: {
      default: 'stretch',
      '@media (max-width: 720px)': 'flex-start',
    },
  },
  headingBlock: {
    flex: 1,
    minWidth: 0,
    maxWidth: 680,
    // Explicit start alignment so the heading + description anchor
    // to the column's left edge regardless of any inherited
    // text-align cascade from ancestor surfaces (the docsite hero
    // chrome above this section sets text-align:center on its own
    // sticky block, which has been observed to inherit into sibling
    // trees in some browsers). Lives on the heading column container
    // rather than as an !important wildcard descendant rule so the
    // override is locally scoped and doesn't fight the buttons in
    // the sibling HeaderLinks column.
    textAlign: 'start',
  },
  fillWidth: {
    width: '100%',
  },
  // Caps the section description's line length to ~70 characters
  // (560px) so it doesn't run uncomfortably wide on desktop. Used
  // by the description paragraph below the heading.
  descriptionWidth: {
    maxWidth: 560,
  },
  // Cluster on the right of the header row — "Create a custom theme"
  // ghost button + "Explore all themes" secondary button. Strictly
  // the Button docs discourage button-for-navigation, but the
  // same docsite uses this pattern on the hero CTAs (`Get started`
  // / `Browse components`) so the visual treatment is consistent
  // with the rest of the landing.
  //
  // Default (row mode): alignSelf:end pins the cluster to the
  // bottom of the row so the buttons sit on the same baseline as
  // the last line of the description text. Below the 720px
  // breakpoint the row collapses to a column (see headerRow) and
  // the cluster shifts to the start so the buttons sit naturally
  // under the description.
  headerLinks: {
    flexShrink: 0,
    alignSelf: {
      default: 'end',
      '@media (max-width: 720px)': 'flex-start',
    },
  },

  // Full-bleed carousel wrapper — bleeds past parent padding so the
  // carousel viewport spans the full screen width. No leading inset
  // here; the leading gutter that aligns the first tile to the
  // heading text is applied via padding-inline-start on the
  // carousel's INNER scroller (see the inline <style> rule below).
  // That way the gutter is part of the scrollable area, so when the
  // user scrolls right and then back left, the leading edge of
  // the previously-scrolled-off tiles can re-enter the viewport
  // fully (vs being permanently clipped behind a wrapper inset).
  carouselWrap: {
    position: 'relative',
    width: '100vw',
    marginInline: 'calc(50% - 50vw)',
  },

  // Each slide is sized to CARD_WIDTH on desktop; clamps to fit
  // the viewport (with a comfortable gutter) on narrower screens.
  // Height is fixed at CARD_HEIGHT on wider viewports so all tiles
  // match. Below the tile's stack breakpoint (800px), the inner
  // ThemeShowcaseTile collapses from 2 columns to 1 column, which
  // makes its natural height roughly double — so we use a taller
  // fixed height (CARD_HEIGHT_STACKED) that fits the tallest
  // stacked theme, keeping every slide the same height so the
  // carousel reads as a clean uniform row at every breakpoint.
  slide: {
    width: `min(${CARD_WIDTH}px, 100vw - var(--spacing-6, 24px) * 2)`,
    height: {
      default: CARD_HEIGHT,
      // 1180px chosen empirically to fit Matcha (the tallest stacked
      // theme) with a comfortable bottom rim. Inlined here because
      // StyleX's compile-time evaluator can't resolve named constants
      // inside an @media object value.
      '@media (max-width: 800px)': 1180,
    },
  },
  // The Card host inside each slide. Fills the slide width and
  // height so the inner ThemeShowcaseTile stretches to match.
  cardFill: {
    width: '100%',
    height: '100%',
  },
  previewFrame: {
    height: '100%',
    overflow: 'hidden',
  },
});

function ShowcaseHeading() {
  return (
    <VStack gap={4} xstyle={styles.headingBlock}>
      <Heading
        level={2}
        type="display-2"
        color="primary"
        xstyle={styles.fillWidth}>
        Custom styles as unique as your app
      </Heading>
      <Text
        display="block"
        type="body"
        color="secondary"
        xstyle={styles.descriptionWidth}>
        Astryx makes it effortless to apply your brand — no rewrites needed.
        Customize your theme at the token level: color, typography, radius, and
        motion.
      </Text>
    </VStack>
  );
}

function HeaderLinks() {
  return (
    <HStack gap={2} align="center" xstyle={styles.headerLinks}>
      <Button
        variant="ghost"
        label="Create a custom theme"
        href="/docs/theme"
      />
      <Button
        variant="secondary"
        label="Explore all themes"
        href="/themes"
      />
    </HStack>
  );
}

export function ThemingShowcase() {
  return (
    <VStack
      as="section"
      gap={10}
      align="stretch"
      xstyle={styles.section}
      data-theming-showcase="true">
      {/* Header row — heading on the left, "Explore all themes" /
          "Create a custom theme" links on the right. Both clusters
          share the same outer page gutter (PAGE_GUTTER) so they
          align to the page's content rim. The carousel below bleeds
          past this gutter to fill 100vw. */}
      <HStack
        gap={6}
        align="stretch"
        hAlign="between"
        xstyle={styles.headerRow}>
        <ShowcaseHeading />
        <HeaderLinks />
      </HStack>

      {/* Scroller padding that aligns the first tile to the heading
          text column. This is a layout concern (not chrome) so it
          remains as a scoped style targeting this carousel's scroller.

          TODO: Consider a `scrollerXstyle` prop or padding prop on
          Carousel if this pattern recurs in other full-bleed usages.
       */}
      <style>{`
        [aria-label="Available themes"] > div:first-child {
          /* Gutter that aligns the first tile to the heading text
             leading edge. Applied as padding on the scroller (not
             a margin on the wrapper) so the gutter is INSIDE the
             scrollable area — scrolling right then back left can
             return tiles fully to their starting position without
             clipping them behind the gutter. scroll-padding-inline-
             start mirrors it so the scroll-snap engine snaps tile
             leading edges to the gutter, not the viewport edge. */
          padding-inline-start: ${CONTENT_GUTTER_FORMULA} !important;
          scroll-padding-inline-start: ${CONTENT_GUTTER_FORMULA} !important;
          /* Matching trailing padding so the last tile doesn't sit
             flush against the viewport's right edge when fully
             scrolled — gives the gallery a symmetric inset that
             frames the row of tiles inside the page rim. */
          padding-inline-end: ${CONTENT_GUTTER_FORMULA} !important;
          scroll-padding-inline-end: ${CONTENT_GUTTER_FORMULA} !important;
        }
      `}</style>

      <div {...stylex.props(styles.carouselWrap)}>
        <Carousel
          aria-label="Available themes"
          gap={4}
          hasSnap
          hasButtons={false}
          hasEdgeFade={false}>
          {themePackages.map(pkg => {
            const theme = themeObjects[pkg.name];
            if (!theme) {
              return null;
            }
            const label = pkg.displayName
              .replace(/^Theme:\s*/, '')
              .replace(/\s*Theme$/, '');
            return (
              <div key={pkg.name} {...stylex.props(styles.slide)}>
                <Card
                  padding={0}
                  variant="transparent"
                  xstyle={styles.cardFill}>
                  <div {...stylex.props(styles.previewFrame)}>
                    <Theme theme={theme} mode="light">
                      <div style={STRUCTURAL_TOKEN_OVERRIDES}>
                        <ThemeShowcaseTile
                          label={label}
                          themeName={pkg.name}
                          description={pkg.description}
                        />
                      </div>
                    </Theme>
                  </div>
                </Card>
              </div>
            );
          })}
        </Carousel>
      </div>
    </VStack>
  );
}
