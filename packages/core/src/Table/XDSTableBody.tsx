// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTableBodyProps extends XDSBaseProps<HTMLTableSectionElement> {
  children: ReactNode;
}

export function XDSTableBody({children, xstyle}: XDSTableBodyProps) {
  return (
    <tbody {...mergeProps(xdsClassName('table-body'), stylex.props(xstyle))}>
      {children}
    </tbody>
  );
}
XDSTableBody.displayName = 'XDSTableBody';
