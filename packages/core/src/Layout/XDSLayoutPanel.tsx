'use client';

/**
 * @file XDSLayoutPanel.tsx
 * @input Uses React StyleX, XDSLayoutAreaContext, XDSLayoutSlotsContext
 * @output Exports XDSLayoutPanel component and XDSLayoutPanelProps
 * @position Sidebar panel for XDSLayout start/end slots. Use for navigation panels,
 *   settings sidebars, detail panels, or any fixed-width side content.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 */


import type {AriaRole, ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useContext} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {XDSLayoutAreaContext} from './XDSLayoutAreaContext';
import {XDSLayoutSlotsContext} from './XDSLayoutSlotsContext';
import {xdsClassName, mergeProps} from '../utils';
import type {SpacingStep} from '../utils/types';
import {paddingStyles, containerPaddingInlineVarStyles} from './padding.stylex';

const styles = stylex.create({
  panel: {
    boxSizing: 'border-box',
    flexShrink: 0,
    overflow: 'clip',
    // Default: inner padding on all sides (will be overridden by position-specific styles)
    paddingInlineStart: `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    paddingInlineEnd: `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    paddingBlockStart: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
  },
  // Start panel: outer-x on left edge
  startPanel: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
  },
  // End panel: outer-x on right edge
  endPanel: {
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
  },
  // When no header: outer-y on top
  noHeader: {
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
  },
  // When no footer: outer-y on bottom
  noFooter: {
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
  },
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
  scrollable: {
    overflow: 'auto',
  },
  // For start panel: divider on end edge
  dividerEnd: {
    borderInlineEndWidth: 1,
    borderInlineEndStyle: 'solid',
    borderInlineEndColor: colorVars['--color-border'],
  },
  // For end panel: divider on start edge
  dividerStart: {
    borderInlineStartWidth: 1,
    borderInlineStartStyle: 'solid',
    borderInlineStartColor: colorVars['--color-border'],
  },
  // When no divider, collapse spacing on the side facing content
  // Start panel: collapse end (right in LTR) to merge with content
  // End panel: collapse start (left in LTR) to merge with content
  collapseStart: {
    marginInlineStart: `calc(-1 * var(--layout-padding-inner-x, ${spacingVars['--spacing-4']}))`,
  },
  collapseEnd: {
    marginInlineEnd: `calc(-1 * var(--layout-padding-inner-x, ${spacingVars['--spacing-4']}))`,
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (width: number | string | null) => ({
    width,
  }),
});

export interface XDSLayoutPanelProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLElement>;
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
   * Internal padding of the panel using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * Overrides the default padding from the layout container.
   */
  padding?: SpacingStep;

  /**
   * Enables scrollable overflow for the panel.
   * Set to false for auto-height layouts where sticky positioning
   * needs to work with parent containers.
   * @default true
   */
  isScrollable?: boolean;

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

  /**
   * Width of the panel.
   * Numbers are treated as pixels, strings are used as-is.
   */
  width?: number | string;
}

/**
 * Sidebar or side panel for XDSLayout. Use in the `start` slot for left navigation
 * or in the `end` slot for detail/inspector panels.
 * Renders with optional divider and context-aware padding.
 * Divider position is auto-detected based on which slot the panel is in.
 *
 * Already provides its own padding and scroll — don't add padding or
 * overflow to children. Use `padding={0}` if you need edge-to-edge content.
 *
 * @example
 * ```
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
export function XDSLayoutPanel({
  children,
  hasDivider = false,
  isScrollable = true,
  label,
  padding,
  role,
  width,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSLayoutPanelProps) {
  const area = useContext(XDSLayoutAreaContext);
  const {hasHeader, hasFooter} = useContext(XDSLayoutSlotsContext);

  // Determine panel position
  const isStartPanel = area === 'start';
  const isEndPanel = area === 'end';

  const isZeroPadding = padding === 0;

  // When no divider, collapse spacing for seamless visual flow
  const shouldCollapseSpacing =
    !hasDivider && !isZeroPadding && padding == null;

  // Select divider style based on position
  const dividerStyle = isStartPanel
    ? styles.dividerEnd
    : isEndPanel
      ? styles.dividerStart
      : null;

  // Select collapse style based on position (collapse the side where divider would be)
  const collapseStyle = isStartPanel
    ? styles.collapseEnd
    : isEndPanel
      ? styles.collapseStart
      : null;

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role={role}
      aria-label={label}
      {...mergeProps(
        xdsClassName('layout-panel'),
        stylex.props(
          styles.panel,
          dynamicStyles.sizing(width ?? null),
          // Outer padding on container edges (unless component is full bleed)
          isStartPanel &&
            !isZeroPadding &&
            padding == null &&
            styles.startPanel,
          isEndPanel && !isZeroPadding && padding == null && styles.endPanel,
          !hasHeader && !isZeroPadding && padding == null && styles.noHeader,
          !hasFooter && !isZeroPadding && padding == null && styles.noFooter,
          isScrollable && styles.scrollable,
          isZeroPadding && styles.fullBleed,
          padding != null && paddingStyles[padding],
          padding != null && containerPaddingInlineVarStyles[padding],
          hasDivider && dividerStyle,
          shouldCollapseSpacing && collapseStyle,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

XDSLayoutPanel.displayName = 'XDSLayoutPanel';
