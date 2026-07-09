// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file testimonialsMarquee.stylex.ts
 * @input  none (compile-time StyleX marker)
 * @output marqueeScope — a scoped hover marker for the testimonials marquee
 * @position Consumed by TestimonialsShowcase to pause row animation on hover
 *
 * A component-scoped marker (never stylex.defaultMarker) so the pause-on-hover
 * ancestor selector only reacts to hovering the marquee viewport itself — not
 * any outer container (nav, showcase overlay) that might also match :hover.
 */

import * as stylex from '@stylexjs/stylex';

export const marqueeScope: ReturnType<typeof stylex.defineMarker> =
  stylex.defineMarker();
