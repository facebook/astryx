// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {
  HeroReelProvider,
  HeroReelCards,
  HeroReelStack,
  HeroReelWordmark,
  HeroReelDots,
} from './_landing/hero/HeroThemeReel';
import {FeaturesShowcase} from './_landing/FeaturesShowcase';
import {AboutShowcase} from './_landing/AboutShowcase';
import {DiscoverShowcase} from './_landing/DiscoverShowcase';

// Height of the hero band (the region the fixed hero content + floating cards
// occupy before the showcase scrolls up over it). Drives the in-flow spacer
// that reserves this space in heroScope. Desktop (≥1024px) uses 760; narrow
// screens use a taller band so the centered hero text and the bottom-pinned
// collage cards both fit without overlapping (the headline wraps to more lines
// and the cards stack into a taller row there).
const HERO_BAND_HEIGHT = 760;
// Narrow screens use a taller band so the centered hero text and the bottom-
// pinned collage both fit without overlapping. The collage is a 3-column row at
// 560–1024px, and wraps to 2 columns (taller) below 560px.
const HERO_BAND_HEIGHT_NARROW = 1000; // 560–1024px: 3-column row
const HERO_BAND_HEIGHT_2COL = 1340; // <560px: wraps to 2 columns

const styles = stylex.create({
  // Wraps hero + showcase together so the sticky hero (position: sticky)
  // bounds its sticky range to this container. Without the wrapper, the
  // hero would stay pinned through the footer (a sibling further down
  // the AppShell main content), which on mobile shows up as the hero
  // bleeding underneath the footer at the bottom of the page.
  heroScope: {
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
    // One gap value shared by the nav→wordmark top padding and the text→cards
    // gap (collage `top`), so both read consistently across breakpoints.
    '--hero-gap': 'calc(var(--spacing-12) * 2)',
  },
  // Hero content column. Rendered position:fixed — locked to the viewport
  // exactly like the aurora glow behind it — so the wordmark + headline +
  // CTAs stay put while the showcase section scrolls UP and covers them
  // (pin-and-cover reveal). Using `fixed` (not `sticky`) keeps it in lockstep
  // with the fixed aurora layer so the two never drift apart, and the whole
  // group is uniformly covered from the bottom by the rising showcase.
  //
  // The fixed container spans the full hero band (from just under the nav to
  // the bottom of the band) and flex-centers its content vertically, so the
  // wordmark + headline + CTAs always sit in the MIDDLE of the hero regardless
  // of how tall the band is. Horizontally centered via inset:0 + marginInline:
  // auto on a capped maxWidth (800 = editorial reading measure). Pulled out of
  // flow, so heroSpacer reserves the hero's height in heroScope.
  heroContent: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: 0,
    right: 0,
    // Span the hero band minus the nav strip so the centered content's box
    // matches the in-flow heroSpacer region exactly. Taller on narrow screens.
    height: {
      default: `calc(${HERO_BAND_HEIGHT_2COL}px - var(--appshell-header-height, 0px))`,
      '@media (min-width: 560px)': `calc(${HERO_BAND_HEIGHT_NARROW}px - var(--appshell-header-height, 0px))`,
      '@media (min-width: 1024px)': `calc(${HERO_BAND_HEIGHT}px - var(--appshell-header-height, 0px))`,
    },
    // Desktop: vertically center the content (the extra paddingBlockEnd
    // optically centers it since the dots add weight at the bottom). Narrow
    // screens: anchor the text to the TOP of the (taller) band so the
    // bottom-pinned collage cards have clear room and don't overlap it.
    justifyContent: {
      default: 'flex-start',
      '@media (min-width: 1024px)': 'center',
    },
    // Narrow screens anchor content to the top, so add the shared --hero-gap
    // below the nav so the wordmark doesn't touch it (and it matches the
    // text→cards gap). Desktop centers, so no top padding needed.
    paddingBlockStart: {
      default: 'var(--hero-gap)',
      '@media (min-width: 1024px)': 0,
    },
    paddingBlockEnd: spacingVars['--spacing-12'],
    maxWidth: 800,
    marginInline: 'auto',
    paddingInline: spacingVars['--spacing-6'],
    textAlign: 'center',
    gap: spacingVars['--spacing-6'],
    // Decorative-position layer; never intercept clicks outside its actual
    // content (the buttons/links re-enable pointer events on themselves).
    zIndex: 0,
  },
  // Reserves the hero's vertical space in heroScope since heroContent is
  // pulled out of flow (position:fixed). Height matches the hero band so the
  // showcase below starts at the right offset and the pin-and-cover reveal
  // reads consistently across viewports.
  heroSpacer: {
    height: {
      default: HERO_BAND_HEIGHT_2COL,
      '@media (min-width: 560px)': HERO_BAND_HEIGHT_NARROW,
      '@media (min-width: 1024px)': HERO_BAND_HEIGHT,
    },
  },
  // Hero CTA button grid. maxWidth: 420 caps the two-up button
  // row at a comfortable thumb-reachable width so the buttons
  // don't stretch edge-to-edge on wide hero columns; literal
  // because the cap is a button-pair ergonomics value, not a
  // spacing-scale step.
  heroButtons: {
    width: '100%',
    maxWidth: 420,
  },
  // Lighter display weight for the leading half of the hero
  // headline ("An open source design system that's"). Astryx's
  // theme override pushes display-1 to semibold (600); we want
  // the leading copy to read as a softer editorial setup so the
  // value-prop tail ("fully customizable and agent ready") can
  // land harder. Applied per-span via xstyle, not as a theme
  // token change, so the rest of the site keeps Astryx's display
  // semibold default.
  heroHeadline: {
    fontWeight: 'var(--font-weight-normal)',
    // Smaller on narrow screens so the headline doesn't dominate; steps up to
    // the full display-1 size on desktop.
    fontSize: {
      default: 'var(--font-size-3xl)',
      '@media (min-width: 768px)': 'var(--font-size-4xl)',
      '@media (min-width: 1024px)': 'var(--text-display-1-size)',
    },
  },
  // The showcase overlay paints the surface that scrolls UP over
  // the pinned hero (pin-and-cover reveal). Surface color +
  // top-rounded corners + body padding all sit on tokens, but
  // paddingBlockStart and gap use the marketing-section rhythm
  // token (--xds-marketing-section-gap) — these are marketing-
  // section rhythm, NOT primitives in the spacing scale.
  showcaseOverlay: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
    backgroundColor: 'var(--color-background-surface)',
    paddingBlockStart: 'var(--xds-marketing-section-gap)',
    paddingBlockEnd: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-6'],
    gap: 'var(--xds-marketing-section-gap)',
  },
});

