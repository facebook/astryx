// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useEffect, useRef, useState} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSHeading, XDSText} from '@xds/core/Text';
import {XDSLink} from '@xds/core/Link';
import {XDSBadge} from '@xds/core/Badge';
import {XDSVStack} from '@xds/core/Layout';
import {XDSGrid} from '@xds/core/Grid';
import {XDSButton} from '@xds/core/Button';
import {XDSPagination} from '@xds/core/Pagination';
import {spacingVars} from '@xds/core/theme/tokens.stylex';
import {FeaturesShowcase} from './_landing/FeaturesShowcase';
import {AboutShowcase} from './_landing/AboutShowcase';
import {DiscoverShowcase} from './_landing/DiscoverShowcase';

// Carousel slide data — each slide drives the three CSS vars that
// paint the heroAurora gradient blobs. Hex literals (not theme
// tokens) because Astryx's cream body bg #F8F4ED is so close to
// most pastel theme tokens that they wash out completely.
interface HeroSlide {
  colorLeft: string;
  colorCenter: string;
  colorRight: string;
}

// Each color uses CSS light-dark() so the same slot picks a
// pastel in light mode and a deep saturated equivalent in dark
// mode. We use CSS-native light-dark() (not theme tokens) because
// these are decorative one-off splash colors not part of the
// semantic token system — keeping them inline keeps the slide
// palette self-contained and easy to tune per slide.
const HERO_SLIDES: ReadonlyArray<HeroSlide> = [
  // Neutral — matches the reference SVG (warm yellow + soft pink)
  {
    colorLeft: 'light-dark(#FEE48B, #5C4A0F)',
    colorCenter: 'light-dark(#FEE48B, #5C4A0F)',
    colorRight: 'light-dark(#FFC5C5, #5C1F2A)',
  },
  // Butter — warmer all-yellow palette with a peach kicker
  {
    colorLeft: 'light-dark(#FDEE8C, #5C5018)',
    colorCenter: 'light-dark(#FFE0A8, #5C3D14)',
    colorRight: 'light-dark(#FFD4A8, #5C2E10)',
  },
  // Matcha — sage greens with a butter warm accent
  {
    colorLeft: 'light-dark(#C5E0B4, #1F3D14)',
    colorCenter: 'light-dark(#B8E0D2, #143D2E)',
    colorRight: 'light-dark(#FFE8B0, #5C470F)',
  },
  // Y2K — candy pinks + lavender + cyan
  {
    colorLeft: 'light-dark(#FFB6E1, #5C1F4A)',
    colorCenter: 'light-dark(#D4B6FF, #3D1F5C)',
    colorRight: 'light-dark(#B6E0FF, #143D5C)',
  },
];

const HERO_AUTOPLAY_INTERVAL_MS = 5000;

