// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file LayoutContent.tsx
 * @input Uses React StyleX, LayoutSlotsContext
 * @output Exports LayoutContent component and LayoutContentProps
 * @position Scrollable main content area for Layout. Wraps the primary body content
 *   with automatic scroll containment and context-aware padding.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Layout/ (showcase blocks)
 */

import type {AriaRole, ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {use} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {LayoutSlotsContext} from './LayoutSlotsContext';
import {mergeProps} from '../utils';
import type {SpacingStep} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {
  paddingStyles,
  containerPaddingInlineVarStyles,
  containerPaddingBlockStartVarStyles,
  containerPaddingBlockEndVarStyles,
} from './padding.stylex';

const styles = stylex.create({
  content: {
    boxSizing: 'border-box',
    flex: 1,
    // Default: inner padding on all sides (will be overridden by position-specific styles)
    paddingInlineStart: `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    paddingInlineEnd: `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    paddingBlockStart: {
      default: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
      // When header has no divider, collapse top padding for seamless visual flow
      [stylex.when.ancestor(
        ':has(> [data-layout-header-lane] > .astryx-layout-header:not([data-divider]))',
      )]: 0,
    },
    paddingBlockEnd: {
      default: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
      // When footer has no divider, collapse bottom padding for seamless visual flow
      [stylex.when.ancestor(
        ':has(> [data-layout-footer-lane] > .astryx-layout-footer:not([data-divider]))',
      )]: 0,
    },
    // Publish container padding vars for bleed children (Table, Divider, etc.)
    '--container-padding-inline-start': `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    '--container-padding-inline-end': `var(--layout-padding-inner-x, ${spacingVars['--spacing-4']})`,
    '--container-padding-block-start': `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
    '--container-padding-block-end': `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
  },
  // When no start panel: outer-x on left edge
  noStart: {
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    '--container-padding-inline-start': `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    '--container-padding-inline-end': `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
  },
  // When no end panel: outer-x on right edge
  noEnd: {
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
  },
  // When no header: outer-y on top
  noHeader: {
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
    '--container-padding-block-start': `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
  },
  // When no footer: outer-y on bottom
  noFooter: {
    paddingBlockEnd: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
    '--container-padding-block-end': `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
  },
  heightFill: {
    height: '100%',
    minHeight: 0,
  },
  heightAuto: {
    alignSelf: 'flex-start',
    height: 'auto',
    minHeight: 0,
  },
  overflowStatic: {
    overflow: 'clip',
  },
  overflowScrollable: {
    overflow: 'auto',
  },
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
    '--container-padding-inline-start': '0px',
    '--container-padding-inline-end': '0px',
    '--container-padding-block-start': '0px',
    '--container-padding-block-end': '0px',
  },
});

export type LayoutRegionHeight = 'fill' | 'auto';

export interface LayoutContentProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
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
   * Controls this region's block-axis sizing.
   * - `fill`: fills the Layout middle region (default).
   * - `auto`: uses its natural height and moves with the fill-height Layout's
   *   middle scrollport.
   * @default 'fill'
   */
  height?: LayoutRegionHeight;

  /**
   * Enables scrollable overflow for the content area.
   * Set to false for non-scrolling overflow behavior, including sticky
   * descendants that need the parent scroll container.
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
 * Scrollable main content area for Layout. Wraps the primary body content
 * with automatic scroll containment and context-aware padding.
 *
 * Provides context-aware padding and controls height and overflow independently.
 * `height="auto"` moves the region with a fill-height Layout's middle scrollport.
 * Don't add padding or overflow to children. Use `padding={0}` if you need
 * edge-to-edge content.
 *
 * @example
 * ```
 * <LayoutContainer variant="card">
 *   <Layout
 *     header={<LayoutHeader>Title</LayoutHeader>}
 *     content={<LayoutContent>Main body content</LayoutContent>}
 *   />
 * </LayoutContainer>
 * <LayoutContainer variant="card">
 *   <Layout
 *     content={
 *       <LayoutContent padding={0}>
 *         <Table />
 *       </LayoutContent>
 *     }
 *   />
 * </LayoutContainer>
 * <LayoutContainer variant="card">
 *   <Layout
 *     content={
 *       <LayoutContent isScrollable={false}>
 *         <StickyElement />
 *       </LayoutContent>
 *     }
 *   />
 * </LayoutContainer>
 * ```
 */
export function LayoutContent({
  children,
  height = 'fill',
  isScrollable = true,
  padding,
  label,
  role,
  xstyle,
  className,
  style,
  ref,
  ...props
}: LayoutContentProps) {
  const {hasHeader, hasFooter, hasStart, hasEnd} = use(LayoutSlotsContext);

  const isZeroPadding = padding === 0;

  return (
    <div
      ref={ref}
      role={role}
      aria-label={label}
      {...mergeProps(
        themeProps('layout-content', {height}),
        stylex.props(
          styles.content,
          height === 'fill' ? styles.heightFill : styles.heightAuto,
          isScrollable ? styles.overflowScrollable : styles.overflowStatic,
          // Outer padding on container edges (unless content is full bleed)
          !hasStart && !isZeroPadding && padding == null && styles.noStart,
          !hasEnd && !isZeroPadding && padding == null && styles.noEnd,
          !hasHeader && !isZeroPadding && padding == null && styles.noHeader,
          !hasFooter && !isZeroPadding && padding == null && styles.noFooter,
          isZeroPadding && styles.fullBleed,
          padding != null && paddingStyles[padding],
          padding != null && containerPaddingInlineVarStyles[padding],
          padding != null && containerPaddingBlockStartVarStyles[padding],
          padding != null && containerPaddingBlockEndVarStyles[padding],
          xstyle,
        ),
        className,
        style,
      )}
      {...props}
      data-layout-region="content"
      data-layout-height={height}>
      {children}
    </div>
  );
}

LayoutContent.displayName = 'LayoutContent';
