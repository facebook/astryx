// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file wcag.ts
 * @input CSS color strings (hex, rgb/rgba, keywords, var() refs) and resolved token maps
 * @output WCAG 2.1 relative luminance, contrast ratios, and alpha-composited colors
 * @position Pure color math for the theme contrast audit; no repo dependencies
 *
 * Implements the WCAG 2.1 definitions exactly (sRGB relative luminance,
 * (L1 + 0.05) / (L2 + 0.05) ratio). Translucent foregrounds/backgrounds are
 * alpha-composited onto their backing surface before measuring, matching what
 * a screen shows and what tools like Colour Contrast Analyser measure.
 */

export type RGBA = {r: number; g: number; b: number; a: number};

const KEYWORDS: Record<string, RGBA> = {
  black: {r: 0, g: 0, b: 0, a: 1},
  white: {r: 255, g: 255, b: 255, a: 1},
  transparent: {r: 0, g: 0, b: 0, a: 0},
};

/**
 * Parse a CSS color literal. Supports #rgb/#rgba/#rrggbb/#rrggbbaa,
 * rgb()/rgba() (comma or space separated), and the keywords
 * black/white/transparent. Returns null for anything else (oklch,
 * color-mix, gradients) so callers can decide how to handle it.
 */
export function parseColor(input: string): RGBA | null {
  const value = input.trim().toLowerCase();

  if (value in KEYWORDS) {
    return {...KEYWORDS[value]};
  }

  if (value.startsWith('#')) {
    const hex = value.slice(1);
    if (!/^[0-9a-f]+$/.test(hex)) {
      return null;
    }
    if (hex.length === 3 || hex.length === 4) {
      const [r, g, b, a] = hex.split('').map(c => parseInt(c + c, 16));
      return {r, g, b, a: hex.length === 4 ? a / 255 : 1};
    }
    if (hex.length === 6 || hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      };
    }
    return null;
  }

  const fnMatch = value.match(/^rgba?\(([^)]+)\)$/);
  if (fnMatch) {
    const parts = fnMatch[1].split(/[,/\s]+/).filter(Boolean);
    if (parts.length < 3) {
      return null;
    }
    const clamp = (n: number, max: number): number =>
      Math.min(max, Math.max(0, n));
    const channel = (raw: string): number =>
      clamp(
        raw.endsWith('%') ? (parseFloat(raw) / 100) * 255 : parseFloat(raw),
        255,
      );
    const alpha = (raw: string | undefined): number => {
      if (raw === undefined) {
        return 1;
      }
      return clamp(
        raw.endsWith('%') ? parseFloat(raw) / 100 : parseFloat(raw),
        1,
      );
    };
    const [r, g, b] = parts.slice(0, 3).map(channel);
    const a = alpha(parts[3]);
    if ([r, g, b, a].some(n => Number.isNaN(n))) {
      return null;
    }
    return {r, g, b, a};
  }

  return null;
}

/** Source-over composite of a (possibly translucent) color onto an opaque backdrop. */
export function composite(fg: RGBA, backdrop: RGBA): RGBA {
  const a = fg.a;
  return {
    r: fg.r * a + backdrop.r * (1 - a),
    g: fg.g * a + backdrop.g * (1 - a),
    b: fg.b * a + backdrop.b * (1 - a),
    a: 1,
  };
}

/** WCAG 2.1 relative luminance of an opaque sRGB color. */
export function relativeLuminance({r, g, b}: RGBA): number {
  const linear = (channel: number): number => {
    const s = channel / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2.1 contrast ratio between two opaque colors, in [1, 21]. */
export function contrastRatio(a: RGBA, b: RGBA): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Render an opaque RGBA back to #rrggbb for readable reports. */
export function toHex({r, g, b}: RGBA): string {
  const channel = (n: number): string =>
    Math.round(n).toString(16).padStart(2, '0');
  return `#${channel(r)}${channel(g)}${channel(b)}`;
}

/**
 * Split a CSS function's arguments on the first top-level comma
 * (nested parens from rgba()/var()/color-mix() do not split).
 */
export function splitTopLevelComma(input: string): [string, string] | null {
  let depth = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '(') {
      depth++;
    } else if (char === ')') {
      depth = Math.max(0, depth - 1);
    } else if (char === ',' && depth === 0) {
      return [input.slice(0, i).trim(), input.slice(i + 1).trim()];
    }
  }
  return null;
}

/**
 * Resolve a token name or CSS expression to an RGBA using a resolved token
 * map. Follows var(--name) / var(--name, fallback) references recursively
 * with cycle protection, and picks the `mode` side of light-dark()
 * expressions (theme component overrides carry those verbatim). Returns
 * null when the chain bottoms out at an unparseable value.
 */
export function resolveColor(
  tokens: Record<string, string>,
  ref: string,
  mode: 'light' | 'dark' = 'light',
  seen: Set<string> = new Set(),
): RGBA | null {
  const value = ref.trim();

  if (value.startsWith('--')) {
    if (seen.has(value)) {
      return null;
    }
    seen.add(value);
    const tokenValue = tokens[value];
    if (tokenValue === undefined) {
      return null;
    }
    return resolveColor(tokens, tokenValue, mode, seen);
  }

  if (value.startsWith('light-dark(') && value.endsWith(')')) {
    const sides = splitTopLevelComma(value.slice('light-dark('.length, -1));
    if (sides === null) {
      return null;
    }
    return resolveColor(
      tokens,
      mode === 'dark' ? sides[1] : sides[0],
      mode,
      seen,
    );
  }

  const varMatch = value.match(/^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/);
  if (varMatch) {
    const resolved = resolveColor(tokens, varMatch[1], mode, seen);
    if (resolved !== null) {
      return resolved;
    }
    return varMatch[2] !== undefined
      ? resolveColor(tokens, varMatch[2], mode, seen)
      : null;
  }

  return parseColor(value);
}

/**
 * Flatten a background stack (bottom-most layer first) into a single opaque
 * color. The bottom layer must be opaque or is composited onto white, which
 * matches the default page canvas.
 */
export function flattenBackground(
  tokens: Record<string, string>,
  stack: readonly string[],
  mode: 'light' | 'dark' = 'light',
): RGBA | null {
  let result: RGBA = {...KEYWORDS.white};
  for (const layer of stack) {
    const color = resolveColor(tokens, layer, mode);
    if (color === null) {
      return null;
    }
    result = composite(color, result);
  }
  return result;
}