const styles = stylex.create({
  // Wraps hero + showcase together so the sticky hero (position: sticky)
  // bounds its sticky range to this container. Without the wrapper, the
  // hero would stay pinned through the footer (a sibling further down
  // the AppShell main content), which on mobile shows up as the hero
  // bleeding underneath the footer at the bottom of the page.
  heroScope: {
    position: 'relative',
    backgroundColor: 'var(--color-background-body)',
  },
  // Aurora gradient layer — three soft blurred-circle blobs
  // behind the hero, matching the reference "Background
  // Gradient.svg" composition (two warm yellow circles + one
  // peach pink). Pinned to the top of heroScope with a fixed
  // height so it covers only the hero area, not the entire
  // marketing page below — heroScope is the full marketing
  // wrapper (hero + showcase sections), so inset:0 would map
  // the blob positions to percentages of a multi-screen-tall
  // container and push them off-screen.
  //
  // Overscan (negative top/left/right) gives the gaussian blur
  // room to fade past the visible edges cleanly. No z-index
  // here — source order keeps the aurora behind the sticky
  // heroContent and showcaseOverlay siblings without
  // establishing a stacking context that would break the
  // sticky pin-and-cover scroll reveal.
  heroAurora: {
    // position:fixed so the blobs stay locked to the viewport
    // as the user scrolls — they don't parallax with the page.
    // The hero content above uses position:sticky and pins to
    // the same viewport region, so visually the gradient feels
    // anchored to the hero for the entire pin duration. When
    // the showcase scrolls up and covers the hero, it also
    // covers this fixed gradient (showcaseOverlay paints a
    // solid white surface on top), so the gradient cleanly
    // disappears past the hero rather than bleeding into the
    // showcase below.
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: -200,
    right: -200,
    height: 1050,
    pointerEvents: 'none',
    opacity: 0.5,
    // Smooth crossfade as the carousel advances. Animating
    // background-image only is enough since the inline CSS vars
    // (--hero-blob-*) are interpolated when the property changes.
    transition: 'background-image 800ms ease',
    // Heavy gaussian blur — mirrors the reference SVG's
    // feGaussianBlur stdDeviation=85. Turns each solid radial
    // disc into a soft halo bloom that reads as "out of focus
    // colored lights" rather than a sharp painted edge.
    filter: 'blur(60px)',
    // Three solid-color discs (fully saturated to ~90% of
    // their radius then quick fade to transparent). Positions
    // trace the reference SVG: yellow lower-left, yellow
    // center, pink upper-right. Colors come from CSS vars set
    // inline by the active carousel slide so the gradient can
    // crossfade between palettes without re-rendering the
    // stylex rule. Hex literals (not theme tokens) because
    // Astryx's cream body bg #F8F4ED is so close to most pastel
    // theme tokens that they wash out completely.
    backgroundImage:
      'radial-gradient(circle 220px at 22% 55%, var(--hero-blob-left), var(--hero-blob-left) 90%, transparent 100%), ' +
      'radial-gradient(circle 200px at 65% 65%, var(--hero-blob-center), var(--hero-blob-center) 90%, transparent 100%), ' +
      'radial-gradient(circle 260px at 78% 45%, var(--hero-blob-right), var(--hero-blob-right) 90%, transparent 100%)',
  },
  // Pagination dot indicator anchored at the bottom of the hero
  // stack. Center the dot row (the XDSPagination nav element is
  // a flex row by default — this just justifies it horizontally
  // within the centered hero column) and add breathing room above
  // so it doesn't crowd the "Built on React and StyleX" line.
  // Intentionally no z-index here — the sticky scroll reveal
  // depends on heroContent + every descendant staying out of any
  // explicit stacking context so showcaseOverlay can naturally
  // cover them via source-order stacking.
  heroPagination: {
    justifyContent: 'center',
    marginBlockStart: spacingVars['--spacing-8'],
  },
  heroContent: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    maxWidth: 800,
    marginInline: 'auto',
    paddingBlock: `calc(${spacingVars['--spacing-12']} * 3)`,
    paddingInline: spacingVars['--spacing-6'],
    textAlign: 'center',
    gap: spacingVars['--spacing-6'],
  },
  // Wrapper around the wordmark + floating Beta badge. Sized
  // exactly to the wordmark image (display:inline-block with no
  // explicit width, so the inline element shrinks to the image's
  // natural rendered width) and centered horizontally by the
  // parent VStack's align:stretch + the wrapper's marginInline:
  // auto. position:relative establishes the positioning context
  // for the absolutely-positioned Beta badge.
  heroWordmarkWrap: {
    position: 'relative',
    display: 'inline-block',
    alignSelf: 'center',
  },
  heroWordmark: {
    display: 'block',
    // Responsive: scale down on narrow viewports so the wordmark
    // doesn't overflow the hero column. 80px at desktop is the
    // designed size; 56px keeps the wordmark visible without
    // clipping on phones at ~375px viewport.
    height: {
      default: 80,
      '@media (max-width: 480px)': 56,
    },
    width: 'auto',
    maxWidth: '100%',
  },
  // Floating Beta badge wrapper — positions the XDSBadge above
  // the wordmark (bottom anchored to the wordmark's top edge)
  // and offset right so it reads as a callout attached to the
  // brand mark without overlapping any of the glyphs. The XDS
  // Badge component carries the pill chrome (background, radius,
  // typography); only positioning + rotation lives here.
  heroWordmarkBeta: {
    position: 'absolute',
    bottom: '100%',
    right: -24,
    marginBottom: 4,
    transform: 'rotate(8deg)',
    transformOrigin: 'bottom right',
  },
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
    fontWeight: 400,
  },
  // Emphasis weight for the trailing half of the headline so the
  // contrast with the lighter lead reads as an intentional
  // pairing rather than an accidental weight shift.
  heroHeadlineEmphasis: {
    fontWeight: 600,
  },
  showcaseOverlay: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 'var(--radius-page)',
    borderTopRightRadius: 'var(--radius-page)',
    backgroundColor: 'var(--color-background-surface)',
    paddingBlockStart: 100,
    paddingBlockEnd: spacingVars['--spacing-12'],
    paddingInline: spacingVars['--spacing-6'],
    gap: 100,
  },
});

