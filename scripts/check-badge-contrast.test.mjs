// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Badge label contrast guard.
 *
 * The Badge label renders at 12px / weight 500, so WCAG 2.1 AA asks for 4.5:1
 * — the 3:1 large-text allowance does not apply. Each theme re-binds the badge
 * fill and label in its own `components.badge` block, so the pairing that
 * actually ships cannot be read off the global `--color-*` tokens; it has to be
 * resolved through the block, `light-dark()` and any `var()` indirection.
 *
 * @input The seven first-party theme objects.
 * @output Fails when a badge variant's label/fill pair drops below 4.5:1 in
 *   either colour scheme.
 * @position Repo-level guard, sibling of the other scripts/check-*.
 */

import {describe, it, expect} from 'vitest';
import {butterTheme} from '../packages/themes/butter/src/butterTheme.ts';
import {chocolateTheme} from '../packages/themes/chocolate/src/chocolateTheme.ts';
import {gothicTheme} from '../packages/themes/gothic/src/gothicTheme.ts';
import {matchaTheme} from '../packages/themes/matcha/src/matchaTheme.ts';
import {neutralTheme} from '../packages/themes/neutral/src/neutralTheme.ts';
import {stoneTheme} from '../packages/themes/stone/src/stoneTheme.ts';
import {y2kTheme} from '../packages/themes/y2k/src/y2kTheme.ts';

const THEMES = {
  butter: butterTheme,
  chocolate: chocolateTheme,
  gothic: gothicTheme,
  matcha: matchaTheme,
  neutral: neutralTheme,
  stone: stoneTheme,
  y2k: y2kTheme,
};

const MODES = ['light', 'dark'];
/** WCAG 2.1 AA, normal-size text. */
const AA_NORMAL = 4.5;

// Surfaces a badge can sit on, most specific first — needed to flatten the
// semi-transparent fills the dark ramps use.
const SURFACE_TOKENS = [
  '--color-background-card',
  '--color-background-surface',
  '--color-background-body',
];

/** Split `a, b` at the top level, ignoring commas nested in parens. */
function splitArgs(input) {
  const out = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current.trim());
  return out;
}

/**
 * Resolve a theme colour expression down to a hex string for one colour
 * scheme, following `light-dark()` and `var()` indirection.
 */
function resolve(value, theme, modeIndex, seen = new Set()) {
  if (typeof value !== 'string') return null;
  const v = value.trim();

  if (v.startsWith('light-dark(')) {
    const args = splitArgs(v.slice('light-dark('.length, -1));
    return resolve(args[modeIndex], theme, modeIndex, seen);
  }

  if (v.startsWith('var(')) {
    const args = splitArgs(v.slice('var('.length, -1));
    const [name, fallback] = args;
    if (seen.has(name)) return null; // cycle guard
    const next = theme.tokens?.[name];
    if (next == null) {
      return fallback ? resolve(fallback, theme, modeIndex, seen) : null;
    }
    return resolve(next, theme, modeIndex, new Set([...seen, name]));
  }

  return /^#[0-9a-f]{3,8}$/i.test(v) ? v : null;
}

/** `#rgb` / `#rrggbb` / `#rrggbbaa` -> `{r, g, b, a}` in 0-255 / 0-1. */
function parseHex(hex) {
  let h = hex.slice(1);
  if (h.length === 3 || h.length === 4) h = [...h].map(c => c + c).join('');
  const n = i => parseInt(h.slice(i, i + 2), 16);
  return {r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1};
}

/** Composite `top` over the opaque `base`. */
function flatten(top, base) {
  if (top.a >= 1) return top;
  const mix = (t, b) => Math.round(t * top.a + b * (1 - top.a));
  return {r: mix(top.r, base.r), g: mix(top.g, base.g), b: mix(top.b, base.b), a: 1};
}

