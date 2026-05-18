// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @input Imports types from ../Selector/types
 * @output Re-exports Selector types with MultiSelector aliases
 * @position Type definitions; used by XDSMultiSelector.tsx and hooks.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/MultiSelector/index.ts
 */

import type {
  XDSSelectorOptionData,
  XDSSelectorDivider,
  XDSSelectorSection,
  XDSSelectorOptionType,
} from '../Selector/types';

export type XDSMultiSelectorOptionData = XDSSelectorOptionData;
export type XDSMultiSelectorDivider = XDSSelectorDivider;
export type XDSMultiSelectorSection = XDSSelectorSection;
export type XDSMultiSelectorOptionType = XDSSelectorOptionType;

export interface XDSMultiSelectorStatus {
  type: 'warning' | 'error' | 'success';
  message?: string;
}
