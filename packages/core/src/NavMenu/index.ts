// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
export {XDSNavHeadingMenu} from './XDSNavHeadingMenu';
export type {XDSNavHeadingMenuProps} from './XDSNavHeadingMenu';
export {XDSNavHeadingMenuItem} from './XDSNavHeadingMenuItem';
export type {XDSNavHeadingMenuItemProps} from './XDSNavHeadingMenuItem';
export {
  XDSNavHeadingMenuContext,
  useXDSNavHeadingMenuContext,
  XDSNavHeadingCloseContext,
  useXDSNavHeadingCloseContext,
} from './XDSNavMenuContext';
export type {
  XDSNavHeadingMenuContextValue,
  XDSNavHeadingCloseContextValue,
  XDSNavHeadingMenuSize,
} from './XDSNavMenuContext';

// Backward compat — use XDSNavHeadingMenuItem instead.
export {XDSNavMenuItem} from './XDSNavMenuItem';
export type {XDSNavMenuItemProps} from './XDSNavMenuItem';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSNavHeadingCloseContext as NavHeadingCloseContext,
  XDSNavHeadingMenu as NavHeadingMenu,
  XDSNavHeadingMenuContext as NavHeadingMenuContext,
  XDSNavHeadingMenuItem as NavHeadingMenuItem,
  XDSNavMenuItem as NavMenuItem,
  useXDSNavHeadingCloseContext as useNavHeadingCloseContext,
  useXDSNavHeadingMenuContext as useNavHeadingMenuContext,
} from '.';
export type {
  XDSNavHeadingCloseContextValue as NavHeadingCloseContextValue,
  XDSNavHeadingMenuContextValue as NavHeadingMenuContextValue,
  XDSNavHeadingMenuItemProps as NavHeadingMenuItemProps,
  XDSNavHeadingMenuProps as NavHeadingMenuProps,
  XDSNavHeadingMenuSize as NavHeadingMenuSize,
  XDSNavMenuItemProps as NavMenuItemProps,
} from '.';
// <compat-aliases:end>
