/**
 * @file XDSTopNavMegaMenuItem.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSTopNavMegaMenuItem component and props
 * @position Individual item inside an XDSTopNavMegaMenuGroup
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

import {type ReactNode} from 'react';

export interface XDSTopNavMegaMenuItemProps {
  /** Display title for the menu item. */
  title: string;
  /** Optional description text displayed below the title. */
  description?: string;
  /** Optional icon element displayed to the left. */
  icon?: ReactNode;
  /** URL to navigate to when clicked. */
  href?: string;
  /** Callback when item is clicked. */
  onClick?: () => void;
}

/**
 * An individual item inside an XDSTopNavMegaMenuGroup.
 *
 * Rendering is handled by the parent XDSTopNavMegaMenu which reads
 * the props from each item. This component provides the composition
 * API surface and type-safety.
 *
 * @example
 * ```
 * <XDSTopNavMegaMenuItem
 *   title="Analytics"
 *   description="Track and analyze user behavior"
 *   icon={<ChartIcon />}
 *   href="/analytics"
 * />
 * ```
 */
export function XDSTopNavMegaMenuItem(_props: XDSTopNavMegaMenuItemProps) {
  // Rendering is handled by the parent — this is a declarative "config" component.
  return null;
}

XDSTopNavMegaMenuItem.displayName = 'XDSTopNavMegaMenuItem';
