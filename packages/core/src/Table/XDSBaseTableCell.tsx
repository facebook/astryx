/**
 * @file XDSBaseTableCell.tsx
 * @input React, StyleX, TableContext, theme tokens
 * @output Exports XDSBaseTableCell component, XDSBaseTableCellProps
 * @position Sub-component; used inside XDSBaseTable children mode
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/README.md
 * - /packages/core/src/Table/index.ts
 */

import {
  forwardRef,
  useContext,
  type TdHTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, textSizeVars} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {TableContext} from './TableContext';

/** Props for XDSBaseTableCell — thin `<td>` wrapper */
export interface XDSBaseTableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children?: ReactNode;
}

const densityStyles = stylex.create({
  compact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontSize: textSizeVars['--text-xsm'],
  },
  balanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    fontSize: textSizeVars['--text-sm'],
  },
  spacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-4'],
    fontSize: textSizeVars['--text-base'],
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
 * XDSBaseTableCell — a `<td>` wrapper for children/streaming mode.
 *
 * When used inside `<XDSBaseTable>`, inherits styling from the table context
 * (density padding, divider borders). When used standalone, renders a plain `<td>`.
 *
 * @example
 * ```tsx
 * <XDSBaseTableRow>
 *   <XDSBaseTableCell>Alice</XDSBaseTableCell>
 *   <XDSBaseTableCell>30</XDSBaseTableCell>
 * </XDSBaseTableRow>
 * ```
 */
export const XDSBaseTableCell = forwardRef<
  HTMLTableCellElement,
  XDSBaseTableCellProps
>(({children, ...props}, ref) => {
  const ctx = useContext(TableContext);

  if (!ctx) {
    return (
      <td ref={ref} {...props}>
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

  return (
    <td ref={ref} {...props} {...stylex.props(...cellStyles)}>
      {children}
    </td>
  );
});

XDSBaseTableCell.displayName = 'XDSBaseTableCell';
