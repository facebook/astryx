/**
 * @file XDSTopNavMegaMenuGroup.tsx
 * @input Uses React, StyleX, XDSGrid
 * @output Exports XDSTopNavMegaMenuGroup component
 * @position Container for mega menu items in a responsive grid layout
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

import {type ReactNode} from 'react';

export interface XDSTopNavMegaMenuGroupProps {
  /** Menu items (XDSTopNavMegaMenuItem elements). */
  children: ReactNode;
}

/**
 * Groups mega menu items inside an XDSTopNavMegaMenu panel.
 *
 * In default (desktop) mode the parent renders children inside
 * an XDSGrid. This component is a thin semantic wrapper so the
 * parent can identify groups vs featured areas.
 *
 * @example
 * ```
 * <XDSTopNavMegaMenuGroup>
 *   <XDSTopNavMegaMenuItem title="Analytics" href="/analytics" />
 *   <XDSTopNavMegaMenuItem title="Reports" href="/reports" />
 * </XDSTopNavMegaMenuGroup>
 * ```
 */
export function XDSTopNavMegaMenuGroup({
  children,
}: XDSTopNavMegaMenuGroupProps) {
  // Rendering is handled by the parent XDSTopNavMegaMenu which reads children.
  // This component exists for composition API ergonomics.
  return <>{children}</>;
}

XDSTopNavMegaMenuGroup.displayName = 'XDSTopNavMegaMenuGroup';
