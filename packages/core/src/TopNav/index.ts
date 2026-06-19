// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports from TopNav component files
 * @output Exports TopNav and companion components
 * @position Entry point for TopNav module
 *
 * SYNC: When modified, update /packages/core/src/TopNav/TopNav.doc.mjs
 */

export {TopNav} from './TopNav';
export type {TopNavProps} from './TopNav';

export {TopNavHeading} from './TopNavHeading';
export type {TopNavHeadingProps} from './TopNavHeading';

export {TopNavItem} from './TopNavItem';
export type {TopNavItemProps} from './TopNavItem';

export {TopNavMenu} from './TopNavMenu';
export type {TopNavMenuProps, TopNavMenuItemData} from './TopNavMenu';

export {TopNavMegaMenu} from './TopNavMegaMenu';
export type {TopNavMegaMenuProps} from './TopNavMegaMenu';

export {TopNavMegaMenuItem} from './TopNavMegaMenuItem';
export type {TopNavMegaMenuItemProps} from './TopNavMegaMenuItem';

export {TopNavMegaMenuFeaturedCard} from './TopNavMegaMenuFeaturedCard';
export type {TopNavMegaMenuFeaturedCardProps} from './TopNavMegaMenuFeaturedCard';

export {
  TopNavRenderContext,
  useTopNavRenderMode,
} from './TopNavRenderContext';
export type {TopNavRenderMode} from './TopNavRenderContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  TopNav as XDSTopNav,
  TopNavHeading as XDSTopNavHeading,
  TopNavItem as XDSTopNavItem,
  TopNavMegaMenu as XDSTopNavMegaMenu,
  TopNavMegaMenuFeaturedCard as XDSTopNavMegaMenuFeaturedCard,
  TopNavMegaMenuItem as XDSTopNavMegaMenuItem,
  TopNavMenu as XDSTopNavMenu,
  TopNavRenderContext as XDSTopNavRenderContext,
  useTopNavRenderMode as useXDSTopNavRenderMode,
} from '.';
export type {
  TopNavHeadingProps as XDSTopNavHeadingProps,
  TopNavItemProps as XDSTopNavItemProps,
  TopNavMegaMenuFeaturedCardProps as XDSTopNavMegaMenuFeaturedCardProps,
  TopNavMegaMenuItemProps as XDSTopNavMegaMenuItemProps,
  TopNavMegaMenuProps as XDSTopNavMegaMenuProps,
  TopNavMenuItemData as XDSTopNavMenuItemData,
  TopNavMenuProps as XDSTopNavMenuProps,
  TopNavProps as XDSTopNavProps,
  TopNavRenderMode as XDSTopNavRenderMode,
} from '.';
// <compat-aliases:end>
