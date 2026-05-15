/**
 * Pending-overrides model for the audit drawer's interactive editor.
 *
 * The audit drawer lets you reassign each color token to a different
 * (rampName, tone) per mode. We track those reassignments here as an
 * in-memory map, then format them out two ways:
 *
 *   - serializeAsTokensBlock() → a `tokens: { ... }` snippet ready to
 *     paste into the theme's defineTheme() call.
 *   - toApplyPayload()         → the JSON payload the /api/theme-audit/apply
 *     endpoint expects, which writes the same values back into the source
 *     theme file.
 */

import type {Mode, RampSeed} from './colorMath';
import {hexToHct, tonalPaletteForMode, type ToneStep} from './colorMath';

// =============================================================================
// Types
// =============================================================================

/**
 * A single per-mode reassignment for one token.
 *
 * Discriminated by `kind`:
 *   - `'palette'` — the user picked a step on a tonal ramp. We retain
 *     `rampName`, `rampSourceHex`, and `tone` so the editor can show
 *     "Blue T35" as the row subtitle and re-resolve the hex if the
 *     ramp seed changes upstream.
 *   - `'custom'` — the user typed a free-form hex (or used the native
 *     color picker). We only carry the hex itself; the editor renders
 *     the row subtitle as "Custom".
 *
 * Both shapes carry the resolved `hex` so the export formatter, CSS
 * variable injector, and active swatch all read from a single field.
 */
export type ModeOverride =
  | {
      kind: 'palette';
      /** Display name of the ramp (e.g. "Blue", "Stone Neutral") */
      rampName: string;
      /** Source hex of the ramp seed — keeps us decoupled from the seed
       *  list so reassignments survive reordering of `tonalColors`. */
      rampSourceHex: string;
      /** Tone step the user picked (0-100, in 5-step increments) */
      tone: ToneStep;
      /** Resolved hex at that ramp+tone+mode (cached for export) */
      hex: string;
    }
  | {
      kind: 'custom';
      /** Free-form hex value as the user entered it (lowercase, with leading #) */
      hex: string;
    };

/** Pending edits for a single token. Either side may be undefined when
 *  the user hasn't reassigned that mode. */
export interface TokenOverride {
  light?: ModeOverride;
  dark?: ModeOverride;
}

/** Full pending-overrides map, keyed by token name (e.g. `--color-text-primary`). */
export type OverridesMap = Record<string, TokenOverride>;

// =============================================================================
// State helpers (called by useReducer in ThemeAuditDrawer)
// =============================================================================

export type OverridesAction =
  | {type: 'set'; token: string; mode: Mode; override: ModeOverride}
  | {type: 'clearMode'; token: string; mode: Mode}
  | {type: 'clearToken'; token: string}
  | {type: 'reset'};

export function overridesReducer(
  state: OverridesMap,
  action: OverridesAction,
): OverridesMap {
  switch (action.type) {
    case 'set': {
      const prev = state[action.token] ?? {};
      const next: TokenOverride = {...prev, [action.mode]: action.override};
      return {...state, [action.token]: next};
    }
    case 'clearMode': {
      const prev = state[action.token];
      if (!prev) return state;
      const next: TokenOverride = {...prev};
      delete next[action.mode];
      // Drop the token entry entirely when neither mode is set so the
      // count badges read cleanly without "phantom" empty entries.
      if (!next.light && !next.dark) {
        const {[action.token]: _, ...rest} = state;
        return rest;
      }
      return {...state, [action.token]: next};
    }
    case 'clearToken': {
      const {[action.token]: _, ...rest} = state;
      return rest;
    }
    case 'reset':
      return {};
  }
}

// =============================================================================
// Resolve a (rampSeed, tone, mode) → hex
// =============================================================================

/** Compute the hex for a given ramp+tone+mode using the same generator
 *  the visible Tonal Palettes section uses. */
export function resolveOverrideHex(
  rampSourceHex: string,
  tone: ToneStep,
  mode: Mode,
): string {
  const {hue, chroma} = hexToHct(rampSourceHex);
  return tonalPaletteForMode(hue, chroma, mode)[tone];
}

