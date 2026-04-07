/**
 * @file edgeCompensation.stylex.ts
 * @input Uses @stylexjs/stylex
 * @output StyleX utilities for automatic edge padding compensation
 * @position Layout utility; used by containers (TopNav, LayoutHeader, Banner, etc.)
 *   and components with transparent variants (Button ghost/tertiary)
 *
 * ## Edge Compensation Pattern
 *
 * Interactive components with transparent padding (ghost buttons, tertiary buttons)
 * create excess visual space at container edges. The container's padding + the
 * component's own transparent padding doubles up. Solid buttons don't have this
 * problem — their padding is visually filled.
 *
 * This module provides a two-layer solution:
 *
 * 1. **Containers** set spatial signals via CSS custom properties:
 *    - `--edge-start: 1` / `--edge-end: 1` on edge-adjacent slots
 *    - `--container-padding-inline` on the container root (the inline padding value)
 *
 * 2. **Components** with flat/transparent variants read these signals and
 *    self-adjust their margins, clamped to `min(own-padding, container-padding-inline)`.
 *
 * The compensation formula:
 * ```
 * margin = var(--edge-*, 0) * -1 * min(own-padding, var(--container-padding-inline, 0px))
 * ```
 *
 * - When not at an edge: `--edge-*` is 0, so margin is 0 (no effect)
 * - When at an edge: margin pulls the component toward the edge by the smaller
 *   of its own padding or the container's inline padding
 *
 * ### Why --container-padding-inline?
 *
 * Edge compensation is always an inline (horizontal) adjustment. Many containers
 * have different inline vs block padding (e.g., Banner: paddingInline=spacing-4,
 * paddingBlock=spacing-3; TopNav: paddingInline=spacing-4, no block padding).
 * The container system uses two directional vars: --container-padding-inline for
 * horizontal padding and --container-padding-block-start/end for vertical. Edge compensation
 * only reads the inline var since it only adjusts horizontal margins.
 *
 * SYNC: When modified, update /packages/core/src/Layout/Layout.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';

// =============================================================================
// Container-side: Edge signal styles
// =============================================================================

/**
 * Styles for containers to mark slots at their edges.
 *
 * Apply these to wrapper divs around slot content (startContent, endContent, etc.)
 * so child components know they're at a container boundary.
 *
 * The container must also set `--container-padding-inline` on its root element
 * so components know how much inline room is available for compensation.
 *
 * @example
 * ```tsx
 * // In TopNav:
 * <div {...stylex.props(edgeSignals.start)}>
 *   {startContent}
 * </div>
 * <div {...stylex.props(edgeSignals.end)}>
 *   {endContent}
 * </div>
 * ```
 */
export const edgeSignals = stylex.create({
  /** Mark slot as being at the inline-start edge of the container */
  start: {
    '--edge-start': '1',
  },
  /** Mark slot as being at the inline-end edge of the container */
  end: {
    '--edge-end': '1',
  },
  /** Mark slot as being at both edges (e.g., a single-slot container) */
  both: {
    '--edge-start': '1',
    '--edge-end': '1',
  },
});

// =============================================================================
// Component-side: Edge compensation styles
// =============================================================================

/**
 * Styles for components to self-adjust at container edges.
 *
 * Components with transparent/flat variants (ghost buttons, tertiary buttons,
 * icon-only buttons) should apply these styles to compensate for doubled padding
 * at container edges.
 *
 * The compensation is `min(own-padding, container-padding-inline)` — never more
 * than either value. When not at an edge (signals default to 0), no compensation
 * is applied.
 *
 * Components must set `--component-padding-inline` on themselves so the
 * compensation formula knows the component's own inline padding. This makes
 * edge compensation theme-safe — if a theme changes the button's internal
 * padding, the compensation adjusts automatically.
 *
 * @example
 * ```tsx
 * // In XDSButton, for ghost variant:
 * const styles = stylex.create({
 *   ghost: {
 *     paddingInline: spacingVars['--spacing-3'],
 *     '--component-padding-inline': spacingVars['--spacing-3'],
 *   },
 * });
 *
 * {...stylex.props(
 *   styles.base,
 *   styles.ghost,
 *   edgeCompensation.self,
 * )}
 * ```
 */
export const edgeCompensation = stylex.create({
  /**
   * Self-compensating edge style. Reads --component-padding-inline from the
   * component itself. The component must set this variable to its own inline
   * padding value (typically via the same spacing token used for paddingInline).
   */
  self: {
    marginInlineStart: `calc(var(--edge-start, 0) * -1 * min(var(--component-padding-inline, 0px), var(--container-padding-inline, 0px)))`,
    marginInlineEnd: `calc(var(--edge-end, 0) * -1 * min(var(--component-padding-inline, 0px), var(--container-padding-inline, 0px)))`,
  },
});
