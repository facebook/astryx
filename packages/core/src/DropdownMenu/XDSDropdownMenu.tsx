'use client';

/**
 * @file XDSDropdownMenu.tsx
 * @input Uses React, StyleX, useXDSPopover, XDSButton, XDSIcon, useListFocus
 * @output Exports XDSDropdownMenu component
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
 * - /packages/core/src/DropdownMenu/XDSDropdownMenu.test.tsx
 * - /packages/core/src/DropdownMenu/index.ts
 * - /apps/storybook/stories/DropdownMenu.stories.tsx
 */

import React, {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSButton, type XDSButtonProps} from '../Button';
import {XDSIcon} from '../Icon';
import type {XDSIconType} from '../Icon';

import {renderXDSDropdownItems} from './renderXDSDropdownItems';
import {
  XDSDropdownMenuContext,
  type XDSDropdownMenuContextValue,
} from './XDSDropdownMenuContext';
import {useListFocus} from '../hooks/useListFocus';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';

const styles = stylex.create({
  dropdown: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    maxHeight: '300px',
    overflowY: 'auto',
    '--dropdown-radius': radiusVars['--radius-container'],
    '--dropdown-padding': spacingVars['--spacing-1'],
    padding: spacingVars['--spacing-1'],
    borderRadius: 'var(--dropdown-radius)',
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  popover: {
    minWidth: 'anchor-size(width)',
  },
  popoverGap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  popoverCustomWidth: (width: string | number) => ({
    minWidth: typeof width === 'number' ? `${width}px` : width,
  }),
});

// =============================================================================
// Types
// =============================================================================

export interface XDSDropdownMenuItemData {
  label: string;
  onClick?: () => void;
  isDisabled?: boolean;
  icon?: XDSIconType;
}

export interface XDSDropdownMenuDivider {
  type: 'divider';
}

export interface XDSDropdownMenuSection {
  type: 'section';
  title?: string;
  items: XDSDropdownMenuItemData[];
}

export type XDSDropdownMenuOption =
  | XDSDropdownMenuItemData
  | XDSDropdownMenuDivider
  | XDSDropdownMenuSection;

// =============================================================================
// Props
// =============================================================================

export type XDSDropdownMenuButtonProps = Omit<XDSButtonProps, 'onClick'>;

interface XDSDropdownMenuBaseProps extends XDSBaseProps {
  button?: XDSDropdownMenuButtonProps;
  isMenuOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  menuWidth?: number | string;
  onClick?: () => void;
  hasChevron?: boolean;
  'data-testid'?: string;
}

interface XDSDropdownMenuDataProps extends XDSDropdownMenuBaseProps {
  items: XDSDropdownMenuOption[];
  children?: undefined;
}

interface XDSDropdownMenuCompoundProps extends XDSDropdownMenuBaseProps {
  items?: undefined;
  children: ReactNode;
}

export type XDSDropdownMenuProps =
  | XDSDropdownMenuDataProps
  | XDSDropdownMenuCompoundProps;

// =============================================================================
// XDSDropdownMenu
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
 * <XDSDropdownMenu
 *   button={{ label: 'Actions' }}
 *   items={[
 *     { label: 'Edit', onClick: () => handleEdit() },
 *     { label: 'Delete', onClick: () => handleDelete() },
 *   ]}
 * />
 * ```
 */
export function XDSDropdownMenu({
  button = {label: 'Menu'},
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  menuWidth,
  onClick,
  hasChevron = true,
  className,
  style,
  xstyle,
  'data-testid': testId,
  ...props
}: XDSDropdownMenuProps) {
  const items = ('items' in props ? props.items : undefined) ?? [];
  const children = props.children as ReactNode;

  const menuId = useId();
  const menuSize = button?.size ?? 'md';
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Open state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Close menu + return focus to trigger
  const handleLayerHide = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalIsOpen(false);
    }
    buttonRef.current?.focus();
  }, [isControlled, onOpenChange]);

  // Track whether to focus the first item when the menu opens
  const shouldFocusOnOpen = useRef(false);

  const handleLayerShow = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(true);
    } else {
      setInternalIsOpen(true);
    }
    if (shouldFocusOnOpen.current) {
      shouldFocusOnOpen.current = false;
      // focusFirst is called via openAndFocus below — defer to rAF
      // so the popover content is rendered before we query for items
    }
  }, [isControlled, onOpenChange]);

  const popover = useXDSPopover({
    onHide: handleLayerHide,
    onShow: handleLayerShow,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  React.useEffect(() => {
    if (isControlled) {
      if (controlledIsOpen && !popover.isOpen) {
        popover.show();
      } else if (!controlledIsOpen && popover.isOpen) {
        popover.hide();
      }
    }
  }, [controlledIsOpen, isControlled, popover]);

  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  // Single keyboard navigation path for both modes
  const {
    listRef,
    handleKeyDown: listNavKeyDown,
    focusFirst,
  } = useListFocus({
    itemSelector: '[role="menuitem"]:not([aria-disabled="true"])',
    wrap: false,
    onEscape: closeMenu,
  });

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
    requestAnimationFrame(() => focusFirst());
  }, [popover, focusFirst]);

  const handleButtonClick = useCallback(() => {
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
      <XDSIcon icon="chevronDown" size="sm" color="inherit" />
    ) : undefined);

  const popoverXstyle = menuWidth
    ? styles.popoverCustomWidth(menuWidth)
    : styles.popover;

  // Context for compound items
  const contextValue = useMemo<XDSDropdownMenuContextValue>(
    () => ({closeMenu, menuSize}),
    [closeMenu, menuSize],
  );

  // Resolve menu content: data-driven items become components
  const menuContent =
    props.items !== undefined ? renderXDSDropdownItems(items) : children;

  return (
    <>
      <XDSButton
        {...button}
        ref={el => {
          (
            buttonRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = el;
          popover.triggerRef(el);
          // Forward consumer ref from button config
          const consumerRef = button.ref;
          if (typeof consumerRef === 'function') {
            consumerRef(el);
          } else if (consumerRef) {
            (
              consumerRef as React.MutableRefObject<HTMLButtonElement | null>
            ).current = el;
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
          ref={listRef as React.RefObject<HTMLDivElement>}
          id={menuId}
          role="menu"
          onKeyDown={listKeyDown}
          {...mergeProps(
            xdsClassName('dropdown-menu'),
            stylex.props(styles.dropdown, xstyle),
            className,
            style,
          )}>
          <XDSDropdownMenuContext.Provider value={contextValue}>
            {menuContent}
          </XDSDropdownMenuContext.Provider>
        </div>,
        {
          placement: 'below',
          alignment: 'start',
          xstyle: [popoverXstyle, styles.popoverGap, layerAnimations.below],
        },
      )}
    </>
  );
}

XDSDropdownMenu.displayName = 'XDSDropdownMenu';
