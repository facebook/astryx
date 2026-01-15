/**
 * @file XDSLayoutContent.tsx
 * @input Uses React forwardRef, StyleX, XDSLayoutSlotsContext
 * @output Exports XDSLayoutContent component and XDSLayoutContentProps
 * @position Layout content area component
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import type { AriaRole, HTMLAttributes, ReactNode } from 'react';
import { forwardRef, useContext } from 'react';
import * as stylex from '@stylexjs/stylex';
import { spacingTokens } from '../../theme/tokens.stylex';
import { XDSLayoutSlotsContext } from './XDSLayoutSlotsContext';

const styles = stylex.create({
  content: {
    boxSizing: 'border-box',
    flex: 1,
    minHeight: 0,
    // Default: inner padding on all sides (will be overridden by position-specific styles)
    paddingInline: `var(--layout-padding-inner-x, ${spacingTokens.space4})`,
    paddingBlock: `var(--layout-padding-inner-y, ${spacingTokens.space4})`,
  },
  // When no start panel: outer-x on left edge
  noStart: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingTokens.space4})`,
  },
  // When no end panel: outer-x on right edge
  noEnd: {
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
  scrollable: {
    overflow: 'auto',
  },
  fullBleed: {
    paddingInline: 0,
    paddingBlock: 0,
  },
});

export interface XDSLayoutContentProps extends Omit<HTMLAttributes<HTMLElement>, 'style' | 'className'> {
  /**
   * Content to render inside the content area.
   */
  children?: ReactNode;

  /**
   * Removes internal padding, allowing content to touch the edges.
   * Useful for edge-to-edge content like tables.
   * @default false
   */
  isFullBleed?: boolean;

  /**
   * Enables scrollable overflow for the content area.
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
   * Use 'main' only for the primary content area of the page (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Main content area for XDSLayout.
 * Renders in the content slot with optional scrollable overflow and padding control.
 *
 * @example
 * ```tsx
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     header={<XDSLayoutHeader>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Main body content</XDSLayoutContent>}
 *   />
 * </XDSLayoutContainer>
 *
 * // Full bleed for edge-to-edge content
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     content={
 *       <XDSLayoutContent isFullBleed>
 *         <Table />
 *       </XDSLayoutContent>
 *     }
 *   />
 * </XDSLayoutContainer>
 *
 * // Non-scrollable for auto-height layouts with sticky elements
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     content={
 *       <XDSLayoutContent isScrollable={false}>
 *         <StickyElement />
 *       </XDSLayoutContent>
 *     }
 *   />
 * </XDSLayoutContainer>
 * ```
 */
export const XDSLayoutContent = forwardRef<HTMLElement, XDSLayoutContentProps>(
  function XDSLayoutContent(
    { children, isFullBleed = false, isScrollable = true, label, role, ...props },
    ref
  ) {
    const { hasHeader, hasFooter, hasStart, hasEnd, isFullBleed: isLayoutFullBleed } = useContext(XDSLayoutSlotsContext);

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={role}
        aria-label={label}
        {...stylex.props(
          styles.content,
          // Outer padding on container edges (unless layout is full bleed)
          !hasStart && !isLayoutFullBleed && styles.noStart,
          !hasEnd && !isLayoutFullBleed && styles.noEnd,
          !hasHeader && !isLayoutFullBleed && styles.noHeader,
          !hasFooter && !isLayoutFullBleed && styles.noFooter,
          isScrollable && styles.scrollable,
          isFullBleed && styles.fullBleed
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

XDSLayoutContent.displayName = 'XDSLayoutContent';
