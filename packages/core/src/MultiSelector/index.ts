// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @output Exports MultiSelector and types
 * @position Public API entry point
 */

export {
  MultiSelector,
  type MultiSelectorProps,
  type MultiSelectorSize,
  type MultiSelectorStatusType,
} from './MultiSelector';
export type {
  MultiSelectorOptionType,
  MultiSelectorOptionData,
  MultiSelectorDivider,
  MultiSelectorSection,
  MultiSelectorStatus,
} from './types';
export {useMultiCombobox} from './hooks';
