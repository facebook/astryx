// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeMotion.ts
 * @input A theme's motion configuration: the three knobs (`tempo`,
 *   `character`, `reducedMotion`), the existing `MotionScaleConfig`, or both
 * @output The resolved knobs, the motion tokens they generate, and
 *   `resolveThemeMotion`, the internal resolver the animator and server code
 *   read (`spec:AST-108` FR1, FR2, FR5, FR6)
 * @position Theme utility; consumed by resolveThemeValues.ts. Pure: no DOM,
 *   no import-time work, safe on the server.
 *
 * `tempo` scales every motion duration, clamped to 0.75–1.5. `character`
 * picks the entrance and move curves (and, in the animator, offsets a spring
 * role's bounce by its weight). `reducedMotion: 'always'` applies the Reduce
 * Motion policy for everyone; `'system'` follows each person's setting. With
 * the defaults (tempo 1, `'standard'`, `'system'`) every token is today's.
 *
 * A `MotionScaleConfig` keeps generating its duration tokens, and its fields
 * win over `tempo` (FR5); explicit `tokens` win over both in
 * resolveThemeValues.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/themeMotion.test.ts
 * - /packages/core/src/theme/resolveThemeValues.ts
 * - /packages/core/src/theme/defineTheme.ts (the `motion` field's docs)
 */

import {expandMotionScale, type MotionScaleConfig} from './expandMotionScale';
import {durationDefaults, easeDefaults} from './tokens.stylex';

/** How lively a theme's motion feels. */
export type MotionCharacter = 'crisp' | 'standard' | 'expressive';

/** Whether a theme reduces motion for everyone. */
export type ThemeReducedMotion = 'system' | 'always';

/** The three motion knobs a theme sets (`spec:AST-108` FR1). */
export interface ThemeMotionKnobs {
  /**
   * Scales every motion duration: 1 is Astryx's own, 0.75 the quickest and
   * 1.5 the slowest (values outside are clamped). Default 1.
   */
  tempo?: number;
  /**
   * `'crisp'` decelerates without overshoot, `'standard'` is Astryx's own,
   * `'expressive'` overshoots slightly on entrances and moves. Exits and
   * fades never overshoot. Default `'standard'`.
   */
  character?: MotionCharacter;
  /**
   * `'always'` reduces motion for everyone; `'system'` follows each person's
   * Reduce Motion setting. No value loosens Reduce Motion. Default `'system'`.
   */
  reducedMotion?: ThemeReducedMotion;
}

/**
 * A theme's `motion`: the knobs, the existing `MotionScaleConfig`, or both.
 * A `MotionScaleConfig`'s fields win over `tempo` for the durations they set.
 */
export type ThemeMotionConfig =
  ThemeMotionKnobs | (MotionScaleConfig & ThemeMotionKnobs);

/** The knobs with their defaults filled in and `tempo` clamped. */
export interface ResolvedMotionKnobs {
  readonly tempo: number;
  readonly character: MotionCharacter;
  readonly reducedMotion: ThemeReducedMotion;
  /**
   * Whether the theme sets `tempo` itself. A `MotionScaleConfig` alone
   * implies a tempo for its CSS durations only; the animator's springs stay
   * at tempo 1 unless this is true (FR5).
   */
  readonly tempoIsSet: boolean;
}

/** The range `tempo` is clamped to. */
export const TEMPO_RANGE = {min: 0.75, max: 1.5} as const;

/**
 * The entrance and move curve at each character. `'standard'` is the theme's
 * `--ease-standard`, so a theme that overrides that easing keeps its entrances
 * on it.
 */
export const CHARACTER_EASE = {
  crisp: 'cubic-bezier(0, 0, 0.2, 1)',
  standard: null,
  expressive: 'cubic-bezier(0.3, 1.2, 0.5, 1)',
} as const satisfies Record<MotionCharacter, string | null>;

const CHARACTERS: ReadonlyArray<MotionCharacter> = [
  'crisp',
  'standard',
  'expressive',
];

function isScaleConfig(
  config: ThemeMotionConfig,
): config is MotionScaleConfig & ThemeMotionKnobs {
  return 'fast' in config && 'medium' in config && 'ratio' in config;
}

/** The knobs of `config`, defaults filled in, `tempo` clamped. */
export function resolveMotionKnobs(
  config: ThemeMotionConfig | undefined,
): ResolvedMotionKnobs {
  const tempoIsSet =
    typeof config?.tempo === 'number' && Number.isFinite(config.tempo);
  const tempo = tempoIsSet
    ? Math.min(
        TEMPO_RANGE.max,
        Math.max(TEMPO_RANGE.min, config.tempo as number),
      )
    : 1;
  const character =
    config?.character != null && CHARACTERS.includes(config.character)
      ? config.character
      : 'standard';
  const reducedMotion =
    config?.reducedMotion === 'always' ? 'always' : 'system';
  return {tempo, character, reducedMotion, tempoIsSet};
}

/** A duration token's value in ms (`'175ms'` → 175). */
function msOf(value: string): number {
  return Number.parseFloat(value);
}

/** The duration tokens at `tempo`: today's values times it, to the ms. */
export function durationTokensAt(tempo: number): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [name, value] of Object.entries(durationDefaults)) {
    tokens[name] = `${Math.round(msOf(value) * tempo)}ms`;
  }
  return tokens;
}

