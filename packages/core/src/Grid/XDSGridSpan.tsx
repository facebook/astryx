/**
 * @file XDSGridSpan.tsx
 * @input Uses React, stylex
 * @output Exports XDSGridSpan component and XDSGridSpanProps
 * @position Grid span component; controls grid item span
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Grid/Grid.doc.mjs
 * - /packages/core/src/Grid/XDSGrid.test.tsx
 * - /apps/storybook/stories/Grid.stories.tsx
 */

import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSGridSpanProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
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
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;

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
 * <XDSGrid columns={3} gap={4}>
 *   <XDSGridSpan columns={2}>Wide item</XDSGridSpan>
 *   <div>Normal</div>
 * </XDSGrid>
 * ```
 */
export function XDSGridSpan({
  columns,
  rows,
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: XDSGridSpanProps) {
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
        className,
        {...style, ...inlineStyle},
      )}
      {...props}>
      {children}
    </div>
  );
}

XDSGridSpan.displayName = 'XDSGridSpan';
