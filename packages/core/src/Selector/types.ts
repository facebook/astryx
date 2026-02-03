/**
 * @file types.ts
 * @output Type definitions for XDSSelector
 * @position Type definitions; used by XDSSelector.tsx
 */

import type {XDSIconType} from '../Icon';

/**
 * A selectable item in the selector
 */
export type XDSSelectorItemData = {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: XDSIconType;
};

/**
 * A divider between items
 */
export type XDSSelectorDivider = {
  type: 'divider';
};

/**
 * A section/group of items with optional title
 */
export type XDSSelectorSection = {
  type: 'section';
  title?: string;
  items: XDSSelectorItemData[];
};

/**
 * Union of all option types
 */
export type XDSSelectorOption =
  | string
  | XDSSelectorItemData
  | XDSSelectorDivider
  | XDSSelectorSection;
