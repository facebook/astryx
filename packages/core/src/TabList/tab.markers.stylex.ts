import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Tab ancestor selectors.
 * Scopes hover styles to the individual tab button/anchor,
 * preventing all unselected tab indicators from showing
 * when any part of the tab list nav is hovered.
 */
export const tabScope = stylex.defineMarker();
