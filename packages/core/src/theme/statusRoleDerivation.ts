// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file statusRoleDerivation.ts
 * @input A theme's portable and local token maps
 * @output Concrete values for the status roles the theme does not set
 * @position Theme generation step for architecture:theme-compilation INV17,
 *   called by generateThemeRules for runtime and static output alike.
 *
 * A theme that sets a status source (its base `--color-success`,
 * `--color-warning`, or `--color-error`, or its accent for Info) gets every
 * status role it leaves unset, computed against its own surfaces:
 * - `--color-text-<status>`: the status hue at 4.5:1 on surface and card;
 * - `--color-<status>-emphasized`: the hue, adjusted until `--color-on-<status>`
 *   reaches 4.5:1 on it;
 * - `--color-info-muted`: the Info hue at Core's pale strength (released
 *   success, warning, and error muted tokens are never derived);
 * - `--color-on-<status>-muted`: the hue at 4.5:1 on the pale fill over the
 *   surface.
 * Icon and border roles alias the text role through the scoped status-role
 * aliases in generateThemeRules, so they are not computed here.
 */

import {colorDefaults} from './tokens.stylex';
import {
  composite,
  contrastRatio,
  isChromatic,
  parseConcreteColor,
  solveLightness,
  toHex,
} from './statusColor';
import type {RGBA} from '../utils/color';

export const STATUS_NAMES = ['info', 'success', 'warning', 'error'] as const;
export type StatusName = (typeof STATUS_NAMES)[number];

/** Core's pale-fill strength for a derived Info fill. */
type ResolvedThemeMode = 'light' | 'dark';

const PALE_ALPHA: Record<ResolvedThemeMode, number> = {light: 0.2, dark: 0.25};
const TEXT_RATIO = 4.5;
// Solve slightly above the floor so rounding to #RRGGBB never lands below it.
const SOLVE_RATIO = TEXT_RATIO + 0.08;
const MODES: ReadonlyArray<ResolvedThemeMode> = ['light', 'dark'];

/** The token whose presence in a theme makes its status roles derivable. */
export function statusSourceToken(status: StatusName): string {
  return status === 'info' ? '--color-accent' : `--color-${status}`;
}

function splitTopLevel(input: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of input) {
    if (ch === '(') {
      depth++;
    }
    if (ch === ')') {
      depth--;
    }
    if (ch === ',' && depth === 0) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  parts.push(current.trim());
  return parts;
}

/**
 * Resolve one token to a concrete value for a mode, following `light-dark()`
 * and `var()` through the theme's tokens and then Core's colour defaults.
 * This stays local (rather than using tokens.ts) so theme generation does not
 * import the runtime token helpers that themselves depend on defineTheme.
 */
function resolveToken(
  tokens: Record<string, unknown>,
  name: string,
  mode: ResolvedThemeMode,
  seen: ReadonlySet<string> = new Set(),
): string | undefined {
  if (seen.has(name)) {
    return undefined;
  }
  const raw = tokens[name] ?? (colorDefaults as Record<string, string>)[name];
  return resolveValue(tokens, raw, mode, new Set([...seen, name]));
}

function resolveValue(
  tokens: Record<string, unknown>,
  raw: unknown,
  mode: ResolvedThemeMode,
  seen: ReadonlySet<string>,
): string | undefined {
  if (Array.isArray(raw)) {
    return resolveValue(tokens, raw[mode === 'light' ? 0 : 1], mode, seen);
  }
  if (typeof raw !== 'string') {
    return undefined;
  }
  const value = raw.trim();
  if (/^light-dark\(/i.test(value) && value.endsWith(')')) {
    const [light, dark] = splitTopLevel(
      value.slice(value.indexOf('(') + 1, -1),
    );
    return resolveValue(tokens, mode === 'light' ? light : dark, mode, seen);
  }
  const ref = /^var\(\s*(--[\w-]+)\s*(?:,(.*))?\)$/s.exec(value);
  if (ref) {
    const resolved = resolveToken(tokens, ref[1], mode, seen);
    return (
      resolved ??
      (ref[2] ? resolveValue(tokens, ref[2], mode, seen) : undefined)
    );
  }
  return value;
}

const CORE_TOKENS: Record<string, unknown> = {};

function resolveModes(
  tokens: Record<string, unknown>,
): Record<ResolvedThemeMode, Record<string, string>> {
  const names = new Set([
    ...Object.keys(colorDefaults),
    ...Object.keys(tokens),
  ]);
  const at = (mode: ResolvedThemeMode): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const name of names) {
      const value = resolveToken(tokens, name, mode);
      if (value !== undefined) {
        out[name] = value;
      }
    }
    return out;
  };
  return {light: at('light'), dark: at('dark')};
}

let coreCache: Record<ResolvedThemeMode, Record<string, string>> | undefined;
function core(): Record<ResolvedThemeMode, Record<string, string>> {
  coreCache ??= resolveModes(CORE_TOKENS);
  return coreCache;
}

