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
 * The theme an element is in is its nearest `data-astryx-theme` scope: the
 * Theme wrapper, or `<html>` for the root theme. Theme writes the knobs it
 * sets on that scope as attributes: `data-astryx-motion-tempo` when the theme
 * sets `tempo` (already clamped), `data-astryx-motion-character` when its
 * character is not `'standard'`, and `data-astryx-reduced-motion` for
 * `reducedMotion: 'always'`. A scope without them plays Astryx's own motion,
 * so a nested theme never inherits an outer theme's knobs. Everything here
 * reads DOM attributes only: no theme module, no style or layout read,
 * nothing on import, nothing on the server, so the foundation still loads in
 * plain Node.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/motion/themeKnobs.test.ts
 * - /packages/core/src/motion/resolveMotion.ts
 * - /packages/core/src/theme/Theme.tsx (writes the attributes)
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

const THEME_SCOPE = '[data-astryx-theme]';
const REDUCED_MOTION_MARK = '[data-astryx-reduced-motion]';

const DEFAULT_KNOBS: ThemeMotionKnobsAt = {
  tempo: 1,
  tempoIsSet: false,
  character: 'standard',
};

/**
 * The motion knobs of the theme `element` is in: Astryx's own (tempo 1,
 * `'standard'`) outside any theme, or for a theme that sets none.
 */
export function themeMotionKnobs(
  element: Element | null | undefined,
): ThemeMotionKnobsAt {
  const scope = element?.closest?.(THEME_SCOPE);
  if (scope == null) {
    return DEFAULT_KNOBS;
  }
  const tempoValue = Number(scope.getAttribute('data-astryx-motion-tempo'));
  const tempoIsSet =
    scope.hasAttribute('data-astryx-motion-tempo') &&
    Number.isFinite(tempoValue) &&
    tempoValue > 0;
  const characterValue = scope.getAttribute('data-astryx-motion-character');
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
