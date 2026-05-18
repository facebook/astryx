// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useListFocus} from '../hooks/useListFocus';
import {
  XDSNavHeadingMenuContext,
  useXDSNavHeadingCloseContext,
  type XDSNavHeadingMenuSize,
} from './XDSNavMenuContext';

const styles = stylex.create({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
});

const sizeStyles = stylex.create({
  sm: {
    minWidth: 160,
  },
  md: {
    minWidth: 200,
  },
  lg: {
    minWidth: 240,
  },
});

export interface XDSNavHeadingMenuProps {
  /** Menu items (XDSNavHeadingMenuItem, dividers, custom content). */
  children: ReactNode;

  /**
   * Size — controls min-width and flows to items for padding.
   * @default 'md'
   */
  size?: XDSNavHeadingMenuSize;

  /**
   * Minimum width override. Takes precedence over size-based defaults.
   */
  minWidth?: number | string;

  /**
   * StyleX styles for layout customization.
   * Must be a `stylex.create()` value.
   */
  xstyle?: StyleXStyles;

  /** CSS class name(s) appended to the root element. */
  className?: string;

  /** Inline styles applied to the root element. */
  style?: React.CSSProperties;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

/**
 * Accessible menu container for nav heading popovers.
 *
 * Provides `role="menu"` with arrow-key navigation (Home/End/Escape)
 * and a size context that flows to child items for consistent padding.
 * Pass as the `menu` prop of XDSSideNavHeading or XDSTopNavHeading.
 *
 * The parent heading component injects the close callback via context,
 * so items automatically dismiss the popover on selection.
 *
 * @example
 * ```
 * <XDSSideNavHeading
 *   heading="Products"
 *   menu={
 *     <XDSNavHeadingMenu size="lg">
 *       <XDSNavHeadingMenuItem label="Dashboard" href="/dashboard" />
 *       <XDSNavHeadingMenuItem label="Analytics" href="/analytics" />
 *     </XDSNavHeadingMenu>
 *   }
 * />
 * ```
 */
export function XDSNavHeadingMenu({
  children,
  size = 'md',
  minWidth,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
}: XDSNavHeadingMenuProps) {
  const closeCtx = useXDSNavHeadingCloseContext();
  const closeMenu = closeCtx?.closeMenu;

  const {listRef, handleKeyDown} = useListFocus({
    onEscape: closeMenu,
  });

  const ctx = useMemo(
    () => ({
      closeMenu: closeMenu ?? (() => {}),
      size,
    }),
    [closeMenu, size],
  );

  const inlineStyle = minWidth != null ? {...styleProp, minWidth} : styleProp;

  return (
    <XDSNavHeadingMenuContext.Provider value={ctx}>
      <div
        ref={listRef as React.RefObject<HTMLDivElement>}
        role="menu"
        onKeyDown={handleKeyDown}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('nav-heading-menu', {size}),
          stylex.props(styles.root, sizeStyles[size], xstyle),
          className,
          inlineStyle,
        )}>
        {children}
      </div>
    </XDSNavHeadingMenuContext.Provider>
  );
}

XDSNavHeadingMenu.displayName = 'XDSNavHeadingMenu';
