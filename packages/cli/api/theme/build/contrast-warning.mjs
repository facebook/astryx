// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Contrast-pair warnings for `astryx theme build` (#5014).
 *
 * `expandColorScale` guarantees generated text at >= 4.5:1 against its
 * surfaces and `--color-border-emphasized` at >= 3:1, for any accent. The
 * guarantee covers what the generator produced — and a theme that hand-writes
 * ONE SIDE of a pair silently leaves the other side generated for the colour
 * it replaced. Nothing said so, and the loss is invisible until someone
 * measures rendered pixels.
 *
 * The case that motivated this, from a theme-authoring study (#5047): a
 * medication-administration theme hand-tuned `--color-accent` for dark mode,
 * kept the scale's `--color-on-accent`, and shipped a primary button at
 * 2.61:1 — measured off the DOM, below AA, in a clinical app. Its author had
 * run contrast math on the accent, against white, which is not what the theme
 * renders. Every theme in that study that hand-wrote `--color-border-emphasized`
 * also fell under 3:1; the ones that left neutrals to `color: {}` did not.
 *
 * SCOPE: exactly the failure mode above — the theme wrote ONE side and left
 * the other. Two neighbouring cases are deliberately silent:
 *
 *   - Neither side authored. The theme inherited whatever the defaults do,
 *     good or bad; that is the platform's to fix (#5019), not this build's to
 *     nag about on every run.
 *   - BOTH sides authored. Then nothing was silently voided — the author chose
 *     the pair, and calling it a defect is a palette opinion, not a broken
 *     guarantee. It is also an opinion the shipped themes contest: every one of
 *     the seven fails some pair under it, and stone shows why the reading is
 *     not settled — its `--color-on-error` is tuned for `--color-error-muted`
 *     (the badge fill) while `--color-error` carries its icon/border tone, so a
 *     pair the defaults treat as fill+label it treats as two separate roles.
 *     Widening to that case needs the token contract settled first.
 *
 * @input A DefinedTheme (needs `__inputTokens` to know what was hand-written)
 *   and core's `resolveThemeTokens`, injected so this module stays IO-free.
 * @output Ordered findings, each naming the pair, the mode, the measured
 *   ratio, its floor, and which side to change.
 * @position Beside build.mjs (api/theme/build/), like font-warning.mjs. Pure
 *   functions, so the `--json` receipt and the human output agree.
 */

/**
 * The pairs whose contrast a reader depends on, and the floor each must clear.
 *
 * Both sides are solid fills by construction: compositing a translucent token
 * (`--color-*-muted`, the overlays) needs the surface underneath it, which
 * depends on where the component sits, so those are out of scope here rather
 * than guessed at.
 *
 * SYNC: the generated side of each pair comes from
 * /packages/core/src/theme/expandColorScale.ts — when it learns to derive a
 * token listed here, keep the pairing honest.
 */
const PAIRS = [
  // WCAG 1.4.3 — text against the fill it sits on.
  {fg: '--color-on-accent', bg: '--color-accent', min: 4.5, what: 'label on the accent fill'},
  {fg: '--color-on-error', bg: '--color-error', min: 4.5, what: 'label on the error fill'},
  {fg: '--color-on-warning', bg: '--color-warning', min: 4.5, what: 'label on the warning fill'},
  {fg: '--color-on-success', bg: '--color-success', min: 4.5, what: 'label on the success fill'},
  {fg: '--color-text-primary', bg: '--color-background-body', min: 4.5, what: 'body text on the page'},
  {fg: '--color-text-primary', bg: '--color-background-surface', min: 4.5, what: 'body text on a surface'},
  {fg: '--color-text-secondary', bg: '--color-background-surface', min: 4.5, what: 'secondary text on a surface'},
  {fg: '--color-text-primary', bg: '--color-background-card', min: 4.5, what: 'body text on a card'},
  // WCAG 1.4.11 — non-text UI that a user must be able to find.
  {fg: '--color-border-emphasized', bg: '--color-background-surface', min: 3, what: 'control boundary on a surface'},
  {fg: '--focus-outline-color', bg: '--color-background-surface', min: 3, what: 'focus ring on a surface'},
];

/** @param {number} channel 0-255 @returns {number} */
function toLinear(channel) {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/**
 * Parse a CSS colour into {r, g, b, a}, or null when it is not a plain sRGB
 * literal. Returning null is a deliberate abstention: `color-mix()`, `oklch()`
 * and `var()` chains that survived resolution cannot be judged here, and a
 * guessed ratio is worse than none.
 *
 * @param {unknown} value
 * @returns {{r: number, g: number, b: number, a: number} | null}
 */
function parseColor(value) {
  if (typeof value !== 'string') return null;
  const text = value.trim();

  const hex = /^#([0-9a-f]{3,8})$/i.exec(text);
  if (hex) {
    let digits = hex[1];
    if (digits.length === 3 || digits.length === 4) {
      digits = [...digits].map(d => d + d).join('');
    }
    if (digits.length !== 6 && digits.length !== 8) return null;
    return {
      r: parseInt(digits.slice(0, 2), 16),
      g: parseInt(digits.slice(2, 4), 16),
      b: parseInt(digits.slice(4, 6), 16),
      a: digits.length === 8 ? parseInt(digits.slice(6, 8), 16) / 255 : 1,
    };
  }

  const rgb = /^rgba?\(([^)]+)\)$/i.exec(text);
  if (rgb) {
    const parts = rgb[1].split(/[,\s/]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const [r, g, b] = parts.slice(0, 3).map(Number);
    if ([r, g, b].some(n => !Number.isFinite(n))) return null;
    let alpha = 1;
    if (parts[3] != null) {
      const raw = parts[3];
      const n = parseFloat(raw);
      if (!Number.isFinite(n)) return null;
      alpha = raw.endsWith('%') ? n / 100 : n;
    }
    return {r, g, b, a: alpha};
  }

  return null;
}

/**
 * Composite a possibly-translucent colour over an opaque one.
 * @param {{r: number, g: number, b: number, a: number}} fg
 * @param {{r: number, g: number, b: number, a: number}} bg
 */
function over(fg, bg) {
  if (fg.a >= 1) return fg;
  return {
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a),
    a: 1,
  };
}

/**
 * WCAG 2.x contrast ratio, rounded to two decimals, or null when either
 * colour could not be parsed.
 *
 * @param {unknown} foreground
 * @param {unknown} background
 * @returns {number | null}
 */
export function contrastRatio(foreground, background) {
  const bg = parseColor(background);
  const rawFg = parseColor(foreground);
  if (!bg || !rawFg || bg.a < 1) return null;
  const fg = over(rawFg, bg);
  const [lighter, darker] = [fg, bg]
    .map(c => 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b))
    .sort((a, b) => b - a);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/**
 * @typedef {object} ContrastFinding
 * @property {string} fg Foreground token name.
 * @property {string} bg Background token name.
 * @property {'light' | 'dark'} mode Colour mode the pair fails in.
 * @property {number} ratio Measured ratio.
 * @property {number} min Floor it had to clear.
 * @property {string} what Human name for what the pair draws.
 * @property {string[]} authored The side the theme hand-wrote.
 * @property {string[]} inherited The side it left to the generator/defaults.
 */

/**
 * Find the token pairs this theme broke: below their floor in either mode,
 * with exactly one side hand-written in `tokens` and the other inherited.
 *
 * @param {{tokens?: Record<string, string>, __inputTokens?: Record<string, unknown>}} theme
 *   A DefinedTheme. Without `__inputTokens` (a hand-built theme object, or a
 *   prebuilt one) nothing is reported: every pair would look inherited.
 * @param {(theme: unknown, options: {mode: string}) => Record<string, string>} resolveTokens
 *   core's `resolveThemeTokens`, injected to keep this module dependency-free.
 * @returns {ContrastFinding[]}
 */
export function collectContrastFailures(theme, resolveTokens) {
  const authoredTokens = new Set(Object.keys(theme?.__inputTokens ?? {}));
  if (authoredTokens.size === 0) return [];

  /** @type {ContrastFinding[]} */
  const findings = [];
  for (const mode of /** @type {const} */ (['light', 'dark'])) {
    let resolved;
    try {
      resolved = resolveTokens(theme, {mode});
    } catch {
      // A theme shape this resolver cannot read is the build's problem to
      // report, not this check's to crash on.
      return findings;
    }
    for (const pair of PAIRS) {
      const sides = [pair.fg, pair.bg];
      const authored = sides.filter(t => authoredTokens.has(t));
      // One side written, one inherited: the guarantee the generator gave for
      // the value that is no longer there. See SCOPE above.
      if (authored.length !== 1) continue;

      const ratio = contrastRatio(resolved[pair.fg], resolved[pair.bg]);
      if (ratio === null || ratio >= pair.min) continue;

      findings.push({
        fg: pair.fg,
        bg: pair.bg,
        mode,
        ratio,
        min: pair.min,
        what: pair.what,
        authored,
        inherited: sides.filter(t => !authoredTokens.has(t)),
      });
    }
  }
  return findings;
}

/**
 * One line per failing pair. The inherited token is the lead: it is the
 * forgotten half by construction, and naming it turns a measurement into an
 * instruction.
 *
 * @param {ContrastFinding} finding
 * @returns {string}
 */
export function formatContrastFailure(finding) {
  const {mode, ratio, min, what, authored, inherited} = finding;
  return (
    `${what} is ${ratio}:1 in ${mode} mode, below ${min}:1 — ` +
    `you set ${authored[0]} but left ${inherited[0]}, which still holds the ` +
    `value generated for the colour you replaced`
  );
}
