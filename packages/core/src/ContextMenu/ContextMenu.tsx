// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file ContextMenu.tsx
 * @input Uses React, StyleX, useLayer (context mode), useListFocus
 * @output Exports ContextMenu component
 * @position Core implementation; consumed by index.ts
 *
 * Right-click context menu positioned at the cursor. The cursor point is
 * captured as an offset *inside the trigger* and materialized as a zero-size
 * anchor element, so the menu is positioned relative to the trigger's context
 * (via CSS anchor positioning) rather than the viewport. It therefore follows
 * the content on scroll and auto-flips at viewport edges, while still appearing
 * under the cursor.
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
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {StyleXStyles} from '../theme/types';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import type {
  DropdownMenuOption,
  DropdownMenuItemData,
  DropdownMenuDivider,
  DropdownMenuSection,
} from '../DropdownMenu/DropdownMenu';

const styles = stylex.create({
  // Trigger wrapper: suppress the iOS long-press callout/selection so the
  // long-press opens our context menu instead of the native text/callout UI.
  // `position: relative` establishes the containing block for the absolutely
  // positioned cursor anchor below, so the anchor point tracks the trigger
  // (and scrolls with it) instead of the page.
  trigger: {
    position: 'relative',
    WebkitTouchCallout: 'none',
  },
  // Zero-size anchor placed at the cursor point within the trigger. The menu
  // is anchored to this element, so it sits under the cursor yet is positioned
  // relative to the trigger's context — it follows the content on scroll and
  // the browser can auto-flip it against the viewport edges.
  cursorAnchor: {
    position: 'absolute',
    width: 0,
    height: 0,
    pointerEvents: 'none',
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
    userSelect: 'none',
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
   * Styles applied to the trigger wrapper element (the right-click target).
   * By default the trigger is a plain block that hugs its content — pass a
   * fill style (e.g. `width/height: 100%`) when the whole parent area should
   * be right-clickable (as the Table does for full-cell context menus).
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
export function ContextMenu({
  children,
  menuWidth,
  size = 'md',
  label: labelFromProps,
  isDisabled = false,
  onOpenChange,
  ref,
  className,
  style,
  xstyle,
  triggerXstyle,
  'data-testid': testId,
  ...props
}: ContextMenuProps) {
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.contextMenu.label');
  const items = ('items' in props ? props.items : undefined) ?? [];
  const menuContent = 'menuContent' in props ? props.menuContent : undefined;

  const menuId = useId();
  // Cursor point in the trigger's local coordinate space (offset from the
  // trigger's top-left, in-flow). Stored here and written to the zero-size
  // anchor element so the menu is positioned relative to the trigger context
  // — it scrolls with the content instead of sitting at a fixed viewport point.
  const positionRef = useRef({x: 0, y: 0});
  const cursorAnchorRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
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
    // Compound-mode menuContent may render selectable items (menuitemradio /
    // menuitemcheckbox) — all three menu item roles are keyboard-navigable
    // (#3829). Keep this selector, the typeahead query below, and the
    // Enter/Space role check in listKeyDown in sync.
    itemSelector:
      '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"])',
    wrap: false,
    onEscape: closeMenu,
  });

  // First-character typeahead over the enabled menu items (menus-11).
  const getMenuItems = useCallback(
    (): HTMLElement[] =>
      listRef.current
        ? Array.from(
            listRef.current.querySelectorAll<HTMLElement>(
              '[role="menuitem"]:not([aria-disabled="true"]), [role="menuitemradio"]:not([aria-disabled="true"]), [role="menuitemcheckbox"]:not([aria-disabled="true"])',
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
        const focusedRole = focused?.getAttribute('role');
        if (
          focusedRole === 'menuitem' ||
          focusedRole === 'menuitemradio' ||
          focusedRole === 'menuitemcheckbox'
        ) {
          focused?.click();
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

  // Place the zero-size cursor anchor at a point in the trigger's local
  // coordinate space and open the menu. Positioning the anchor inside the
  // trigger (rather than storing viewport coordinates on the menu itself) is
  // what makes the menu context-relative: it scrolls with the content and the
  // browser auto-flips it against the viewport edges via CSS anchor positioning.
  const openAtLocalPoint = useCallback(
    (localX: number, localY: number, focusEl: HTMLElement | null) => {
      positionRef.current = {x: localX, y: localY};
      const anchorEl = cursorAnchorRef.current;
      if (anchorEl) {
        anchorEl.style.left = `${localX}px`;
        anchorEl.style.top = `${localY}px`;
      }
      // Remember the element focused before opening so we can restore it on
      // close (Escape or outside-click), instead of dropping focus to <body>.
      triggerFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : focusEl;
      layer.show();
      requestAnimationFrame(() => focusFirst());
    },
    [layer, focusFirst],
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      if (isDisabled) {
        return;
      }
      e.preventDefault();
      const trigger = triggerRef.current;
      const rect = trigger?.getBoundingClientRect();
      // A keyboard-initiated contextmenu (Shift+F10 / the Menu key) fires a
      // `contextmenu` event whose coordinates are (0, 0) in several browsers.
      // Detect that and anchor the menu to the trigger's bottom-left instead,
      // so the menu is reachable without a pointer (menus-8).
      const isKeyboardInvoked =
        e.clientX === 0 && e.clientY === 0 && e.detail === 0;
      // Convert the viewport cursor point into the trigger's local space so
      // the anchor lives inside the (scrollable) trigger context.
      const localX = isKeyboardInvoked || !rect ? 0 : e.clientX - rect.left;
      const localY =
        isKeyboardInvoked || !rect ? (rect?.height ?? 0) : e.clientY - rect.top;
      openAtLocalPoint(localX, localY, e.currentTarget as HTMLElement);
    },
    [isDisabled, openAtLocalPoint],
  );

  // Touch long-press invocation (menus-8). iOS Safari never synthesizes a
  // `contextmenu` event on long-press, so a context menu is otherwise
  // unreachable on touch. Open the menu at the touch point once the press is
  // held long enough (see useLongPress for timer/move-cancel/cleanup logic).
  const longPressHandlers = useLongPress({
    disabled: isDisabled,
    onLongPress: useCallback(
      (point: {x: number; y: number}) => {
        const rect = triggerRef.current?.getBoundingClientRect();
        openAtLocalPoint(
          rect ? point.x - rect.left : point.x,
          rect ? point.y - rect.top : point.y,
          triggerRef.current,
        );
      },
      [openAtLocalPoint],
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

  return (
    <>
      <div
        ref={mergeRefs(ref, triggerRef)}
        onContextMenu={handleContextMenu}
        {...longPressHandlers}
        data-testid={testId}
        {...stylex.props(
          styles.trigger,
          ...(triggerXstyle
            ? Array.isArray(triggerXstyle)
              ? triggerXstyle
              : [triggerXstyle]
            : []),
        )}>
        {children}
        <span
          ref={mergeRefs(cursorAnchorRef, layer.ref)}
          aria-hidden="true"
          {...mergeProps(stylex.props(styles.cursorAnchor), {
            style: {
              left: `${positionRef.current.x}px`,
              top: `${positionRef.current.y}px`,
            },
          })}
        />
      </div>

      {layer.render(
        <div
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={listKeyDown}
          onContextMenu={e => e.preventDefault()}
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
