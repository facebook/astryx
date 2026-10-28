// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as stylex from '@stylexjs/stylex';

/**
 * Scoped marker for Lightbox's container. A tap on the photo hides the
 * controls by setting `data-chrome-hidden` on the container, and the
 * controls read it through `stylex.when.ancestor()` (they stop taking
 * taps), so a toggle in the middle of a gesture renders nothing.
 */
export const lightboxScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
