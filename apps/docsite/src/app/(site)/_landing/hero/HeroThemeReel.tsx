// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeroThemeReel.tsx
 * @input none (reads the generated theme registry via heroThemeContent)
 * @output Provider + two placed pieces (wordmark, floating cards) + dots
 * @position Home hero — orchestrates the per-theme reel behind the headline.
 *
 * The hero's themed pieces live in different parts of the DOM: the recolorable
 * wordmark sits in the centered content column (in normal flow, so it defines
 * the hero's height), while the floating UI cards must anchor to the FULL-WIDTH
 * hero scope so they can sit out in the left/right gutters instead of on top of
 * the headline. To keep both pieces re-skinning together and sharing one
 * auto-advance clock, the cycling state lives in a context provider
 * (`HeroReelProvider`) and each piece is a thin consumer placed by page.tsx:
 *
 *   <HeroReelProvider>                 // owns index + timer, no DOM of its own
 *     <div heroScope position:relative>
 *       <HeroReelCards />              // full-bleed absolute layer (gutters)
 *       <div heroContent>             // centered 800px column
 *         <HeroReelWordmark />        // in-flow, centered
 *         ...headline / CTAs (NOT themed — stable Astryx brand)...
 *         <HeroReelDots />            // theme switcher
 *       </div>
 *     </div>
 *   </HeroReelProvider>
 *
 * Behavior: auto-advances on a timer; pauses on hover/focus of the hero or when
 * the tab is hidden; respects prefers-reduced-motion (no auto-advance, no
 * entrance animation) while keeping the dots fully usable.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSTheme} from '@xds/core/theme';
import {XDSText} from '@xds/core/Text';
import {XDSPagination} from '@xds/core/Pagination';
import {useMediaQuery} from '@xds/core/hooks';
import {HERO_THEME_SLIDES, type HeroThemeSlide} from './heroThemeContent';
import {AstryxWordmark} from './AstryxWordmark';
import {HeroFloatingCards} from './HeroFloatingCards';

// How long each theme stays on screen before auto-advancing (ms).
const ADVANCE_INTERVAL_MS = 4500;

// Master switch for the auto-advance carousel. Temporarily off while iterating
// on the hero design — the dots still switch themes manually. Flip back to true
// to re-enable cycling.
const AUTOPLAY_ENABLED = false;

interface HeroReelState {
  slides: ReadonlyArray<HeroThemeSlide>;
  index: number;
  goTo: (i: number) => void;
  /** Whether entrance/cycle animation should run (false under reduced-motion). */
  animate: boolean;
  setPaused: (paused: boolean) => void;
}

const HeroReelContext = createContext<HeroReelState | null>(null);

function useHeroReel(): HeroReelState | null {
  return useContext(HeroReelContext);
}

