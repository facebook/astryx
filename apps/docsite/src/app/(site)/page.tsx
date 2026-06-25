// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef, type Ref, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Link} from '@astryxdesign/core/Link';
import {VStack} from '@astryxdesign/core/Layout';
import {Grid} from '@astryxdesign/core/Grid';
import {Button} from '@astryxdesign/core/Button';
import {Theme} from '@astryxdesign/core/theme';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
// Built theme (__built:true) so <XDSTheme> uses the pre-built CSS and skips
// runtime style injection. Importing the source astryxTheme.ts re-triggers it.
import {astryxTheme} from '@/themes/astryx';
import {layout} from '../../layout.stylex';
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

// Desktop hero band height — reserved by heroSpacer for the fixed (pinned)
// hero. Narrow screens render the hero in normal flow, so they don't use a
// fixed band height.
const HERO_BAND_HEIGHT = 760;

const styles = stylex.create({
  // Wraps hero + showcase so the pin-and-cover stays bounded to this container
  // (not pinned through the footer).
  heroScope: {
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
    // Shared by the nav→wordmark gap and the text→cards gap so they match.
    '--hero-gap': 'calc(var(--spacing-12) * 2)',
  },
  // Hero content column.
  //
  // Desktop (≥1024px): position:fixed (like the aurora glow) so it stays put
  // while the showcase scrolls up and covers it (pin-and-cover). Pulled out of
  // flow; heroSpacer reserves its height.
  //
  // Narrow (<1024px): position:relative (in normal flow). The mobile hero
  // (text + full-height collage) is taller than one viewport, and pinning it
  // left the lower half of the collage stranded below the fold (covered by the
  // showcase instead of scrollable into view). In flow, the hero scrolls
  // normally so the whole collage is visible, then the showcase follows below
  // it. heroSpacer collapses to 0 on narrow so it doesn't double the space.
  heroContent: {
    position: {
      default: 'relative',
      '@media (min-width: 1024px)': 'fixed',
    },
    // Only offset by the nav height when fixed (desktop). On narrow the hero is
    // in flow under the (transparent) nav, so a top offset would just push it
    // down and leave a gap.
    top: {
      default: 0,
      '@media (min-width: 1024px)': 'var(--appshell-header-height, 0px)',
    },
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
    // Narrow: the hero is in flow under the transparent fixed nav (top:0), so
    // pad by the nav height (so the wordmark clears the transparent fixed nav)
    // PLUS a modest gap. The full --hero-gap (96px) on top of the nav height
    // read too tall on phones, so use --spacing-8 (32px) there and the larger
    // --hero-gap from ≥768px where there's more room. Desktop is fixed at
    // top:navHeight and centers, so no top padding.
    paddingBlockStart: {
      default: 'calc(var(--appshell-header-height, 0px) + var(--spacing-8))',
      '@media (min-width: 768px)':
        'calc(var(--appshell-header-height, 0px) + var(--hero-gap))',
      '@media (min-width: 1024px)': 0,
    },
    paddingBlockEnd: spacingVars['--spacing-12'],
    maxWidth: layout.proseMaxWidth,
    marginInline: 'auto',
    paddingInline: spacingVars['--spacing-6'],
    textAlign: 'center',
    gap: spacingVars['--spacing-6'],
    // Decorative-position layer; never intercept clicks outside its actual
    // content (the buttons/links re-enable pointer events on themselves).
    zIndex: 0,
  },
  // Reserves the hero's height in flow when the hero is fixed (desktop only).
  // Narrow: the hero is in normal flow now, so it reserves its own space and
  // this spacer collapses to 0 (otherwise it would double the hero's height).
  // Desktop (≥1024px): the fixed band height.
  heroSpacer: {
    height: {
      default: 0,
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
  // The surface that scrolls up over the pinned hero (pin-and-cover). The top
  // padding, bottom padding, and inter-section gap all use the single
  // --astryx-marketing-section-gap token (which is itself responsive — see
  // globals.css), so the marketing rhythm stays consistent and there are no
  // ad-hoc per-spot spacing values to keep in sync.
  showcaseOverlay: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
    backgroundColor: 'var(--color-background-surface)',
    paddingBlockStart: 'var(--astryx-marketing-section-gap)',
    // Bottom padding stays a standard --spacing-12 (smaller than the section
    // gap): the footer supplies its own top breathing room below this, so the
    // surface doesn't need the full marketing gap here.
    paddingBlockEnd: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-6'],
    gap: 'var(--astryx-marketing-section-gap)',
  },
  // The theme-switcher dots, anchored low in the hero — below the CTAs, sitting
  // 32px (--spacing-8) above the features seam (the hero band's bottom). The
  // hero is
  // position:fixed and the features surface scrolls up over it (pin-and-cover),
  // so the dots naturally get covered as you scroll — no sticky/JS needed.
  //
  // Desktop (≥1024px): the band is a fixed height that vertically CENTERS its
  // content. To put the dots at the bottom WITHOUT disturbing that centering
  // (which sets the wordmark's top padding — must match prod), they're taken out
  // of flow via position:absolute pinned to the band's bottom edge. A plain
  // margin-top:auto would instead absorb the band's free space and shove the
  // centered block (wordmark/headline/CTAs) upward, shrinking the top padding.
  //
  // Narrow (<1024px): the band is auto-height and top-anchored, so absolute
  // positioning would overlap the collage. There the dots stay in normal flow
  // right after the collage. The heroContent VStack already supplies a
  // gap:spacing-6 between flex children, so NO extra paddingBlockStart on narrow
  // (that doubled the gap into an awkwardly large space below the collage); the
  // padding only applies on desktop, where it pads inside the absolute box.
  heroDots: {
    paddingBlockStart: {
      default: 0,
      '@media (min-width: 1024px)': spacingVars['--spacing-6'],
    },
    position: {
      default: 'static',
      '@media (min-width: 1024px)': 'absolute',
    },
    insetBlockEnd: {
      default: 'auto',
      // The fixed hero band's bottom edge sits navHeight px ABOVE where the
      // features surface actually begins (the spacer reserves the full band
      // height from the top of the page, but the overlay starts a nav-height
      // lower). Subtract navHeight so the dots land 32px above the *real* seam,
      // not 32px above the band bottom. Robust to nav-height changes.
      '@media (min-width: 1024px)':
        'calc(var(--spacing-8) - var(--appshell-header-height, 0px))',
    },
    insetInlineStart: {
      default: 'auto',
      '@media (min-width: 1024px)': 0,
    },
    insetInlineEnd: {
      default: 'auto',
      '@media (min-width: 1024px)': 0,
    },
    // Center the dots horizontally within the absolute box on desktop.
    display: 'flex',
    justifyContent: 'center',
  },
});

// Renders hero controls (CTAs, dots) in the active slide's mode. Always renders
// the same <Theme> element and only toggles `mode` — swapping the element type
// (Fragment ↔ Theme) would remount the subtree and drop keyboard focus from
// the dot the user just activated.
function DarkScope({isDark, children}: {isDark: boolean; children: ReactNode}) {
  return (
    <Theme theme={astryxTheme} mode={isDark ? 'dark' : 'light'}>
      {children}
    </Theme>
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
    <VStack
      ref={contentRef}
      data-home-page="true"
      align="stretch"
      xstyle={[styles.heroContent, isDark && styles.heroTextDark]}>
      <HeroReelWordmark />
      <Heading
        level={1}
        type="display-1"
        color={isDark ? 'inherit' : 'primary'}
        xstyle={styles.heroHeadline}>
        An open source design system that's{' '}
        <Text as="span" type="inherit" color="inherit" weight="semibold">
          fully customizable and agent ready
        </Text>
      </Heading>
      <VStack gap={4} align="center">
        <DarkScope isDark={isDark}>
          <Grid columns={2} gap={3} xstyle={styles.heroButtons}>
            <Button
              variant="primary"
              size="lg"
              label="Get started"
              href="/docs/getting-started"
            />
            <Button
              variant="secondary"
              size="lg"
              label="Browse components"
              href="/components"
            />
          </Grid>
        </DarkScope>
        <Text display="block" color={isDark ? 'inherit' : 'secondary'}>
          Currently in Beta · Built on{' '}
          <Link
            type="body"
            color="inherit"
            href="https://react.dev"
            target="_blank"
            rel="noopener noreferrer"
            hasUnderline>
            React
          </Link>{' '}
          and{' '}
          <Link
            type="body"
            color="inherit"
            href="https://stylexjs.com"
            target="_blank"
            rel="noopener noreferrer"
            hasUnderline>
            StyleX
          </Link>
        </Text>
      </VStack>
      {/* Narrow-screen collage — rendered inside the (fixed) hero content so it's
          pinned with the text and sits a consistent --hero-gap below it. The
          desktop overlap layer (HeroReelCards) hides below 1024px; this
          self-hides at ≥1024px. */}
      <HeroReelStack />
      {/* Theme switcher dots — sit at the bottom of the hero on all sizes (below
          the CTAs on desktop, below the collage on narrow). On desktop
          styles.heroDots pins them absolutely 32px above the features seam; on
          narrow they sit in flow right after the collage with a normal gap.
          DarkScope flips the dot ink to match the active slide's light/dark
          mode. */}
      <DarkScope isDark={isDark}>
        <div data-home-page="true" {...stylex.props(styles.heroDots)}>
          <HeroReelDots />
        </div>
      </DarkScope>
    </VStack>
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
      <VStack ref={showcaseRef} xstyle={styles.showcaseOverlay}>
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </VStack>
    </div>
  );
}
