/**
 * @file index.ts
 * @input Imports from TopNav component files
 * @output Exports XDSTopNav and companion components
 * @position Entry point for TopNav module
 *
 * SYNC: When modified, update /packages/core/src/TopNav/README.md
 */

export {XDSTopNav} from './XDSTopNav';
export type {XDSTopNavProps} from './XDSTopNav';

export {XDSTopNavTitle} from './XDSTopNavTitle';
export type {XDSTopNavTitleProps} from './XDSTopNavTitle';

/**
 * @deprecated Use `XDSNavIcon` from `@xds/core/NavIcon` instead.
 */
export {XDSNavIcon as XDSTopNavTitleIcon} from '../NavIcon';
/**
 * @deprecated Use `XDSNavIconProps` from `@xds/core/NavIcon` instead.
 */
export type {XDSNavIconProps as XDSTopNavTitleIconProps} from '../NavIcon';

export {XDSTopNavItem} from './XDSTopNavItem';
export type {XDSTopNavItemProps} from './XDSTopNavItem';

export {XDSTopNavMenu} from './XDSTopNavMenu';
export type {XDSTopNavMenuProps, XDSTopNavMenuItemData} from './XDSTopNavMenu';
