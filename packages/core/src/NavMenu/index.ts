'use client';
export {XDSNavHeadingMenu} from './XDSNavHeadingMenu';
export type {XDSNavHeadingMenuProps} from './XDSNavHeadingMenu';
export {XDSNavHeadingMenuItem} from './XDSNavHeadingMenuItem';
export type {XDSNavHeadingMenuItemProps} from './XDSNavHeadingMenuItem';
export {
  XDSNavMenuContext,
  useXDSNavMenuContext,
  XDSNavMenuCloseContext,
  useXDSNavMenuCloseContext,
} from './XDSNavMenuContext';
export type {
  XDSNavMenuContextValue,
  XDSNavMenuCloseContextValue,
  XDSNavHeadingMenuSize,
} from './XDSNavMenuContext';

// Backward compat — use XDSNavHeadingMenuItem instead.
export {XDSNavMenuItem} from './XDSNavMenuItem';
export type {XDSNavMenuItemProps} from './XDSNavMenuItem';
