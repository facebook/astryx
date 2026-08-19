// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contrast.ts
 * @input CSS color strings (hex, rgb()/rgba()) or parsed RGBA values
 * @output WCAG 2.x relative luminance and contrast ratios
 * @position Theme utility; consumed by expandColorScale.ts and theme tests
 *
 * Dependency-free WCAG 2.x contrast math. Backs the contrast guarantees
 * for generated color tokens (WCAG 1.4.3 text contrast >= 4.5:1,
 * WCAG 1.4.11 non-text contrast >= 3:1).
 *
 * Semi-transparent foregrounds are composited over their backdrop in
 * gamma-encoded sRGB space (matching CSS alpha compositing) before the
 * ratio is measured — a translucent token has no contrast of its own,
 * only against what it renders on.
 */

import type {RGBA} from '../utils/color';
import {parseColor} from '../utils/color';

/**
 * WCAG 2.x relative luminance of an sRGB color (alpha ignored).
 * 0 = black, 1 = white.
 *
 * https://www.w3.org/WAI/WCAG22/Techniques/general/G18
 */
export function relativeLuminance(color: RGBA): number {
  const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * channel(color.r) +
    0.7152 * channel(color.g) +
    0.0722 * channel(color.b)
  );
}

/**
 * Composite a (possibly translucent) foreground over an opaque backdrop
 * using standard source-over alpha blending in gamma-encoded sRGB space,
 * matching how CSS paints translucent tokens. Returns an opaque color.
 */
export function compositeOver(foreground: RGBA, backdrop: RGBA): RGBA {
  const a = foreground.a;
  return {
    r: foreground.r * a + backdrop.r * (1 - a),
    g: foreground.g * a + backdrop.g * (1 - a),
    b: foreground.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

function resolve(value: string | RGBA, label: string): RGBA {
  if (typeof value !== 'string') {
    return value;
  }
  const parsed = parseColor(value);
  if (parsed === null) {
    throw new TypeError(`contrastRatio: could not parse ${label} "${value}"`);
  }
  return parsed;
}

/**
 * WCAG 2.x contrast ratio between a foreground and an opaque background.
 * Returns a value in [1, 21].
 *
 * A translucent foreground is composited over the background first.
 * A translucent background is rejected — composite it over its own
 * backdrop before calling, since its rendered color is unknowable here.
 *
 * @example
 * ```
 * contrastRatio('#000000', '#FFFFFF'); // 21
 * contrastRatio('#0D131A', '#FCFDFE') >= 4.5; // text-on-surface check
 * ```
 */
export function contrastRatio(
  foreground: string | RGBA,
  background: string | RGBA,
): number {
  const bg = resolve(background, 'background');
  if (bg.a < 1) {
    throw new TypeError(
      'contrastRatio: background must be opaque — composite it over its backdrop first',
    );
  }
  let fg = resolve(foreground, 'foreground');
  if (fg.a < 1) {
    fg = compositeOver(fg, bg);
  }
  const lumA = relativeLuminance(fg);
  const lumB = relativeLuminance(bg);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}
