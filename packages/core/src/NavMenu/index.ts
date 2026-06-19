// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
export {NavHeadingMenu} from './NavHeadingMenu';
export type {NavHeadingMenuProps} from './NavHeadingMenu';
export {NavHeadingMenuItem} from './NavHeadingMenuItem';
export type {NavHeadingMenuItemProps} from './NavHeadingMenuItem';
export {
  NavHeadingMenuContext,
  useNavHeadingMenuContext,
  NavHeadingCloseContext,
  useNavHeadingCloseContext,
} from './NavMenuContext';
export type {
  NavHeadingMenuContextValue,
  NavHeadingCloseContextValue,
  NavHeadingMenuSize,
} from './NavMenuContext';

// Backward compat — use NavHeadingMenuItem instead.
export {NavMenuItem} from './NavMenuItem';
export type {NavMenuItemProps} from './NavMenuItem';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  NavHeadingCloseContext as XDSNavHeadingCloseContext,
  NavHeadingMenu as XDSNavHeadingMenu,
  NavHeadingMenuContext as XDSNavHeadingMenuContext,
  NavHeadingMenuItem as XDSNavHeadingMenuItem,
  NavMenuItem as XDSNavMenuItem,
  useNavHeadingCloseContext as useXDSNavHeadingCloseContext,
  useNavHeadingMenuContext as useXDSNavHeadingMenuContext,
} from '.';
export type {
  NavHeadingCloseContextValue as XDSNavHeadingCloseContextValue,
  NavHeadingMenuContextValue as XDSNavHeadingMenuContextValue,
  NavHeadingMenuItemProps as XDSNavHeadingMenuItemProps,
  NavHeadingMenuProps as XDSNavHeadingMenuProps,
  NavHeadingMenuSize as XDSNavHeadingMenuSize,
  NavMenuItemProps as XDSNavMenuItemProps,
} from '.';
// <compat-aliases:end>
