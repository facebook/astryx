// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file index.server.ts
 * @input Imports the TopNav and TopNavItem server shells, and the other
 *   TopNav parts from their client modules
 * @output Exports the same names as index.ts
 * @position The `react-server` entry of `@astryxdesign/core/TopNav`. TopNav
 *   and TopNavItem render on the server (TopNavShell.tsx,
 *   TopNavItemShell.tsx); the heading, menus, mega menu and render context
 *   are client modules, as they are through index.ts.
 *
 * SYNC: When modified, update index.ts (the two entries export the same
 * names) and the `./TopNav` entry of /packages/core/package.json.
 */

export {TopNav} from './TopNavShell';
export type {TopNavProps} from './TopNav';

export {TopNavHeading} from './TopNavHeading';
export type {TopNavHeadingProps} from './TopNavHeading';

export {TopNavItem} from './TopNavItemShell';
export type {TopNavItemProps} from './TopNavItem';

export {TopNavMenu} from './TopNavMenu';
export type {TopNavMenuProps, TopNavMenuItemData} from './TopNavMenu';

export {TopNavMegaMenu} from './TopNavMegaMenu';
export type {TopNavMegaMenuProps} from './TopNavMegaMenu';

export {TopNavMegaMenuItem} from './TopNavMegaMenuItem';
export type {TopNavMegaMenuItemProps} from './TopNavMegaMenuItem';

export {TopNavMegaMenuFeaturedCard} from './TopNavMegaMenuFeaturedCard';
export type {TopNavMegaMenuFeaturedCardProps} from './TopNavMegaMenuFeaturedCard';

export {TopNavRenderContext, useTopNavRenderMode} from './TopNavRenderContext';
export type {TopNavRenderMode} from './TopNavRenderContext';
