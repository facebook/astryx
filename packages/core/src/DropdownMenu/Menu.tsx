// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Menu.tsx
 * @input React, StyleX, useListFocus, useTypeahead, DropdownMenu context + item roles
 * @output Exports Menu — a role=menu body with no trigger and no layer of its own
 * @position Sub-component of DropdownMenu; place inside any already-open layer
 *   (ComplexSelector, a custom popover) or inside DropdownMenu / ContextMenu.
 *
 * The popup body DropdownMenu already had — role="menu", roving focus,
 * typeahead, Enter/Space, Tab-closes, context provider — without a trigger
 * and without a layer. DropdownMenu is trigger + layer + Menu. A
 * ComplexSelector consumer who needs a second level composes Menu +
 * DropdownMenuSubMenu instead of hand-rolling a role="dialog".
 *
 * Keyboard focus on open is the one-line footgun: calling focusFirst() on
 * mount while the ancestor popover is still closed leaves the menu dead.
 * Pass `isOpen` from the layer (ComplexSelector's render-state `isOpen`,
 * or DropdownMenu's popover) so focus runs after the surface is shown.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/DropdownMenu/Menu.doc.mjs
 * - /packages/core/src/DropdownMenu/Menu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /packages/core/src/DropdownMenu/DropdownMenu.tsx
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {composeEventHandlers, mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {
  MENU_ITEM_ROLES,
  MENU_ITEM_SELECTOR,
  MENU_BOUNDARY_SELECTOR,
} from './menuItemRoles';
import {
  DropdownMenuContext,
  type DropdownMenuContextValue,
  type DropdownMenuSize,
} from './DropdownMenuContext';

const styles = stylex.create({
  menu: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    maxHeight: '300px',
    overflowY: 'auto',
    '--_dropdown-menu-radius': radiusVars['--radius-container'],
    '--_dropdown-menu-padding': spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-1'],
    borderRadius: 'var(--_dropdown-menu-radius)',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});

export type MenuFocusOnOpen = 'item' | 'container' | 'none';

export interface MenuProps extends BaseProps<HTMLDivElement> {
  /** Menu rows: DropdownMenuItem, DropdownMenuSubMenu, dividers, etc. */
  children?: ReactNode;
  /** Accessible name announced as e.g. "Models menu". */
  label: string;
  /**
   * Called on Tab (APG menu-button: Tab closes) and provided to items as
   * `closeMenu` so a leaf selection dismisses the stack.
   */
  onClose: () => void;
  /**
   * Whether the ancestor layer is open. Focus-on-open runs when this becomes
   * true — not on mount — so a menu rendered inside a closed popover is not
   * left unfocusable. Defaults to true for standalone usage.
   */
  isOpen?: boolean;
  /**
   * Where to put focus when `isOpen` becomes true.
   * - `item`: first enabled item (keyboard / programmatic open)
   * - `container`: the menu itself, so no item reads as pre-selected (pointer)
   * - `none`: do not move focus
   * @default 'item'
   */
  focusOnOpen?: MenuFocusOnOpen;
  /** Item size, forwarded through DropdownMenuContext. @default 'md' */
  size?: DropdownMenuSize;
  /** Ref to the `role="menu"` container. */
  ref?: React.Ref<HTMLDivElement>;
}

/**
 * A standalone `role="menu"` with roving focus, typeahead, Enter/Space
 * activation, and Tab-closes. No trigger, no layer — compose it into an
 * already-open surface such as ComplexSelector.
 *
 * @example
 * ```
 * <ComplexSelector
 *   label="Model"
 *   value={value}
 *   onChange={setValue}
 *   triggerLabel={value}
 *   popupRole="none">
 *   {(_v, commit, close, state) => (
 *     <Menu
 *       label="Model"
 *       onClose={close}
 *       isOpen={state.isOpen}>
 *       <DropdownMenuItem
 *         label="GPT-4"
 *         onClick={() => commit('GPT-4')}
 *       />
 *       <DropdownMenuSubMenu label="More models">
 *         <DropdownMenuItem
 *           label="Fable 5"
 *           onClick={() => commit('Fable 5')}
 *         />
 *       </DropdownMenuSubMenu>
 *     </Menu>
 *   )}
 * </ComplexSelector>
 * ```
 */
export function Menu({
  children,
  label,
  onClose,
  isOpen = true,
  focusOnOpen = 'item',
  size = 'md',
  className,
  style,
  xstyle,
  id,
  ref,
  onKeyDown: onKeyDownProp,
  ...rest
}: MenuProps) {
  const wasOpenRef = useRef(false);

  const {
    listRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
    focusItem,
    ownsEvent,
    getItems: getMenuItems,
  } = useListFocus<HTMLDivElement>({
    itemSelector: MENU_ITEM_SELECTOR,
    boundarySelector: MENU_BOUNDARY_SELECTOR,
    wrap: false,
    onEscape: onClose,
  });

  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getMenuItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
  });

  useEffect(() => {
    if (!isOpen) {
      wasOpenRef.current = false;
      return;
    }
    // This open was already handled — a prop change is not a re-open.
    if (wasOpenRef.current || focusOnOpen === 'none') {
      wasOpenRef.current = true;
      return;
    }
    const frameId = requestAnimationFrame(() => {
      // Mark the open handled only once the frame actually runs. React
      // double-invokes mount effects under StrictMode and re-runs them on
      // Fast Refresh; committing before the frame would make the cancelled
      // first pass swallow the transition, and a Menu mounted already open
      // (the default `isOpen`) would never take focus.
      wasOpenRef.current = true;
      const node = listRef.current;
      if (node == null) {
        return;
      }
      // The ancestor popover may already have closed (light-dismiss) before
      // this frame. Don't steal focus back from the trigger.
      const layer = node.closest('[popover]');
      if (layer != null && !layer.matches(':popover-open')) {
        return;
      }
      if (focusOnOpen === 'container' || !focusFirst()) {
        node.focus();
      }
    });
    return () => cancelAnimationFrame(frameId);
  }, [isOpen, focusOnOpen, focusFirst, listRef]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!ownsEvent(e)) {
        return;
      }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const focused = document.activeElement as HTMLElement | null;
        if (
          focused &&
          MENU_ITEM_ROLES.has(focused.getAttribute('role') ?? '')
        ) {
          focused.click();
        }
        return;
      }
      if (e.key === 'Tab') {
        onClose();
        return;
      }
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      listNavKeyDown(e);
    },
    [listNavKeyDown, onClose, typeahead, ownsEvent],
  );

  // `onKeyDown` is part of BaseProps, so a consumer may pass one. Run theirs
  // first; calling preventDefault opts that key out of menu navigation.
  const keyDown = useMemo(
    () => composeEventHandlers(onKeyDownProp, handleKeyDown),
    [onKeyDownProp, handleKeyDown],
  );

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({closeMenu: onClose, menuSize: size}),
    [onClose, size],
  );

  return (
    <div
      {...rest}
      ref={mergeRefs(listRef, ref)}
      id={id}
      role="menu"
      tabIndex={-1}
      aria-label={label}
      onKeyDown={keyDown}
      {...mergeProps(
        themeProps('dropdown-menu'),
        stylex.props(styles.menu, xstyle),
        className,
        style,
      )}>
      <DropdownMenuContext value={contextValue}>{children}</DropdownMenuContext>
    </div>
  );
}

Menu.displayName = 'Menu';
