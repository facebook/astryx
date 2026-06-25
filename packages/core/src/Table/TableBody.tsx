// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export interface TableBodyProps extends BaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function TableBody({ref, children, xstyle}: TableBodyProps) {
  return (
    <tbody
      ref={ref}
      {...mergeProps(themeProps('table-body'), stylex.props(xstyle))}>
      {children}
    </tbody>
  );
}
TableBody.displayName = 'TableBody';
