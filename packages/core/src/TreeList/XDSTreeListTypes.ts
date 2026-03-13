/**
 * @file XDSTreeListTypes.ts
 * @input Uses React types
 * @output Exports XDSTreeListItemData, XDSTreeListDensity types
 * @position Type definitions; consumed by XDSTreeList.tsx, XDSTreeListItem.tsx, index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TreeList/TreeList.doc.mjs
 * - /packages/core/src/TreeList/index.ts
 */

import type {ReactNode} from 'react';

/** Spacing density for tree list items. */
export type XDSTreeListDensity = 'compact' | 'balanced' | 'spacious';

/** Branch alignment mode for tree connector lines. */
export type XDSTreeListBranchAlignment = 'center' | 'top';

/** Recursive item configuration for XDSTreeList. */
export interface XDSTreeListItemData {
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
  children?: XDSTreeListItemData[];

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
