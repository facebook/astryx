// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useAutoMediaMode.ts
 * @input Ref to the element whose backdrop should be measured
 * @output 'dark' | 'light' | null (not yet measurable)
 * @position INTERNAL — powers `MediaTheme mode="auto"`. Not exported from the
 *   package: MediaTheme is the supported surface for this behavior.
 *   Sibling to useImageMode, which answers the same question for images.
 *
 * Picks the media context a surface wants by measuring what the browser
 * actually painted, rather than trusting a token's name.
 *
 * The bug it exists for: `--color-background-inverted` is not required to be
 * inverted. A theme can define it as a pale grey, and a hardcoded
 * `mode="dark"` then paints white text on it at 1.25:1. Because the surface
 * colour is a runtime value and the mode is a compile-time guess, no amount
 * of care in the component can catch that.
 *
 * The answer can also be `'off'`: when the surface's own ambient text already
 * reads on it, the surface is not effectively inverted and does not want a
 * media context. Verified in Chromium that this loses nothing on a surface
 * that is chromatic but legible — the dark-mode error toast renders
 * identically either way, because a dark page already resolves those tokens
 * to the values the media context would install.
 *
 * @example
 * ```
 * // Inside MediaTheme; see its `mode="auto"`.
 * const detected = useAutoMediaMode(ref, mode === 'auto');
 * ```
 */

import {useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {RGBA} from '../utils/color';
import {parseColor, formatColor} from '../utils/color';
import {contrastRatio, compositeOver} from '../theme/contrast';
import {useTheme} from '../theme/useTheme';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

/** A surface luminance context, or `"off"` when no media context is wanted. */
export type DetectedMediaMode = 'dark' | 'light' | 'off';

/**
 * Resolve token references to the colors they actually paint, by reading them
 * back off a hidden probe.
 *
 * A custom property cannot simply be read: `getPropertyValue` returns the
 * token's *specified* text, and Astryx tokens are `light-dark(a, b)` pairs
 * that resolve only once used in a real property. The probe assigns each
 * token to `color` and reads the computed value back, which the browser has
 * resolved against the host's own color-scheme and any overrides.
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
 * ancestor.
 *
 * Returns null when the paint is not knowable from CSS:
 * - a `background-image` (gradient, photo, video poster) anywhere in the
 *   chain — its pixels need sampling, which is `useImageMode`'s job and
 *   needs CORS access the stylesheet cannot give us;
 * - no opaque layer at all, where the paint is the browser canvas.
 */
function resolveBackdrop(element: HTMLElement): RGBA | null {
  const layers: RGBA[] = [];
  let node: HTMLElement | null = element;

  while (node !== null) {
    const style = getComputedStyle(node);
    if (style.backgroundImage !== 'none') {
      return null;
    }
    const color = parseColor(style.backgroundColor);
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
 * Contrast at which a surface's own ambient text counts as reading well
 * enough that no media context is wanted.
 *
 * WCAG's non-text / large-text line. It is deliberately low: this decides
 * whether a surface is *effectively inverted*, not whether its text meets a
 * standard. A pairing that clears 3:1 is one the theme is rendering
 * successfully, and swapping in a media context there changes accent,
 * overlays and borders for no legibility gain.
 */
const AMBIENT_READS_AT = 3;

/**
 * Which media context a surface wants: `'off'` when its ambient text already
 * reads on the surface, otherwise whichever on-color reads better. Pure — the
 * DOM read is the caller's. Ties between the two sides go to dark, matching
 * the convention that an inverted surface is usually the dark one.
 *
 * The `'off'` answer is the point of measuring at all. A surface that a theme
 * calls inverted but paints pale does not want an inverted context; its own
 * text is already correct for it, and forcing one is how white-on-pale-grey
 * happens.
 */
export function pickMediaMode(
  background: RGBA,
  ambient: RGBA | null,
  onDark: RGBA | null,
  onLight: RGBA | null,
): DetectedMediaMode | null {
  if (onDark === null || onLight === null) {
    return null;
  }

  if (
    ambient !== null &&
    contrastRatio(ambient, background) >= AMBIENT_READS_AT
  ) {
    return 'off';
  }

  return contrastRatio(onDark, background) >= contrastRatio(onLight, background)
    ? 'dark'
    : 'light';
}

/**
 * Detect the media context for the element's surroundings.
 *
 * Measures `ref`'s PARENT, never `ref` itself: MediaTheme sets its media
 * attribute on its own element, so measuring that would feed the decision
 * back into its own input and let it oscillate. The parent owns the
 * background and sits outside the media context, so both inputs stay
 * independent of the result.
 *
 * Returns null until a measurement succeeds — on the server, before the
 * layout effect runs, and whenever the backdrop is not knowable from CSS.
 * The caller renders its fallback for those.
 */
export function useAutoMediaMode(
  ref: RefObject<HTMLElement | null>,
  isEnabled: boolean,
): DetectedMediaMode | null {
  const [detected, setDetected] = useState<DetectedMediaMode | null>(null);
  // `tokens` is a stable reference unless the theme or color mode changes.
  const {tokens} = useTheme();
  const lastRef = useRef<{background: string; tokens: unknown} | null>(null);

  // Deliberately no dependency array. A surface's color is a painted value:
  // it changes when a prop on some ancestor changes, and no dependency this
  // hook could name would catch that (an earlier revision took a `watch`
  // array and silently went stale whenever a caller forgot an entry). So the
  // measurement re-runs whenever anything re-renders, and skips its own
  // expensive half when nothing moved — see the early return below.
  useIsomorphicLayoutEffect(() => {
    const surface = ref.current?.parentElement ?? null;
    if (!isEnabled || surface === null) {
      return;
    }

    const background = resolveBackdrop(surface);
    if (background === null) {
      return;
    }

    // The backdrop walk above is a couple of getComputedStyle reads; the
    // probe below appends a node and forces another style resolution. Skip
    // it when neither the painted backdrop nor the theme has moved, which is
    // the overwhelmingly common render.
    const backgroundKey = formatColor(background);
    const last = lastRef.current;
    if (
      last !== null &&
      last.background === backgroundKey &&
      last.tokens === tokens
    ) {
      return;
    }
    lastRef.current = {background: backgroundKey, tokens};

    const [ambient, onDark, onLight] = resolvePaintedColors(surface, [
      '--color-text-primary',
      '--color-on-dark',
      '--color-on-light',
    ]);
    const next = pickMediaMode(background, ambient, onDark, onLight);
    if (next === null) {
      return;
    }

    // eslint-disable-next-line @eslint-react/set-state-in-effect -- the mode is derived from painted DOM colors
    setDetected(current => (current === next ? current : next));
  });

  // A disabled hook must not answer with a value measured while it was on.
  return isEnabled ? detected : null;
}
