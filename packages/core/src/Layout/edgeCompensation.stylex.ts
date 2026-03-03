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
 * ### Why --container-padding-inline instead of --container-padding?
 *
 * Edge compensation is always an inline (horizontal) adjustment. Many containers
 * have different inline vs block padding (e.g., Banner: paddingInline=spacing-4,
 * paddingBlock=spacing-3; TopNav: paddingInline=spacing-4, no block padding).
 * Using the isotropic `--container-padding` would be semantically misleading and
 * could cause incorrect vertical compensation if a future component reads it for
 * block-direction adjustments. The existing `--container-padding` variable is used
 * by Divider and Section for edge-to-edge bleeds in both directions — we don't
 * want to overload it with a value that only represents one axis.
 *
 * SYNC: When modified, update /packages/core/src/Layout/README.md
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';

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
 * Each variant corresponds to a spacing token value matching the component's
 * own inline padding:
 * - `inlinePadding2`: for icon-only buttons (paddingInline: spacing-2)
 * - `inlinePadding3`: for text buttons ghost/tertiary (paddingInline: spacing-3)
 *
 * @example
 * ```tsx
 * // In XDSButton, for ghost variant:
 * {...stylex.props(
 *   styles.base,
 *   variants.ghost,
 *   edgeCompensation.inlinePadding3,
 * )}
 * ```
 */
export const edgeCompensation = stylex.create({
  /**
   * Compensate for spacing-2 inline padding at edges.
   * Used by icon-only buttons.
   */
  inlinePadding2: {
    marginInlineStart: `calc(var(--edge-start, 0) * -1 * min(${spacingVars['--spacing-2']}, var(--container-padding-inline, 0px)))`,
    marginInlineEnd: `calc(var(--edge-end, 0) * -1 * min(${spacingVars['--spacing-2']}, var(--container-padding-inline, 0px)))`,
  },
  /**
   * Compensate for spacing-3 inline padding at edges.
   * Used by ghost/tertiary XDSButton (paddingInline: spacing-3).
   */
  inlinePadding3: {
    marginInlineStart: `calc(var(--edge-start, 0) * -1 * min(${spacingVars['--spacing-3']}, var(--container-padding-inline, 0px)))`,
    marginInlineEnd: `calc(var(--edge-end, 0) * -1 * min(${spacingVars['--spacing-3']}, var(--container-padding-inline, 0px)))`,
  },
  /**
   * Compensate for spacing-4 inline padding at edges.
   * Used by larger padded components.
   */
  inlinePadding4: {
    marginInlineStart: `calc(var(--edge-start, 0) * -1 * min(${spacingVars['--spacing-4']}, var(--container-padding-inline, 0px)))`,
    marginInlineEnd: `calc(var(--edge-end, 0) * -1 * min(${spacingVars['--spacing-4']}, var(--container-padding-inline, 0px)))`,
  },
});
