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
