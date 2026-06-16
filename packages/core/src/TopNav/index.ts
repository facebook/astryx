// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

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
export type {XDSTopNavMegaMenuProps} from './XDSTopNavMegaMenu';

export {XDSTopNavMegaMenuItem} from './XDSTopNavMegaMenuItem';
export type {XDSTopNavMegaMenuItemProps} from './XDSTopNavMegaMenuItem';

export {XDSTopNavMegaMenuFeaturedCard} from './XDSTopNavMegaMenuFeaturedCard';
export type {XDSTopNavMegaMenuFeaturedCardProps} from './XDSTopNavMegaMenuFeaturedCard';

export {
  XDSTopNavRenderContext,
  useXDSTopNavRenderMode,
} from './XDSTopNavRenderContext';
export type {XDSTopNavRenderMode} from './XDSTopNavRenderContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTopNav as TopNav,
  XDSTopNavHeading as TopNavHeading,
  XDSTopNavItem as TopNavItem,
  XDSTopNavMegaMenu as TopNavMegaMenu,
  XDSTopNavMegaMenuFeaturedCard as TopNavMegaMenuFeaturedCard,
  XDSTopNavMegaMenuItem as TopNavMegaMenuItem,
  XDSTopNavMenu as TopNavMenu,
  XDSTopNavRenderContext as TopNavRenderContext,
  useXDSTopNavRenderMode as useTopNavRenderMode,
} from '.';
export type {
  XDSTopNavHeadingProps as TopNavHeadingProps,
  XDSTopNavItemProps as TopNavItemProps,
  XDSTopNavMegaMenuFeaturedCardProps as TopNavMegaMenuFeaturedCardProps,
  XDSTopNavMegaMenuItemProps as TopNavMegaMenuItemProps,
  XDSTopNavMegaMenuProps as TopNavMegaMenuProps,
  XDSTopNavMenuItemData as TopNavMenuItemData,
  XDSTopNavMenuProps as TopNavMenuProps,
  XDSTopNavProps as TopNavProps,
  XDSTopNavRenderMode as TopNavRenderMode,
} from '.';
// <compat-aliases:end>
