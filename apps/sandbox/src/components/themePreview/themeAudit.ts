// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Theme audit logic.
 *
 * Two questions this module answers, both painful to eyeball from raw
 * theme source files:
 *
 *   1. "Which tokens did this theme actually change vs the Astryx defaults?"
 *      — diff `theme.tokens` against `tokenDefaults` and bucket each
 *        entry as unchanged / overridden / new.
 *
 *   2. "Did each color token snap to a step on a tonal ramp, or did the
 *      author free-form it?"
 *      — for every color-typed token, find the closest tone step across
 *        the theme's tonal seeds (the same seeds the visible Tonal Palettes
 *        section renders) and bucket the ΔE as exact / snapped / near / off.
 */

import type {DefinedTheme} from '@astryxdesign/core/theme';
import {tokenDefaults} from '@astryxdesign/core/theme';
import {
  findClosestRampStep,
  type Mode,
  type RampSeed,
  type SnapMatch,
} from './colorMath';

// =============================================================================
// Token categorization
// =============================================================================

/**
 * Top-level audit category for grouping tokens in the audit UI.
 *
 * Derived from token name prefix because that's how the defaults file
 * already groups them (`colorDefaults`, `radiusDefaults`, …) — the prefix
 * is the source of truth, not a separate registry that can drift.
 */
export type TokenCategory =
  | 'color'
  | 'background'
  | 'text'
  | 'border'
  | 'shadow'
  | 'spacing'
  | 'size'
  | 'radius'
  | 'typography'
  | 'motion'
  | 'syntax'
  | 'other';

const CATEGORY_ORDER: TokenCategory[] = [
  'color',
  'background',
  'text',
  'border',
  'shadow',
  'radius',
  'spacing',
  'size',
  'typography',
  'motion',
  'syntax',
  'other',
];

export function categorizeToken(name: string): TokenCategory {
  if (name.startsWith('--color-syntax-')) {
    return 'syntax';
  }
  if (name.startsWith('--color-background-')) {
    return 'background';
  }
  if (name.startsWith('--color-text-') || name.startsWith('--color-icon-')) {
    return 'text';
  }
  if (
    name.startsWith('--color-border-') ||
    name === '--color-border' ||
    name === '--color-border-emphasized'
  ) {
    return 'border';
  }
  if (name.startsWith('--color-')) {
    return 'color';
  }
  if (name.startsWith('--shadow-')) {
    return 'shadow';
  }
  if (name.startsWith('--radius-')) {
    return 'radius';
  }
  if (name.startsWith('--space-') || name.startsWith('--spacing-')) {
    return 'spacing';
  }
  if (name.startsWith('--size-')) {
    return 'size';
  }
  if (
    name.startsWith('--font-') ||
    name.startsWith('--text-') ||
    name.startsWith('--type-')
  ) {
    return 'typography';
  }
  if (
    name.startsWith('--duration-') ||
    name.startsWith('--ease-') ||
    name.startsWith('--transition-')
  ) {
    return 'motion';
  }
  return 'other';
}

// =============================================================================
// Token diff — overridden / unchanged / new vs tokenDefaults
// =============================================================================

export type DiffStatus =
  /** Token name exists in defaults; theme value === default */
  | 'unchanged'
  /** Token name exists in defaults; theme value !== default */
  | 'overridden'
  /** Token name only exists in the theme (theme adds a token defaults didn't have) */
  | 'new'
  /** Token name only exists in defaults (theme inherited it; not strictly possible
   *  with the current defineTheme since defaults are merged in, but kept for
   *  symmetry if we ever audit the inverse) */
  | 'removed';

export interface TokenDiffEntry {
  name: string;
  category: TokenCategory;
  status: DiffStatus;
  /** Default value (if the token has one) */
  defaultValue?: string;
  /** Current theme value (if the theme defines it) */
  themeValue?: string;
}

export interface TokenDiff {
  entries: TokenDiffEntry[];
  /** Aggregate counts — handy for the toolbar badge */
  counts: Record<DiffStatus, number>;
  /** Per-category counts of overridden + new — used to drive the section badges */
  changedByCategory: Record<TokenCategory, number>;
}

/**
 * Build a full token diff vs tokenDefaults.
 *
 * Note: defineTheme pre-seeds `theme.tokens` from base + generated +
 * explicit overrides, so every token defaults supplies will also appear on
 * `theme.tokens` — meaning "unchanged" rows are common. We keep them in
 * the result so the UI can offer a "show unchanged" toggle for the
 * exhaustive case where a theme author wants to confirm a default landed.
 */
