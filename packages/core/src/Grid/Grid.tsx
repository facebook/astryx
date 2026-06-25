// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Grid.tsx
 * @input Uses React, stylex, spacing tokens
 * @output Exports Grid component, GridProps, and GridColumns
 * @position Grid component; provides CSS Grid-based layout
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Grid/Grid.doc.mjs
 * - /packages/core/src/Grid/Grid.test.tsx
 * - /apps/storybook/stories/Grid.stories.tsx
 * - /packages/cli/templates/blocks/components/Grid/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import type {SpacingStep} from '../utils/types';
import type {SizeValue} from '../utils/types';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Grid alignment options for align-items and justify-items.
 */

export type GridAlignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * Column configuration for Grid.
 *
 * - `number` — fixed equal-width columns (e.g. `columns={3}`)
 * - `object` — responsive columns based on minimum child width:
 *   - `minWidth` — minimum width (px) for each column track
 *   - `repeat` — `'fill'` (default) preserves empty tracks for consistent widths;
 *     `'fit'` collapses empty tracks so items stretch to fill
 *   - `max` — caps the maximum number of columns by limiting track max size.
 *     The grid stretches to 100% of its parent; `max` only limits how many
 *     columns appear.
 */
export type GridColumns =
  | number
  | {
      minWidth: number;
      max?: number;
      repeat?: 'fill' | 'fit';
    };

export interface GridProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Column configuration.
   * - `number` — fixed equal-width columns
   * - `{minWidth, max?, repeat?}` — responsive columns
   *
   * @see GridColumns
   */
  columns?: GridColumns;

  /**
   * Minimum width of each grid item in pixels.
   * Enables responsive auto-fit behavior.
   *
   * @deprecated Use `columns={{minWidth: 280}}` instead.
   * @default 0 (disabled)
   */
  minChildWidth?: number;

  /**
   * Width of the grid container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  width?: SizeValue;

  /**
   * Height of the grid container.
   * Numbers are treated as pixels, strings are used as-is (e.g., '100%').
   */
  height?: SizeValue;

  /**
   * Spacing between all grid items (both row and column).
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  gap?: SpacingStep;

  /**
   * Spacing between rows. Overrides gap for rows.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  rowGap?: SpacingStep;

  /**
   * Spacing between columns. Overrides gap for columns.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   */
  columnGap?: SpacingStep;

  /**
   * Height of each implicit row track in pixels.
   * Sets `grid-auto-rows` — use with `GridSpan rows={N}` to create
   * masonry-style layouts where items span varying numbers of rows.
   *
   * @example
   * ```
   * <Grid columns={3} rowHeight={80} gap={3}>
   *   <GridSpan rows={4}>Tall</GridSpan>
   *   <GridSpan rows={2}>Short</GridSpan>
   * </Grid>
   * ```
   */
  rowHeight?: number;

  /**
   * Vertical alignment of grid items (align-items).
   * @default 'stretch'
   */
  align?: GridAlignment;

  /**
   * Horizontal alignment of grid items (justify-items).
   * @default 'stretch'
   */
  justify?: GridAlignment;

  /**
   * Content to render inside the grid.
   */
  children?: ReactNode;
}

const baseStyles = stylex.create({
  grid: {
    display: 'grid',
  },
});

const alignStyles = stylex.create({
  start: {
    alignItems: 'start',
  },
  center: {
    alignItems: 'center',
  },
  end: {
    alignItems: 'end',
  },
  stretch: {
    alignItems: 'stretch',
  },
});

const justifyStyles = stylex.create({
  start: {
    justifyItems: 'start',
  },
  center: {
    justifyItems: 'center',
  },
  end: {
    justifyItems: 'end',
  },
  stretch: {
    justifyItems: 'stretch',
  },
});

const gapStyles = stylex.create({
  0: {
    gap: spacingVars['--spacing-0'],
  },
  0.5: {
    gap: spacingVars['--spacing-0-5'],
  },
  1: {
    gap: spacingVars['--spacing-1'],
  },
  1.5: {
    gap: spacingVars['--spacing-1-5'],
  },
  2: {
    gap: spacingVars['--spacing-2'],
  },
  3: {
    gap: spacingVars['--spacing-3'],
  },
  4: {
    gap: spacingVars['--spacing-4'],
  },
  5: {
    gap: spacingVars['--spacing-5'],
  },
  6: {
    gap: spacingVars['--spacing-6'],
  },
  8: {
    gap: spacingVars['--spacing-8'],
  },
  10: {
    gap: spacingVars['--spacing-10'],
  },
});

const rowGapStyles = stylex.create({
  0: {
    rowGap: spacingVars['--spacing-0'],
  },
  0.5: {
    rowGap: spacingVars['--spacing-0-5'],
  },
  1: {
    rowGap: spacingVars['--spacing-1'],
  },
  1.5: {
    rowGap: spacingVars['--spacing-1-5'],
  },
  2: {
    rowGap: spacingVars['--spacing-2'],
  },
  3: {
    rowGap: spacingVars['--spacing-3'],
  },
  4: {
    rowGap: spacingVars['--spacing-4'],
  },
  5: {
    rowGap: spacingVars['--spacing-5'],
  },
  6: {
    rowGap: spacingVars['--spacing-6'],
  },
  8: {
    rowGap: spacingVars['--spacing-8'],
  },
  10: {
    rowGap: spacingVars['--spacing-10'],
  },
});

