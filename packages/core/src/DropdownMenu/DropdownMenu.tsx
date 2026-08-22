// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenu.tsx
 * @input Uses React, StyleX, usePopover, Button, Icon, Menu
 * @output Exports DropdownMenu component
 * @position Core implementation; consumed by index.ts
 *
 * Supports two modes with a single keyboard/focus path:
 * - **Data-driven**: pass `items` array (converted to components internally)
 * - **Compound-component**: pass JSX children directly
 *
 * Both modes render the same Menu body (roving focus, typeahead, Tab-closes).
 *
 * Initial focus on open follows the input modality: a keyboard open
 * (Enter / Space / ArrowDown on the trigger) focuses the first enabled item
 * (APG menu-button); a pointer open focuses the menu container itself so no
 * item reads as pre-selected, and the first ArrowDown then moves to item 1.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/Menu.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/DropdownMenu/ (showcase blocks)
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {usePopover} from '../Popover/usePopover';
import {Button, type ButtonProps} from '../Button';
import {Icon} from '../Icon';

import {renderDropdownItems} from './renderDropdownItems';
import type {DropdownMenuItemProps} from './DropdownMenuItem';
import {Menu} from './Menu';
import {MENU_ITEM_SELECTOR} from './menuItemRoles';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerAlignment, LayerPlacement} from '../Layer/useLayer';
import {spacingVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {useTranslator} from '../i18n';

const styles = stylex.create({
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

  // Track when the menu was last hidden so a near-simultaneous trigger
  // click — e.g. on iOS Safari where pointerdown fires light-dismiss
  // before the trigger's click event — can't immediately re-open it.
  const lastHideTimeRef = useRef(0);

  // Close menu + return focus to trigger
  const handleLayerHide = useCallback(() => {
    lastHideTimeRef.current = Date.now();
    onOpenChange?.(false);
    if (!isControlled) {
      setInternalIsOpen(false);
    }
    buttonRef.current?.focus();
  }, [isControlled, onOpenChange]);

  // Defer item focus until the layer has committed open, so focus restore
  // captures the trigger instead of the first menu item.
  const shouldFocusOnOpenRef = useRef(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const popover = usePopover({
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
  // honoring the input modality. Menu itself is told focusOnOpen="none"
  // so this one-shot ref stays the single source of truth — a second
  // auto-focus inside Menu would steal focus back from the trigger on
  // light-dismiss.
  useEffect(() => {
    if (!popover.isOpen || !shouldFocusOnOpenRef.current) {
      return;
    }
    shouldFocusOnOpenRef.current = false;
    requestAnimationFrame(() => {
      const menu = menuRef.current;
      if (menu == null) {
        return;
      }
      if (openModalityRef.current === 'pointer') {
        menu.focus();
      } else {
        const first = menu.querySelector(MENU_ITEM_SELECTOR);
        (first instanceof HTMLElement ? first : menu).focus();
      }
      openModalityRef.current = 'keyboard';
    });
  }, [popover.isOpen]);

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
      // If the menu was just closed by light dismiss (e.g. iOS Safari fires
      // pointerdown → hide before the trigger's click), the click would
      // otherwise immediately re-open it. Short-circuit within the guard
      // window.
      if (Date.now() - lastHideTimeRef.current < 50) {
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
      // When open, key events go to the Menu container
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

  // Resolve menu content: data-driven items become components
  const menuContent =
    props.items !== undefined ? renderDropdownItems(items) : children;

  // `ButtonProps['label']` is a string, and `button` already falls back to the
  // translated default above, so the trigger's label is always a usable
  // accessible name for the menu (menus-13).
  const menuLabel = button.label;

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
        <Menu
          {...rest}
          ref={menuRef}
          label={menuLabel}
          onClose={closeMenu}
          isOpen={popover.isOpen}
          focusOnOpen="none"
          size={menuSize}
          id={menuId}
          xstyle={xstyle}
          className={className}
          style={style}>
          {menuContent}
        </Menu>,
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
