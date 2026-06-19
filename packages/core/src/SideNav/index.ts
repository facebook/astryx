// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports SideNav components and types
 * @output Exports SideNav, SideNavHeading, SideNavItem, SideNavSection
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/SideNav/SideNav.doc.mjs
 */

export {SideNav} from './SideNav';
export type {SideNavProps} from './SideNav';

export {SideNavHeading} from './SideNavHeading';
export type {SideNavHeadingProps} from './SideNavHeading';

export {SideNavItem} from './SideNavItem';
export type {SideNavItemProps} from './SideNavItem';

export {SideNavSection} from './SideNavSection';
export type {SideNavSectionProps} from './SideNavSection';

export {SideNavCollapseButton} from './SideNavCollapseButton';
export type {SideNavCollapseButtonProps} from './SideNavCollapseButton';

export {useSideNavCollapse} from './SideNavCollapseContext';
export type {
  SideNavCollapseState,
  SideNavImperativeCollapseHandle,
} from './SideNavCollapseContext';

export {
  SideNavRenderContext,
  useSideNavRenderMode,
} from './SideNavRenderContext';
export type {SideNavRenderMode} from './SideNavRenderContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  SideNav as XDSSideNav,
  SideNavCollapseButton as XDSSideNavCollapseButton,
  SideNavHeading as XDSSideNavHeading,
  SideNavItem as XDSSideNavItem,
  SideNavRenderContext as XDSSideNavRenderContext,
  SideNavSection as XDSSideNavSection,
  useSideNavCollapse as useXDSSideNavCollapse,
  useSideNavRenderMode as useXDSSideNavRenderMode,
} from '.';
export type {
  SideNavCollapseButtonProps as XDSSideNavCollapseButtonProps,
  SideNavCollapseState as XDSSideNavCollapseState,
  SideNavHeadingProps as XDSSideNavHeadingProps,
  SideNavImperativeCollapseHandle as XDSSideNavImperativeCollapseHandle,
  SideNavItemProps as XDSSideNavItemProps,
  SideNavProps as XDSSideNavProps,
  SideNavRenderMode as XDSSideNavRenderMode,
  SideNavSectionProps as XDSSideNavSectionProps,
} from '.';
// <compat-aliases:end>
