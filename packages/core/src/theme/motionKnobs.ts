// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file motionKnobs.ts
 * @input A theme's motion knobs (`tempo`, `character`, `reducedMotion`)
 * @output Their types and `resolveMotionKnobs`, which fills in the defaults
 *   and clamps `tempo` (`spec:AST-108` FR1)
 * @position Theme utility with no imports: themeMotion.ts builds the motion
 *   tokens on it, and the motion foundation reads a theme's knobs through it
 *   without loading the token stylesheet. Pure; safe on the server and in
 *   plain Node.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/theme/themeMotion.ts (re-exports these)
 * - /packages/core/src/theme/themeMotion.test.ts
 */

/** How lively a theme's motion feels. */
export type MotionCharacter = 'crisp' | 'standard' | 'expressive';

/**
 * Whose Reduce Motion setting a theme follows: `'system'`, each person's own.
 */
export type ThemeReducedMotion = 'system';

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
   * `'system'` follows each person's Reduce Motion setting. It is the only
   * value, and the default: no theme loosens Reduce Motion.
   */
  reducedMotion?: ThemeReducedMotion;
}

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

const CHARACTERS: ReadonlyArray<MotionCharacter> = [
  'crisp',
  'standard',
  'expressive',
];

/** The knobs of `config`, defaults filled in, `tempo` clamped. */
export function resolveKnobs(
  config: ThemeMotionKnobs | undefined,
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
  return {tempo, character, reducedMotion: 'system', tempoIsSet};
}
