// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file XDSContextMenu.tsx
 * @input Uses React, StyleX, useXDSLayer (fixed mode), useListFocus
 * @output Exports XDSContextMenu component
 * @position Core implementation; consumed by index.ts
 *
 * Right-click context menu positioned at cursor coordinates.
 * Reuses DropdownMenu item rendering and keyboard navigation.
 *
 * Supports two content modes with a single keyboard/focus path:
 * - **Data-driven**: pass `items` array (converted to components internally)
 * - **Compound-component**: pass `menuContent` JSX directly
 *
 * Both modes use useListFocus for DOM-based keyboard navigation.
 * Open state is managed internally — right-click opens, click-outside/Escape closes.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ContextMenu/ContextMenu.doc.mjs
 * - /packages/core/src/ContextMenu/XDSContextMenu.test.tsx
 * - /packages/core/src/ContextMenu/index.ts
 * - /apps/storybook/stories/ContextMenu.stories.tsx
 * - /packages/cli/templates/blocks/components/ContextMenu/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSLayer} from '../Layer/useXDSLayer';
import {renderXDSDropdownItems} from '../DropdownMenu/renderXDSDropdownItems';
import {
  XDSDropdownMenuContext,
  type XDSDropdownMenuContextValue,
} from '../DropdownMenu/XDSDropdownMenuContext';
import {useListFocus} from '../hooks/useListFocus';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';
import type {
  XDSDropdownMenuOption,
  XDSDropdownMenuItemData,
  XDSDropdownMenuDivider,
  XDSDropdownMenuSection,
} from '../DropdownMenu/XDSDropdownMenu';

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
    backgroundColor: colorVars['--color-background-popover'],
    boxShadow: shadowVars['--shadow-low'],
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  popover: {
    minWidth: '160px',
  },
  popoverCustomWidth: (width: string | number) => ({
    minWidth: typeof width === 'number' ? `${width}px` : width,
  }),
});

// =============================================================================
// Types
// =============================================================================

export type XDSContextMenuItemData = XDSDropdownMenuItemData;

export type XDSContextMenuDivider = XDSDropdownMenuDivider;

export type XDSContextMenuSection = XDSDropdownMenuSection;

export type XDSContextMenuOption = XDSDropdownMenuOption;

// =============================================================================
// Props
// =============================================================================

interface XDSContextMenuBaseProps extends XDSBaseProps {
  /** Ref forwarded to the trigger wrapper element. */
  ref?: React.Ref<HTMLDivElement>;
  /** The trigger area — right-click on this to open the menu. */
  children: ReactNode;
  /** Custom menu width. @default '160px' */
  menuWidth?: number | string;
  /** Size of menu items. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Whether to auto-focus the first menu item when the menu opens.
   * Set to `false` for inline showcases or documentation previews.
   * @default true
   */
  hasAutoFocus?: boolean;
  /** When true, right-click shows the native browser context menu instead. */
  isDisabled?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  'data-testid'?: string;
}

interface XDSContextMenuDataProps extends XDSContextMenuBaseProps {
  /** Array of menu entries (data-driven mode). */
  items: XDSContextMenuOption[];
  menuContent?: undefined;
}

interface XDSContextMenuCompoundProps extends XDSContextMenuBaseProps {
  items?: undefined;
  /** Custom JSX menu content (compound mode). */
  menuContent: ReactNode;
}

export type XDSContextMenuProps =
  | XDSContextMenuDataProps
  | XDSContextMenuCompoundProps;

// =============================================================================
// XDSContextMenu
// =============================================================================

/**
 * A context menu component that appears on right-click at cursor position.
 *
 * Supports two modes:
 * - **Data-driven**: pass `items` for static menus
 * - **Compound-component**: pass `menuContent` JSX for dynamic menus
 *
 * Both modes share the same DOM-based keyboard navigation via useListFocus.
 *
 * @example
 * ```
 * <XDSContextMenu
 *   items={[
 *     { label: 'Cut', onClick: () => handleCut() },
 *     { label: 'Copy', onClick: () => handleCopy() },
 *     { type: 'divider' },
 *     { label: 'Paste', onClick: () => handlePaste() },
 *   ]}
 * >
 *   <div>Right-click this area</div>
 * </XDSContextMenu>
 * ```
 */
export function XDSContextMenu({
  children,
  menuWidth,
  size = 'md',
  hasAutoFocus = true,
  isDisabled = false,
  onOpenChange,
  ref,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}: XDSContextMenuProps) {
  const items = ('items' in props ? props.items : undefined) ?? [];
  const menuContent = 'menuContent' in props ? props.menuContent : undefined;

  const menuId = useId();
  const positionRef = useRef({x: 0, y: 0});
  // eslint-disable-next-line @eslint-react/no-unused-state -- isOpen triggers the click-outside effect
  const [isOpen, setIsOpen] = useState(false);

  const layer = useXDSLayer({
    mode: 'fixed',
    onHide: useCallback(() => {
      setIsOpen(false);
      onOpenChange?.(false);
    }, [onOpenChange]),
    onShow: useCallback(() => {
      setIsOpen(true);
      onOpenChange?.(true);
    }, [onOpenChange]),
    lightDismiss: false,
  });

  const closeMenu = useCallback(() => {
    layer.hide();
  }, [layer]);

  const {
    listRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
  } = useListFocus<HTMLDivElement>({
    itemSelector: '[role="menuitem"]:not([aria-disabled="true"])',
    wrap: false,
    onEscape: closeMenu,
  });

  // Dismiss on any click outside the menu. We use popover="manual" (not
  // "auto") because the native light-dismiss treats the mouseup from the
  // opening right-click as a dismiss event. Handling it ourselves via
  // mousedown avoids that race.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleClickOutside = (e: MouseEvent) => {
      const menu = listRef.current;
      if (menu && !menu.contains(e.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeMenu, listRef]);

  const listKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const focused = document.activeElement as HTMLElement | null;
        if (focused?.getAttribute('role') === 'menuitem') {
          focused.click();
        }
        return;
      }
      listNavKeyDown(e);
    },
    [listNavKeyDown],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) {
        return;
      }
      e.preventDefault();
      positionRef.current = {x: e.clientX, y: e.clientY};
      layer.show();
      if (hasAutoFocus) {
        requestAnimationFrame(() => focusFirst());
      }
    },
    [isDisabled, layer, hasAutoFocus, focusFirst],
  );

  const popoverXstyle = menuWidth
    ? styles.popoverCustomWidth(menuWidth)
    : styles.popover;

  const contextValue = useMemo<XDSDropdownMenuContextValue>(
    () => ({closeMenu, menuSize: size}),
    [closeMenu, size],
  );

  const resolvedMenuContent =
    props.items !== undefined ? renderXDSDropdownItems(items) : menuContent;

  return (
    <>
      <div ref={ref} onContextMenu={handleContextMenu} data-testid={testId}>
        {children}
      </div>

      {layer.render(
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          onKeyDown={listKeyDown}
          {...mergeProps(
            xdsClassName('context-menu'),
            stylex.props(styles.menu, xstyle),
            className,
            style,
          )}>
          <XDSDropdownMenuContext value={contextValue}>
            {resolvedMenuContent}
          </XDSDropdownMenuContext>
        </div>,
        {
          x: positionRef.current.x,
          y: positionRef.current.y,
          xstyle: [popoverXstyle, layerAnimations.below],
        },
      )}
    </>
  );
}

XDSContextMenu.displayName = 'XDSContextMenu';