// Aurora gradient layer for the hero. Rendered as a sibling inside
// heroScope (NOT a wrapper around heroContent) so it shares the
// sticky parent without establishing a stacking context that would
// trap heroContent and break the sticky pin-and-cover scroll
// reveal. Must remain the FIRST child of heroScope so source-order
// stacking keeps it behind heroContent + showcaseOverlay.
//
// Theme tokens were tried earlier and washed out against Astryx's
// cream body bg — so the carousel slide drives raw hex colors
// straight into three CSS vars consumed by the radial-gradient
// stack in styles.heroAurora. Animating background-image (declared
// in the stylex rule) gives a smooth crossfade between slides.
function Hero({slide}: {slide: HeroSlide}): React.ReactElement {
  return (
    <div
      {...stylex.props(styles.heroAurora)}
      aria-hidden="true"
      style={
        {
          '--hero-blob-left': slide.colorLeft,
          '--hero-blob-center': slide.colorCenter,
          '--hero-blob-right': slide.colorRight,
        } as React.CSSProperties
      }
    />
  );
}

export default function HomePage() {
  const showcaseRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Pause flag for the autoplay loop. A ref (not state) so the
  // interval handler reads the latest value WITHOUT tearing down
  // and rebuilding the timer on every hover/focus toggle — that
  // churn would reset the visible 5s cadence each time the cursor
  // moved across the hero.
  const pauseRef = useRef(false);
  const slideCount = HERO_SLIDES.length;
  const activeSlide = HERO_SLIDES[activeIndex];

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pauseRef.current) {
        return;
      }
      setActiveIndex(prev => (prev + 1) % slideCount);
    }, HERO_AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [slideCount]);

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
    <div
      {...stylex.props(styles.heroScope)}
      onMouseEnter={() => {
        pauseRef.current = true;
      }}
      onMouseLeave={() => {
        pauseRef.current = false;
      }}
      onFocusCapture={() => {
        pauseRef.current = true;
      }}
      onBlurCapture={() => {
        pauseRef.current = false;
      }}>
      <Hero slide={activeSlide} />
      <XDSVStack
        data-home-page="true"
        align="stretch"
        xstyle={styles.heroContent}>
        <div {...stylex.props(styles.heroWordmarkWrap)}>
          <img
            src="/astryx-logo.svg"
            alt="Astryx"
            {...stylex.props(styles.heroWordmark)}
          />
          <span {...stylex.props(styles.heroWordmarkBeta)}>
            <XDSBadge label="Beta" variant="blue" />
          </span>
        </div>
        <XDSHeading
          level={1}
          type="display-1"
          color="primary"
          xstyle={styles.heroHeadline}>
          An open source design system that's{' '}
          <span {...stylex.props(styles.heroHeadlineEmphasis)}>
            fully customizable and agent ready
          </span>
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
          <XDSText display="block">
            Built on{' '}
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
        </XDSVStack>
        <XDSPagination
          variant="dots"
          page={activeIndex + 1}
          onChange={p => setActiveIndex(p - 1)}
          totalPages={slideCount}
          size="md"
          label="Hero theme carousel"
          xstyle={styles.heroPagination}
        />
      </XDSVStack>
      <XDSVStack ref={showcaseRef} xstyle={styles.showcaseOverlay}>
        <FeaturesShowcase />
        <AboutShowcase />
        <DiscoverShowcase />
      </XDSVStack>
    </div>
  );
}
