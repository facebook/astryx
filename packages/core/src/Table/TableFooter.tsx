// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export interface TableFooterProps extends BaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function TableFooter({ref, children, xstyle}: TableFooterProps) {
  return (
    <tfoot
      ref={ref}
      {...mergeProps(themeProps('table-footer'), stylex.props(xstyle))}>
      {children}
    </tfoot>
  );
}
TableFooter.displayName = 'TableFooter';
