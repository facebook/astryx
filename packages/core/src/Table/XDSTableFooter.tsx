// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTableFooterProps extends XDSBaseProps<HTMLTableSectionElement> {
  children: ReactNode;
}

export function XDSTableFooter({children, xstyle}: XDSTableFooterProps) {
  return (
    <tfoot {...mergeProps(xdsClassName('table-footer'), stylex.props(xstyle))}>
      {children}
    </tfoot>
  );
}
XDSTableFooter.displayName = 'XDSTableFooter';
