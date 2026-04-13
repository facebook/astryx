import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Switch ancestor selectors.
 * Prevents focus-within and hover styles from leaking from parent containers.
 */
export const switchScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
