'use client';

/**
 * @file XDSGrid.tsx
 * @input Uses React, stylex, spacing tokens
 * @output Exports XDSGrid component and XDSGridProps
 * @position Grid component; provides CSS Grid-based layout
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
import {spacingVars} from '../theme/tokens.stylex';
import type {SpacingStep} from '../utils/types';
import type {SizeValue} from '../utils/types';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Grid alignment options for align-items and justify-items.
 */

export type GridAlignment = 'start' | 'center' | 'end' | 'stretch';

export interface XDSGridProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLElement>;
  /**
   * Maximum number of columns.
   * - When only columns is set: creates fixed equal-width columns
   * - When both columns and minChildWidth are set: caps the max columns
   * - When neither is set with minChildWidth: unlimited columns
   */
  columns?: number;

  /**
   * Minimum width of each grid item in pixels.
   * Enables auto-fit responsive behavior where columns automatically
   * adjust based on available width.
   * @default 0 (disabled - uses fixed columns)
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

// Spacing token values in pixels for max-width calculation
const spacingPixels: Record<SpacingStep, number> = {
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
};

/**
 * Calculate max-width when capping columns with minChildWidth.
 * maxWidth = columns * minChildWidth + (columns - 1) * gapPx
 */
function calculateMaxWidth(
  columns: number,
  minChildWidth: number,
  gap: SpacingStep | undefined,
  columnGap: SpacingStep | undefined,
): number {
  const gapPx =
    columnGap != null
      ? spacingPixels[columnGap]
      : gap != null
        ? spacingPixels[gap]
        : 0;
  return columns * minChildWidth + (columns - 1) * gapPx;
}

/**
 * Grid component for CSS Grid-based layouts.
 *
 * Supports both fixed-column and responsive auto-fit layouts.
 * The `columns` and `minChildWidth` props work together:
 * - columns only: Fixed equal-width columns
 * - minChildWidth only: Auto-fit responsive, unlimited columns
 * - Both: Auto-fit responsive, capped at max columns
 *
 * @example
 * ```
 * <XDSGrid columns={3} gap={4}>
 *   <Item />
 *   <Item />
 *   <Item />
 * </XDSGrid>
 * ```
 */
export function XDSGrid({
  columns,
  minChildWidth = 0,
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
}: XDSGridProps) {
  // Determine grid-template-columns value
  let gridTemplateColumns: string;
  let calculatedMaxWidth: number | undefined;

  if (minChildWidth > 0) {
    // Auto-fit mode: responsive columns
    gridTemplateColumns = `repeat(auto-fit, minmax(${minChildWidth}px, 1fr))`;

    // If columns is also set, cap the max columns via max-width
    if (columns != null && columns > 0) {
      calculatedMaxWidth = calculateMaxWidth(
        columns,
        minChildWidth,
        gap,
        columnGap,
      );
    }
  } else if (columns != null && columns > 0) {
    // Fixed columns mode
    gridTemplateColumns = `repeat(${columns}, 1fr)`;
  } else {
    // Default to 1 column if nothing specified
    gridTemplateColumns = '1fr';
  }

  // Build inline style for dynamic values
  const inlineStyle: React.CSSProperties = {
    gridTemplateColumns,
    ...(calculatedMaxWidth != null && {maxWidth: `${calculatedMaxWidth}px`}),
    ...(width != null && {
      width: typeof width === 'number' ? `${width}px` : width,
    }),
    ...(height != null && {
      height: typeof height === 'number' ? `${height}px` : height,
    }),
  };

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      {...mergeProps(
        xdsClassName('grid', {columns, gap, align, justify}),
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

XDSGrid.displayName = 'XDSGrid';
