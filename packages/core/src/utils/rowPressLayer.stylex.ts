// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file rowPressLayer.stylex.ts
 * @input StyleX
 * @output The list row press layer's clocks (`cellPressConsts`) and the theme
 *   motion roles every touch press release plays (`pressReleaseRoles`)
 * @position Internal to core: core's `exports` do not list this module, so
 *   none of it is public API (`architecture:public-component-api` INV12).
 *   Read by interactionOverlay.stylex.ts (the overlay's release),
 *   rowPressLayer.ts (the row layer) and pressFeedback.ts (the controller's
 *   timer); interactionOverlay.exports.test.ts holds it off the published
 *   paths.
 */

import * as stylex from '@stylexjs/stylex';

/**
 * A list row's release (`rowPressLayerStyles.cell`, rowPressLayer.ts), mirrored for the stylesheet: StyleX evaluates
 * a style at build time and cannot read the constants table, so these are the
 * table's `list.highlight` values (motion/uikit/list.ts), and
 * interactionOverlay.cell.test.ts fails if they drift.
 */
export const cellPressConsts = stylex.defineConsts({
  /** `list.highlight.releaseMs`, in ms. */
  cellReleaseMs: 200,
  /** `list.highlight.releaseCurve`, as CSS. */
  cellReleaseEase: 'cubic-bezier(0, 0, 0.2, 1)',
});

/**
 * The theme motion roles the release plays (`spec:AST-094` FR4): a cell's
 * clock, `timing.press.highlightOutMs`, and curve,
 * `timing.press.highlightOutCurve`, and a control's clock,
 * `timing.press.buttonReleaseMs`. A theme writes a role's variable only
 * when it retunes it, so the table's value is each one's fallback;
 * interactionOverlay.cell.test.ts holds the names to motion/roles.ts and the
 * controller reads the same clock roles (pressFeedback.ts).
 */
export const pressReleaseRoles = stylex.defineConsts({
  duration: '--motion-timing-press-highlight-out-ms',
  curve: '--motion-timing-press-highlight-out-curve',
  controlDuration: '--motion-timing-press-button-release-ms',
});
