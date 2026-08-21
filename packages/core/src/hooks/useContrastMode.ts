// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useContrastMode.ts
 * @input Ref to the element that paints the surface
 * @output MediaTheme mode ('dark' | 'light' | 'off') plus the measurement behind it
 * @position Hook; auto-detects a MediaTheme mode from painted colors.
 *   Sibling to useImageMode, which detects one from image pixels.
 *
 * A surface only needs MediaTheme when its own background pulls the ambient
 * foreground out of contrast. Themes are free to define
 * `--color-background-inverted` as something that is not actually inverted,
 * and then a statically-applied `mode="dark"` paints white text on a light
 * surface. This hook decides from what the browser actually painted instead
 * of from what the token is named.
 *
 * The measurement deliberately reads the surface element — the one that owns
 * the background and sits OUTSIDE the MediaTheme it controls. Both inputs are
 * therefore independent of the decision, so applying the result can never
 * change the next measurement and the decision cannot oscillate.
 *
 * The foreground it measures is `--color-text-primary`, resolved through a
 * hidden probe. That is the color Text and Icon actually paint with; a
 * surface's own inherited `color` can differ from it, and children never read
 * that.
 *
 * @example
 * ```
 * const ref = useRef<HTMLDivElement>(null);
 * const contrast = useContrastMode(ref);
 * return (
 *   <div ref={ref} style={{background: 'var(--color-background-inverted)'}}>
 *     <MediaTheme mode={contrast?.mode ?? 'dark'}>{children}</MediaTheme>
 *   </div>
 * );
 * ```
 *
 * SYNC: When modified, update:
 * - /packages/core/src/hooks/index.ts
 */

import {useState} from 'react';
import type {RefObject} from 'react';
import type {RGBA} from '../utils/color';
import {parseColor, formatColor} from '../utils/color';
import {
  contrastRatio,
  compositeOver,
  relativeLuminance,
} from '../theme/contrast';
import {useTheme} from '../theme/useTheme';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

/** Surface luminance context, including "no media theme at all". */
export type ContrastMode = 'dark' | 'light' | 'off';

/** What the DOM measurement found, and what it implies. */
export interface ContrastMeasurement {
  /** MediaTheme mode this surface should use. */
  mode: ContrastMode;
  /** Ratio of the ambient foreground against the surface, WCAG 2.x [1, 21]. */
  ambientRatio: number;
  /** Ratio the chosen mode yields — equal to ambientRatio when 'off'. */
  resolvedRatio: number;
  /** Composited surface color, as an opaque `#RRGGBB` string. */
  background: string;
  /** Ambient foreground (`--color-text-primary`), as a `#RRGGBB` string. */
  foreground: string;
}

export interface UseContrastModeOptions {
  /**
   * Contrast the ambient pairing must reach for the surface to stay 'off'.
   *
   * Defaults to 7 (WCAG AAA) rather than the 4.5 AA line on purpose: a media
   * theme carries more than text color — interaction overlays, borders and
   * accent all flip with it — so a surface should only skip it when the
   * ambient pairing is comfortable, not merely passing. At 7, every stock
   * Astryx surface keeps the mode it has today.
   * @default 7
   */
  threshold?: number;
  /**
   * Values that change the painted colors and so must force a re-measure
   * (a variant prop, for example). Theme and color mode are tracked already.
   * @default []
   */
  watch?: ReadonlyArray<unknown>;
  /** Set false to skip measuring entirely. @default true */
  isEnabled?: boolean;
}

/**
 * Foregrounds MediaTheme would install, read off the surface's own
 * custom properties so a theme's values are used rather than assumed.
 */
interface MediaForegrounds {
  dark: RGBA | null;
  light: RGBA | null;
}

/**
 * Resolve token references to the colors they actually paint, by reading
 * them back off a hidden probe inside the surface.
 *
 * A custom property cannot simply be read: `getPropertyValue` returns the
 * token's *specified* text, and Astryx tokens are `light-dark(a, b)` pairs
 * that resolve only once used in a real property. The probe assigns each
 * token to `color` and reads the computed value back, which the browser has
 * resolved against the surface's own color-scheme and any overrides.
 *
 * `display: none` keeps the probe out of layout — computed color still
 * resolves — so this costs a style recalc and no reflow.
 */
function resolvePaintedColors(
  host: HTMLElement,
  tokens: ReadonlyArray<string>,
): (RGBA | null)[] {
  const probe = document.createElement('span');
  probe.style.display = 'none';
  host.appendChild(probe);
  try {
    return tokens.map(token => {
      probe.style.color = `var(${token})`;
      return parseColor(getComputedStyle(probe).color);
    });
  } finally {
    probe.remove();
  }
}

