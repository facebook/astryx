/**
 * @file edgeCompensation.stylex.ts
 * @input Uses @stylexjs/stylex
 * @output StyleX utilities for automatic edge padding compensation
 * @position Layout utility; used by containers (TopNav, Toolbar, etc.)
 *   and components with transparent variants (Button ghost, Tab)
 *
 * ## Edge Inset Pattern
 *
 * Interactive components with transparent padding (ghost buttons, tabs)
 * create excess visual space at container edges. The container's padding + the
 * component's own transparent padding doubles up.
 *
 * This module provides a two-layer solution:
 *
 * 1. **Containers** set the inset budget via CSS custom properties on slot wrappers:
 *    - `--edge-inset-start: <px>` — how much to pull back at the start edge
 *    - `--edge-inset-end: <px>` — how much to pull back at the end edge
 *
 * 2. **Components** opt in by applying `edgeCompensation.item` which uses
 *    `:first-child` / `:last-child` selectors to only compensate items
 *    actually at the edge.
 *
 * The container decides the amount. The component decides whether to participate.
 *
 * SYNC: When modified, update /packages/core/src/Layout/Layout.doc.mjs
 */

import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';

// =============================================================================
// Container-side: Edge inset styles
// =============================================================================

/**
 * Styles for containers to set the edge inset budget on slot wrappers.
 *
 * Apply to wrapper divs around slot content (startContent, endContent, etc.).
 * The value is the amount of negative margin that edge-adjacent components
 * will apply to pull themselves toward the container edge.
 *
 * @example
 * ```tsx
 * // Toolbar sets inset equal to its slot padding:
 * <div {...stylex.props(edgeInset.start4)}>
 *   {startContent}
 * </div>
 * <div {...stylex.props(edgeInset.end4)}>
 *   {endContent}
 * </div>
 * ```
 */
export const edgeInset = stylex.create({
  /** Start edge inset: spacing-1 (4px) */
  start1: {'--edge-inset-start': spacingVars['--spacing-1']},
  /** Start edge inset: spacing-1.5 (6px) */
  start1_5: {'--edge-inset-start': spacingVars['--spacing-1-5']},
  /** Start edge inset: spacing-2 (8px) */
  start2: {'--edge-inset-start': spacingVars['--spacing-2']},
  /** Start edge inset: spacing-3 (12px) */
  start3: {'--edge-inset-start': spacingVars['--spacing-3']},
  /** Start edge inset: spacing-4 (16px) */
  start4: {'--edge-inset-start': spacingVars['--spacing-4']},
  /** Start edge inset: spacing-5 (20px) */
  start5: {'--edge-inset-start': spacingVars['--spacing-5']},
  /** End edge inset: spacing-1 (4px) */
  end1: {'--edge-inset-end': spacingVars['--spacing-1']},
  /** End edge inset: spacing-1.5 (6px) */
  end1_5: {'--edge-inset-end': spacingVars['--spacing-1-5']},
  /** End edge inset: spacing-2 (8px) */
  end2: {'--edge-inset-end': spacingVars['--spacing-2']},
  /** End edge inset: spacing-3 (12px) */
  end3: {'--edge-inset-end': spacingVars['--spacing-3']},
  /** End edge inset: spacing-4 (16px) */
  end4: {'--edge-inset-end': spacingVars['--spacing-4']},
  /** End edge inset: spacing-5 (20px) */
  end5: {'--edge-inset-end': spacingVars['--spacing-5']},
});

// =============================================================================
// Component-side: Edge compensation styles
// =============================================================================

/**
 * Styles for components to self-adjust at container edges.
 *
 * Components with transparent/flat padding (ghost buttons, tabs) apply
 * `edgeCompensation.item` to participate in edge compensation.
 *
 * Only the first child in a slot gets start compensation, and only the
 * last child gets end compensation — via `:first-child` / `:last-child`.
 *
 * @example
 * ```tsx
 * // In XDSButton, for ghost variant:
 * {...stylex.props(
 *   styles.base,
 *   styles.ghost,
 *   edgeCompensation.item,
 * )}
 * ```
 */
export const edgeCompensation = stylex.create({
  /**
   * Edge-compensating item. Applies negative margin at container edges
   * using the inset budget set by the parent container.
   * Only activates when the component is :first-child (start) or :last-child (end).
   */
  item: {
    marginInlineStart: {
      default: null,
      ':first-child': 'calc(-1 * var(--edge-inset-start, 0px))',
    },
    marginInlineEnd: {
      default: null,
      ':last-child': 'calc(-1 * var(--edge-inset-end, 0px))',
    },
  },
});
