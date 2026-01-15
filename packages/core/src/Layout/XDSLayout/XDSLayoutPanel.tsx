/**
 * @file XDSLayoutPanel.tsx
 * @input Uses React forwardRef, StyleX, XDSLayoutAreaContext, XDSLayoutSlotsContext
 * @output Exports XDSLayoutPanel component and XDSLayoutPanelProps
 * @position Layout content area component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import type { AriaRole, HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useContext } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colorTokens, spacingTokens } from '../../theme/tokens.stylex';
import { XDSLayoutAreaContext } from './XDSLayoutAreaContext';
import { XDSLayoutSlotsContext } from './XDSLayoutSlotsContext';

const styles = stylex.create({
  panel: {
    boxSizing: 'border-box',
    flexShrink: 0,
    overflow: 'auto',
    // Default: inner padding on all sides (will be overridden by position-specific styles)
    paddingInline: `var(--layout-padding-inner-x, ${spacingTokens.space4})`,
    paddingBlock: `var(--layout-padding-inner-y, ${spacingTokens.space4})`,
  },
  // Start panel: outer-x on left edge
  startPanel: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingTokens.space4})`,
  },
  // End panel: outer-x on right edge
  endPanel: {
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingTokens.space4})`,
  },
  // When no header: outer-y on top
  noHeader: {
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingTokens.space4})`,
  },
  // When no footer: outer-y on bottom
  noFooter: {
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingTokens.space4})`,
  },
  // When layout is full bleed, use inner padding on outer edges
  layoutFullBleedStart: {
    paddingInlineStart: `var(--layout-padding-inner-x, ${spacingTokens.space4})`,
  },
  layoutFullBleedEnd: {
    paddingInlineEnd: `var(--layout-padding-inner-x, ${spacingTokens.space4})`,
  },
  layoutFullBleedTop: {
    paddingBlockStart: `var(--layout-padding-inner-y, ${spacingTokens.space4})`,
  },
  layoutFullBleedBottom: {
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingTokens.space4})`,
  },
  fullBleed: {
    paddingInline: 0,
    paddingBlock: 0,
  },
  // For start panel: divider on end edge
  dividerEnd: {
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorTokens.divider,
  },
  // For end panel: divider on start edge
  dividerStart: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorTokens.divider,
  },
  // When no divider, collapse spacing to avoid double-padding
  collapseStart: {
    marginInlineStart: `calc(-1 * var(--layout-padding-inner-x, ${spacingTokens.space4}))`,
  },
  collapseEnd: {
    marginInlineEnd: `calc(-1 * var(--layout-padding-inner-x, ${spacingTokens.space4}))`,
  },
});

export interface XDSLayoutPanelProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  /**
   * Content to render inside the panel.
   */
  children?: ReactNode;

  /**
   * Adds a themed border on the appropriate edge.
   * - Start panel: border on end edge (right in LTR)
   * - End panel: border on start edge (left in LTR)
   * When false, spacing collapse is applied automatically for seamless visual flow.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Removes internal padding, allowing content to touch the edges.
   * @default false
   */
  isFullBleed?: boolean;

  /**
   * Accessible label for the landmark.
   * Required when role is set and multiple landmarks of the same type exist.
   */
  label?: string;

  /**
   * ARIA landmark role for accessibility.
   * Use 'navigation' or 'complementary' only for top-level layouts (not nested).
   */
  role?: AriaRole;
}

/**
 * Side panel content area for XDSLayout.
 * Renders in the start or end slot with optional divider and padding control.
 * Divider position is auto-detected based on which slot the panel is in.
 *
 * @example
 * ```tsx
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     start={
 *       <XDSLayoutPanel hasDivider role="navigation">
 *         <Navigation />
 *       </XDSLayoutPanel>
 *     }
 *     content={<XDSLayoutContent>Main content</XDSLayoutContent>}
 *     end={
 *       <XDSLayoutPanel hasDivider role="complementary">
 *         <Sidebar />
 *       </XDSLayoutPanel>
 *     }
 *   />
 * </XDSLayoutContainer>
 * ```
 */
export const XDSLayoutPanel = forwardRef<HTMLElement, XDSLayoutPanelProps>(
  function XDSLayoutPanel(
    { children, hasDivider = false, isFullBleed = false, label, role, ...props },
    ref
  ) {
    const area = useContext(XDSLayoutAreaContext);
    const { hasHeader, hasFooter, isFullBleed: isLayoutFullBleed } = useContext(XDSLayoutSlotsContext);

    // Determine panel position
    const isStartPanel = area === 'start';
    const isEndPanel = area === 'end';

    // When no divider, collapse spacing for seamless visual flow
    const shouldCollapseSpacing = !hasDivider && !isFullBleed;

    // Don't apply any outer padding styles when component is full bleed
    const applyOuterPadding = !isFullBleed && !isLayoutFullBleed;

    // Select divider style based on position
    const dividerStyle = isStartPanel ? styles.dividerEnd
      : isEndPanel ? styles.dividerStart
      : null;

    // Select collapse style based on position
    const collapseStyle = isStartPanel ? styles.collapseStart
      : isEndPanel ? styles.collapseEnd
      : null;

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={role}
        aria-label={label}
        {...stylex.props(
          styles.panel,
          // Outer padding on container edges (unless component or layout is full bleed)
          isStartPanel && applyOuterPadding && styles.startPanel,
          isEndPanel && applyOuterPadding && styles.endPanel,
          !hasHeader && applyOuterPadding && styles.noHeader,
          !hasFooter && applyOuterPadding && styles.noFooter,
          // Full bleed overrides
          isFullBleed && styles.fullBleed,
          hasDivider && dividerStyle,
          shouldCollapseSpacing && collapseStyle
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

XDSLayoutPanel.displayName = 'XDSLayoutPanel';
