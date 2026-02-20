/**
 * @file XDSLayoutHeader.tsx
 * @input Uses React forwardRef, StyleX
 * @output Exports XDSLayoutHeader component and XDSLayoutHeaderProps
 * @position Top bar / header area for XDSLayout. Use for page titles, app bars,
 *   toolbar areas, or any fixed-height content at the top of a layout.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import type {AriaRole, HTMLAttributes, ReactNode} from 'react';
import {forwardRef} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars} from '../../theme/tokens.stylex';

const styles = stylex.create({
  header: {
    boxSizing: 'border-box',
    flexShrink: 0,
    // Default: outer padding on edges that touch container, inner on interior edges
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
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
    borderBlockEndColor: colorVars['--color-divider'],
  },
  // When no divider, collapse spacing to avoid double-padding with content
  collapseBottom: {
    marginBlockEnd: `calc(-1 * var(--layout-padding-inner-y, ${spacingVars['--spacing-4']}))`,
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
 * Top bar / header for XDSLayout. Use for page titles, app bars, or toolbars.
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
