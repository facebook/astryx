'use client';
import type {ReactNode} from 'react';
import type {StyleXStyles} from '../theme/types';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTableFooterProps { children: ReactNode; xstyle?: StyleXStyles; }

export function XDSTableFooter({children, xstyle}: XDSTableFooterProps) {
  return (<tfoot {...mergeProps(xdsClassName('table-footer'), stylex.props(xstyle))}>{children}</tfoot>);
}
XDSTableFooter.displayName = 'XDSTableFooter';
