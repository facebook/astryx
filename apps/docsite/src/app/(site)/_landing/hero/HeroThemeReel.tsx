// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file HeroThemeReel.tsx
 * @input none (reads the generated theme registry via heroThemeContent)
 * @output Provider + placed pieces (wordmark, cards, dots) consumed by page.tsx
 * @position Home hero — orchestrates the per-theme reel behind the headline.
 *
 * The cycling state (active index + auto-advance clock) lives in HeroReelProvider
 * so the wordmark, cards, and dots — placed in different parts of the DOM by
 * page.tsx — re-skin together. Auto-advance pauses on hover/focus and when the
 * tab is hidden, and respects prefers-reduced-motion.
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
import {useThemeMode} from '../../../providers';
import {HERO_THEME_SLIDES, type HeroThemeSlide} from './heroThemeContent';
import {AstryxWordmark} from './AstryxWordmark';
import {HeroFloatingCards} from './HeroFloatingCards';

// How long each theme stays on screen before auto-advancing (ms).
const ADVANCE_INTERVAL_MS = 4500;

// Auto-advance carousel master switch.
const AUTOPLAY_ENABLED = true;

interface HeroReelState {
  slides: ReadonlyArray<HeroThemeSlide>;
  index: number;
  goTo: (i: number) => void;
  /** Whether entrance/cycle animation should run (false under reduced-motion). */
  animate: boolean;
  setPaused: (paused: boolean) => void;
  /**
   * The docsite's color mode for theme rendering. 'system' on the first paint
   * (before the OS preference resolves) so slides keep `color-scheme: light
   * dark` and their light-dark() tokens follow the OS — no flash (#2713).
   */
  userMode: 'system' | 'light' | 'dark';
}

const HeroReelContext = createContext<HeroReelState | null>(null);

function useHeroReel(): HeroReelState | null {
  return useContext(HeroReelContext);
}

/**
 * The color mode a slide should render in: dark-first themes (e.g. Gothic) are
 * always dark; every other theme follows the docsite's color mode so the hero
 * respects the user's light/dark toggle (and the OS preference via 'system'
 * before that resolves).
 */
function effectiveMode(
  slide: HeroThemeSlide,
  userMode: 'system' | 'light' | 'dark',
): 'system' | 'light' | 'dark' {
  return slide.isDark ? 'dark' : userMode;
}

/**
 * Whether the active hero slide should render with light text/nav. True when
 * the slide is a dark-first theme (e.g. Gothic) OR the docsite is in dark mode —
 * in both cases the hero sits on a dark body and its text/nav must go light.
 * 'system' is treated as not-dark here: the light-text overrides only apply once
 * the resolved dark mode is known, which avoids forcing light ink on a slide
 * that may still paint its light scheme.
 */
export function useHeroReelIsDark(): boolean {
  const reel = useContext(HeroReelContext);
  if (!reel || reel.slides.length === 0) {
    return false;
  }
  const active = reel.slides[reel.index];
  if (!active) {
    return false;
  }
  return effectiveMode(active, reel.userMode) === 'dark';
}

const styles = stylex.create({
  // Centers the wordmark SVG; it paints with currentColor (set per-slide).
  wordmarkWrap: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    transitionProperty: 'color',
    transitionDuration: 'var(--duration-medium, 300ms)',
    transitionTimingFunction: 'var(--ease-standard, ease)',
  },
  // Hero-scale wordmark, smaller on narrow screens.
  wordmark: {
    width: {
      default: 'min(360px, 70%)',
      '@media (min-width: 768px)': 'min(440px, 70%)',
      '@media (min-width: 1024px)': 'min(520px, 70%)',
    },
    height: 'auto',
  },
  // Sticky, zero-height layer hosting the overlap cards so they pin with the
  // hero and don't intercept clicks.
  cardsLayer: {
    position: 'sticky',
    top: 'var(--appshell-header-height, 0px)',
    height: 0,
    width: '100%',
    pointerEvents: 'none',
    zIndex: 0,
  },
  // Per-slide body fill behind the hero (resolves to the active theme's body
  // color). Covers the band + a page-radius extra so the color sits behind the
  // showcase's rounded top corners (no cream notch on dark themes like Gothic).
  themeFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: {
      default:
        'calc(var(--hero-content-height, 760px) + var(--radius-page, 24px))',
      '@media (min-width: 1024px)': 'calc(760px + var(--radius-page, 24px))',
    },
    backgroundColor: 'var(--color-background-body)',
    pointerEvents: 'none',
    transition: 'background-color 600ms ease',
  },
  // Per-slide band behind the transparent top nav so it retints too.
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
  // Blurred aurora glow — fixed, in the same 1200px box as the cards so blobs
  // and cards stay aligned. Capped to 100vw to avoid horizontal scroll. Blob
  // centers sit under the card clusters; colors come from --aurora-* per slide.
  backdropGlow: {
    position: 'fixed',
    top: 'var(--appshell-header-height, 0px)',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(1200px, 100vw)',
    height: 1050,
    pointerEvents: 'none',
    opacity: 0.5,
    transition: 'background-image 800ms ease',
    filter: 'blur(60px)',
    backgroundImage:
      'radial-gradient(circle 220px at 5% 75%, var(--aurora-left), var(--aurora-left) 90%, transparent 100%), ' +
      'radial-gradient(circle 200px at 72% 85%, var(--aurora-center), var(--aurora-center) 90%, transparent 100%), ' +
      'radial-gradient(circle 260px at 92% 65%, var(--aurora-right), var(--aurora-right) 90%, transparent 100%)',
    // Visible at all widths (behind the collage on narrow + overlap on desktop).
    display: 'block',
  },
  // Centers the pagination dots with breathing room above.
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

// Dynamic per-theme values via stylex.create functions (no inline styles).
const dynamic = stylex.create({
  wordmarkColor: (color: string) => ({color}),
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
  const {themeMode: userMode} = useThemeMode();

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
    () => ({slides, index, goTo, animate: !reduceMotion, setPaused, userMode}),
    [slides, index, goTo, reduceMotion, userMode],
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
    <XDSTheme theme={active.theme} mode={effectiveMode(active, reel.userMode)}>
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
    <XDSTheme theme={active.theme} mode={effectiveMode(active, reel.userMode)}>
      <div {...stylex.props(styles.themeFill)} aria-hidden="true" />
      <div {...stylex.props(styles.navBackdrop)} aria-hidden="true" />
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
 * Narrow-screen (collage) variant of the hero cards, placed after the hero text
 * in page.tsx. Self-hides at ≥1024px, where HeroReelCards (overlap) takes over.
 */
export function HeroReelStack() {
  const reel = useHeroReel();
  if (!reel || reel.slides.length === 0) {
    return null;
  }
  const active = reel.slides[reel.index];
  return (
    <XDSTheme theme={active.theme} mode={effectiveMode(active, reel.userMode)}>
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