const columnGapStyles = stylex.create({
  0: {
    columnGap: spacingVars['--spacing-0'],
  },
  0.5: {
    columnGap: spacingVars['--spacing-0-5'],
  },
  1: {
    columnGap: spacingVars['--spacing-1'],
  },
  1.5: {
    columnGap: spacingVars['--spacing-1-5'],
  },
  2: {
    columnGap: spacingVars['--spacing-2'],
  },
  3: {
    columnGap: spacingVars['--spacing-3'],
  },
  4: {
    columnGap: spacingVars['--spacing-4'],
  },
  5: {
    columnGap: spacingVars['--spacing-5'],
  },
  6: {
    columnGap: spacingVars['--spacing-6'],
  },
  8: {
    columnGap: spacingVars['--spacing-8'],
  },
  10: {
    columnGap: spacingVars['--spacing-10'],
  },
});

/**
 * Spacing token CSS var names for gap calculation in track-max expressions.
 */
const spacingVarNames: Record<SpacingStep, string> = {
  0: '--spacing-0',
  0.5: '--spacing-0-5',
  1: '--spacing-1',
  1.5: '--spacing-1-5',
  2: '--spacing-2',
  3: '--spacing-3',
  4: '--spacing-4',
  5: '--spacing-5',
  6: '--spacing-6',
  8: '--spacing-8',
  10: '--spacing-10',
};

/**
 * Build a grid-template-columns value that caps columns at `max` by
 * limiting each track's max size to `(100% - (max-1) * gap) / max`.
 * The grid stays 100% width; the track-max prevents more than `max` columns.
 */
function buildCappedTemplate(
  minWidth: number,
  maxCols: number,
  repeatMode: 'auto-fill' | 'auto-fit',
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
): string {
  const gapVar =
    columnGap != null
      ? spacingVarNames[columnGap]
      : gap != null
        ? spacingVarNames[gap]
        : null;

  // trackMax = (100% - (maxCols - 1) * gap) / maxCols
  const trackMax = gapVar
    ? `calc((100% - ${maxCols - 1} * var(${gapVar})) / ${maxCols})`
    : `calc(100% / ${maxCols})`;

  return `repeat(${repeatMode}, minmax(${minWidth}px, ${trackMax}))`;
}

/**
 * Grid component for CSS Grid-based layouts.
 *
 * Supports fixed-column and responsive layouts via the `columns` prop:
 * - `columns={3}` — fixed 3-column grid
 * - `columns={{minWidth: 280}}` — responsive auto-fill (consistent widths)
 * - `columns={{minWidth: 280, repeat: 'fit'}}` — responsive auto-fit (stretch)
 * - `columns={{minWidth: 280, max: 4}}` — responsive, capped at 4 columns
 *
 * @example
 * ```
 * <Grid columns={3} gap={4}>
 *   <Item />
 *   <Item />
 *   <Item />
 * </Grid>
 * ```
 */
export function Grid({
  columns,
  minChildWidth = 0,
  rowHeight,
  width,
  height,
  gap,
  rowGap,
  columnGap,
  align,
  justify,
  xstyle,
  className,
  style,
  children,
  ref,
  ...props
}: GridProps) {
  // Determine grid-template-columns value
  let gridTemplateColumns: string;

  if (typeof columns === 'object' && columns != null) {
    // Responsive API: columns={{minWidth, max?, repeat?}}
    const repeatMode = columns.repeat === 'fit' ? 'auto-fit' : 'auto-fill';

    if (columns.max != null && columns.max > 0) {
      // Cap column count by limiting each track's max size
      gridTemplateColumns = buildCappedTemplate(
        columns.minWidth,
        columns.max,
        repeatMode,
        gap,
        columnGap,
      );
    } else {
      gridTemplateColumns = `repeat(${repeatMode}, minmax(${columns.minWidth}px, 1fr))`;
    }
  } else if (minChildWidth > 0) {
    // Deprecated path: minChildWidth uses auto-fit for backward compat
    const numColumns = typeof columns === 'number' ? columns : 0;
    if (numColumns > 0) {
      gridTemplateColumns = buildCappedTemplate(
        minChildWidth,
        numColumns,
        'auto-fit',
        gap,
        columnGap,
      );
    } else {
      gridTemplateColumns = `repeat(auto-fit, minmax(${minChildWidth}px, 1fr))`;
    }
  } else if (typeof columns === 'number' && columns > 0) {
    // Fixed columns mode
    gridTemplateColumns = `repeat(${columns}, 1fr)`;
  } else {
    // Default to 1 column if nothing specified
    gridTemplateColumns = '1fr';
  }

  // Build inline style for dynamic values
  const inlineStyle: React.CSSProperties = {
    gridTemplateColumns,
    ...(rowHeight != null && {gridAutoRows: `${rowHeight}px`}),
    ...(width != null && {
      width: typeof width === 'number' ? `${width}px` : width,
    }),
    ...(height != null && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  };

  // For themeProps, extract numeric columns value for variant tracking
  const columnsVariant =
    typeof columns === 'number'
      ? columns
      : typeof columns === 'object'
        ? undefined
        : undefined;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('grid', {columns: columnsVariant, gap, align, justify}),
        stylex.props(
          baseStyles.grid,
          gap != null && gapStyles[gap],
          rowGap != null && rowGapStyles[rowGap],
          columnGap != null && columnGapStyles[columnGap],
          align != null && alignStyles[align],
          justify != null && justifyStyles[justify],
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

Grid.displayName = 'Grid';
