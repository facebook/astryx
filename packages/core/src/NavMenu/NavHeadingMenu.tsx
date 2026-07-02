// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavHeadingMenu.tsx
 * @input Uses React, StyleX, useListFocus, NavMenuContext
 * @output Exports NavHeadingMenu component and NavHeadingMenuProps type
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update:
 * - /packages/core/src/NavMenu/index.ts
 */

import React, {useCallback, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {themeProps} from '../utils/themeProps';
import {
  NavHeadingMenuContext,
  useNavHeadingCloseContext,
  type NavHeadingMenuSize,
} from './NavMenuContext';

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

export interface NavHeadingMenuProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /** Menu items (NavHeadingMenuItem, dividers, custom content). */
  children: ReactNode;

  /**
   * Size — controls min-width and flows to items for padding.
   * @default 'md'
   */
  size?: NavHeadingMenuSize;

  /**
   * Minimum width override. Takes precedence over size-based defaults.
   */
  minWidth?: number | string;
}

/**
 * Accessible menu container for nav heading popovers.
 *
 * Provides `role="menu"` with arrow-key navigation (Home/End/Escape)
 * and a size context that flows to child items for consistent padding.
 * Pass as the `menu` prop of SideNavHeading or TopNavHeading.
 *
 * The parent heading component injects the close callback via context,
 * so items automatically dismiss the popover on selection.
 *
 * @example
 * ```
 * <SideNavHeading
 *   heading="Products"
 *   menu={
 *     <NavHeadingMenu size="lg">
 *       <NavHeadingMenuItem label="Dashboard" href="/dashboard" />
 *       <NavHeadingMenuItem label="Analytics" href="/analytics" />
 *     </NavHeadingMenu>
 *   }
 * />
 * ```
 */
export function NavHeadingMenu({
  ref,
  children,
  size = 'md',
  minWidth,
  xstyle,
  className,
  style: styleProp,
  'data-testid': testId,
}: NavHeadingMenuProps) {
  const closeCtx = useNavHeadingCloseContext();
  const closeMenu = closeCtx?.closeMenu;

  const {listRef, handleKeyDown, focusItem} = useListFocus({
    onEscape: closeMenu,
  });

  // First-character typeahead over the menu items (menus-11).
  const getMenuItems = useCallback(
    (): HTMLElement[] =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]'),
          )
        : [],
    [listRef],
  );
  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getMenuItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
    isDisabled: index =>
      getMenuItems()[index]?.getAttribute('aria-disabled') === 'true',
  });

  // Extend useListFocus with Enter/Space activation. Items rendered without an
  // `href` are `<div role="menuitem">` elements, which have no native keyboard
  // activation — without this, Enter/Space on a focused onClick-only item does
  // nothing. Anchor items (with `href`) already activate on Enter natively.
  const listKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement as HTMLElement | null;
        if (focused?.getAttribute('role') === 'menuitem') {
          e.preventDefault();
          focused.click();
          return;
        }
      }
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      handleKeyDown(e);
    },
    [handleKeyDown, typeahead],
  );

  const ctx = useMemo(
    () => ({
      closeMenu: closeMenu ?? (() => {}),
      size,
    }),
    [closeMenu, size],
  );

  const inlineStyle = minWidth != null ? {...styleProp, minWidth} : styleProp;

  return (
    <NavHeadingMenuContext value={ctx}>
      <div
        ref={mergeRefs(ref, listRef)}
        role="menu"
        onKeyDown={listKeyDown}
        data-testid={testId}
        {...mergeProps(
          themeProps('nav-heading-menu', {size}),
          stylex.props(styles.root, sizeStyles[size], xstyle),
          className,
          inlineStyle,
        )}>
        {children}
      </div>
    </NavHeadingMenuContext>
  );
}

NavHeadingMenu.displayName = 'NavHeadingMenu';
