// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
import type {ReactNode} from 'react';
import type {StyleXStyles} from '../theme/types';
import * as stylex from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';

export interface XDSTableBodyProps { children: ReactNode; xstyle?: StyleXStyles; }

export function XDSTableBody({children, xstyle}: XDSTableBodyProps) {
  return (<tbody {...mergeProps(xdsClassName('table-body'), stylex.props(xstyle))}>{children}</tbody>);
}
XDSTableBody.displayName = 'XDSTableBody';