/**
 * The motion tokens `config` generates (FR2, FR5): `--duration-*` times
 * `tempo`, with a `MotionScaleConfig`'s own durations winning, and the
 * job-named `--ease-entrance` and `--ease-move` at the theme's character.
 * A knob the config leaves out writes nothing, so a theme extending another
 * keeps the base's value for it; a knob it sets is written even at its
 * default, so a child can set a base's tempo back to 1.
 */
export function expandThemeMotion(
  config: ThemeMotionConfig,
): Record<string, string> {
  const knobs = resolveMotionKnobs(config);
  const tokens: Record<string, string> = {};
  if (knobs.tempoIsSet) {
    Object.assign(tokens, durationTokensAt(knobs.tempo));
  }
  if (isScaleConfig(config)) {
    Object.assign(tokens, expandMotionScale(config));
  }
  const scaleEasing =
    isScaleConfig(config) && config.easing != null ? config.easing : null;
  const ease =
    CHARACTER_EASE[knobs.character] ??
    (config.character != null
      ? (scaleEasing ?? easeDefaults['--ease-standard'])
      : scaleEasing);
  if (ease != null) {
    tokens['--ease-entrance'] = ease;
    tokens['--ease-move'] = ease;
  }
  return tokens;
}

/** What `resolveThemeMotion` returns for a theme. */
export interface ThemeMotion {
  /** The knobs, defaults filled in. */
  readonly knobs: ResolvedMotionKnobs;
  /** Every `--duration-*` token's value. */
  readonly durations: Readonly<Record<string, string>>;
  /** `--ease-standard`, `--ease-entrance` and `--ease-move`. */
  readonly easings: Readonly<Record<string, string>>;
}

/**
 * A theme's motion values, for the animator and for server code (FR6): the
 * knobs, and the duration and easing tokens they resolve to with the theme's
 * explicit tokens applied. Pure: it reads only `theme`.
 */
export function resolveThemeMotion(theme: {
  readonly motion?: ThemeMotionConfig;
  readonly tokens?: Readonly<Record<string, string | undefined>>;
}): ThemeMotion {
  const knobs = resolveMotionKnobs(theme.motion);
  const generated = theme.motion ? expandThemeMotion(theme.motion) : {};
  const value = (name: string, fallback: string): string =>
    theme.tokens?.[name] ?? generated[name] ?? fallback;
  const durations: Record<string, string> = {};
  for (const [name, fallback] of Object.entries(durationDefaults)) {
    durations[name] = value(name, fallback);
  }
  const standard = value('--ease-standard', easeDefaults['--ease-standard']);
  return {
    knobs,
    durations,
    easings: {
      '--ease-standard': standard,
      '--ease-entrance': value('--ease-entrance', standard),
      '--ease-move': value('--ease-move', standard),
    },
  };
}