/**
 * The color actually behind an element: its own background if opaque,
 * otherwise its translucent layers composited down onto the first opaque
 * ancestor. Returns null when the chain never reaches an opaque layer — the
 * paint is then the browser canvas, which no computed style reports.
 */
function resolveBackdrop(element: HTMLElement): RGBA | null {
  const layers: RGBA[] = [];
  let node: HTMLElement | null = element;

  while (node !== null) {
    const color = parseColor(getComputedStyle(node).backgroundColor);
    if (color !== null && color.a > 0) {
      layers.push(color);
      if (color.a >= 1) {
        break;
      }
    }
    node = node.parentElement;
  }

  const base = layers.pop();
  if (base === undefined || base.a < 1) {
    return null;
  }
  // layers is now top-first; composite downward so the topmost lands last.
  return layers.reduceRight(
    (backdrop, layer) => compositeOver(layer, backdrop),
    base,
  );
}

/**
 * Choose a mode from measured colors. Pure — the DOM read is the caller's.
 *
 * Stays 'off' when the ambient pairing already clears the threshold, and
 * also when neither media foreground would beat it: a media theme that does
 * not improve contrast is a change with no benefit.
 */
export function decideContrastMode(
  foreground: RGBA,
  background: RGBA,
  mediaForegrounds: MediaForegrounds,
  threshold: number,
): Omit<ContrastMeasurement, 'background' | 'foreground'> {
  const ambientRatio = contrastRatio(foreground, background);
  if (ambientRatio >= threshold) {
    return {mode: 'off', ambientRatio, resolvedRatio: ambientRatio};
  }

  const candidates = (['dark', 'light'] as const)
    .map(mode => {
      const color = mediaForegrounds[mode];
      return color === null
        ? null
        : {mode, ratio: contrastRatio(color, background)};
    })
    .filter(candidate => candidate !== null);

  if (candidates.length === 0) {
    // No usable --color-on-* tokens: fall back to the luminance of the
    // surface, which is what a hand-written static rule would have assumed.
    const mode = relativeLuminance(background) < 0.5 ? 'dark' : 'light';
    return {mode, ambientRatio, resolvedRatio: ambientRatio};
  }

  const best = candidates.reduce((a, b) => (b.ratio > a.ratio ? b : a));
  return best.ratio > ambientRatio
    ? {mode: best.mode, ambientRatio, resolvedRatio: best.ratio}
    : {mode: 'off', ambientRatio, resolvedRatio: ambientRatio};
}

/**
 * Decide whether a surface needs MediaTheme, from the colors the browser
 * painted. Returns null until the first measurement (SSR, or before the
 * layout effect runs) — render a static guess for that frame.
 */
export function useContrastMode(
  ref: RefObject<HTMLElement | null>,
  options: UseContrastModeOptions = {},
): ContrastMeasurement | null {
  const {threshold = 7, watch = [], isEnabled = true} = options;
  const [measurement, setMeasurement] = useState<ContrastMeasurement | null>(
    null,
  );
  // Stable across renders unless the theme or the color mode changes.
  const {tokens, mode: themeMode} = useTheme();

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!isEnabled || element === null) {
      return;
    }

    const background = resolveBackdrop(element);

    // The ambient foreground is the token children actually paint with, not
    // the surface's inherited `color`: Text and Icon set
    // `color: var(--color-text-primary)` explicitly, so a surface can inherit
    // one color while its children render another.
    const [ambient, onDark, onLight] = resolvePaintedColors(element, [
      '--color-text-primary',
      '--color-on-dark',
      '--color-on-light',
    ]);
    const foreground = ambient ?? parseColor(getComputedStyle(element).color);

    // No opaque backdrop in the chain, or a color we cannot parse (a
    // wide-gamut or relative-color token): we do not know what is painted,
    // and a guess is worse than the caller's static fallback. This is also
    // what keeps jsdom — where no stylesheet is applied — from "measuring"
    // black on white and switching every surface off.
    if (foreground === null || background === null) {
      return;
    }

    const decision = decideContrastMode(
      foreground,
      background,
      {dark: onDark, light: onLight},
      threshold,
    );

    const next: ContrastMeasurement = {
      ...decision,
      background: formatColor(background),
      foreground: formatColor(foreground),
    };

    // eslint-disable-next-line @eslint-react/set-state-in-effect -- the media mode is derived from painted DOM colors
    setMeasurement(current =>
      current !== null &&
      current.mode === next.mode &&
      current.background === next.background &&
      current.foreground === next.foreground
        ? current
        : next,
    );
  }, [ref, threshold, isEnabled, tokens, themeMode, ...watch]);

  return isEnabled ? measurement : null;
}