function statusHue(
  status: StatusName,
  resolved: Record<string, string>,
  mode: ResolvedThemeMode,
): RGBA | null {
  const candidates =
    status === 'info'
      ? [resolved['--color-accent'], resolved['--color-icon-blue']]
      : [resolved[`--color-${status}`]];
  for (const value of candidates) {
    const color = parseConcreteColor(value);
    if (color !== null && isChromatic(color)) {
      return {...color, a: 1};
    }
  }
  // A grey or unresolvable source falls back to Core's own status hue.
  const fallback = parseConcreteColor(
    status === 'info'
      ? core()[mode]['--color-icon-blue']
      : core()[mode][`--color-${status}`],
  );
  return fallback === null ? null : {...fallback, a: 1};
}

function sourceIsHue(
  status: StatusName,
  resolved: Record<string, string>,
): boolean {
  const source = parseConcreteColor(resolved[statusSourceToken(status)]);
  return source !== null && source.a >= 1 && isChromatic(source);
}

function opaqueOver(color: RGBA, under: RGBA): RGBA {
  return color.a < 1 ? composite(color, under) : color;
}

interface ModeRoles {
  text?: RGBA;
  emphasized?: RGBA;
  muted?: RGBA;
  onMuted?: RGBA;
}

function deriveForMode(
  status: StatusName,
  resolved: Record<string, string>,
  mode: ResolvedThemeMode,
): ModeRoles | null {
  // A source that does not resolve to a concrete colour (an oklch() value, an
  // unknown reference) keeps the scoped alias to it instead of a guess.
  if (parseConcreteColor(resolved[statusSourceToken(status)]) === null) {
    return null;
  }
  const hue = statusHue(status, resolved, mode);
  const surface = parseConcreteColor(resolved['--color-background-surface']);
  if (hue === null || surface === null) {
    return null;
  }
  const opaqueSurface = opaqueOver(surface, {r: 255, g: 255, b: 255, a: 1});
  const cardColor = parseConcreteColor(resolved['--color-background-card']);
  const card =
    cardColor === null ? opaqueSurface : opaqueOver(cardColor, opaqueSurface);
  const roles: ModeRoles = {};

  const text = solveLightness(hue, [opaqueSurface, card], SOLVE_RATIO);
  if (text !== null) {
    roles.text = text;
  }

  const on = parseConcreteColor(
    resolved[`--color-on-${status}`] ??
      (status === 'info' ? resolved['--color-on-accent'] : undefined),
  );
  if (on !== null) {
    const onOpaque = opaqueOver(on, hue);
    // A source that already carries its content keeps the scoped alias to
    // that source; only a source that needs adjusting, or a grey Info accent,
    // gets a concrete value.
    if (
      contrastRatio(onOpaque, hue) < TEXT_RATIO ||
      !sourceIsHue(status, resolved)
    ) {
      const emphasized = solveLightness(hue, [onOpaque], SOLVE_RATIO);
      if (emphasized !== null) {
        roles.emphasized = emphasized;
      }
    }
  }

  const muted =
    status === 'info'
      ? {...hue, a: PALE_ALPHA[mode]}
      : parseConcreteColor(resolved[`--color-${status}-muted`]);
  if (status === 'info') {
    roles.muted = {...hue, a: PALE_ALPHA[mode]};
  }
  if (muted !== null) {
    const fill = composite(
      muted.a < 1 ? muted : {...muted, a: 1},
      opaqueSurface,
    );
    const onMuted = solveLightness(hue, [fill], SOLVE_RATIO);
    if (onMuted !== null) {
      roles.onMuted = onMuted;
    }
  }
  return roles;
}

const ROLE_TOKENS: Record<keyof ModeRoles, (status: StatusName) => string> = {
  text: s => `--color-text-${s}`,
  emphasized: s => `--color-${s}-emphasized`,
  muted: s => `--color-${s}-muted`,
  onMuted: s => `--color-on-${s}-muted`,
};

/**
 * Concrete `light-dark()` values for every status role a theme leaves unset
 * while setting that status's source. Authored roles are never overridden.
 */
export function deriveStatusRoleTokens(
  tokens: Record<string, string>,
  localTokens: Record<string, string> = {},
): [string, string][] {
  const authored = new Set(Object.keys(tokens));
  const sources = STATUS_NAMES.filter(s => authored.has(statusSourceToken(s)));
  if (sources.length === 0) {
    return [];
  }
  const resolved = resolveModes({...localTokens, ...tokens});
  const entries: [string, string][] = [];
  for (const status of sources) {
    const perMode = MODES.map(mode =>
      deriveForMode(status, resolved[mode], mode),
    );
    const hues = MODES.map(mode => statusHue(status, resolved[mode], mode));
    if (perMode.some(r => r === null)) {
      continue;
    }
    for (const key of Object.keys(ROLE_TOKENS) as (keyof ModeRoles)[]) {
      if (key === 'muted' && status !== 'info') {
        continue;
      }
      const token = ROLE_TOKENS[key](status);
      if (authored.has(token)) {
        continue;
      }
      let [light, dark] = perMode.map(r => r?.[key]);
      if (key === 'emphasized' && (light !== undefined || dark !== undefined)) {
        // One mode needed adjusting: the other keeps its source hue.
        light ??= hues[0] ?? undefined;
        dark ??= hues[1] ?? undefined;
      }
      if (light === undefined || dark === undefined) {
        continue;
      }
      entries.push([token, `light-dark(${toHex(light)}, ${toHex(dark)})`]);
    }
  }
  return entries;
}
