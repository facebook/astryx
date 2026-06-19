// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Imports types from ../Selector/types
 * @output Re-exports Selector types with MultiSelector aliases
 * @position Type definitions; used by MultiSelector.tsx and hooks.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/MultiSelector/index.ts
 */

import type {
  SelectorOptionData,
  SelectorDivider,
  SelectorSection,
  SelectorOptionType,
} from '../Selector/types';

export type MultiSelectorOptionData = SelectorOptionData;
export type MultiSelectorDivider = SelectorDivider;
export type MultiSelectorSection = SelectorSection;
export type MultiSelectorOptionType = SelectorOptionType;

export interface MultiSelectorStatus {
  type: 'warning' | 'error' | 'success';
  message?: string;
}