const styles = stylex.create({
  // Wordmark wrapper — centers the SVG and caps its width. The SVG paints
  // with currentColor; the per-theme `color` is supplied by wordmarkColor()
  // below (dynamic value) since it varies by slide.
  wordmarkWrap: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    transitionProperty: 'color',
    transitionDuration: 'var(--duration-medium, 300ms)',
    transitionTimingFunction: 'var(--ease-standard, ease)',
  },
  // Hero-scale wordmark. Caps at 520px on desktop; smaller on narrow screens so
  // it doesn't dominate (and the glyphs never kiss the viewport edge).
  wordmark: {
    width: {
      default: 'min(360px, 70%)',
      '@media (min-width: 768px)': 'min(440px, 70%)',
      '@media (min-width: 1024px)': 'min(520px, 70%)',
    },
    height: 'auto',
  },
  // Full-bleed layer that hosts the floating cards. It's STICKY (not
  // absolute) with the same top offset + zero height as the hero content
  // column, so it pins to the viewport in lockstep with the sticky hero
  // text instead of scrolling away while the text stays put. Zero height
  // keeps it out of flow; the floating cards inside are absolutely placed
  // relative to this pinned box, so they hang at fixed offsets below the
  // pin point and ride along as the user scrolls the hero. pointer-events:
  // none so the decoration never intercepts clicks meant for the real CTAs.
  cardsLayer: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    height: 0,
    width: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  // Slide-themed body fill behind the hero. Lives inside the reel's themed
  // scope so --color-background-body resolves to the ACTIVE slide's theme body
  // color (not Astryx's default), retinting the whole hero region per slide.
  //
  // position:absolute (anchored to heroScope) with NO z-index — source order
  // puts it on top of heroScope's own (Astryx) background but behind the
  // aurora + content that follow it. (A negative z-index would drop it BEHIND
  // the heroScope background, hiding the retint — that was the earlier bug.)
  // top:0 + height covers the hero band; it scrolls away with the page and the
  // showcase paints over it via later source order.
  themeFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // Matches the hero band height (HERO_BAND_HEIGHT / heroSpacer in
    // page.tsx) so the fill covers exactly the hero region and never overlaps
    // the showcase below (an absolute fill taller than the band would paint
    // over the showcase's top edge since it's out of flow).
    height: 760,
    backgroundColor: 'var(--color-background-body)',
    pointerEvents: 'none',
    transition: 'background-color 600ms ease',
  },
  // Slide-themed band fixed behind the (transparent) top nav so the nav strip
  // retints with the active slide too. Height matches the nav; zIndex:0 sits
  // under the nav but above page content. Inside the themed scope so its
  // --color-background-body is the active slide's.
  navBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--appshell-header-height, 64px)',
    backgroundColor: 'var(--color-background-body)',
    pointerEvents: 'none',
    transition: 'background-color 600ms ease',
    zIndex: 0,
  },
  // Aurora glow behind the hero — replicates the home-page-refresh PR exactly.
  // position:fixed locks the blobs to the viewport as the user scrolls (the
  // sticky hero pins to the same region, so the glow reads as anchored to the
  // hero); when the showcase scrolls up it paints a solid surface over this
  // fixed layer, so the glow cleanly disappears past the hero. Three solid
  // discs (solid to 90% of radius, then quick fade), heavily blurred into soft
  // out-of-focus lights at opacity 0.5. Disc colors come from --aurora-* vars
  // set per-slide by dynamic.aurora(). Every literal here matches the PR.
  backdropGlow: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    // Fixed-width, viewport-centered box — the SAME box the floating cards use
    // (HeroFloatingCards `stage`) so the blobs and the cards share one
    // coordinate space and stay aligned at any screen width.
    left: '50%',
    transform: 'translateX(-50%)',
    // Cap to the viewport so the fixed glow box never forces horizontal scroll
    // on narrow screens.
    width: 'min(1200px, 100vw)',
    height: 1050,
    pointerEvents: 'none',
    opacity: 0.5,
    transition: 'background-image 800ms ease',
    filter: 'blur(60px)',
    // Blob centers sit under the card clusters (same 1200px box): left blob
    // under the left cluster (~5%), center + right blobs under the right
    // cluster (~72% / ~92%).
    backgroundImage:
      'radial-gradient(circle 220px at 5% 75%, var(--aurora-left), var(--aurora-left) 90%, transparent 100%), ' +
      'radial-gradient(circle 200px at 72% 85%, var(--aurora-center), var(--aurora-center) 90%, transparent 100%), ' +
      'radial-gradient(circle 260px at 92% 65%, var(--aurora-right), var(--aurora-right) 90%, transparent 100%)',
    // Visible at all widths so the per-theme aurora glow sits behind the hero on
    // narrow screens (with the collage) as well as the desktop overlap layout.
    display: 'block',
  },
  // Centering wrapper for the XDSPagination dots, with breathing room above
  // so they don't crowd the "Currently in Beta · Built on React and StyleX"
  // line. XDSPagination renders its own centered nav, so this just adds the
  // top margin + centers the nav within the hero column.
  dots: {
    display: 'flex',
    justifyContent: 'center',
    marginBlockStart: 'var(--spacing-6)',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

// Dynamic per-theme values. StyleX functions keep runtime values out of inline
// style attributes (the design system forbids inline styles on raw elements).
const dynamic = stylex.create({
  wordmarkColor: (color: string) => ({color}),
  // Feeds the three aurora disc colors into the gradient via CSS vars.
  aurora: (left: string, center: string, right: string) => ({
    '--aurora-left': left,
    '--aurora-center': center,
    '--aurora-right': right,
  }),
});

/**
 * Owns the cycling state + auto-advance clock and exposes them via context.
 * Renders no DOM of its own beyond the provider + a hover/focus wrapper so the
 * hero can pause cycling while the user interacts with it.
 */
export function HeroReelProvider({children}: {children: ReactNode}) {
  const slides = HERO_THEME_SLIDES;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const goTo = useCallback(
    (next: number) => {
      const count = slides.length;
      if (count === 0) {
        return;
      }
      setIndex(((next % count) + count) % count);
    },
    [slides.length],
  );

  useEffect(() => {
    if (!AUTOPLAY_ENABLED || reduceMotion || paused || slides.length <= 1) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex(i => (i + 1) % slides.length);
    }, ADVANCE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion, paused, slides.length]);

  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const value = useMemo<HeroReelState>(
    () => ({slides, index, goTo, animate: !reduceMotion, setPaused}),
    [slides, index, goTo, reduceMotion],
  );

  return (
    <HeroReelContext value={value}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}>
        {children}
      </div>
    </HeroReelContext>
  );
}

