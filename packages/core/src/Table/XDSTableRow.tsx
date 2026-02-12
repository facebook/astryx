/**
 * @file XDSTableRow.tsx
 * @input React, StyleX, TableContext, theme tokens
 * @output Exports XDSTableRow component, XDSTableRowProps
 * @position Sub-component; used inside XDSTable children mode
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Table/README.md
 * - /packages/core/src/Table/index.ts
 */

import {
  forwardRef,
  useContext,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, transitionVars} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {TableContext} from './TableContext';

/** Props for XDSTableRow — thin `<tr>` wrapper */
export interface XDSTableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
}

const stripedRowStyles = stylex.create({
  row: {
    backgroundColor: {
      default: null,
      ':nth-child(even)': colorVars['--color-wash'],
    },
  },
});

const hoverRowStyles = stylex.create({
  row: {
    backgroundColor: {
      default: null,
      ':hover': colorVars['--color-hover-overlay'],
    },
    transitionProperty: 'background-color',
    transitionDuration: transitionVars['--transition-fast'],
  },
});

const stripedHoverRowStyles = stylex.create({
  row: {
    backgroundColor: {
      default: null,
      ':nth-child(even)': colorVars['--color-wash'],
      ':hover': colorVars['--color-hover-overlay'],
    },
    transitionProperty: 'background-color',
    transitionDuration: transitionVars['--transition-fast'],
  },
});

const lastBodyRowStyles = stylex.create({
  row: {
    borderBottomStyle: {
      default: null,
      ':last-child': 'hidden',
    },
  },
});

/**
 * XDSTableRow — a `<tr>` wrapper for children/streaming mode.
 *
 * When used inside `<XDSTable>`, inherits styling from the table context
 * (striped, hover, divider overrides). When used standalone, renders a plain `<tr>`.
 *
 * @example
 * ```tsx
 * <XDSTable>
 *   <XDSTableRow>
 *     <XDSTableCell>Alice</XDSTableCell>
 *     <XDSTableCell>30</XDSTableCell>
 *   </XDSTableRow>
 * </XDSTable>
 * ```
 */
export const XDSTableRow = forwardRef<HTMLTableRowElement, XDSTableRowProps>(
  ({children, ...props}, ref) => {
    const ctx = useContext(TableContext);

    if (!ctx) {
      return (
        <tr ref={ref} {...props}>
          {children}
        </tr>
      );
    }

    const rowStyles: StyleXStyles[] = [];

    // Handle striped + hover combination to avoid backgroundColor conflicts
    if (ctx.striped && ctx.hover) {
      rowStyles.push(stripedHoverRowStyles.row);
    } else if (ctx.striped) {
      rowStyles.push(stripedRowStyles.row);
    } else if (ctx.hover) {
      rowStyles.push(hoverRowStyles.row);
    }

    if (ctx.dividers === 'rows' || ctx.dividers === 'grid') {
      rowStyles.push(lastBodyRowStyles.row);
    }

    return (
      <tr ref={ref} {...props} {...stylex.props(...rowStyles)}>
        {children}
      </tr>
    );
  },
);

XDSTableRow.displayName = 'XDSTableRow';
