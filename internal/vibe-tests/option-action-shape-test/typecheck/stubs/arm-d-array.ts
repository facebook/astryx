// Copyright (c) Meta Platforms, Inc. and affiliates.
// Arm D: a per-option array of nodes.
export * from '../../../../../packages/core/src';
import type {ReactNode} from 'react';
import type {BaseOptionData, BaseProps} from './common';
export type MultiSelectorOptionData = BaseOptionData & {actions?: ReactNode[]};
export type MultiSelectorOptionType = string | MultiSelectorOptionData;
export type MultiSelectorProps = BaseProps<MultiSelectorOptionData>;
export declare function MultiSelector(props: MultiSelectorProps): ReactNode;
