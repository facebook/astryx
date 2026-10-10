// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file GridSpan.tsx
 * @input Uses React, stylex
 * @output Exports GridSpan component and GridSpanProps
 * @position Grid span component; controls grid item span
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Grid/Grid.doc.mjs
 * - /packages/core/src/Grid/Grid.test.tsx
 * - /apps/storybook/stories/Grid.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Grid/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export interface GridSpanProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Number of columns to span, or 'full' to span all columns.
   * - Number: `grid-column: span N`. Inside a numeric `columns={N}` grid
   *   that has dropped to fewer columns than the span (a phone), the item
   *   spans the whole row instead, so it never adds tracks or pushes the
   *   grid wider than its container. Spans in fixed (`isFixed`) and
   *   `{minWidth}` grids are unchanged.
   * - 'full': `grid-column: 1 / -1` (spans entire row)
   */
  columns?: number | 'full';

  /**
   * Number of rows to span.
   * Sets `grid-row: span N`.
   */
  rows?: number;

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

// The span lives in a private per-element variable read by a class-level
// grid-column declaration, so the declaration can change inside a container
// query (an inline grid-column could not).
const SPAN = 'var(--_grid-span)';
// Set by the parent grid: `1 / -1` in a numeric "at most N" grid, invalid in
// every other grid, where the span stays exact.
const NARROW = 'var(--_grid-span-narrow, var(--_grid-span))';

const dynamicStyles = stylex.create({
  columnSpan: (value: string) => ({
    '--_grid-span': value,
  }),
});

/**
 * A span of N in a numeric grid that currently has fewer than N tracks would
 * add implicit tracks and push the grid wider than its container. A numeric
 * grid with a GridSpan child is an inline-size query container
 * (`astryx-grid`). Below the narrowest width at which it can hold N tracks,
 * N × 12rem (the numeric column floor) plus N − 1 gaps at the largest gap
 * step (2.5rem), the span becomes `1 / -1`: every track the grid has. In the
 * band where the grid already has exactly N tracks, that is the same
 * placement as `span N`. Container conditions are static, so there is one
 * rule per span from 2 to 12.
 */
const narrowStyles = stylex.create({
  1: {gridColumn: SPAN},
  2: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 26.5rem)': NARROW,
    },
  },
  3: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 41rem)': NARROW,
    },
  },
  4: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 55.5rem)': NARROW,
    },
  },
  5: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 70rem)': NARROW,
    },
  },
  6: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 84.5rem)': NARROW,
    },
  },
  7: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 99rem)': NARROW,
    },
  },
  8: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 113.5rem)': NARROW,
    },
  },
  9: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 128rem)': NARROW,
    },
  },
  10: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 142.5rem)': NARROW,
    },
  },
  11: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 157rem)': NARROW,
    },
  },
  12: {
    gridColumn: {
      default: SPAN,
      '@container astryx-grid (width < 171.5rem)': NARROW,
    },
  },
});

type NarrowSpan = keyof typeof narrowStyles;

function spanStyle(span: number) {
  const key = (
    Number.isInteger(span) && span >= 1 && span <= 12 ? span : 1
  ) as NarrowSpan;
  return narrowStyles[key];
}

/**
 * Grid span component for controlling how many columns/rows a grid item spans.
 *
 * Use as a direct child of Grid to make an item span multiple columns
 * or rows.
 *
 * @example
 * ```
 * <Grid columns={3} gap={4}>
 *   <GridSpan columns={2}>Wide item</GridSpan>
 *   <div>Normal</div>
 * </Grid>
 * ```
 */
export function GridSpan({
  columns,
  rows,
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: GridSpanProps) {
  const span = typeof columns === 'number' ? columns : null;

  // 'full' and rows keep their inline placement. A numeric span is a class
  // (see narrowStyles) so it can respond to the parent grid's width.
  const inlineStyle: React.CSSProperties = {
    ...(columns === 'full' && {gridColumn: '1 / -1'}),
    ...(rows != null && {
      gridRow: `span ${rows}`,
    }),
  };

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('grid-span'),
        stylex.props(
          baseStyles.span,
          span != null && dynamicStyles.columnSpan(`span ${span}`),
          span != null && spanStyle(span),
          xstyle,
        ),
        className,
        {...style, ...inlineStyle},
      )}
      {...props}>
      {children}
    </div>
  );
}

GridSpan.displayName = 'GridSpan';
