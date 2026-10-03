// Copyright (c) Meta Platforms, Inc. and affiliates.
// Arm B: a per-option node.
export * from '../../../../../packages/core/src';
import type {ReactNode} from 'react';
import type {BaseOptionData, BaseProps} from './common';
export type MultiSelectorOptionData = BaseOptionData & {action?: ReactNode};
export type MultiSelectorOptionType = string | MultiSelectorOptionData;
export type MultiSelectorProps = BaseProps<MultiSelectorOptionData>;
export declare function MultiSelector(props: MultiSelectorProps): ReactNode;
