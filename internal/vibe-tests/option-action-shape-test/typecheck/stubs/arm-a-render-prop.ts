// Copyright (c) Meta Platforms, Inc. and affiliates.
// Arm A: a root render prop, the shape the open pull request ships.
export * from '../../../../../packages/core/src';
import type {ReactNode} from 'react';
import type {BaseOptionData, BaseProps} from './common';
export type MultiSelectorOptionData = BaseOptionData;
export type MultiSelectorOptionType = string | MultiSelectorOptionData;
export type MultiSelectorProps = BaseProps<MultiSelectorOptionData> & {
  renderOptionAction?: (option: MultiSelectorOptionData) => ReactNode;
};
export declare function MultiSelector(props: MultiSelectorProps): ReactNode;
