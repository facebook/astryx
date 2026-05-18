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
