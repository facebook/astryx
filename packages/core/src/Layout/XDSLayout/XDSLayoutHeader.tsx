/**
 * @file XDSLayoutHeader.tsx
 * @input Uses React forwardRef, StyleX
 * @output Exports XDSLayoutHeader component and XDSLayoutHeaderProps
 * @position Layout content area component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import type {AriaRole, HTMLAttributes, ReactNode} from 'react';
import {forwardRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {color, spacing} from '../../theme/tokens.stylex';

const styles = stylex.create({
  header: {
    boxSizing: 'border-box',
    flexShrink: 0,
    // Default: outer padding on edges that touch container, inner on interior edges
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacing.space4})`,
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacing.space4})`,
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacing.space4})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacing.space4})`,
  },
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
  divider: {
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: color.divider,
  },
  // When no divider, collapse spacing to avoid double-padding with content
  collapseBottom: {
    marginBlockEnd: `calc(-1 * var(--layout-padding-inner-y, ${spacing.space4}))`,
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (height: number | string | null) => ({
    height,
  }),
});

export interface XDSLayoutHeaderProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
  /**
   * Content to render inside the header.
   */
  children?: ReactNode;

  /**
   * Adds a themed border at the bottom edge.
   * When false, spacing collapse is applied automatically for seamless visual flow.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Height of the header.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: number | string;

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
   * Use 'banner' only for site-wide headers (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Header content area for XDSLayout.
 * Renders in the header slot with optional divider and padding control.
 *
 * @example
 * ```tsx
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     header={<XDSLayoutHeader hasDivider>Page Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>...</XDSLayoutContent>}
 *   />
 * </XDSLayoutContainer>
 * ```
 */
export const XDSLayoutHeader = forwardRef<HTMLElement, XDSLayoutHeaderProps>(
  function XDSLayoutHeader(
    {
      children,
      hasDivider = false,
      height,
      isFullBleed = false,
      label,
      role,
      ...props
    },
    ref,
  ) {
    // When no divider, collapse spacing for seamless visual flow
    const shouldCollapseSpacing = !hasDivider && !isFullBleed;

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={role}
        aria-label={label}
        {...stylex.props(
          styles.header,
          dynamicStyles.sizing(height ?? null),
          isFullBleed && styles.fullBleed,
          hasDivider && styles.divider,
          shouldCollapseSpacing && styles.collapseBottom,
        )}
        {...props}>
        {children}
      </div>
    );
  },
);

XDSLayoutHeader.displayName = 'XDSLayoutHeader';
