/**
 * @file XDSGridSpan.tsx
 * @input Uses React forwardRef, stylex
 * @output Exports XDSGridSpan component and XDSGridSpanProps
 * @position Grid span component; controls grid item span
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Grid/Grid.doc.mjs
 * - /packages/core/src/Grid/XDSGrid.test.tsx
 * - /apps/storybook/stories/Grid.stories.tsx
 */

import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSGridSpanProps extends Omit<
  HTMLAttributes<HTMLElement>,
  'style' | 'className'
> {
  /**
   * Number of columns to span, or 'full' to span all columns.
   * - Number: `grid-column: span N`
   * - 'full': `grid-column: 1 / -1` (spans entire row)
   */
  columns?: number | 'full';

  /**
   * Number of rows to span.
   * Sets `grid-row: span N`.
   */
  rows?: number;

  /**
   * StyleX styles to apply to the grid span element.
   */
  xstyle?: StyleXStyles;

  /**
   * Content to render inside the grid span.
   */
  children?: ReactNode;
}

const baseStyles = stylex.create({
  span: {
    // Base styles for grid item
    minWidth: 0, // Prevent overflow in grid
    // Make span fill grid cell and stretch children
    display: 'grid',
    height: '100%',
  },
});

/**
 * Grid span component for controlling how many columns/rows a grid item spans.
 *
 * Use as a direct child of XDSGrid to make an item span multiple columns
 * or rows.
 *
 * @example
 * ```
 * <XDSGrid columns={3} gap="space4">
 *   <XDSGridSpan columns={2}>Wide item</XDSGridSpan>
 *   <div>Normal</div>
 * </XDSGrid>
 * ```
 */
export const XDSGridSpan = forwardRef<HTMLElement, XDSGridSpanProps>(
  function XDSGridSpan({columns, rows, xstyle, children, ...props}, ref) {
    // Build inline style for grid spanning
    const inlineStyle: React.CSSProperties = {
      ...(columns != null && {
        gridColumn: columns === 'full' ? '1 / -1' : `span ${columns}`,
      }),
      ...(rows != null && {
        gridRow: `span ${rows}`,
      }),
    };

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        {...mergeProps(
          xdsClassName('grid-span'),
          stylex.props(baseStyles.span, xstyle),
        )}
        style={inlineStyle}
        {...props}>
        {children}
      </div>
    );
  },
);

XDSGridSpan.displayName = 'XDSGridSpan';
