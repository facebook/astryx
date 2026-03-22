'use client';

/**
 * @file index.ts
 * @input Imports SideNav components and types
 * @output Exports XDSSideNav, XDSSideNavHeading, XDSSideNavItem, XDSSideNavSection
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/SideNav/SideNav.doc.mjs
 */

export {XDSSideNav} from './XDSSideNav';
export type {XDSSideNavProps} from './XDSSideNav';

export {XDSSideNavHeading} from './XDSSideNavHeading';
export type {XDSSideNavHeadingProps} from './XDSSideNavHeading';

export {XDSSideNavItem} from './XDSSideNavItem';
export type {XDSSideNavItemProps} from './XDSSideNavItem';

export {XDSSideNavSection} from './XDSSideNavSection';
export type {XDSSideNavSectionProps} from './XDSSideNavSection';

export {XDSSideNavCollapseButton} from './XDSSideNavCollapseButton';
export type {XDSSideNavCollapseButtonProps} from './XDSSideNavCollapseButton';

export {useXDSSideNavCollapse} from './XDSSideNavCollapseContext';

export {
  XDSSideNavRenderContext,
  useXDSSideNavRenderMode,
} from './XDSSideNavRenderContext';
export type {XDSSideNavRenderMode} from './XDSSideNavRenderContext';
