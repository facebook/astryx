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
// paint the heroAurora gradient blobs. Color values resolve to
// marketing-only theme tokens declared in astryxTheme.ts
// (`--xds-marketing-hero-*-{left,center,right}`); the slide data
// here only names which palette feeds the gradient. Each token is
// itself a `light-dark()` pair, so dark mode handling is inherited
// for free.
interface HeroSlide {
  colorLeft: string;
  colorCenter: string;
  colorRight: string;
}

// Hero splash palettes — pulled from the categorical (non-
// semantic) background color tokens so each slide maps to a
// theme's pink / yellow / orange / blue / etc. ramp. Theme
// authors can override these tokens to retint the hero
// splashes without touching this file, and dark mode is handled
// by the tokens' built-in light-dark() pairs.
const HERO_SLIDES: ReadonlyArray<HeroSlide> = [
  // Neutral — warm yellow + soft pink (matches the reference SVG).
  {
    colorLeft: 'var(--color-background-yellow)',
    colorCenter: 'var(--color-background-yellow)',
    colorRight: 'var(--color-background-pink)',
  },
  // Butter — all yellows + a peach kicker.
  {
    colorLeft: 'var(--color-background-yellow)',
    colorCenter: 'var(--color-background-yellow)',
    colorRight: 'var(--color-background-orange)',
  },
  // Matcha — sage greens + a butter warm accent.
  {
    colorLeft: 'var(--color-background-green)',
    colorCenter: 'var(--color-background-cyan)',
    colorRight: 'var(--color-background-yellow)',
  },
  // Y2K — candy pinks + lavender + cyan.
  {
    colorLeft: 'var(--color-background-pink)',
    colorCenter: 'var(--color-background-purple)',
    colorRight: 'var(--color-background-blue)',
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
  // No z-index here — source order keeps the aurora behind the
  // sticky heroContent and showcaseOverlay siblings without
  // establishing a stacking context that would break the
  // sticky pin-and-cover scroll reveal.
  //
  // Every literal pixel value in this rule is a one-off
  // marketing-visual dimension, NOT something derivable from
  // the design system's spacing scale. These are tuned by hand
  // against the reference SVG and should stay as literals:
  //
  //   • left: -200 / right: -200 — overscan so the gaussian
  //     blur fades past the visible viewport edges cleanly;
  //     200px is roughly 3.5× the blur radius (60px) so the
  //     halo never clips against the screen edge.
  //   • height: 1050 — fixed hero band height in viewport
  //     space, matching the reference SVG canvas. Not the
  //     viewport height (`100vh`) because the blobs are placed
  //     at percentages of THIS height; tying that to viewport
  //     would mean the composition moves around vertically on
  //     short screens.
  //   • filter: blur(60px) — mirrors the reference SVG's
  //     feGaussianBlur stdDeviation=85. Turns each solid disc
  //     into a soft halo bloom that reads as "out of focus
  //     colored lights" rather than a sharp painted edge.
  //   • radial-gradient `circle 220px/200px/260px` — disc
  //     radii from the reference SVG; the slight per-blob
  //     variation reads as organic rather than mechanical.
  //   • Percentage positions (22% 55%, 65% 65%, 78% 45%)
  //     trace the reference SVG's blob placement exactly.
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
    filter: 'blur(60px)',
    // Three solid-color discs (fully saturated to ~90% of
    // their radius then quick fade to transparent). Colors come
    // from --hero-blob-* CSS vars set inline by the active
    // carousel slide; each --hero-blob-* var resolves to a
    // marketing theme token (--xds-marketing-hero-*), so the
    // entire palette stays at the theme layer and the
    // background-image declaration carries no literal colors.
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
  // Hero content column. maxWidth: 800 is an editorial reading-
  // measure cap (≈ display-1 + body at a comfortable line length);
  // not derivable from the spacing scale, kept as a literal
  // because it's a marketing-section measure, not a system primitive.
  // paddingBlock = --spacing-12 * 3 → 144px top/bottom; expressed
  // as a calc() over the spacing token so the rhythm scales with
  // any future spacing-scale theme override.
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
  //
  // right: -24 is a literal pixel offset (not a spacing token)
  // because the badge anchor is tied to the wordmark glyph
  // geometry — the badge needs to clear the rightmost ligature
  // by a precise visual margin that doesn't correspond to any
  // spacing-scale step. Negative spacing tokens don't exist in
  // the scale anyway, so even the symmetric "24px" would be a
  // literal here.
  heroWordmarkBeta: {
    position: 'absolute',
    bottom: '100%',
    right: -24,
    marginBottom: spacingVars['--spacing-1'],
    transform: 'rotate(8deg)',
    transformOrigin: 'bottom right',
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
  },
  // The showcase overlay paints the surface that scrolls UP over
  // the pinned hero (pin-and-cover reveal). Surface color +
  // top-rounded corners + body padding all sit on tokens, but
  // paddingBlockStart and gap are literal 100px values — these
  // are marketing-section rhythm, NOT primitives in the spacing
  // scale (closest tokens would be --spacing-12 at 48px, or
  // --spacing-11 at 44px). Picking 100 lets the showcase sections
  // breathe with the surrounding hero air without snapping to a
  // narrower system step that would feel cramped. Kept as
  // literals (not exotic `calc()` chains over spacing tokens)
  // because the intent is "this is a one-off marketing rhythm",
  // not "this is 2× spacing-12 + spacing-1".
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

// Aurora gradient layer for the hero. Rendered as a sibling inside
// heroScope (NOT a wrapper around heroContent) so it shares the
// sticky parent without establishing a stacking context that would
// trap heroContent and break the sticky pin-and-cover scroll
// reveal. Must remain the FIRST child of heroScope so source-order
// stacking keeps it behind heroContent + showcaseOverlay.
//
// Each carousel slide's three color slots resolve to marketing
// theme tokens (--xds-marketing-hero-*-{left,center,right} in
// astryxTheme.ts) — the slide forwards those token references into
// three local CSS vars (--hero-blob-*) via inline `style`, which
// the radial-gradient stack in styles.heroAurora consumes.
// Animating background-image (declared in the stylex rule) gives
// a smooth crossfade between slides; the CSS vars carry the
// concrete colors so the static stylex rule never re-renders.
//
// Rendered as a raw <div> because this is a purely decorative,
// absolutely-positioned visual layer (aria-hidden) with no
// semantics — no XDS primitive represents "decorative background
// layer". Inline style is the documented stylex pattern for
// per-instance CSS-var values (see stylex docs: dynamic / runtime
// values must go through inline style or stylex.create()
// dynamic-function styles).
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
        {/* heroWordmarkWrap is a raw <div> because its sole job is
            to establish a `position: relative` context for the
            absolutely-positioned Beta badge while sizing exactly to
            the inline wordmark image's natural width. XDSVStack /
            XDSHStack would impose flex semantics that fight the
            inline-block sizing; no other XDS primitive represents
            "positioning context that hugs an inline child". */}
        <div {...stylex.props(styles.heroWordmarkWrap)}>
          {/* Raw <img> — @xds/core does not export a general-purpose
              image component (XDSThumbnail is chat-attachment chrome;
              XDSIcon is a glyph registry). Sizing + responsive
              breakpoints come from the heroWordmark xstyle. */}
          <img
            src="/astryx-logo.svg"
            alt="Astryx"
            {...stylex.props(styles.heroWordmark)}
          />
          {/* heroWordmarkBeta is a raw <span> because we need an
              inline-level element that establishes its own
              position:absolute context for the XDSBadge — a stack
              would force flex children and break the floating
              callout placement. */}
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