export function diffThemeTokens(theme: DefinedTheme): TokenDiff {
  const themeTokens = theme.tokens;
  const allKeys = new Set<string>([
    ...Object.keys(tokenDefaults),
    ...Object.keys(themeTokens),
  ]);

  const entries: TokenDiffEntry[] = [];
  const counts: Record<DiffStatus, number> = {
    unchanged: 0,
    overridden: 0,
    new: 0,
    removed: 0,
  };
  const changedByCategoryInit = {};
  const changedByCategory = changedByCategoryInit as Record<
    TokenCategory,
    number
  >;
  for (const c of CATEGORY_ORDER) {
    changedByCategory[c] = 0;
  }

  for (const name of allKeys) {
    const defaultValue = tokenDefaults[name];
    const themeValue = themeTokens[name];
    const category = categorizeToken(name);

    let status: DiffStatus;
    if (defaultValue == null && themeValue != null) {
      status = 'new';
    } else if (defaultValue != null && themeValue == null) {
      status = 'removed';
    } else if (defaultValue === themeValue) {
      status = 'unchanged';
    } else {
      status = 'overridden';
    }

    counts[status]++;
    if (status === 'overridden' || status === 'new') {
      changedByCategory[category]++;
    }

    entries.push({name, category, status, defaultValue, themeValue});
  }

  // Sort: changed first, then by category order, then alphabetically.
  // Putting "changed" tokens at the top is the common case the audit
  // panel exists for; unchanged are present mostly for completeness.
  const statusRank: Record<DiffStatus, number> = {
    overridden: 0,
    new: 1,
    removed: 2,
    unchanged: 3,
  };
  const categoryRank = (c: TokenCategory) => CATEGORY_ORDER.indexOf(c);
  entries.sort((a, b) => {
    if (statusRank[a.status] !== statusRank[b.status]) {
      return statusRank[a.status] - statusRank[b.status];
    }
    if (a.category !== b.category) {
      return categoryRank(a.category) - categoryRank(b.category);
    }
    return a.name.localeCompare(b.name);
  });

  return {entries, counts, changedByCategory};
}

// =============================================================================
// light-dark() parsing
// =============================================================================

/**
 * Pull [light, dark] hex values out of a token value.
 *
 * Token values come in three shapes:
 *   - `light-dark(#fff, #000)` — the standard form generated by defineTheme
 *   - `#aabbcc` (or rgba(...) etc.) — same value in both modes
 *   - `var(--something)` — a reference; we can't resolve it statically and
 *     return null/null. The audit UI flags these as "indirect."
 *
 * Hex+alpha forms (`#aabbccdd`) are accepted; alpha is dropped — we only
 * care about the base color for snap detection.
 */
const LIGHT_DARK_RE = /^light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)$/;
const HEX_RE =
  /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

export interface TokenColor {
  light: string | null;
  dark: string | null;
  /** True when value is a `var(--…)` reference we can't statically resolve */
  indirect: boolean;
  /**
   * Per-mode alpha (0-1). Defaults to 1 (fully opaque) when the value
   * has no alpha component. Used by the audit drawer + snap action to
   * preserve transparency end-to-end — a snap on a 10%-alpha overlay
   * commits the ramp swatch with `1A` (10%) appended.
   */
  alphaLight: number;
  alphaDark: number;
  /**
   * Convenience: `alphaLight < 1 || alphaDark < 1`. Saves the row UI
   * from re-checking each side when it just needs to know "should I
   * format this with a percent suffix?".
   */
  hasAlpha: boolean;
}

export function parseTokenColor(value: string | undefined): TokenColor {
  if (!value) {
    return {
      light: null,
      dark: null,
      indirect: false,
      alphaLight: 1,
      alphaDark: 1,
      hasAlpha: false,
    };
  }
  const trimmed = value.trim();

  if (trimmed.startsWith('var(')) {
    return {
      light: null,
      dark: null,
      indirect: true,
      alphaLight: 1,
      alphaDark: 1,
      hasAlpha: false,
    };
  }

  const ld = trimmed.match(LIGHT_DARK_RE);
  if (ld) {
    const alphaLight = extractAlpha(ld[1]);
    const alphaDark = extractAlpha(ld[2]);
    return {
      light: normalizeColorString(ld[1]),
      dark: normalizeColorString(ld[2]),
      indirect: false,
      alphaLight,
      alphaDark,
      hasAlpha: alphaLight < 1 || alphaDark < 1,
    };
  }

  const single = normalizeColorString(trimmed);
  const alpha = extractAlpha(trimmed);
  return {
    light: single,
    dark: single,
    indirect: false,
    alphaLight: alpha,
    alphaDark: alpha,
    hasAlpha: alpha < 1,
  };
}

/**
 * Extract the alpha channel from a CSS color expression as a 0-1 value.
 * Returns 1 (fully opaque) when the value has no alpha component or
 * when we can't parse it. Recognizes:
 *   - 8-digit hex `#aabbccdd` (last two hex digits are the alpha channel)
 *   - 4-digit hex `#abcd` (last digit is the alpha channel, doubled)
 *   - `rgba(r,g,b,a)` form
 */
