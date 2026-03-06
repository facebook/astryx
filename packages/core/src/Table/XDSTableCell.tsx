/**
 * @file XDSTableCell.tsx
 * @input React, StyleX, XDSTableContext, theme tokens
 * @output Exports XDSTableCell component, XDSTableCellProps
 * @position Sub-component; used inside XDSTable children mode
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/README.md
 * - /packages/core/src/Table/index.ts
 */

'use client';

import {
  forwardRef,
  useContext,
  type TdHTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, textSizeVars} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {XDSTableContext} from './XDSTableContext';

/** Props for XDSTableCell — thin `<td>` wrapper */
export interface XDSTableCellProps extends Omit<
  TdHTMLAttributes<HTMLTableCellElement>,
  'className' | 'style'
> {
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

const dividerRowStyles = stylex.create({
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
 * XDSTableCell — a `<td>` wrapper for children/streaming mode.
 *
 * When used inside `<XDSTable>`, inherits styling from the table context
 * (density padding, divider borders). When used standalone, renders a plain `<td>`.
 *
 * @example
 * ```
 * <XDSTableRow>
 *   <XDSTableCell>Alice</XDSTableCell>
 *   <XDSTableCell>30</XDSTableCell>
 * </XDSTableRow>
 * ```
 */
export const XDSTableCell = forwardRef<HTMLTableCellElement, XDSTableCellProps>(
  ({children, xstyle, ...props}, ref) => {
    const ctx = useContext(XDSTableContext);

    if (!ctx) {
      return (
        <td ref={ref} {...props} {...stylex.props(xstyle)}>
          {children}
        </td>
      );
    }

    const cellStyles: StyleXStyles[] = [densityStyles[ctx.density]];

    if (ctx.dividers === 'rows' || ctx.dividers === 'grid') {
      cellStyles.push(dividerRowStyles.cell);
    }

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
      <td ref={ref} {...props} {...stylex.props(...cellStyles)}>
        {children}
      </td>
    );
  },
);

XDSTableCell.displayName = 'XDSTableCell';
