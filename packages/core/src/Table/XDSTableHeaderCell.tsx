'use client';

/**
 * @file XDSTableHeaderCell.tsx
 * @input React, StyleX, XDSTableContext, theme tokens, useTableCellStyles
 * @output Exports XDSTableHeaderCell component, XDSTableHeaderCellProps
 * @position Sub-component; used inside XDSTable for header cells
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/Table.doc.mjs
 * - /packages/core/src/Table/index.ts
 */

import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
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
import {
  useTableContext,
  buildDividerStyles,
  mergeXStyle,
} from './useTableCellStyles';
import {xdsClassName, mergeProps} from '../utils';

/** Props for XDSTableHeaderCell — `<th>` wrapper with context-aware styling */
export interface XDSTableHeaderCellProps extends XDSBaseProps<HTMLTableCellElement> {
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
 * XDSTableHeaderCell — a `<th>` wrapper for header cells.
 *
 * When used inside `<XDSTable>`, inherits styling from the table context
 * (density padding, header font weight/color, divider borders).
 * When used standalone, renders a plain `<th>`.
 *
 * Accepts `xstyle` for plugin-provided styles that merge on top.
 *
 * @example
 * ```
 * <thead>
 *   <tr>
 *     <XDSTableHeaderCell>Name</XDSTableHeaderCell>
 *     <XDSTableHeaderCell>Age</XDSTableHeaderCell>
 *   </tr>
 * </thead>
 * ```
 */
export function XDSTableHeaderCell({
  children,
  xstyle,
  ref,
  className: incomingClassName,
  style: incomingStyle,
  ...props
}: XDSTableHeaderCellProps) {
  const ctx = useTableContext();

  if (!ctx) {
    return (
      <th
        ref={ref}
        {...props}
        {...mergeProps(
          xdsClassName('table-header-cell'),
          stylex.props(xstyle),
          incomingClassName,
          incomingStyle as React.CSSProperties,
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
    containerEdgeStyles.cell,
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
        xdsClassName('table-header-cell'),
        stylex.props(...mergeXStyle(cellStyles, xstyle)),
        incomingClassName,
        incomingStyle as React.CSSProperties,
      )}>
      {children}
    </th>
  );
}

XDSTableHeaderCell.displayName = 'XDSTableHeaderCell';