/** Themed, recolorable Astryx wordmark for the centered content column. */
export function HeroReelWordmark() {
  const reel = useHeroReel();

  if (!reel || reel.slides.length === 0) {
    // Fallback: render the static brand wordmark in the default accent so the
    // hero still has a brand mark even if no themes are registered.
    return (
      <div
        {...stylex.props(
          styles.wordmarkWrap,
          dynamic.wordmarkColor('var(--color-text-accent)'),
        )}>
        <AstryxWordmark className={stylex.props(styles.wordmark).className} />
      </div>
    );
  }

  const active = reel.slides[reel.index];
  return (
    <XDSTheme theme={active.theme} mode="light">
      <div
        {...stylex.props(
          styles.wordmarkWrap,
          dynamic.wordmarkColor(active.wordmarkColor),
        )}>
        <AstryxWordmark className={stylex.props(styles.wordmark).className} />
      </div>
    </XDSTheme>
  );
}

/** Full-bleed floating cards layer for the hero gutters. */
export function HeroReelCards() {
  const reel = useHeroReel();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!reel || reel.slides.length === 0) {
    return null;
  }

  const active = reel.slides[reel.index];
  // Entrance animation only runs when motion is allowed; otherwise cards are
  // shown in their resting pose immediately.
  const shown = reel.animate ? mounted : true;

  return (
    <XDSTheme theme={active.theme} mode="light">
      {/* Slide-themed body fill behind the hero region. */}
      <div {...stylex.props(styles.themeFill)} aria-hidden="true" />
      {/* Slide-themed band behind the transparent top nav. */}
      <div {...stylex.props(styles.navBackdrop)} aria-hidden="true" />
      {/* Blurred aurora glow — position:fixed, locked to the viewport behind
          the hero (covered by the showcase on scroll). */}
      <div
        aria-hidden="true"
        {...stylex.props(
          styles.backdropGlow,
          dynamic.aurora(
            active.aurora.left,
            active.aurora.center,
            active.aurora.right,
          ),
        )}
      />
      {/* Floating cards layer */}
      <div {...stylex.props(styles.cardsLayer)}>
        <HeroFloatingCards content={active.content} mounted={shown} />
      </div>
    </XDSTheme>
  );
}

/**
 * Mobile-only stacked variant of the hero cards. The desktop overlap layout
 * (HeroReelCards) hides below 1024px; this renders the same cards as a centered
 * single column in normal flow. Placed after the hero text in page.tsx so it
 * appears below the headline on small screens. Self-hides at ≥1024px via the
 * `stackStage` style.
 */
export function HeroReelStack() {
  const reel = useHeroReel();
  if (!reel || reel.slides.length === 0) {
    return null;
  }
  const active = reel.slides[reel.index];
  return (
    <XDSTheme theme={active.theme} mode="light">
      <HeroFloatingCards content={active.content} mounted layout="stack" />
    </XDSTheme>
  );
}

/** Dot controls + a polite live region announcing the active theme. */
export function HeroReelDots() {
  const reel = useHeroReel();
  if (!reel || reel.slides.length <= 1) {
    return null;
  }
  const {slides, index, goTo} = reel;
  const active = slides[index];

  return (
    <>
      {/* Real XDSPagination (dots variant). It's 1-indexed, so page = index+1.
          The prev/next chevrons it ships with are hidden on the home page via
          a [data-home-page] CSS rule in globals.css, leaving just the dots. */}
      <div {...stylex.props(styles.dots)}>
        <XDSPagination
          variant="dots"
          label="Preview Astryx themes"
          page={index + 1}
          totalPages={slides.length}
          onChange={p => goTo(p - 1)}
        />
      </div>
      <XDSText
        as="span"
        type="supporting"
        aria-live="polite"
        xstyle={styles.srOnly}>
        {active.label} theme
      </XDSText>
    </>
  );
}
