// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Color token categories — copied verbatim from the docsite Theme Editor
 * (`apps/sandbox/src/app/(fullscreen)/pages/docsite/ThemeEditorView.tsx`)
 * so the audit drawer groups tokens exactly the way that surface does.
 *
 * Keeping the exact category names + ordering (rather than auto-bucketing
 * by token-name prefix) means the audit experience is visually identical
 * to the editor a theme author already knows.
 */

/**
 * Curated category buckets. Tokens not listed here fall through to a
 * catch-all "Other" category at render time, so the audit drawer never
 * silently hides a color token regardless of what core adds or what a
 * theme defines on top.
 *
 * Where this list extends the docsite editor's set:
 *   - "Core Semantic" gains `--color-on-accent` (sibling of `--color-accent`)
 *   - "Text" gains `--color-on-light` (sibling of `--color-on-dark`)
 *   - "Icon" gains `--color-icon-accent` (sibling of the rest)
 *   - "Surface Variants" gains the inverted backgrounds
 *     (`--color-background-inverted`, `--color-background-error-inverted`)
 *   - "Status/Sentiment" gains the on-* status tokens
 *     (`--color-on-success/error/warning`)
 */
export const COLOR_CATEGORIES = {
  'Core Semantic': [
    '--color-accent',
    '--color-accent-muted',
    '--color-on-accent',
    '--color-neutral',
    '--color-overlay',
  ],
  'Interactive States': [
    '--color-overlay-hover',
    '--color-overlay-pressed',
    '--color-accent',
    '--color-error',
    '--color-success',
    '--color-warning',
    '--color-background-muted',
  ],
  Text: [
    '--color-text-primary',
    '--color-text-secondary',
    '--color-text-disabled',
    '--color-text-accent',
    '--color-on-dark',
    '--color-on-light',
  ],
  Icon: [
    '--color-icon-accent',
    '--color-icon-primary',
    '--color-icon-secondary',
    '--color-icon-disabled',
  ],
  'Surface Variants': [
    '--color-background-surface',
    '--color-background-body',
    '--color-background-card',
    '--color-background-popover',
    '--color-background-inverted',
    '--color-background-error-inverted',
  ],
  'Status/Sentiment': [
    '--color-success',
    '--color-success-muted',
    '--color-on-success',
    '--color-error',
    '--color-error-muted',
    '--color-on-error',
    '--color-warning',
    '--color-warning-muted',
    '--color-on-warning',
  ],
  Divider: ['--color-border', '--color-border-emphasized'],
  Effects: ['--color-skeleton', '--color-shadow', '--color-tint-hover'],
  'Palette: Blue': [
    '--color-background-blue',
    '--color-border-blue',
    '--color-icon-blue',
    '--color-text-blue',
  ],
  'Palette: Green': [
    '--color-background-green',
    '--color-border-green',
    '--color-icon-green',
    '--color-text-green',
  ],
  'Palette: Red': [
    '--color-background-red',
    '--color-border-red',
    '--color-icon-red',
    '--color-text-red',
  ],
  'Palette: Yellow': [
    '--color-background-yellow',
    '--color-border-yellow',
    '--color-icon-yellow',
    '--color-text-yellow',
  ],
  'Palette: Orange': [
    '--color-background-orange',
    '--color-border-orange',
    '--color-icon-orange',
    '--color-text-orange',
  ],
  'Palette: Purple': [
    '--color-background-purple',
    '--color-border-purple',
    '--color-icon-purple',
    '--color-text-purple',
  ],
  'Palette: Pink': [
    '--color-background-pink',
    '--color-border-pink',
    '--color-icon-pink',
    '--color-text-pink',
  ],
  'Palette: Teal': [
    '--color-background-teal',
    '--color-border-teal',
    '--color-icon-teal',
    '--color-text-teal',
  ],
  'Palette: Cyan': [
    '--color-background-cyan',
    '--color-border-cyan',
    '--color-icon-cyan',
    '--color-text-cyan',
  ],
  'Palette: Gray': [
    '--color-background-gray',
    '--color-border-gray',
    '--color-icon-gray',
    '--color-text-gray',
  ],
} as const;

/** Bucket name for theme-only color tokens that aren't in the curated
 *  categories above (custom tokens a theme adds, future core tokens we
 *  haven't slotted yet). */
export const OTHER_CATEGORY = 'Other Colors';

export type ColorCategoryName = keyof typeof COLOR_CATEGORIES;

/**
 * Convert a CSS custom property name into a human label.
 * Mirrors `getTokenLabel` in the docsite editor:
 *   `--color-accent` → "Color Accent"
 *   `--color-text-primary` → "Color Text Primary"
 */
export function getTokenLabel(tokenName: string): string {
  return tokenName
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export type CategorizedTokens = Array<{
  category: ColorCategoryName | typeof OTHER_CATEGORY;
  tokens: string[];
}>;

/**
 * Iterate categories in declaration order, deduplicating any tokens that
 * already appeared in an earlier category (some tokens are intentionally
 * cross-listed — e.g. `--color-accent` shows up under both Core Semantic
 * and Interactive States; the Inspector shows each token in its first
 * home only).
 *
 * When `knownTokens` is provided, any color-typed entry not covered by
 * the curated categories falls into a trailing "Other Colors" bucket.
 * This guarantees the audit drawer never silently hides a token regardless
 * of what core adds or what custom tokens a theme defines.
 *
 * Syntax-highlighting tokens (`--color-syntax-*`) are deliberately
 * excluded — they're better edited via the dedicated
 * `defineSyntaxTheme()` API rather than as raw color tokens, and
 * surfacing them here would create a confusing second source of truth.
 */
export function getCategorizedColorTokens(knownTokens?: Iterable<string>): CategorizedTokens {
  const seen = new Set<string>();
  const result: CategorizedTokens = [];
  for (const [category, tokenNames] of Object.entries(COLOR_CATEGORIES) as Array<
    [ColorCategoryName, readonly string[]]
  >) {
    const uniqueTokens = tokenNames.filter(t => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
    if (uniqueTokens.length === 0) continue;
    result.push({category, tokens: [...uniqueTokens]});
  }

  if (knownTokens) {
    // Any color-typed entry not in a curated category lands in "Other
    // Colors". Syntax tokens are filtered out entirely — see the JSDoc.
    const leftovers: string[] = [];
    for (const t of knownTokens) {
      if (!t.startsWith('--color-')) continue;
      if (t.startsWith('--color-syntax-')) continue;
      if (seen.has(t)) continue;
      seen.add(t);
      leftovers.push(t);
    }
    leftovers.sort();
    if (leftovers.length > 0) {
      result.push({category: OTHER_CATEGORY, tokens: leftovers});
    }
  }

  return result;
}
