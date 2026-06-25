// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type React from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

export interface TableHeaderProps extends BaseProps<HTMLTableSectionElement> {
  ref?: React.Ref<HTMLTableSectionElement>;
  children: ReactNode;
}

export function TableHeader({ref, children, xstyle}: TableHeaderProps) {
  return (
    <thead
      ref={ref}
      {...mergeProps(themeProps('table-header'), stylex.props(xstyle))}>
      {children}
    </thead>
  );
}
TableHeader.displayName = 'TableHeader';
