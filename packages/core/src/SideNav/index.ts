// Copyright (c) Meta Platforms, Inc. and affiliates.

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
export type {
  XDSSideNavCollapseState,
  XDSSideNavImperativeCollapseHandle,
} from './XDSSideNavCollapseContext';

export {
  XDSSideNavRenderContext,
  useXDSSideNavRenderMode,
} from './XDSSideNavRenderContext';
export type {XDSSideNavRenderMode} from './XDSSideNavRenderContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSSideNav as SideNav,
  XDSSideNavCollapseButton as SideNavCollapseButton,
  XDSSideNavHeading as SideNavHeading,
  XDSSideNavItem as SideNavItem,
  XDSSideNavRenderContext as SideNavRenderContext,
  XDSSideNavSection as SideNavSection,
  useXDSSideNavCollapse as useSideNavCollapse,
  useXDSSideNavRenderMode as useSideNavRenderMode,
} from '.';
export type {
  XDSSideNavCollapseButtonProps as SideNavCollapseButtonProps,
  XDSSideNavCollapseState as SideNavCollapseState,
  XDSSideNavHeadingProps as SideNavHeadingProps,
  XDSSideNavImperativeCollapseHandle as SideNavImperativeCollapseHandle,
  XDSSideNavItemProps as SideNavItemProps,
  XDSSideNavProps as SideNavProps,
  XDSSideNavRenderMode as SideNavRenderMode,
  XDSSideNavSectionProps as SideNavSectionProps,
} from '.';
// <compat-aliases:end>
