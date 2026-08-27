// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenu.tsx
 * @input Uses React, StyleX, usePopover, Button, Icon, useListFocus
 * @output Exports DropdownMenu component
 * @position Core implementation; consumed by index.ts
 *
 * Supports two modes with a single keyboard/focus path:
 * - **Data-driven**: pass `items` array (converted to components internally)
 * - **Compound-component**: pass JSX children directly
 *
 * Both modes use useListFocus for DOM-based keyboard navigation.
 *
 * Initial focus on open follows the input modality: a keyboard open
 * (Enter / Space / ArrowDown on the trigger) focuses the first enabled item
 * (APG menu-button); a pointer open focuses the menu container itself so no
 * item reads as pre-selected, and the first ArrowDown then moves to item 1.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {usePopoverInternal} from '../Popover/usePopover';
import {Button, type ButtonProps} from '../Button';
import {Icon} from '../Icon';

import {renderDropdownItems} from './renderDropdownItems';
import type {DropdownMenuItemProps} from './DropdownMenuItem';
import {
  MENU_ITEM_ROLES,
  MENU_ITEM_SELECTOR,
  MENU_BOUNDARY_SELECTOR,
} from './menuItemRoles';
import {
  DropdownMenuContext,
  type DropdownMenuContextValue,
} from './DropdownMenuContext';
import {useListFocus} from '../hooks/useListFocus';
import {useTypeahead} from '../hooks/useTypeahead';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import {
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

const styles = stylex.create({
  dropdown: {
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
  popover: {
    minWidth: 'anchor-size(width)',
  },
  popoverCustomWidth: (width: string | number) => ({
    minWidth: typeof width === 'number' ? `${width}px` : width,
  }),
});

// =============================================================================
// Types
// =============================================================================

/**
 * Data-mode shape for one menu row.
 *
 * The item fields are sourced from `DropdownMenuItemProps` — data mode renders
 * through `DropdownMenuItem`, so the two APIs describe the same thing and must
 * not drift. Only the fields listed here are part of the data API; add a key to
 * the `Pick` to expose more of the item's props to `items`.
 */
export interface DropdownMenuItemData extends Pick<
  DropdownMenuItemProps,
  | 'icon'
  | 'onClick'
  | 'isDisabled'
  | 'variant'
  | 'description'
  | 'endContent'
  | 'hasCloseOnSelect'
> {
  /**
   * Stable identity for the row, used as its React key (as on
   * `TreeListItemData`). Omit it and the row is keyed by position, which is
   * correct for a fixed menu; set it when `items` can reorder, filter, or grow,
   * so a row keeps its DOM node — and therefore keyboard focus — as the array
   * changes around it.
   */
  id?: string;
  /** Primary label content. */
  label: ReactNode;
  /**
   * Nested submenu entries. When present, this row becomes a submenu (a
   * flyout revealing `items`) instead of a leaf action — no separate item
   * "type" is needed. Data-mode parity for the compound DropdownMenuSubMenu API.
   */
  items?: DropdownMenuOption[];
}

/**
 * Data-mode shape for a divider row. The compound-mode peer is the
 * `DropdownMenuDivider` component, which both modes render.
 */
export interface DropdownMenuDividerData {
  type: 'divider';
}

export interface DropdownMenuSection {
  type: 'section';
  /** Stable identity for the group; see {@link DropdownMenuItemData.id}. */
  id?: string;
  title?: string;
  items: DropdownMenuItemData[];
}

export type DropdownMenuOption =
  DropdownMenuItemData | DropdownMenuDividerData | DropdownMenuSection;

// =============================================================================
// Props
// =============================================================================

export type DropdownMenuButtonProps = Omit<ButtonProps, 'onClick'>;

interface DropdownMenuBaseProps extends BaseProps {
  button?: DropdownMenuButtonProps;
  isMenuOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  menuWidth?: number | string;
  onClick?: () => void;
  hasChevron?: boolean;
  /**
   * Position placement relative to the trigger.
   * Uses the same placement values as other Astryx layer-based components.
   * @default 'below'
   */
  placement?: LayerPlacement;

  /**
   * Alignment along the placement axis.
   * Uses the same alignment values as other Astryx layer-based components.
   * @default 'start'
   */
  alignment?: LayerAlignment;

  'data-testid'?: string;
}

interface DropdownMenuDataProps extends DropdownMenuBaseProps {
  items: DropdownMenuOption[];
  children?: undefined;
}

interface DropdownMenuCompoundProps extends DropdownMenuBaseProps {
  items?: undefined;
  children: ReactNode;
}

export type DropdownMenuProps =
  DropdownMenuDataProps | DropdownMenuCompoundProps;

// =============================================================================
// DropdownMenu
// =============================================================================

/**
 * A dropdown menu component that displays a list of actionable items.
 *
 * Supports two modes:
 * - **Data-driven**: pass `items` for static menus with optional custom rendering
 * - **Compound-component**: pass JSX children for dynamic, stateful, or lazy-loaded menus
 *
 * Both modes share the same DOM-based keyboard navigation via useListFocus.
 *
 * @example
 * ```
 * <DropdownMenu
 *   button={{ label: 'Actions' }}
 *   items={[
 *     { label: 'Edit', onClick: () => handleEdit() },
 *     { label: 'Delete', onClick: () => handleDelete() },
 *   ]}
 * />
 * ```
 */
// When the consumer doesn't pass `button`, the default label is looked up
// at render time so it respects the active InternationalizationProvider
// locale.
const DEFAULT_BUTTON_I18N_KEY = '@astryx.dropdownMenu.label' as const;

export function DropdownMenu({
  button: buttonFromProps,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  menuWidth,
  onClick,
  hasChevron = true,
  placement = 'below',
  alignment = 'start',
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}: DropdownMenuProps) {
  const t = useTranslator();
  const button = buttonFromProps ?? {label: t(DEFAULT_BUTTON_I18N_KEY)};

  const items = ('items' in props ? props.items : undefined) ?? [];
  const children = props.children;

  // Extract BaseProps pass-throughs (aria-*, id, event handlers) from the
  // discriminated-union rest bag so they can be forwarded to the menu element.
  const {
    items: _items,
    children: _children,
    ...rest
  } = props as Record<string, unknown>;

  const menuId = useId();
  const menuSize = button.size ?? 'md';
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Open state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Close menu + return focus to trigger
  const handleLayerHide = useCallback(() => {
    onOpenChange?.(false);
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    buttonRef.current?.focus();
  }, [isControlled, onOpenChange]);

  // Defer item focus until the layer has committed open, so focus restore
  // captures the trigger instead of the first menu item.
  const shouldFocusOnOpenRef = useRef(false);

  // How the next open was initiated. Keyboard (and programmatic) opens focus
  // the first enabled item per the APG menu-button pattern; pointer opens
  // focus the menu container instead, so no item is visually highlighted as
  // if pre-selected (#4477). Reset to 'keyboard' after every open so
  // programmatic controlled opens keep the item-focus behavior.
  const openModalityRef = useRef<'keyboard' | 'pointer'>('keyboard');

  const handleLayerShow = useCallback(() => {
    onOpenChange?.(true);
    if (!isControlled) {
      setInternalIsOpen(true);
    }
  }, [isControlled, onOpenChange]);

  const popover = usePopoverInternal({
    onHide: handleLayerHide,
    onShow: handleLayerShow,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
    // The popup's own role="menu" is the exposed semantics; wrapping it in a
    // modal dialog would announce an unnamed dialog around the menu.
    role: 'none',
  });

  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  // Single keyboard navigation path for both modes.
  // The selector matches plain items plus selectable items
  // (menuitemradio/menuitemcheckbox) so lab checkbox/radio rows are reachable
  // and roved to alongside plain items — not just role="menuitem".
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
    onEscape: closeMenu,
  });

  // First-character typeahead over the (enabled) menu items — jump to the next
  // item whose label starts with the typed text (menus-11). Reuses the hook's
  // scoped item collection so an inline submenu flyout's items aren't swept in.
  const typeahead = useTypeahead({
    getItemLabels: () => getMenuItems().map(el => el.textContent),
    onMatch: focusItem,
    getCurrentIndex: () =>
      getMenuItems().findIndex(
        el =>
          el === document.activeElement || el.contains(document.activeElement),
      ),
  });

  // Sync controlled open state → popover.
  useEffect(() => {
    if (isControlled) {
      if (controlledIsOpen && !popover.isOpen) {
        shouldFocusOnOpenRef.current = true;
        popover.show();
      } else if (!controlledIsOpen && popover.isOpen) {
        popover.hide();
      }
    }
  }, [controlledIsOpen, isControlled, popover]);

  // Move focus into the menu only after the layer has committed open,
  // honoring the input modality: keyboard (and programmatic) opens land on
  // the first enabled item per the APG menu-button pattern; pointer opens
  // focus the menu container itself (tabIndex={-1}) so no item is
  // highlighted as if pre-selected (#4477). Container focus keeps arrows,
  // typeahead, Escape and Tab in the menu's onKeyDown, and is also the
  // fallback when no item is focusable (e.g. all disabled), mirroring the
  // submenu flyout fallback.
  useEffect(() => {
    if (!popover.isOpen || !shouldFocusOnOpenRef.current) {
      return;
    }
    shouldFocusOnOpenRef.current = false;
    requestAnimationFrame(() => {
      if (openModalityRef.current === 'pointer' || !focusFirst()) {
        listRef.current?.focus();
      }
      openModalityRef.current = 'keyboard';
    });
  }, [popover.isOpen, focusFirst, listRef]);

  // Extend useListFocus with Enter/Space activation + typeahead
  const listKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // A submenu flyout renders inline inside this menu; its key events bubble
      // up here. Let that level own them — only handle events from this level.
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
      // APG menu-button pattern: Tab closes the menu. Menu items are
      // tabIndex={-1} so the focus trap has nothing trappable and Tab would
      // otherwise leak into the page while the menu stayed open (menus-5).
      // Do NOT preventDefault — closing restores focus to the trigger, and the
      // browser's default Tab then continues from there to the next element.
      if (e.key === 'Tab') {
        closeMenu();
        return;
      }
      // Type-to-focus next; if it consumed a printable key, stop here.
      if (typeahead.onKeyDown(e)) {
        e.preventDefault();
        return;
      }
      listNavKeyDown(e);
    },
    [listNavKeyDown, closeMenu, typeahead, ownsEvent],
  );

  const openAndFocus = useCallback(
    (modality: 'keyboard' | 'pointer' = 'keyboard') => {
      openModalityRef.current = modality;
      shouldFocusOnOpenRef.current = true;
      popover.show();
    },
    [popover],
  );

  const handleButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      // The click that light-dismissed the menu is not a request to reopen it.
      if (popover.wasJustDismissed()) {
        return;
      }
      onClick?.();
      // detail === 0 marks a synthesized click (screen reader / AT
      // activation): treat it as keyboard so those users still land on the
      // first item. Real pointer clicks report detail >= 1.
      const modality = e.detail === 0 ? 'keyboard' : 'pointer';
      if (isControlled) {
        if (!controlledIsOpen) {
          openModalityRef.current = modality;
        }
        onOpenChange?.(!controlledIsOpen);
      } else {
        if (popover.isOpen) {
          popover.hide();
        } else {
          openAndFocus(modality);
        }
      }
    },
    [
      onClick,
      isControlled,
      onOpenChange,
      controlledIsOpen,
      popover,
      openAndFocus,
    ],
  );

  const handleButtonKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!popover.isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openAndFocus();
        }
      }
      // When open, key events go to the menu container via useListFocus
    },
    [popover.isOpen, openAndFocus],
  );

  // Icon-only
  const isIconOnly = button.isIconOnly === true;
  const resolvedEndContent =
    button.endContent ??
    (hasChevron && !isIconOnly ? (
      <Icon icon="chevronDown" size="sm" color="inherit" />
    ) : undefined);

  const popoverXstyle = menuWidth
    ? styles.popoverCustomWidth(menuWidth)
    : styles.popover;
  // Context for compound items
  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({closeMenu, menuSize}),
    [closeMenu, menuSize],
  );

  // Resolve menu content: data-driven items become components
  const menuContent =
    props.items !== undefined ? renderDropdownItems(items) : children;

  return (
    <>
      <Button
        {...button}
        ref={el => {
          buttonRef.current = el;
          popover.triggerRef(el);
          const consumerRef = button.ref;
          if (typeof consumerRef === 'function') {
            consumerRef(el);
          } else if (consumerRef) {
            /* eslint-disable react-compiler/react-compiler -- ref callback: forwarding consumer ref object */
            consumerRef.current = el;
            /* eslint-enable react-compiler/react-compiler */
          }
        }}
        tooltip={isOpen ? undefined : button.tooltip}
        endContent={resolvedEndContent}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        data-testid={testId}
      />

      {popover.render(
        <div
          {...rest}
          ref={listRef}
          id={menuId}
          role="menu"
          // Focus target for pointer opens (not in the Tab order): holding
          // focus on the container keeps key events (arrows, typeahead,
          // Escape, Tab) inside the menu without highlighting any item.
          // Mirrors the DropdownMenuSubMenu flyout container.
          tabIndex={-1}
          // Give the menu an accessible name from its trigger's label, so
          // screen readers announce e.g. "Actions menu" rather than an unnamed
          // menu (menus-13).
          aria-label={button.label}
          onKeyDown={listKeyDown}
          {...mergeProps(
            themeProps('dropdown-menu'),
            stylex.props(styles.dropdown, xstyle),
            className,
            style,
          )}>
          <DropdownMenuContext value={contextValue}>
            {menuContent}
          </DropdownMenuContext>
        </div>,
        {
          placement,
          alignment,
          offset: spacingVars['--spacing-1'],
          xstyle: [popoverXstyle, layerAnimations[placement]],
        },
      )}
    </>
  );
}

DropdownMenu.displayName = 'DropdownMenu';
