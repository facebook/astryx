// Copyright (c) Meta Platforms, Inc. and affiliates.
// Arm C: a per-option declared descriptor in the menu-row vocabulary.
export * from '../../../../../packages/core/src';
import type {ReactNode} from 'react';
import type {BaseOptionData, BaseProps} from './common';
export type MultiSelectorOptionAction = {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
};
export type MultiSelectorOptionData = BaseOptionData & {
  action?: MultiSelectorOptionAction;
};
export type MultiSelectorOptionType = string | MultiSelectorOptionData;
export type MultiSelectorProps = BaseProps<MultiSelectorOptionData>;
export declare function MultiSelector(props: MultiSelectorProps): ReactNode;
