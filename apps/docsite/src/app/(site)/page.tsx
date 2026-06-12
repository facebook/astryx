// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef, type Ref, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSTheme} from '@xds/core/theme';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {astryxTheme} from '../../themes/astryxTheme';
import {
  HeroReelProvider,
  HeroReelCards,
  HeroReelStack,
  HeroReelWordmark,
  HeroReelDots,
  useHeroReelIsDark,
} from './_landing/hero/HeroThemeReel';
import {FeaturesShowcase} from './_landing/FeaturesShowcase';
import {AboutShowcase} from './_landing/AboutShowcase';
import {DiscoverShowcase} from './_landing/DiscoverShowcase';

// Hero band height (reserved by heroSpacer). Desktop is fixed; narrow screens
// fall back to these per-tier values until the measured height is applied.
const HERO_BAND_HEIGHT = 760;
const HERO_BAND_HEIGHT_NARROW = 940; // 768–1024px: 3-column collage
const HERO_BAND_HEIGHT_2COL = 1200; // <768px: 2-column collage

const styles = stylex.create({
  // Wraps hero + showcase so the pin-and-cover stays bounded to this container
  // (not pinned through the footer).
  heroScope: {
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
    // Shared by the nav→wordmark gap and the text→cards gap so they match.
    '--hero-gap': 'calc(var(--spacing-12) * 2)',
  },
  // Hero content column. position:fixed (like the aurora glow) so it stays put
  // while the showcase scrolls up and covers it (pin-and-cover). Pulled out of
  // flow; heroSpacer reserves its height. Capped at 800 (reading measure).
  heroContent: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: 0,
    right: 0,
    // Desktop: fixed band, centered (cards are a separate overlap layer).
    // Narrow: auto height (sizes to text + collage); a ResizeObserver applies it
    // to heroSpacer so the showcase starts right after the cards.
    height: {
      default: 'auto',
      '@media (min-width: 1024px)': `calc(${HERO_BAND_HEIGHT}px - var(--appshell-header-height, 0px))`,
    },
    // Desktop centers the content; narrow anchors it to the top so the collage
    // below has room.
    justifyContent: {
      default: 'flex-start',
      '@media (min-width: 1024px)': 'center',
    },
    // Narrow: --hero-gap below the nav (matches the text→cards gap). Desktop
    // centers, so no top padding.
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
  // Reserves the hero's height in flow (heroContent is fixed/out of flow).
  // Narrow: the measured --hero-content-height (per-tier constants are the
  // fallback). Desktop: the fixed band.
  heroSpacer: {
    height: {
      default: `var(--hero-content-height, ${HERO_BAND_HEIGHT_2COL}px)`,
      '@media (min-width: 768px)': `var(--hero-content-height, ${HERO_BAND_HEIGHT_NARROW}px)`,
      '@media (min-width: 1024px)': HERO_BAND_HEIGHT,
    },
  },
  // CTA button row, capped at a thumb-reachable width.
  heroButtons: {
    width: '100%',
    maxWidth: 420,
    marginInline: 'auto',
  },
  // On dark slides the hero text switches to a light ink (headline/links inherit).
  heroTextDark: {
    color: 'var(--hero-on-dark)',
  },
  // Normal weight (the value-prop span is semibold); smaller on narrow screens.
  heroHeadline: {
    fontWeight: 'var(--font-weight-normal)',
    fontSize: {
      default: 'var(--font-size-3xl)',
      '@media (min-width: 768px)': 'var(--font-size-4xl)',
      '@media (min-width: 1024px)': 'var(--text-display-1-size)',
    },
  },
  // The surface that scrolls up over the pinned hero (pin-and-cover).
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

// Renders hero controls (CTAs, dots) in the active slide's mode. Always renders
// the same <XDSTheme> element and only toggles `mode` — swapping the element type
// (Fragment ↔ XDSTheme) would remount the subtree and drop keyboard focus from
// the dot the user just activated.
function DarkScope({isDark, children}: {isDark: boolean; children: ReactNode}) {
  return (
    <XDSTheme theme={astryxTheme} mode={isDark ? 'dark' : 'light'}>
      {children}
    </XDSTheme>
  );
}

// Hero text block (wordmark, headline, CTAs, dots, collage). Inside
// HeroReelProvider so it can read isDark and switch to light text on dark slides.
function HeroContent({contentRef}: {contentRef: Ref<HTMLElement>}) {
  const isDark = useHeroReelIsDark();
  // Flag the body on dark slides so the transparent nav can go light (globals.css).
  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-hero-dark', '');
    } else {
      document.body.removeAttribute('data-hero-dark');
    }
    return () => document.body.removeAttribute('data-hero-dark');
  }, [isDark]);
  return (
    <XDSVStack
      ref={contentRef}
      data-home-page="true"
      align="stretch"
      xstyle={[styles.heroContent, isDark && styles.heroTextDark]}>
      <HeroReelWordmark />
      <XDSHeading
        level={1}
        type="display-1"
        color={isDark ? 'inherit' : 'primary'}
        xstyle={styles.heroHeadline}>
        An open source design system that's{' '}
        <XDSText as="span" type="inherit" color="inherit" weight="semibold">
          fully customizable and agent ready
        </XDSText>
      </XDSHeading>
      <XDSVStack gap={4} align="center">
        <DarkScope isDark={isDark}>
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
        </DarkScope>
        <XDSText display="block" color={isDark ? 'inherit' : 'secondary'}>
          Currently in Beta · Built on{' '}
          <XDSLink
            type="body"
            color="inherit"
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            hasUnderline>
            React
          </XDSLink>{' '}
          and{' '}
          <XDSLink
            type="body"
            color="inherit"
            href="https://stylexjs.com"
            target="_blank"
            rel="noopener noreferrer"
            hasUnderline>
            StyleX
          </XDSLink>
        </XDSText>
        {/* Theme switcher dots — jump straight to any theme in the reel. */}
        <DarkScope isDark={isDark}>
          <HeroReelDots />
        </DarkScope>
      </XDSVStack>
      {/* Narrow-screen collage — rendered inside the (fixed) hero content so it's
          pinned with the text and sits a consistent --hero-gap below it. The
          desktop overlap layer (HeroReelCards) hides below 1024px; this
          self-hides at ≥1024px. */}
      <HeroReelStack />
    </XDSVStack>
  );
}

