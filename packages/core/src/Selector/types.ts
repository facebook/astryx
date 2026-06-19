// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Type definitions for Selector
 * @position Type definitions; used by Selector.tsx
 */

import type {ReactNode} from 'react';
import type {IconType} from '../Icon';

/**
 * A selectable option in the selector
 */
export type SelectorOptionData = {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: ReactNode | IconType;
};

/**
 * A divider between options
 */
export type SelectorDivider = {
  type: 'divider';
};

/**
 * A section/group of options with optional title
 */
export type SelectorSection = {
  type: 'section';
  title?: string;
  options: SelectorOptionData[];
};

/**
 * Union of all option types passed to the `options` prop.
 * Can be a plain string, option data object, divider, or section.
 */
export type SelectorOptionType =
  | string
  | SelectorOptionData
  | SelectorDivider
  | SelectorSection;
