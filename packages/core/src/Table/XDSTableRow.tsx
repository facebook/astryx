/**
 * @file XDSTableRow.tsx
 * @input React, StyleX, XDSTableContext, theme tokens
 * @output Exports XDSTableRow component, XDSTableRowProps
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
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars, transitionVars} from '../theme/tokens.stylex';
import type {StyleXStyles} from '../theme/types';
import {XDSTableContext} from './XDSTableContext';

/** Props for XDSTableRow — thin `<tr>` wrapper */
export interface XDSTableRowProps extends Omit<
  HTMLAttributes<HTMLTableRowElement>,
  'className' | 'style'
> {
  children: ReactNode;
  xstyle?: StyleXStyles[];
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
      ':hover': {
        '@media (hover: hover)': colorVars['--color-hover-overlay'],
      },
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
      ':hover': {
        '@media (hover: hover)': colorVars['--color-hover-overlay'],
      },
    },
    transitionProperty: 'background-color',
    transitionDuration: transitionVars['--transition-fast'],
  },
});

const _lastBodyRowStyles = stylex.create({
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
 * ```
 * <XDSTable>
 *   <XDSTableRow>
 *     <XDSTableCell>Alice</XDSTableCell>
 *     <XDSTableCell>30</XDSTableCell>
 *   </XDSTableRow>
 * </XDSTable>
 * ```
 */
export const XDSTableRow = forwardRef<HTMLTableRowElement, XDSTableRowProps>(
  ({children, xstyle, ...props}, ref) => {
    const ctx = useContext(XDSTableContext);

    if (!ctx) {
      return (
        <tr ref={ref} {...props} {...stylex.props(xstyle)}>
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
      // Note: last-body-row border removal is handled by XDSTableCell
      // to avoid affecting the header row in <thead>.
    }

    if (xstyle) {
      rowStyles.push(...xstyle);
    }

    return (
      <tr ref={ref} {...props} {...stylex.props(...rowStyles)}>
        {children}
      </tr>
    );
  },
);

XDSTableRow.displayName = 'XDSTableRow';
