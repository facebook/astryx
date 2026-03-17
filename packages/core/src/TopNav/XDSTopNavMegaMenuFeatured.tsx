/**
 * @file XDSTopNavMegaMenuFeatured.tsx
 * @input Uses React
 * @output Exports XDSTopNavMegaMenuFeatured component
 * @position Featured content area inside an XDSTopNavMegaMenu panel
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/TopNav/TopNav.doc.mjs
 * - /packages/core/src/TopNav/index.ts
 */

import {type ReactNode} from 'react';

export interface XDSTopNavMegaMenuFeaturedProps {
  /** Custom content for the featured area. */
  children: ReactNode;
}

/**
 * Featured content area inside an XDSTopNavMegaMenu panel.
 *
 * Accepts any ReactNode as children and renders them in the
 * featured (right-side) area of the mega menu panel.
 *
 * @example
 * ```
 * <XDSTopNavMegaMenuFeatured>
 *   <img src="/promo.jpg" alt="Promo" />
 *   <p>Check out our latest features!</p>
 * </XDSTopNavMegaMenuFeatured>
 * ```
 */
export function XDSTopNavMegaMenuFeatured({
  children,
}: XDSTopNavMegaMenuFeaturedProps) {
  // Rendering is handled by the parent XDSTopNavMegaMenu.
  return <>{children}</>;
}

XDSTopNavMegaMenuFeatured.displayName = 'XDSTopNavMegaMenuFeatured';
