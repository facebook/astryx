'use client';

/**
 * @file XDSLayoutContent.tsx
 * @input Uses React StyleX, XDSLayoutSlotsContext
 * @output Exports XDSLayoutContent component and XDSLayoutContentProps
 * @position Scrollable main content area for XDSLayout. Wraps the primary body content
 *   with automatic scroll containment and context-aware padding.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 */


import type {AriaRole, ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useContext} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {XDSLayoutSlotsContext} from './XDSLayoutSlotsContext';
import {xdsClassName, mergeProps} from '../utils';
import type {SpacingStep} from '../utils/types';
import {paddingStyles, containerPaddingInlineVarStyles} from './padding.stylex';

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

export interface XDSLayoutContentProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLElement>;
  /**
   * Content to render inside the content area.
   */
  children?: ReactNode;

  /**
   * Internal padding of the content area using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * Overrides the default padding from the layout container.
   */
  padding?: SpacingStep;

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
 * Already provides its own padding and scroll — don't add padding or
 * overflow to children. Use `padding={0}` if you need edge-to-edge content.
 *
 * @example
 * ```
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     header={<XDSLayoutHeader>Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>Main body content</XDSLayoutContent>}
 *   />
 * </XDSLayoutContainer>
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     content={
 *       <XDSLayoutContent padding={0}>
 *         <Table />
 *       </XDSLayoutContent>
 *     }
 *   />
 * </XDSLayoutContainer>
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
export function XDSLayoutContent({
  children,
  isScrollable = true,
  padding,
  label,
  role,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSLayoutContentProps) {
  const {hasHeader, hasFooter, hasStart, hasEnd} = useContext(
    XDSLayoutSlotsContext,
  );

  const isZeroPadding = padding === 0;

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role={role}
      aria-label={label}
      {...mergeProps(
        xdsClassName('layout-content'),
        stylex.props(
          styles.content,
          // Outer padding on container edges (unless content is full bleed)
          !hasStart && !isZeroPadding && padding == null && styles.noStart,
          !hasEnd && !isZeroPadding && padding == null && styles.noEnd,
          !hasHeader && !isZeroPadding && padding == null && styles.noHeader,
          !hasFooter && !isZeroPadding && padding == null && styles.noFooter,
          isScrollable && styles.scrollable,
          isZeroPadding && styles.fullBleed,
          padding != null && paddingStyles[padding],
          padding != null && containerPaddingInlineVarStyles[padding],
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

XDSLayoutContent.displayName = 'XDSLayoutContent';
