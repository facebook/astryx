import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Carousel ancestor selectors.
 * Prevents hover styles from leaking from parent containers.
 */
export const carouselScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
