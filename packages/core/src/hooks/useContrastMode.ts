// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useContrastMode.ts
 * @input Ref to the element that paints the surface
 * @output MediaTheme mode ('dark' | 'light' | 'off') plus the measurement behind it
 * @position INTERNAL hook — not exported from the package. Toast is the only
 *   consumer; a second one, or a decision to fold this into
 *   `MediaTheme mode="auto"`, is what would settle its public shape.
 *   Sibling to useImageMode, which detects a mode from image pixels.
 *
 * A component asks for the media context it wants. This hook only checks
 * whether that request is obviously broken on the surface the browser
 * actually painted, and escapes if so — it does not enforce contrast, and it
 * does not second-guess a theme that is merely low-contrast on purpose.
 *
 * The bug it exists for: `--color-background-inverted` is not required to be
 * inverted. A theme can define it as a pale grey, and a statically-applied
 * `mode="dark"` then paints white text on it at 1.25:1. That is not a taste
 * question, it is unreadable — and the component has no way to know, because
 * the assumption lives in a ternary rather than in anything measured.
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
 * // "dark" is the intent; the hook returns it back unless it is broken here.
 * const contrast = useContrastMode(ref, 'dark');
 * return (
 *   <div ref={ref} style={{background: 'var(--color-background-inverted)'}}>
 *     <MediaTheme mode={contrast?.mode ?? 'dark'}>{children}</MediaTheme>
 *   </div>
 * );
 * ```
 */

import {useState} from 'react';
import type {RefObject} from 'react';
import type {RGBA} from '../utils/color';
import {parseColor, formatColor} from '../utils/color';
import {contrastRatio, compositeOver} from '../theme/contrast';
import {useTheme} from '../theme/useTheme';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

/** Surface luminance context, including "no media theme at all". */
export type ContrastMode = 'dark' | 'light' | 'off';

/** The media context a component asks for, before any measurement. */
export type RequestedMediaMode = 'dark' | 'light';

/** What the DOM measurement found, and what it implies. */
export interface ContrastMeasurement {
  /** MediaTheme mode to use — the requested one unless it was broken. */
  mode: ContrastMode;
  /** True when the request was overridden. */
  isCorrected: boolean;
  /** Ratio the requested mode would have produced, WCAG 2.x [1, 21]. */
  requestedRatio: number;
  /** Ratio the returned mode produces. */
  resolvedRatio: number;
  /** Ratio of the ambient foreground against the surface. */
  ambientRatio: number;
  /** Composited surface color, as an opaque `#RRGGBB` string. */
  background: string;
  /** Ambient foreground (`--color-text-primary`), as a `#RRGGBB` string. */
  foreground: string;
}

export interface UseContrastModeOptions {
  /**
   * The ratio below which the requested mode counts as broken rather than
   * merely low-contrast.
   *
   * This is a floor for "obviously a bug", not a contrast target: the hook is
   * here to catch white-on-pale-grey, not to enforce WCAG or to overrule a
   * theme that chose a soft pairing deliberately. 3:1 is WCAG's own
   * non-text/large-text line — below it nothing is arguably legible, above it
   * the theme's call stands. Raising this turns the guard into an enforcer;
   * that is a different feature and probably belongs elsewhere.
   * @default 3
   */
  minContrast?: number;
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
 * Check a requested media mode against measured colors, and escape only if it
 * is broken. Pure — the DOM read is the caller's.
 *
 * The escape prefers the opposite mode over `'off'`: the component asked for
 * media treatment, and the usual bug is that it named the wrong side, not
 * that it wanted no treatment. `'off'` is the answer when neither media side
 * works but the theme's own ambient text does. When nothing clears the floor
 * the request stands — there is no better answer, and churning the tree to a
 * different broken state helps no one.
 */
export function decideContrastMode(
  requested: RequestedMediaMode,
  foreground: RGBA,
  background: RGBA,
  mediaForegrounds: MediaForegrounds,
  minContrast: number,
): Omit<ContrastMeasurement, 'background' | 'foreground'> {
  const ratioOf = (color: RGBA | null): number | null =>
    color === null ? null : contrastRatio(color, background);

  const ambientRatio = contrastRatio(foreground, background);
  const requestedRatio = ratioOf(mediaForegrounds[requested]);

  const keep = (
    mode: ContrastMode,
    resolvedRatio: number,
  ): Omit<ContrastMeasurement, 'background' | 'foreground'> => ({
    mode,
    isCorrected: mode !== requested,
    // With no readable --color-on-* token there is nothing to report but the
    // ambient measurement; the request is passed through untouched.
    requestedRatio: requestedRatio ?? ambientRatio,
    resolvedRatio,
    ambientRatio,
  });

  if (requestedRatio === null || requestedRatio >= minContrast) {
    return keep(requested, requestedRatio ?? ambientRatio);
  }

  const flipped: RequestedMediaMode = requested === 'dark' ? 'light' : 'dark';
  const flippedRatio = ratioOf(mediaForegrounds[flipped]);
  if (flippedRatio !== null && flippedRatio >= minContrast) {
    return keep(flipped, flippedRatio);
  }

  if (ambientRatio >= minContrast) {
    return keep('off', ambientRatio);
  }

  return keep(requested, requestedRatio);
}

/**
 * Check whether a requested media mode is broken on the surface the browser
 * painted, and escape if so. Returns null until the first measurement (SSR,
 * or before the layout effect runs) — render the requested mode until then.
 */
export function useContrastMode(
  ref: RefObject<HTMLElement | null>,
  requested: RequestedMediaMode,
  options: UseContrastModeOptions = {},
): ContrastMeasurement | null {
  const {minContrast = 3, watch = [], isEnabled = true} = options;
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
    // and a guess is worse than leaving the request alone. This is also what
    // keeps jsdom — where no stylesheet is applied — from "measuring" black
    // on white and correcting every surface.
    if (foreground === null || background === null) {
      return;
    }

    const decision = decideContrastMode(
      requested,
      foreground,
      background,
      {dark: onDark, light: onLight},
      minContrast,
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
  }, [ref, requested, minContrast, isEnabled, tokens, themeMode, ...watch]);

  return isEnabled ? measurement : null;
}
