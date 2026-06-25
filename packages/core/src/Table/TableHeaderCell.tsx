// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableHeaderCell.tsx
 * @input React, StyleX, TableContext, theme tokens, useTableCellStyles
 * @output Exports TableHeaderCell component, TableHeaderCellProps
 * @position Sub-component; used inside Table for header cells
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/Table.doc.mjs
 * - /packages/core/src/Table/index.ts
 * - /packages/cli/templates/blocks/components/Table/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  fontWeightVars,
  typeScaleVars,
  borderVars,
} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {overflowStyles, containerEdgeStyles} from './table.stylex';
import {useTableContext, mergeXStyle} from './useTableCellStyles';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/** Props for TableHeaderCell — `<th>` wrapper with context-aware styling */
export interface TableHeaderCellProps extends BaseProps<HTMLTableCellElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLTableCellElement>;
  /** Specifies which cells this header relates to. */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  children?: ReactNode;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   */
  xstyle?: StyleXStyles | StyleXStyles[];
}

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontSize: typeScaleVars['--text-label-size'],
    boxSizing: 'border-box',
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: typeScaleVars['--text-label-size'],
    boxSizing: 'border-box',
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: typeScaleVars['--text-label-size'],
    boxSizing: 'border-box',
  },
});

const headerStyles = stylex.create({
  cell: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'start',
  },
});

const headerDividerStyles = stylex.create({
  cell: {
    borderBottomWidth: borderVars['--border-width'],
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
  },
});

const dividerColumnStyles = stylex.create({
  cell: {
    borderRightWidth: {
      default: borderVars['--border-width'],
      ':last-child': '0',
    },
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-border'],
  },
});

/**
 * TableHeaderCell — a `<th>` wrapper for header cells.
 *
 * When used inside `<Table>`, inherits styling from the table context
 * (density padding, header font weight/color, divider borders).
 * When used standalone, renders a plain `<th>`.
 *
 * Accepts `xstyle` for plugin-provided styles that merge on top.
 *
 * @example
 * ```
 * <thead>
 *   <tr>
 *     <TableHeaderCell>Name</TableHeaderCell>
 *     <TableHeaderCell>Age</TableHeaderCell>
 *   </tr>
 * </thead>
 * ```
 */
export function TableHeaderCell({
  children,
  xstyle,
  ref,
  className: incomingClassName,
  style: incomingStyle,
  ...props
}: TableHeaderCellProps) {
  const ctx = useTableContext();

  if (!ctx) {
    return (
      <th
        ref={ref}
        {...props}
        {...mergeProps(
          themeProps('table-header-cell'),
          stylex.props(xstyle),
          incomingClassName,
          incomingStyle,
        )}>
        {children}
      </th>
    );
  }

  // Header cells always get the bottom divider (separates header from body).
  // Column dividers use the shared buildDividerStyles — but only for
  // the column axis, since the row divider is the headerDividerStyles.
  const cellStyles: StyleXStyles[] = [
    headerStyles.cell,
    densityStyles[ctx.density],
    headerDividerStyles.cell,
    overflowStyles.cell,
    containerEdgeStyles[ctx.density],
  ];

  // Only add column dividers from the shared builder
  if (ctx.dividers === 'columns' || ctx.dividers === 'grid') {
    cellStyles.push(dividerColumnStyles.cell);
  }

  return (
    <th
      ref={ref}
      {...props}
      {...mergeProps(
        themeProps('table-header-cell'),
        stylex.props(...mergeXStyle(cellStyles, xstyle)),
        incomingClassName,
        incomingStyle,
      )}>
      {children}
    </th>
  );
}

TableHeaderCell.displayName = 'TableHeaderCell';
