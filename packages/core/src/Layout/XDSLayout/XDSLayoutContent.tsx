/**
 * @file XDSLayoutContent.tsx
 * @input Uses React forwardRef, StyleX, XDSLayoutSlotsContext
 * @output Exports XDSLayoutContent component and XDSLayoutContentProps
 * @position Scrollable main content area for XDSLayout. Wraps the primary body content
 *   with automatic scroll containment and context-aware padding.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/XDSLayout/README.md
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import type {AriaRole, HTMLAttributes, ReactNode} from 'react';
import {forwardRef, useContext} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../../theme/tokens.stylex';
import {XDSLayoutSlotsContext} from './XDSLayoutSlotsContext';

const styles = stylex.create({
  content: {
    boxSizing: 'border-box',
    height: '100%',
    flex: 1,
    minHeight: 0,
    overflow: 'clip',
    // Default: inner padding on all sides (will be overridden by position-specific styles)
    paddingInlineStart: `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    paddingInlineEnd: `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    paddingBlockStart: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
  },
  // When no start panel: outer-x on left edge
  noStart: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
  },
  // When no end panel: outer-x on right edge
  noEnd: {
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
  scrollable: {
    overflow: 'auto',
  },
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
});

export interface XDSLayoutContentProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
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
 * Scrollable main content area for XDSLayout. Wraps the primary body content
 * with automatic scroll containment and context-aware padding.
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
    {children, isFullBleed = false, isScrollable = true, label, role, ...props},
    ref,
  ) {
    const {hasHeader, hasFooter, hasStart, hasEnd} = useContext(
      XDSLayoutSlotsContext,
    );

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        role={role}
        aria-label={label}
        {...stylex.props(
          styles.content,
          // Outer padding on container edges (unless content is full bleed)
          !hasStart && !isFullBleed && styles.noStart,
          !hasEnd && !isFullBleed && styles.noEnd,
          !hasHeader && !isFullBleed && styles.noHeader,
          !hasFooter && !isFullBleed && styles.noFooter,
          isScrollable && styles.scrollable,
          isFullBleed && styles.fullBleed,
        )}
        {...props}>
        {children}
      </div>
    );
  },
);

XDSLayoutContent.displayName = 'XDSLayoutContent';
