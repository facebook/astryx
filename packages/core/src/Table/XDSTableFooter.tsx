// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps, xdsProps} from '../utils';

export interface XDSTableFooterProps extends XDSBaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function XDSTableFooter({ref, children, xstyle}: XDSTableFooterProps) {
  return (
    <tfoot
      ref={ref}
      {...mergeProps(xdsProps('table-footer'), stylex.props(xstyle))}>
      {children}
    </tfoot>
  );
}
XDSTableFooter.displayName = 'XDSTableFooter';
