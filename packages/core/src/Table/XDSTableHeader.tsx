// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';

export interface XDSTableHeaderProps extends XDSBaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function XDSTableHeader({ref, children, xstyle}: XDSTableHeaderProps) {
  return (
    <thead
      ref={ref}
      {...mergeProps(xdsThemeProps('table-header'), stylex.props(xstyle))}>
      {children}
    </thead>
  );
}
XDSTableHeader.displayName = 'XDSTableHeader';