function luminance({r, g, b}) {
  const lin = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrast(fg, bg) {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

/** The opaque surface a badge is painted onto, for flattening alpha fills. */
function surfaceOf(theme, modeIndex) {
  for (const token of SURFACE_TOKENS) {
    const hex = resolve(theme.tokens?.[token], theme, modeIndex);
    if (hex) {
      const parsed = parseHex(hex);
      if (parsed.a >= 1) return parsed;
    }
  }
  // No opaque surface declared — fall back to the colour scheme's page default.
  return modeIndex === 0
    ? {r: 255, g: 255, b: 255, a: 1}
    : {r: 0, g: 0, b: 0, a: 1};
}

/**
 * Every resolvable badge label/fill pair, as
 * `{theme, mode, variant, fg, bg, ratio}`.
 */
function badgePairs() {
  const rows = [];
  for (const [themeName, theme] of Object.entries(THEMES)) {
    const badge = theme.components?.badge;
    if (!badge) continue;
    // A variant may inherit the block's own base colour/fill.
    const baseColor = badge.color;
    const baseBg = badge.backgroundColor;

    for (const [key, block] of Object.entries(badge)) {
      if (!key.startsWith('variant:') || typeof block !== 'object') continue;
      const variant = key.slice('variant:'.length);

      for (let modeIndex = 0; modeIndex < MODES.length; modeIndex++) {
        const fgHex = resolve(block.color ?? baseColor, theme, modeIndex);
        const bgHex = resolve(block.backgroundColor ?? baseBg, theme, modeIndex);
        if (!fgHex || !bgHex) continue; // not expressible as a flat pair

        const surface = surfaceOf(theme, modeIndex);
        const bg = flatten(parseHex(bgHex), surface);
        const fg = flatten(parseHex(fgHex), bg);
        rows.push({
          theme: themeName,
          mode: MODES[modeIndex],
          variant,
          fg: fgHex,
          bg: bgHex,
          ratio: contrast(fg, bg),
        });
      }
    }
  }
  return rows;
}

/** Themes that re-bind the badge fill/label. The rest inherit core's defaults. */
const THEMES_WITH_BADGE_BLOCK = ['butter', 'gothic', 'neutral', 'stone', 'y2k'];

/**
 * Pre-existing shortfalls this guard records rather than silently tolerates.
 *
 * Both themes pin these fills to brand values ("pinned to the brand colors
 * from the spec"), so moving them is a design call, not a bug fix. The guard
 * asserts the set matches exactly, so a new shortfall fails the build and a
 * fixed one fails until it's deleted from this list.
 */
const KNOWN_GAPS = [
  'butter/dark variant:error',
  'butter/dark variant:info',
  'butter/dark variant:neutral',
  'butter/light variant:error',
  'butter/light variant:info',
  'butter/light variant:neutral',
  'gothic/dark variant:warning',
  'gothic/light variant:warning',
];

describe('Badge label contrast', () => {
  const rows = badgePairs();
  const label = r => `${r.theme}/${r.mode} variant:${r.variant}`;

  it('resolves the badge pairs of every theme that defines a badge block', () => {
    // Guards the resolver itself: a refactor that silently stops resolving
    // would otherwise turn this whole file into a no-op.
    const covered = [...new Set(rows.map(r => r.theme))].sort();
    expect(covered).toEqual(THEMES_WITH_BADGE_BLOCK);

    // The four semantic variants must resolve in every theme and both schemes;
    // those are the filled pairs this guard exists for.
    const missing = [];
    for (const theme of THEMES_WITH_BADGE_BLOCK) {
      for (const mode of MODES) {
        for (const variant of ['info', 'success', 'warning', 'error']) {
          const hit = rows.some(
            r => r.theme === theme && r.mode === mode && r.variant === variant,
          );
          if (!hit) missing.push(`${theme}/${mode} variant:${variant}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });

  it('holds the neutral error badge above AA — the pair that regressed', () => {
    const pair = rows.find(
      r => r.theme === 'neutral' && r.mode === 'light' && r.variant === 'error',
    );
    expect(pair).toBeDefined();
    expect(pair.fg).toBe('#ffffff');
    expect(pair.ratio).toBeGreaterThanOrEqual(AA_NORMAL);
  });

  it('meets WCAG AA (4.5:1) for every badge variant in both colour schemes', () => {
    const failures = rows
      .filter(r => r.ratio < AA_NORMAL)
      .map(
        r =>
          `${label(r)} — ${r.fg} on ${r.bg} = ${r.ratio.toFixed(2)}:1`,
      );

    const unexpected = failures.filter(f => !KNOWN_GAPS.includes(f.split(' — ')[0]));
    expect(unexpected).toEqual([]);
  });

  it('keeps the known-gap list exact, so a fixed pair cannot linger', () => {
    const failing = rows.filter(r => r.ratio < AA_NORMAL).map(label).sort();
    expect(failing).toEqual(KNOWN_GAPS);
  });
});
