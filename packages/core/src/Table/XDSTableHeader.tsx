// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTableHeaderProps extends XDSBaseProps<HTMLTableSectionElement> {
  children: ReactNode;
}

export function XDSTableHeader({children, xstyle}: XDSTableHeaderProps) {
  return (
    <thead {...mergeProps(xdsClassName('table-header'), stylex.props(xstyle))}>
      {children}
    </thead>
  );
}
XDSTableHeader.displayName = 'XDSTableHeader';