function extractAlpha(input: string): number {
  const v = input.trim();
  const hex8 = v.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})$/);
  if (hex8) {
    return parseInt(hex8[2], 16) / 255;
  }
  const hex4 = v.match(/^#([0-9a-fA-F]{3})([0-9a-fA-F])$/);
  if (hex4) {
    const aChar = hex4[2];
    return parseInt(aChar + aChar, 16) / 255;
  }
  const rgba = v.match(
    /^rgba\(\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*,\s*\d+(?:\.\d+)?\s*,\s*([\d.]+)\s*\)$/i,
  );
  if (rgba) {
    const a = Number(rgba[1]);
    if (Number.isFinite(a)) {
      return Math.max(0, Math.min(1, a));
    }
  }
  return 1;
}

/**
 * Normalize a CSS color expression to a #rrggbb string (alpha dropped).
 * Returns null for color expressions we can't resolve cheaply (color-mix,
 * named colors other than black/white, etc.) — the audit UI surfaces these
 * as "skipped."
 */
function normalizeColorString(input: string): string | null {
  const v = input.trim();
  if (HEX_RE.test(v)) {
    if (v.length === 5) {
      // #rgba → #rrggbb (drop alpha)
      return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toLowerCase();
    }
    if (v.length === 4) {
      return ('#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3]).toLowerCase();
    }
    if (v.length === 9) {
      return v.slice(0, 7).toLowerCase();
    }
    return v.toLowerCase();
  }
  if (v === 'black') {
    return '#000000';
  }
  if (v === 'white') {
    return '#ffffff';
  }
  if (v === 'transparent') {
    return null;
  }
  // rgb()/rgba() - parse the three channels
  const rgbMatch = v.match(
    /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)/,
  );
  if (rgbMatch) {
    const r = Math.round(Number(rgbMatch[1]));
    const g = Math.round(Number(rgbMatch[2]));
    const b = Math.round(Number(rgbMatch[3]));
    const hex = (n: number) =>
      Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
    return ('#' + hex(r) + hex(g) + hex(b)).toLowerCase();
  }
  return null;
}

// =============================================================================
// Snap audit — closest tonal step for every color token
// =============================================================================

export interface SnapAuditEntry {
  name: string;
  category: TokenCategory;
  /** Per-mode resolved hex (null when unresolvable — indirect/color-mix/etc.) */
  light: string | null;
  dark: string | null;
  /** Per-mode alpha (0-1, 1 = fully opaque). Preserved through snap +
   *  custom edits so transparency survives end-to-end. */
  alphaLight: number;
  alphaDark: number;
  /** Per-mode closest ramp match — base color only, alpha is layered
   *  on at commit time. */
  lightMatch: SnapMatch | null;
  darkMatch: SnapMatch | null;
  /** True for `var(--…)` references that we couldn't resolve */
  indirect: boolean;
  /** Convenience: `alphaLight < 1 || alphaDark < 1`. */
  hasAlpha: boolean;
}

/**
 * Run snap audit across every color-ish token in the theme.
 * "Color-ish" = a token whose category is color/background/text/border AND
 * parses to a real hex (no var(), no color-mix). Everything else is filtered
 * out so the audit table stays focused on actionable rows.
 */
export function auditSnapToRamps(
  theme: DefinedTheme,
  rampSeeds: RampSeed[],
): SnapAuditEntry[] {
  const out: SnapAuditEntry[] = [];
  // Every category whose tokens are *meant* to be a color literal. The
  // drawer needs a snap entry for every color-typed token (even
  // `syntax` highlighting tokens) so the row renderer can show a swatch
  // and editor for it; tokens that aren't colors (spacing/radius/etc)
  // stay excluded.
  const eligibleCategories: TokenCategory[] = [
    'color',
    'background',
    'text',
    'border',
    'syntax',
  ];
  for (const [name, value] of Object.entries(theme.tokens)) {
    const category = categorizeToken(name);
    if (!eligibleCategories.includes(category)) {
      continue;
    }
    const {light, dark, indirect, alphaLight, alphaDark, hasAlpha} =
      parseTokenColor(value);
    if (!light && !dark && !indirect) {
      continue;
    }
    const lightMatch = light
      ? findClosestRampStep(light, rampSeeds, 'light')
      : null;
    const darkMatch = dark
      ? findClosestRampStep(dark, rampSeeds, 'dark')
      : null;
    out.push({
      name,
      category,
      light,
      dark,
      alphaLight,
      alphaDark,
      lightMatch,
      darkMatch,
      indirect,
      hasAlpha,
    });
  }
  // Sort: worst (off-ramp) first so the noisy rows surface to the top.
  // Within the same verdict, alphabetical for stable ordering.
  const verdictRank = (m: SnapMatch | null) =>
    m == null ? 99 : {off: 0, near: 1, snapped: 2, exact: 3}[m.verdict];
  out.sort((a, b) => {
    const aWorst = Math.min(
      verdictRank(a.lightMatch),
      verdictRank(a.darkMatch),
    );
    const bWorst = Math.min(
      verdictRank(b.lightMatch),
      verdictRank(b.darkMatch),
    );
    if (aWorst !== bWorst) {
      return aWorst - bWorst;
    }
    return a.name.localeCompare(b.name);
  });
  return out;
}