export default function HomePage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const heroScopeRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLElement | null>(null);

  // Measure the hero text block height and expose it as --hero-text-height on
  // heroScope. The pinned collage positions itself a consistent gap below the
  // text using this (instead of a fixed estimate), so the nav→wordmark gap and
  // the text→cards gap stay equal as the text wraps/resizes across breakpoints.
  useEffect(() => {
    const scope = heroScopeRef.current;
    const content = heroContentRef.current;
    if (!scope || !content) {
      return;
    }
    // The fixed hero content fills the band; its children (wordmark, headline,
    // CTAs) are the text block. Measure from the first child's top to the last
    // child's bottom to get the real text-block height regardless of wrapping.
    const setVar = () => {
      const first = content.firstElementChild;
      const last = content.lastElementChild;
      if (!first || !last) {
        return;
      }
      const height =
        last.getBoundingClientRect().bottom - first.getBoundingClientRect().top;
      scope.style.setProperty('--hero-text-height', `${Math.round(height)}px`);
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = showcaseRef.current;
    if (!el) {
      return;
    }

    function readNavHeight() {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        '--appshell-header-height',
      );
      return parseFloat(raw) || 64;
    }

    function update() {
      if (!el) {
        return;
      }
      const navHeight = readNavHeight();
      const top = el.getBoundingClientRect().top;
      const reached = top <= navHeight;
      if (reached) {
        document.body.setAttribute('data-nav-mode', 'surface');
      } else {
        document.body.removeAttribute('data-nav-mode');
      }
    }

    update();
    window.addEventListener('scroll', update, {passive: true});
    window.addEventListener('resize', update, {passive: true});

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.body.removeAttribute('data-nav-mode');
    };
  }, []);

  return (
    <div ref={heroScopeRef} {...stylex.props(styles.heroScope)}>
      {/* The theming showcase reel is split across the DOM: a full-bleed
          floating-cards layer that anchors to this heroScope (so the cards
          sit in the left/right gutters), and the recolorable wordmark inside
          the centered content column below. HeroReelProvider holds the shared
          cycling state + auto-advance clock for both, plus the dot switcher.
          The headline / CTAs / subtext are intentionally NOT themed — they
          stay in the stable Astryx brand style. */}
      <HeroReelProvider>
        {/* Floating themed UI cards — anchored to the full-width heroScope so
            they flank the centered text column instead of overlapping it. */}
        <HeroReelCards />
        {/* Reserves the hero's height in flow since the content below is
            position:fixed (pulled out of flow). Without this the showcase
            would jump up to the top of the page. */}
        <div {...stylex.props(styles.heroSpacer)} aria-hidden="true" />
        <XDSVStack
          ref={heroContentRef}
          data-home-page="true"
          align="stretch"
          xstyle={styles.heroContent}>
          {/* Theme-reactive Astryx wordmark — recolors to each theme's accent
              as the reel cycles; the "Beta" signal moved into the subtext
              line below the CTAs. */}
          <HeroReelWordmark />
          <XDSHeading
            level={1}
            type="display-1"
            color="primary"
            xstyle={styles.heroHeadline}>
            An open source design system that's{' '}
            {/* XDSText emphasis span — type/color="inherit" picks up
                the heading's display-1 size + color so only the
                weight changes, and weight="semibold" provides the
                contrast against the parent heading's normal weight
                (set via styles.heroHeadline above). Using XDSText
                keeps the inline emphasis on a typed XDS primitive
                instead of a raw <span> + xstyle escape. */}
            <XDSText as="span" type="inherit" color="inherit" weight="semibold">
              fully customizable and agent ready
            </XDSText>
          </XDSHeading>
          <XDSVStack gap={4} align="center">
            <XDSGrid columns={2} gap={3} xstyle={styles.heroButtons}>
              <XDSButton
                variant="primary"
                size="lg"
                label="Get started"
                href="/docs/getting-started"
              />
              <XDSButton
                variant="secondary"
                size="lg"
                label="Browse components"
                href="/components"
              />
            </XDSGrid>
            <XDSText display="block" color="secondary">
              Currently in Beta · Built on{' '}
              <XDSLink
                type="body"
                color="primary"
                href="https://react.dev"
                target="_blank"
                rel="noopener noreferrer"
                hasUnderline>
                React
              </XDSLink>{' '}
              and{' '}
              <XDSLink
                type="body"
                color="primary"
                href="https://stylexjs.com"
                target="_blank"
                rel="noopener noreferrer"
                hasUnderline>
                StyleX
              </XDSLink>
            </XDSText>
            {/* Theme switcher dots — jump straight to any theme in the reel. */}
            <HeroReelDots />
          </XDSVStack>
        </XDSVStack>
        {/* Mobile-only stacked cards — the desktop overlap layer (HeroReelCards)
            hides below 1024px; this renders the same cards as a collage here,
            below the hero text. Self-hides at ≥1024px. */}
        <HeroReelStack />
      </HeroReelProvider>
      <XDSVStack ref={showcaseRef} xstyle={styles.showcaseOverlay}>
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </XDSVStack>
    </div>
  );
}
