// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';

export interface XDSTableBodyProps extends XDSBaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function XDSTableBody({ref, children, xstyle}: XDSTableBodyProps) {
  return (
    <tbody
      ref={ref}
      {...mergeProps(xdsThemeProps('table-body'), stylex.props(xstyle))}>
      {children}
    </tbody>
  );
}
XDSTableBody.displayName = 'XDSTableBody';