export default function HomePage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const heroScopeRef = useRef<HTMLDivElement | null>(null);
  const heroContentRef = useRef<HTMLElement | null>(null);

  // Measure the (auto-height) narrow hero content and expose it as
  // --hero-content-height so heroSpacer matches it (showcase starts right after
  // the cards). Desktop uses the fixed band, so the var is ignored there.
  useEffect(() => {
    const scope = heroScopeRef.current;
    const content = heroContentRef.current;
    if (!scope || !content) {
      return;
    }
    const navHeight = () => {
      const raw = getComputedStyle(document.documentElement).getPropertyValue(
        '--appshell-header-height',
      );
      return parseFloat(raw) || 64;
    };
    const setVar = () => {
      const total = content.getBoundingClientRect().height + navHeight();
      scope.style.setProperty(
        '--hero-content-height',
        `${Math.round(total)}px`,
      );
    };
    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(content);
    window.addEventListener('resize', setVar, {passive: true});
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
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
      {/* HeroReelProvider holds the shared cycling state for the cards, wordmark,
          and dots. The headline/CTAs stay in stable Astryx brand style. */}
      <HeroReelProvider>
        {/* Desktop overlap cards layer (the gutters). */}
        <HeroReelCards />
        {/* Reserves the fixed hero's height so the showcase starts below it. */}
        <div {...stylex.props(styles.heroSpacer)} aria-hidden="true" />
        <HeroContent contentRef={heroContentRef} />
      </HeroReelProvider>
      <XDSVStack ref={showcaseRef} xstyle={styles.showcaseOverlay}>
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </XDSVStack>
    </div>
  );
}
