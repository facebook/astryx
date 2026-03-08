/**
 * @file index.ts
 * @input Imports from TopNav component files
 * @output Exports XDSTopNav and companion components
 * @position Entry point for TopNav module
 *
 * SYNC: When modified, update /packages/core/src/TopNav/TopNav.doc.mjs
 */

export {XDSTopNav} from './XDSTopNav';
export type {XDSTopNavProps} from './XDSTopNav';

export {XDSTopNavHeading} from './XDSTopNavHeading';
export type {XDSTopNavHeadingProps} from './XDSTopNavHeading';

export {XDSTopNavItem} from './XDSTopNavItem';
export type {XDSTopNavItemProps} from './XDSTopNavItem';

export {XDSTopNavMenu} from './XDSTopNavMenu';
export type {XDSTopNavMenuProps, XDSTopNavMenuItemData} from './XDSTopNavMenu';

export {XDSTopNavMegaMenu} from './XDSTopNavMegaMenu';
export type {
  XDSTopNavMegaMenuProps,
  XDSTopNavMegaMenuItemData,
  XDSTopNavMegaMenuFeatured,
} from './XDSTopNavMegaMenu';
