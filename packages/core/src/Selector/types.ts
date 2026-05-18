// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file types.ts
 * @output Type definitions for XDSSelector
 * @position Type definitions; used by XDSSelector.tsx
 */

import type {ReactNode} from 'react';
import type {XDSIconType} from '../Icon';

/**
 * A selectable option in the selector
 */
export type XDSSelectorOptionData = {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: ReactNode | XDSIconType;
};

/**
 * A divider between options
 */
export type XDSSelectorDivider = {
  type: 'divider';
};

/**
 * A section/group of options with optional title
 */
export type XDSSelectorSection = {
  type: 'section';
  title?: string;
  options: XDSSelectorOptionData[];
};

/**
 * Union of all option types passed to the `options` prop.
 * Can be a plain string, option data object, divider, or section.
 */
export type XDSSelectorOptionType =
  | string
  | XDSSelectorOptionData
  | XDSSelectorDivider
  | XDSSelectorSection;