/** Build a palette-style ModeOverride from a ramp seed + tone + mode. */
export function buildModeOverride(
  seed: RampSeed,
  tone: ToneStep,
  mode: Mode,
): ModeOverride {
  return {
    kind: 'palette',
    rampName: seed.name,
    rampSourceHex: seed.sourceHex,
    tone,
    hex: resolveOverrideHex(seed.sourceHex, tone, mode),
  };
}

/** Build a custom (free-form hex) ModeOverride. Hex is normalised to
 *  lowercase, with a leading `#`, alpha dropped (the rest of the
 *  pipeline assumes 6-digit hex values). */
export function buildCustomOverride(hex: string): ModeOverride {
  return {kind: 'custom', hex: normalizeHex(hex)};
}

/** Validate + normalise a free-form hex string. Returns null when the
 *  input doesn't parse as a 3/4/6/8-digit hex. */
export function normalizeHex(input: string): string {
  const trimmed = input.trim().toLowerCase();
  const m = trimmed.match(/^#?([0-9a-f]{3,8})$/);
  if (!m) return '#000000';
  const body = m[1];
  if (body.length === 3) {
    return '#' + body[0] + body[0] + body[1] + body[1] + body[2] + body[2];
  }
  if (body.length === 4) {
    return '#' + body[0] + body[0] + body[1] + body[1] + body[2] + body[2];
  }
  if (body.length === 6) return '#' + body;
  if (body.length === 8) return '#' + body.slice(0, 6);
  return '#000000';
}

export function isValidHex(input: string): boolean {
  return /^#?[0-9a-fA-F]{3,8}$/.test(input.trim());
}

// =============================================================================
// Count helpers
// =============================================================================

/** Count of tokens with any pending override. Drives the toolbar badge. */
export function countOverrides(state: OverridesMap): number {
  return Object.keys(state).length;
}

/** Total per-mode reassignments across all tokens. Drives sub-counts. */
export function countModeOverrides(state: OverridesMap): {
  light: number;
  dark: number;
} {
  let light = 0;
  let dark = 0;
  for (const t of Object.values(state)) {
    if (t.light) light++;
    if (t.dark) dark++;
  }
  return {light, dark};
}

// =============================================================================
// Export — TypeScript tokens block
// =============================================================================

/**
 * Format the pending overrides as a TypeScript `tokens: { ... }` snippet
 * suitable for pasting into a `defineTheme()` call.
 *
 * Per-token shape:
 *   - both modes set:    '--color-foo': ['#light', '#dark'],   // Ramp T35 / Ramp T80
 *   - only light set:    '--color-foo': ['#light', '<existing dark>'],
 *   - only dark set:     '--color-foo': ['<existing light>', '#dark'],
 *
 * The "unchanged" side falls back to the current theme value (passed in via
 * `currentTokenValues`) so the resulting array is always a valid replacement
 * for the existing entry — copy-paste won't accidentally drop the other mode.
 */
export interface SerializeContext {
  /** Current resolved hex per token per mode — used to fill in the side
   *  the user didn't reassign. */
  currentTokenValues: Record<string, {light: string | null; dark: string | null}>;
}

export function serializeAsTokensBlock(
  state: OverridesMap,
  ctx: SerializeContext,
): string {
  const lines: string[] = [];
  // Sort tokens alphabetically — predictable diff output.
  const tokens = Object.keys(state).sort();
  for (const token of tokens) {
    const ov = state[token];
    const current = ctx.currentTokenValues[token] ?? {light: null, dark: null};
    const lightHex = ov.light?.hex ?? current.light;
    const darkHex = ov.dark?.hex ?? current.dark;

    // When light === dark, defineTheme accepts a single string. Keep tuple
    // form when either mode comes from the user (so the comment annotation
    // attaches to the right side); collapse to single only when both modes
    // are unmanaged (shouldn't happen here but kept defensive).
    const value =
      lightHex && darkHex && lightHex === darkHex && !ov.light && !ov.dark
        ? `'${lightHex}'`
        : `[${formatHex(lightHex)}, ${formatHex(darkHex)}]`;

    const annotations: string[] = [];
    if (ov.light) annotations.push(`light: ${describeOverride(ov.light)}`);
    if (ov.dark) annotations.push(`dark: ${describeOverride(ov.dark)}`);
    const comment = annotations.length ? `  // ${annotations.join(' · ')}` : '';

    lines.push(`    '${token}': ${value},${comment}`);
  }
  return `tokens: {\n${lines.join('\n')}\n  }`;
}

/** Human-readable description of a ModeOverride for export comments and
 *  inline subtitles. Palette overrides read as `Blue T35`; custom
 *  overrides read as `Custom`. */
export function describeOverride(ov: ModeOverride): string {
  if (ov.kind === 'palette') return `${ov.rampName} T${ov.tone}`;
  return 'Custom';
}

function formatHex(hex: string | null): string {
  if (!hex) return `''`;
  return `'${hex}'`;
}

// =============================================================================
// Apply payload — JSON sent to /api/theme-audit/apply
// =============================================================================

export interface ApplyPayloadEntry {
  token: string;
  /** Final value to write — either a single hex (both modes equal) or a
   *  [light, dark] tuple. */
  value: string | [string, string];
  /** Human-readable annotation string the endpoint can use as a trailing
   *  `// ...` comment when inserting a new token entry. */
  annotation?: string;
}

export interface ApplyPayload {
  themeName: string;
  entries: ApplyPayloadEntry[];
}

export function toApplyPayload(
  themeName: string,
  state: OverridesMap,
  ctx: SerializeContext,
): ApplyPayload {
  const entries: ApplyPayloadEntry[] = [];
  for (const token of Object.keys(state).sort()) {
    const ov = state[token];
    const current = ctx.currentTokenValues[token] ?? {light: null, dark: null};
    const lightHex = ov.light?.hex ?? current.light ?? '';
    const darkHex = ov.dark?.hex ?? current.dark ?? '';
    const value: string | [string, string] =
      lightHex === darkHex ? lightHex : [lightHex, darkHex];

    const annotations: string[] = [];
    if (ov.light) annotations.push(`light: ${describeOverride(ov.light)}`);
    if (ov.dark) annotations.push(`dark: ${describeOverride(ov.dark)}`);
    entries.push({
      token,
      value,
      annotation: annotations.length > 0 ? annotations.join(' · ') : undefined,
    });
  }
  return {themeName, entries};
}

// =============================================================================
// Live preview — convert pending overrides into a CSS-custom-property style map
// =============================================================================

/**
 * Build the set of CSS custom properties that, when applied to a parent
 * element, cause every descendant component to render with the pending
 * overrides instead of the committed theme values.
 *
 * Each entry comes out as `light-dark(#light, #dark)`:
 *   - the user-edited side uses the new ramp+tone hex
 *   - the unedited side falls back to the current theme value (so we
 *     never accidentally collapse a [light, dark] tuple to a single
 *     value when the user only touched one mode)
 *
 * Returns the empty object when nothing is pending — the caller can spread
 * unconditionally without an extra branch.
 *
 * Note: returned as `React.CSSProperties` so it composes cleanly with
 * other inline styles, but the keys are CSS custom properties which the
 * built-in CSSProperties type doesn't model — `as` cast required.
 */
export function buildOverrideCSSVars(
  state: OverridesMap,
  ctx: SerializeContext,
): React.CSSProperties {
  const vars: Record<string, string> = {};
  for (const [token, ov] of Object.entries(state)) {
    const current = ctx.currentTokenValues[token] ?? {light: null, dark: null};
    const lightHex = ov.light?.hex ?? current.light;
    const darkHex = ov.dark?.hex ?? current.dark;
    if (!lightHex && !darkHex) continue;
    if (lightHex === darkHex && lightHex) {
      vars[token] = lightHex;
    } else {
      // Either side may be null when the original theme value was
      // unparseable (e.g. var() reference). Fall back to a transparent
      // sentinel rather than emitting `light-dark(null, ...)` which is
      // invalid CSS and would silently break the cascade for that token.
      vars[token] = `light-dark(${lightHex ?? 'transparent'}, ${darkHex ?? 'transparent'})`;
    }
  }
  return vars as React.CSSProperties;
}
