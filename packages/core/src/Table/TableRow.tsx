// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file TableRow.tsx
 * @input React, StyleX, TableContext, theme tokens
 * @output Exports TableRow component, TableRowProps
 * @position Sub-component; used inside Table children mode
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/Table.doc.mjs
 * - /packages/core/src/Table/index.ts
 * - /packages/cli/templates/blocks/components/Table/ (showcase blocks)
 */

import {use, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, durationVars, easeVars} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {tableRowMarker} from './table.stylex';
import {TableContext} from './TableContext';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/** Props for TableRow — thin `<tr>` wrapper */
export interface TableRowProps extends BaseProps<HTMLTableRowElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLTableRowElement>;
  children: ReactNode;
  /**
   * StyleX styles for layout customization (margins, positioning, sizing).
   * Must be a `stylex.create()` value — not an inline style object.
   */
  xstyle?: StyleXStyles[];
}

const stripedRowStyles = stylex.create({
  row: {
    backgroundColor: {
      default: null,
      ':nth-child(even)': colorVars['--color-background-muted'],
    },
  },
});

const hoverRowStyles = stylex.create({
  row: {
    backgroundColor: {
      default: null,
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

const stripedHoverRowStyles = stylex.create({
  row: {
    backgroundColor: {
      default: null,
      ':nth-child(even)': colorVars['--color-background-muted'],
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
    },
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

/**
 * TableRow — a `<tr>` wrapper for children/streaming mode.
 *
 * When used inside `<Table>`, inherits styling from the table context
 * (striped, hover, divider overrides). When used standalone, renders a plain `<tr>`.
 *
 * @example
 * ```
 * <Table>
 *   <TableRow>
 *     <TableCell>Alice</TableCell>
 *     <TableCell>30</TableCell>
 *   </TableRow>
 * </Table>
 * ```
 */
export function TableRow({
  children,
  xstyle,
  ref,
  ...props
}: TableRowProps) {
  const ctx = use(TableContext);

  if (!ctx) {
    return (
      <tr
        ref={ref}
        {...props}
        {...mergeProps(
          themeProps('table-row'),
          stylex.props(tableRowMarker, xstyle),
        )}>
        {children}
      </tr>
    );
  }

  const rowStyles: StyleXStyles[] = [];

  // Handle striped + hover combination to avoid backgroundColor conflicts
  if (ctx.isStriped && ctx.hasHover) {
    rowStyles.push(stripedHoverRowStyles.row);
  } else if (ctx.isStriped) {
    rowStyles.push(stripedRowStyles.row);
  } else if (ctx.hasHover) {
    rowStyles.push(hoverRowStyles.row);
  }

  if (ctx.dividers === 'rows' || ctx.dividers === 'grid') {
    // Note: last-body-row border removal is handled by TableCell
    // to avoid affecting the header row in <thead>.
  }

  if (xstyle) {
    rowStyles.push(...xstyle);
  }

  return (
    <tr
      ref={ref}
      {...props}
      {...mergeProps(
        themeProps('table-row'),
        stylex.props(tableRowMarker, ...rowStyles),
      )}>
      {children}
    </tr>
  );
}

TableRow.displayName = 'TableRow';
