import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for CheckboxInput ancestor selectors.
 * Prevents focus-within and hover styles from leaking when
 * checkboxes are placed inside Popovers or other containers
 * that also have focus-within state.
 */
export const checkboxScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
