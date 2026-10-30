// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeKnobs.ts
 * @input An element on the page
 * @output `themeMotionKnobs(element)`: the motion knobs of the theme the
 *   element is in, and `themeReducesMotion(element)`: whether that theme
 *   reduces motion for everyone (`spec:AST-108` FR3, FR6)
 * @position Motion foundation; resolveMotion.ts derives a role's value from
 *   the knobs, and the animator treats a theme that reduces motion for
 *   everyone as the person's Reduce Motion setting
 *
 * The knobs are the private custom properties a theme or an adaptation rule
 * that sets them writes beside its duration tokens: `--_astryx-motion-tempo`
 * (already clamped) and `--_astryx-motion-character`. The springs read them
 * where the durations do, so they inherit into a nested theme that sets
 * neither and follow a rule where its condition holds. One
 * `getComputedStyle` read at each motion start reads custom properties only,
 * which forces no layout. `reducedMotion: 'always'` marks the theme's root
 * with `data-astryx-reduced-motion`. Nothing here runs on import or on the
 * server, and no theme module is imported, so the foundation still loads in
 * plain Node.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/themeKnobs.test.ts
 * - /packages/core/src/motion/resolveMotion.ts
 * - /packages/core/src/theme/themeMotion.ts (writes the properties)
 */

/** How lively a theme's motion feels. */
export type ThemeMotionCharacter = 'crisp' | 'standard' | 'expressive';

/** The motion knobs the animator follows, with Astryx's own as defaults. */
export interface ThemeMotionKnobsAt {
  /** The theme's tempo: 1 unless the theme sets one. */
  readonly tempo: number;
  /**
   * Whether the theme sets `tempo` itself: a duration scale alone leaves the
   * springs at tempo 1 (FR5).
   */
  readonly tempoIsSet: boolean;
  readonly character: ThemeMotionCharacter;
}

const REDUCED_MOTION_MARK = '[data-astryx-reduced-motion]';

const DEFAULT_KNOBS: ThemeMotionKnobsAt = {
  tempo: 1,
  tempoIsSet: false,
  character: 'standard',
};

/**
 * The motion knobs `element` plays: the ones it inherits from its theme or an
 * adaptation rule, else Astryx's own (tempo 1, `'standard'`).
 */
export function themeMotionKnobs(
  element: Element | null | undefined,
): ThemeMotionKnobsAt {
  if (element == null || typeof getComputedStyle !== 'function') {
    return DEFAULT_KNOBS;
  }
  const style = getComputedStyle(element);
  const tempoValue = Number.parseFloat(
    style.getPropertyValue('--_astryx-motion-tempo'),
  );
  const tempoIsSet = Number.isFinite(tempoValue) && tempoValue > 0;
  const characterValue = style
    .getPropertyValue('--_astryx-motion-character')
    .trim();
  const character: ThemeMotionCharacter =
    characterValue === 'crisp' || characterValue === 'expressive'
      ? characterValue
      : 'standard';
  if (!tempoIsSet && character === 'standard') {
    return DEFAULT_KNOBS;
  }
  return {tempo: tempoIsSet ? tempoValue : 1, tempoIsSet, character};
}

/**
 * Whether the theme `element` is in reduces motion for everyone
 * (`reducedMotion: 'always'`, which marks the theme's root).
 */
export function themeReducesMotion(
  element: Element | null | undefined,
): boolean {
  return element?.closest?.(REDUCED_MOTION_MARK) != null;
}
