/**
 * @file XDSLayoutFooter.tsx
 * @input Uses React forwardRef, StyleX
 * @output Exports XDSLayoutFooter component and XDSLayoutFooterProps
 * @position Bottom bar / footer area for XDSLayout. Use for action bars,
 *   pagination, status bars, or any fixed-height content at the bottom of a layout.
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
  footer: {
    boxSizing: 'border-box',
    flexShrink: 0,
    // Default: outer padding on edges that touch container, inner on interior edges
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    paddingBlockStart: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
  },
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
  divider: {
    borderBlockStartWidth: 1,
    borderBlockStartStyle: 'solid',
    borderBlockStartColor: colorVars['--color-divider'],
  },
  // When no divider, collapse spacing to avoid double-padding with content
  collapseTop: {
    marginBlockStart: `calc(-1 * var(--layout-padding-inner-y, ${spacingVars['--spacing-4']}))`,
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (height: number | string | null) => ({
    height,
  }),
});

export interface XDSLayoutFooterProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
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
   * Height of the footer.
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
   * Use 'contentinfo' only for site-wide footers (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Bottom bar / footer for XDSLayout. Use for action bars, pagination, or status bars.
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
          styles.footer,
          dynamicStyles.sizing(height ?? null),
          isFullBleed && styles.fullBleed,
          hasDivider && styles.divider,
          shouldCollapseSpacing && styles.collapseTop,
        )}
        {...props}>
        {children}
      </div>
    );
  },
);

XDSLayoutFooter.displayName = 'XDSLayoutFooter';
