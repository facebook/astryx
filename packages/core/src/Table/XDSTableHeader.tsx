// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type {ReactNode} from 'react';
import type {StyleXStyles} from '../theme/types';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTableHeaderProps { children: ReactNode; xstyle?: StyleXStyles; }

export function XDSTableHeader({children, xstyle}: XDSTableHeaderProps) {
  return (<thead {...mergeProps(xdsClassName('table-header'), stylex.props(xstyle))}>{children}</thead>);
}
XDSTableHeader.displayName = 'XDSTableHeader';
