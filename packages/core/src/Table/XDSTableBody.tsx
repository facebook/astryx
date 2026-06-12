// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps, xdsProps} from '../utils';

export interface XDSTableBodyProps extends XDSBaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function XDSTableBody({ref, children, xstyle}: XDSTableBodyProps) {
  return (
    <tbody
      ref={ref}
      {...mergeProps(xdsProps('table-body'), stylex.props(xstyle))}>
      {children}
    </tbody>
  );
}
XDSTableBody.displayName = 'XDSTableBody';
