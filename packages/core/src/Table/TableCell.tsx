// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableCell.tsx
 * @input React, StyleX, TableContext, theme tokens, useTableCellStyles
 * @output Exports TableCell component, TableCellProps
 * @position Sub-component; used inside Table children mode
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
  borderVars,
  colorVars,
  spacingVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {
  overflowStyles,
  wrapStyles,
  containerEdgeStyles,
  tableRowMarker,
} from './table.stylex';
import {
  useTableContext,
  buildDividerStyles,
  mergeXStyle,
} from './useTableCellStyles';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/** Props for TableCell — thin `<td>` wrapper */
export interface TableCellProps extends BaseProps<HTMLTableCellElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLTableCellElement>;
  /** Specifies which cells this cell relates to (used on `<td>` acting as a row header). */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  /** Space-separated list of header cell IDs this cell is described by. */
  headers?: string;
  /** Number of columns this cell spans. Standard HTML `<td>` attribute. */
  colSpan?: number;
  /** Number of rows this cell spans. Standard HTML `<td>` attribute. */
  rowSpan?: number;
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
    fontSize: typeScaleVars['--text-body-size'],
    boxSizing: 'border-box',
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: typeScaleVars['--text-body-size'],
    boxSizing: 'border-box',
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: typeScaleVars['--text-body-size'],
    boxSizing: 'border-box',
  },
});

const dividerRowStyles = stylex.create({
  cell: {
    borderBottomWidth: {
      default: borderVars['--border-width'],
      // Skip border on cells in the last body row to avoid a
      // redundant line at the bottom of the table.
      // Scoped to tableRowMarker so only the parent <tr> is checked —
      // without the scope, <tbody> (also a :last-child) would match
      // and suppress borders on every row.
      [stylex.when.ancestor(':last-child', tableRowMarker)]: '0',
    },
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

const verticalAlignStyles = stylex.create({
  middle: {
    verticalAlign: 'middle',
  },
  top: {
    verticalAlign: 'top',
  },
  bottom: {
    verticalAlign: 'bottom',
  },
});

/**
 * TableCell — a `<td>` wrapper for children/streaming mode.
 *
 * When used inside `<Table>`, inherits styling from the table context
 * (density padding, divider borders). When used standalone, renders a plain `<td>`.
 *
 * @example
 * ```
 * <TableRow>
 *   <TableCell>Alice</TableCell>
 *   <TableCell>30</TableCell>
 * </TableRow>
 * ```
 */
export function TableCell({
  children,
  xstyle,
  ref,
  className: incomingClassName,
  style: incomingStyle,
  ...props
}: TableCellProps) {
  const ctx = useTableContext();

  if (!ctx) {
    return (
      <td
        ref={ref}
        {...props}
        {...mergeProps(
          themeProps('table-cell'),
          stylex.props(xstyle),
          incomingClassName,
          incomingStyle,
        )}>
        {children}
      </td>
    );
  }

  const cellStyles: StyleXStyles[] = [
    densityStyles[ctx.density],
    ctx.textOverflow === 'truncate' ? overflowStyles.cell : wrapStyles.cell,
    containerEdgeStyles[ctx.density],
    verticalAlignStyles[ctx.verticalAlign],
    ...buildDividerStyles(ctx, dividerRowStyles.cell, dividerColumnStyles.cell),
  ];

  return (
    <td
      ref={ref}
      {...props}
      {...mergeProps(
        themeProps('table-cell'),
        stylex.props(...mergeXStyle(cellStyles, xstyle)),
        incomingClassName,
        incomingStyle,
      )}>
      {children}
    </td>
  );
}

TableCell.displayName = 'TableCell';
