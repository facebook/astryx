/**
 * @file XDSTableHeaderCell.tsx
 * @input React, StyleX, XDSTableContext, theme tokens
 * @output Exports XDSTableHeaderCell component, XDSTableHeaderCellProps
 * @position Sub-component; used inside XDSTable for header cells
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/Table.doc.mjs
 * - /packages/core/src/Table/index.ts
 */

'use client';

import {forwardRef, useContext, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  textSizeVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {XDSTableContext} from './XDSTableContext';
import {xdsClassName, mergeProps} from '../utils';

/** Props for XDSTableHeaderCell — `<th>` wrapper with context-aware styling */
export interface XDSTableHeaderCellProps extends XDSBaseProps<HTMLTableCellElement> {
  /** Specifies which cells this header relates to. */
  scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
  children?: ReactNode;
  xstyle?: StyleXStyles | StyleXStyles[];
}

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontSize: textSizeVars['--text-xsm'],
    boxSizing: 'border-box',
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: textSizeVars['--text-sm'],
    boxSizing: 'border-box',
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: textSizeVars['--text-base'],
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
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-divider'],
  },
});

const dividerColumnStyles = stylex.create({
  cell: {
    borderRightWidth: {
      default: '1px',
      ':last-child': '0',
    },
    borderRightStyle: 'solid',
    borderRightColor: colorVars['--color-divider'],
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
export const XDSTableHeaderCell = forwardRef<
  HTMLTableCellElement,
  XDSTableHeaderCellProps
>(({children, xstyle, ...props}, ref) => {
  const ctx = useContext(XDSTableContext);

  if (!ctx) {
    return (
      <th
        ref={ref}
        {...props}
        {...mergeProps(
          xdsClassName('table-header-cell'),
          stylex.props(xstyle),
        )}>
        {children}
      </th>
    );
  }

  const cellStyles: StyleXStyles[] = [
    headerStyles.cell,
    densityStyles[ctx.density],
    headerDividerStyles.cell,
  ];

  if (ctx.dividers === 'columns' || ctx.dividers === 'grid') {
    cellStyles.push(dividerColumnStyles.cell);
  }

  if (xstyle) {
    if (Array.isArray(xstyle)) {
      cellStyles.push(...xstyle);
    } else {
      cellStyles.push(xstyle);
    }
  }

  return (
    <th
      ref={ref}
      {...props}
      {...mergeProps(
        xdsClassName('table-header-cell'),
        stylex.props(...cellStyles),
      )}>
      {children}
    </th>
  );
});

XDSTableHeaderCell.displayName = 'XDSTableHeaderCell';
