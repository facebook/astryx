/**
 * @file index.ts
 * @input Imports SideNav components and types
 * @output Exports XDSSideNav, XDSSideNavHeader, XDSSideNavItem, XDSSideNavSection
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/SideNav/README.md
 */

export {XDSSideNav} from './XDSSideNav';
export type {XDSSideNavProps} from './XDSSideNav';

export {XDSSideNavHeader} from './XDSSideNavHeader';
export type {XDSSideNavHeaderProps} from './XDSSideNavHeader';

export {XDSSideNavItem} from './XDSSideNavItem';
export type {XDSSideNavItemProps} from './XDSSideNavItem';

export {XDSSideNavSection} from './XDSSideNavSection';
export type {XDSSideNavSectionProps} from './XDSSideNavSection';
