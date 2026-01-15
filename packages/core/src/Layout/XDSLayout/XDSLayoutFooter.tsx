/**
 * @file XDSLayoutFooter.tsx
 * @input Uses React forwardRef, StyleX, XDSLayoutSlotsContext
 * @output Exports XDSLayoutFooter component and XDSLayoutFooterProps
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
import { XDSLayoutSlotsContext } from './XDSLayoutSlotsContext';

const styles = stylex.create({
  footer: {
    boxSizing: 'border-box',
    flexShrink: 0,
    // Default: outer padding on edges that touch container, inner on interior edges
    paddingInline: `var(--layout-padding-outer-x, ${spacingTokens.space4})`,
    paddingBlockStart: `var(--layout-padding-inner-y, ${spacingTokens.space4})`,
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingTokens.space4})`,
  },
  // When layout is full bleed, use inner padding instead of outer
  layoutFullBleed: {
    paddingInline: `var(--layout-padding-inner-x, ${spacingTokens.space4})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingTokens.space4})`,
  },
  fullBleed: {
    paddingInline: 0,
    paddingBlock: 0,
  },
  divider: {
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorTokens.divider,
  },
  // When no divider, collapse spacing to avoid double-padding with content
  collapseTop: {
    marginBlockStart: `calc(-1 * var(--layout-padding-inner-y, ${spacingTokens.space4}))`,
  },
});

export interface XDSLayoutFooterProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  /**
   * Content to render inside the footer.
   */
  children?: ReactNode;

  /**
   * Adds a themed border at the top edge.
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
   * Use 'contentinfo' only for site-wide footers (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Footer content area for XDSLayout.
 * Renders in the footer slot with optional divider and padding control.
 *
 * @example
 * ```tsx
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     content={<XDSLayoutContent>...</XDSLayoutContent>}
 *     footer={<XDSLayoutFooter hasDivider>Actions</XDSLayoutFooter>}
 *   />
 * </XDSLayoutContainer>
 * ```
 */
export const XDSLayoutFooter = forwardRef<HTMLElement, XDSLayoutFooterProps>(
  function XDSLayoutFooter(
    { children, hasDivider = false, isFullBleed = false, label, role, ...props },
    ref
  ) {
    const { isFullBleed: isLayoutFullBleed } = useContext(XDSLayoutSlotsContext);

    // When no divider, collapse spacing for seamless visual flow
    const shouldCollapseSpacing = !hasDivider && !isFullBleed;

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={role}
        aria-label={label}
        {...stylex.props(
          styles.footer,
          isLayoutFullBleed && styles.layoutFullBleed,
          isFullBleed && styles.fullBleed,
          hasDivider && styles.divider,
          shouldCollapseSpacing && styles.collapseTop
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

XDSLayoutFooter.displayName = 'XDSLayoutFooter';