// =============================================================================
// Tonal markers — which tone steps does this theme actually consume?
// =============================================================================

export interface TonalUsage {
  /** Token name */
  name: string;
  /** light or dark mode the snap matched in */
  mode: Mode;
  /** Verdict for this snap (drives marker color) */
  verdict: SnapMatch['verdict'];
  /** ΔE — for hover details */
  deltaE: number;
}

/**
 * Per-ramp, per-mode, per-tone map of which tokens consume that step.
 * Keyed: `${rampName} :: ${mode} :: ${tone}` → list of usages.
 *
 * Used by ThemePalettePreview to draw a marker on each tone step that any
 * theme token has snapped to (with hover showing the token list). Drives
 * an evidence-based "where do my tokens land?" view rather than the
 * existing hardcoded `usedTones = [15, 25, 80, 90]` list.
 */
export type TonalUsageMap = Record<string, TonalUsage[]>;

/**
 * Per-token overrides recognised by `buildTonalUsageMap`. The drawer's
 * override map matches this shape exactly; we accept a generic shape
 * here so this module doesn't have to import from themeOverrides.ts and
 * create a circular dep.
 *
 * The full ModeOverride is a discriminated union (palette | custom);
 * for marker purposes we only care about palette picks since custom
 * hexes aren't on a ramp by definition. Either side may be a custom
 * override and that side is simply ignored here.
 */
export interface TonalUsageModeOverride {
  /** Discriminator — only `'palette'` produces a marker. */
  kind: 'palette' | 'custom';
  rampName?: string;
  tone?: number;
}
export interface TonalUsageOverride {
  light?: TonalUsageModeOverride;
  dark?: TonalUsageModeOverride;
}

export function buildTonalUsageMap(
  audit: SnapAuditEntry[],
  /** Optional pending overrides — when provided, the override's ramp+tone
   *  replaces the auto-detected snap match for that token. The marker
   *  shows up as `verdict: 'snapped'` (the user explicitly placed it
   *  there, so it can't be off-ramp by definition). */
  overrides?: Record<string, TonalUsageOverride>,
): TonalUsageMap {
  const map: TonalUsageMap = {};
  const push = (
    rampName: string,
    mode: Mode,
    tone: number,
    usage: TonalUsage,
  ) => {
    const k = `${rampName}::${mode}::${tone}`;
    if (!map[k]) {
      map[k] = [];
    }
    map[k].push(usage);
  };

  for (const e of audit) {
    const ov = overrides?.[e.name];
    // Light side: prefer a *palette* override, then fall back to the
    // auto-detected match when not off-ramp. Custom overrides bypass the
    // markers entirely (they're explicitly off-ramp by definition);
    // off-ramp tokens with no override also get no marker — there's
    // nowhere on the ramp to put one.
    if (
      ov?.light?.kind === 'palette' &&
      ov.light.rampName &&
      ov.light.tone != null
    ) {
      push(ov.light.rampName, 'light', ov.light.tone, {
        name: e.name,
        mode: 'light',
        verdict: 'snapped',
        deltaE: 0,
      });
    } else if (!ov?.light && e.lightMatch && e.lightMatch.verdict !== 'off') {
      push(e.lightMatch.rampName, 'light', e.lightMatch.tone, {
        name: e.name,
        mode: 'light',
        verdict: e.lightMatch.verdict,
        deltaE: e.lightMatch.deltaE,
      });
    }
    if (
      ov?.dark?.kind === 'palette' &&
      ov.dark.rampName &&
      ov.dark.tone != null
    ) {
      push(ov.dark.rampName, 'dark', ov.dark.tone, {
        name: e.name,
        mode: 'dark',
        verdict: 'snapped',
        deltaE: 0,
      });
    } else if (!ov?.dark && e.darkMatch && e.darkMatch.verdict !== 'off') {
      push(e.darkMatch.rampName, 'dark', e.darkMatch.tone, {
        name: e.name,
        mode: 'dark',
        verdict: e.darkMatch.verdict,
        deltaE: e.darkMatch.deltaE,
      });
    }
  }
  return map;
}

export function tonalUsageKey(
  rampName: string,
  mode: Mode,
  tone: number,
): string {
  return `${rampName}::${mode}::${tone}`;
}

export {CATEGORY_ORDER};
