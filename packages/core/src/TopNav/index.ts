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

export {XDSTopNavTitleIcon} from './XDSTopNavTitleIcon';
export type {
  XDSTopNavTitleIconProps,
  XDSTopNavTitleIconSize,
} from './XDSTopNavTitleIcon';

export {XDSTopNavItem} from './XDSTopNavItem';
export type {XDSTopNavItemProps} from './XDSTopNavItem';
