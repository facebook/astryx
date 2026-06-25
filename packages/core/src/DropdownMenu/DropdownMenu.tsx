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
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/DropdownMenu/DropdownMenu.doc.mjs
 * - /packages/core/src/DropdownMenu/DropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 * - /packages/cli/templates/blocks/components/DropdownMenu/ (showcase blocks)
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
import {usePopover} from '../Popover/usePopover';
import {Button, type ButtonProps} from '../Button';
import {Icon} from '../Icon';
import type {IconType} from '../Icon';

import {renderXDSDropdownItems} from './renderXDSDropdownItems';
import {
  DropdownMenuContext,
  type DropdownMenuContextValue,
} from './DropdownMenuContext';
import {useListFocus} from '../hooks/useListFocus';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import type {LayerPlacement} from '../Layer/useLayer';
import {
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

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
  popoverBlockGap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  popoverInlineGap: {
    marginInlineStart: spacingVars['--spacing-1'],
    marginInlineEnd: spacingVars['--spacing-1'],
  },
  popoverCustomWidth: (width: string | number) => ({
    minWidth: typeof width === 'number' ? `${width}px` : width,
  }),
});

// =============================================================================
// Types
// =============================================================================

export interface DropdownMenuItemData {
  label: string;
  onClick?: () => void;
  isDisabled?: boolean;
  icon?: ReactNode | IconType;
}

export interface DropdownMenuDivider {
  type: 'divider';
}

export interface DropdownMenuSection {
  type: 'section';
  title?: string;
  items: DropdownMenuItemData[];
}

export type DropdownMenuOption =
  | DropdownMenuItemData
  | DropdownMenuDivider
  | DropdownMenuSection;

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
   * Whether to auto-focus the first menu item when the menu opens.
   * Set to `false` for inline showcases or documentation previews
   * where stealing focus is undesirable.
   * @default true
   */
  hasAutoFocus?: boolean;
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
  | DropdownMenuDataProps
  | DropdownMenuCompoundProps;

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
const DEFAULT_BUTTON = {label: 'Menu'} as const;

export function DropdownMenu({
  button = DEFAULT_BUTTON,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  menuWidth,
  onClick,
  hasChevron = true,
  placement = 'below',
  hasAutoFocus = true,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}: DropdownMenuProps) {
  const items = ('items' in props ? props.items : undefined) ?? [];
  const children = props.children;

  const menuId = useId();
  const menuSize = button?.size ?? 'md';
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
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalIsOpen(false);
    }
    buttonRef.current?.focus();
  }, [isControlled, onOpenChange]);

  // Track whether to focus the first item when the menu opens
  const shouldFocusOnOpenRef = useRef(false);

  const handleLayerShow = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(true);
    } else {
      setInternalIsOpen(true);
    }
    if (shouldFocusOnOpenRef.current) {
      shouldFocusOnOpenRef.current = false;
      // focusFirst is called via openAndFocus below — defer to rAF
      // so the popover content is rendered before we query for items
    }
  }, [isControlled, onOpenChange]);

  const popover = usePopover({
    onHide: handleLayerHide,
    onShow: handleLayerShow,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  // Single keyboard navigation path for both modes
  const {
    listRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
  } = useListFocus<HTMLDivElement>({
    itemSelector: '[role="menuitem"]:not([aria-disabled="true"])',
    wrap: false,
    onEscape: closeMenu,
  });

  // Sync controlled open state → popover, and focus first item on open
  useEffect(() => {
    if (isControlled) {
      if (controlledIsOpen && !popover.isOpen) {
        popover.show();
        if (hasAutoFocus) {
          requestAnimationFrame(() => focusFirst());
        }
      } else if (!controlledIsOpen && popover.isOpen) {
        popover.hide();
      }
    }
  }, [controlledIsOpen, isControlled, popover, hasAutoFocus, focusFirst]);

  // Extend useListFocus with Enter/Space activation
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

  const openAndFocus = useCallback(() => {
    popover.show();
    if (hasAutoFocus) {
      requestAnimationFrame(() => focusFirst());
    }
  }, [popover, hasAutoFocus, focusFirst]);

  const handleButtonClick = useCallback(() => {
    // If the menu was just closed by light dismiss (e.g. iOS Safari fires
    // pointerdown → hide before the trigger's click), the click would
    // otherwise immediately re-open it. Short-circuit within the guard window.
    if (Date.now() - lastHideTimeRef.current < 50) {
      return;
    }
    onClick?.();
    if (isControlled) {
      onOpenChange?.(!controlledIsOpen);
    } else {
      if (popover.isOpen) {
        popover.hide();
      } else {
        openAndFocus();
      }
    }
  }, [
    onClick,
    isControlled,
    onOpenChange,
    controlledIsOpen,
    popover,
    openAndFocus,
  ]);

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
  const popoverGapStyle =
    placement === 'above' || placement === 'below'
      ? styles.popoverBlockGap
      : styles.popoverInlineGap;

  // Context for compound items
  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({closeMenu, menuSize}),
    [closeMenu, menuSize],
  );

  // Resolve menu content: data-driven items become components
  const menuContent =
    props.items !== undefined ? renderXDSDropdownItems(items) : children;

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
          ref={listRef}
          id={menuId}
          role="menu"
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
          alignment: 'start',
          xstyle: [popoverXstyle, popoverGapStyle, layerAnimations[placement]],
        },
      )}
    </>
  );
}

DropdownMenu.displayName = 'DropdownMenu';
