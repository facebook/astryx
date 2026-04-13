import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for RadioListItem ancestor selectors.
 * Prevents hover styles from leaking from parent containers.
 */
export const radioScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
