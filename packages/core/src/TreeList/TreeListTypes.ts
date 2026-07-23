// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file TreeListTypes.ts
 * @input Uses React types
 * @output Exports TreeListItemData, TreeListDensity, TreeListExpandIconState types
 * @position Type definitions; consumed by TreeList.tsx, TreeListItem.tsx, index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/index.ts
 */

import type {ReactNode} from 'react';

/** Spacing density for tree list items. */
export type TreeListDensity = 'compact' | 'balanced' | 'spacious';

/** State passed to TreeList's `renderExpandIcon` render prop. */
export interface TreeListExpandIconState {
  /** Whether the item is currently expanded. Always false for leaf items. */
  isExpanded: boolean;

  /** Whether the item has nested children (i.e. renders a toggle). */
  hasChildren: boolean;

  /** Whether the item is disabled. */
  isDisabled: boolean;
}

/** Recursive item configuration for TreeList. */
export interface TreeListItemData {
  /** Unique identifier for the item. Used as React key and for expansion tracking. */
  id: string;

  /** Primary text label for the item. */
  label: ReactNode;

  /** Secondary description text below the label. */
  description?: string;

  /** Content rendered before the label (icon, avatar, checkbox). */
  startContent?: ReactNode;

  /** Content rendered after the label (badge, action button). */
  endContent?: ReactNode;

  /** Nested child items. When present, the item renders an expand/collapse toggle. */
  children?: TreeListItemData[];

  /** Click handler for the item. */
  onClick?: (e: React.MouseEvent) => void;

  /** URL for link items. Renders an invisible anchor element. */
  href?: string;

  /** Link target (e.g., '_blank'). Only used with href. */
  target?: string;

  /** Whether the item is disabled. */
  isDisabled?: boolean;

  /** Whether the item is currently selected. */
  isSelected?: boolean;

  /** Whether the item is initially expanded. Only meaningful for items with children. */
  isExpanded?: boolean;
}
