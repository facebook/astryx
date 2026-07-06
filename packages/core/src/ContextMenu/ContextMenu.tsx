// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file ContextMenu.tsx
 * @input Uses React, StyleX, useLayer (context mode), useListFocus
 * @output Exports ContextMenu component
 * @position Core implementation; consumed by index.ts
 *
 * Right-click context menu anchored to the trigger element via CSS anchor
 * positioning (scroll-follow + auto-flip) — same display:contents wrapper
 * pattern as Tooltip and HoverCard for ref preservation.
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
 * - /packages/core/src/ContextMenu/ContextMenu.test.tsx
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
import {useLayer} from '../Layer/useLayer';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {renderDropdownItems} from '../DropdownMenu/renderDropdownItems';
import {
  DropdownMenuContext,
  type DropdownMenuContextValue,
} from '../DropdownMenu/DropdownMenuContext';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {useLongPress} from '../hooks/useLongPress';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  shadowVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {StyleXStyles} from '../theme/types';
import {themeProps} from '../utils/themeProps';
import type {
  DropdownMenuOption,
  DropdownMenuItemData,
  DropdownMenuDivider,
  DropdownMenuSection,
} from '../DropdownMenu/DropdownMenu';

const styles = stylex.create({
  // Trigger wrapper: invisible (display:contents) — the child element is the
  // effective right-click target. Only sets the iOS long-press callout guard.
  trigger: {
    display: 'contents',
    WebkitTouchCallout: 'none',
  },
  wrapperInline: {
    display: 'inline',
  },
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

export type ContextMenuItemData = DropdownMenuItemData;

export type ContextMenuDivider = DropdownMenuDivider;

export type ContextMenuSection = DropdownMenuSection;

export type ContextMenuOption = DropdownMenuOption;

// =============================================================================
// Props
// =============================================================================

interface ContextMenuBaseProps extends BaseProps {
  /** Ref forwarded to the trigger wrapper element. */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * @deprecated No longer needed — the trigger wrapper uses display:contents
   * so no extra box is introduced. The child element is the effective
   * right-click target and fills its container naturally.
   */
  triggerXstyle?: StyleXStyles | StyleXStyles[];
  /** The trigger area — right-click on this to open the menu. */
  children: ReactNode;
  /** Custom menu width. @default '160px' */
  menuWidth?: number | string;
  /** Size of menu items. @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Accessible name for the menu surface, announced when it opens.
   * @default 'Context menu'
   */
  label?: string;
  /** When true, right-click shows the native browser context menu instead. */
  isDisabled?: boolean;
  /** Called when the menu opens or closes. */
  onOpenChange?: (isOpen: boolean) => void;
  'data-testid'?: string;
}

interface ContextMenuDataProps extends ContextMenuBaseProps {
  /** Array of menu entries (data-driven mode). */
  items: ContextMenuOption[];
  menuContent?: undefined;
}

interface ContextMenuCompoundProps extends ContextMenuBaseProps {
  items?: undefined;
  /** Custom JSX menu content (compound mode). */
  menuContent: ReactNode;
}

export type ContextMenuProps = ContextMenuDataProps | ContextMenuCompoundProps;

// =============================================================================
// ContextMenu
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
 * <ContextMenu
 *   items={[
 *     { label: 'Cut', onClick: () => handleCut() },
 *     { label: 'Copy', onClick: () => handleCopy() },
 *     { type: 'divider' },
 *     { label: 'Paste', onClick: () => handlePaste() },
 *   ]}
 * >
 *   <div>Right-click this area</div>
 * </ContextMenu>
 * ```
 */
function isTextOnly(children: ReactNode): boolean {
  return typeof children === 'string' || typeof children === 'number';
}

export function ContextMenu({
  children,
  menuWidth,
  size = 'md',
  label = 'Context menu',
  isDisabled = false,
  onOpenChange,
  ref,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}: ContextMenuProps) {
  const items = ('items' in props ? props.items : undefined) ?? [];
  const menuContent = 'menuContent' in props ? props.menuContent : undefined;

  const menuId = useId();
  // Element focused before the menu opened, restored when it closes so focus
  // does not fall to <body> after Escape or outside-click dismissal.
  const triggerFocusRef = useRef<HTMLElement | null>(null);

  const [isOpen, setIsOpen] = useState(false);

  const layer = useLayer({
    mode: 'context',
    onHide: useCallback(() => {
      setIsOpen(false);
      onOpenChange?.(false);
      // Restore focus to the element that was focused before opening.
      const toRestore = triggerFocusRef.current;
      triggerFocusRef.current = null;
      if (toRestore && document.contains(toRestore)) {
        toRestore.focus();
      }
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
    focusItem,
  } = useListFocus<HTMLDivElement>({
    itemSelector: '[role="menuitem"]:not([aria-disabled="true"])',
    wrap: false,
    onEscape: closeMenu,
  });

  // First-character typeahead over the enabled menu items (menus-11).
  const getMenuItems = useCallback(
    (): HTMLElement[] =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>(
              '[role="menuitem"]:not([aria-disabled="true"])',
            ),
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

  // Dismiss on Escape from anywhere while open. The menu div's own onKeyDown
  // only fires when focus is inside the menu; a document-level listener is
  // kept as a reliable fallback Escape path (e.g. if focus has moved out of
  // the menu). Guards against IME composition-cancel.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') {
        return;
      }
      if (e.isComposing || e.keyCode === 229) {
        return;
      }
      e.preventDefault();
      closeMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

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
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      listNavKeyDown(e);
    },
    [listNavKeyDown, typeahead],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) {
        return;
      }
      e.preventDefault();
      // Remember the element focused before opening so we can restore it on
      // close (Escape or outside-click), instead of dropping focus to <body>.
      triggerFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : (e.currentTarget as HTMLElement);
      layer.show();
      requestAnimationFrame(() => focusFirst());
    },
    [isDisabled, layer, focusFirst],
  );

  // Touch long-press invocation (menus-8). iOS Safari never synthesizes a
  // `contextmenu` event on long-press, so a context menu is otherwise
  // unreachable on touch. Open the menu once the press is held long enough
  // (see useLongPress for timer/move-cancel/cleanup logic). Position is
  // handled by CSS anchor positioning on the trigger element.
  const longPressHandlers = useLongPress({
    disabled: isDisabled,
    onLongPress: useCallback(
      (_point: {x: number; y: number}) => {
        layer.show();
        requestAnimationFrame(() => focusFirst());
      },
      [layer, focusFirst],
    ),
  });

  const popoverXstyle = menuWidth
    ? styles.popoverCustomWidth(menuWidth)
    : styles.popover;

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({closeMenu, menuSize: size}),
    [closeMenu, size],
  );

  const resolvedMenuContent =
    props.items !== undefined ? renderDropdownItems(items) : menuContent;

  // --- Trigger wrapper ---
  // display:contents so no extra box is introduced — matches Tooltip and
  // HoverCard. The child element becomes the effective right-click target.
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textOnly = isTextOnly(children);

  useIsomorphicLayoutEffect(() => {
    if (textOnly) {
      return;
    }
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }
    const firstChild = wrapper.firstElementChild as HTMLElement | null;
    if (!firstChild) {
      return;
    }
    layer.ref(firstChild);
    return () => {
      layer.ref(null);
    };
  }, [textOnly, layer.ref]);

  // Text-only children: wrap in an inline span with the ref directly
  if (textOnly) {
    return (
      <>
        <span
          ref={layer.ref}
          onContextMenu={handleContextMenu}
          {...longPressHandlers}
          data-testid={testId}
          {...stylex.props(styles.trigger, styles.wrapperInline)}>
          {children}
        </span>
        {layer.render(
          <div
            ref={listRef}
            id={menuId}
            role="menu"
            aria-label={label}
            onKeyDown={listKeyDown}
            {...mergeProps(
              themeProps('context-menu'),
              stylex.props(styles.menu, xstyle),
              className,
              style,
            )}>
            <DropdownMenuContext value={contextValue}>
              {resolvedMenuContent}
            </DropdownMenuContext>
          </div>,
          {
            placement: 'below',
            alignment: 'start',
            xstyle: [popoverXstyle, layerAnimations.below],
          },
        )}
      </>
    );
  }

  // Element children: use display:contents wrapper, ref on first child
  return (
    <>
      <div
        ref={wrapperRef}
        onContextMenu={handleContextMenu}
        {...longPressHandlers}
        data-testid={testId}
        {...stylex.props(styles.trigger)}>
        {children}
      </div>
      {layer.render(
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={listKeyDown}
          {...mergeProps(
            themeProps('context-menu'),
            stylex.props(styles.menu, xstyle),
            className,
            style,
          )}>
          <DropdownMenuContext value={contextValue}>
            {resolvedMenuContent}
          </DropdownMenuContext>
        </div>,
        {
          placement: 'below',
          alignment: 'start',
          xstyle: [popoverXstyle, layerAnimations.below],
        },
      )}
    </>
  );
}

ContextMenu.displayName = 'ContextMenu';
