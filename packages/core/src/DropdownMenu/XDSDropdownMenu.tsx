'use client';

/**
 * @file XDSDropdownMenu.tsx
 * @input Uses React, StyleX, useXDSPopover, XDSButton, XDSIcon
 * @output Exports XDSDropdownMenu component
 * @position Core implementation; consumed by index.ts
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

import {XDSDivider} from '../Divider';
import {XDSDropdownMenuItem} from './XDSDropdownMenuItem';
import {layerAnimations} from '../Layer/layerAnimations.stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Size-aware item padding.
 * sm triggers → tighter vertical padding (4px block, 8px inline)
 * md/lg triggers → standard padding (8px all around, inherited from base item style)
 *
 * Note: menuSize is passed to xdsClassName on the item wrapper so themes
 * can target `.xds-dropdown-menu-item[data-size="sm"]` etc.
 */
const itemSizeStyles = stylex.create({
  sm: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  md: {
    // Uses base item padding (--spacing-2 all around)
  },
  lg: {
    // Uses base item padding (--spacing-2 all around)
  },
});

const styles = stylex.create({
  // Dropdown container
  dropdown: {
    boxSizing: 'border-box',
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

  // Popover container (for anchor positioning)
  popover: {
    minWidth: 'anchor-size(width)',
  },

  // Gap between button and popover
  popoverGap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },

  // Custom width popover
  popoverCustomWidth: (width: string | number) => ({
    minWidth: typeof width === 'number' ? `${width}px` : width,
  }),

  // Section heading label (replaces divider for named sections)
  sectionHeading: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },

  // Divider
  divider: {
    marginBlock: spacingVars['--spacing-1'],
  },

  // Individual item
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    padding: spacingVars['--spacing-2'],
    borderRadius:
      'max(0px, calc(var(--dropdown-radius) - var(--dropdown-padding)))',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

// =============================================================================
// Types
// =============================================================================

/**
 * A menu item in the dropdown
 */
export interface XDSDropdownMenuItemData {
  /**
   * Display label for the item.
   */
  label: string;

  /**
   * Callback when item is selected.
   */
  onClick?: () => void;

  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Icon to display before the label.
   */
  icon?: XDSIconType;
}

/**
 * A divider between items
 */
export interface XDSDropdownMenuDivider {
  type: 'divider';
}

/**
 * A section/group of items with optional title
 */
export interface XDSDropdownMenuSection {
  type: 'section';
  title?: string;
  items: XDSDropdownMenuItemData[];
}

/**
 * Union of all menu option types
 */
export type XDSDropdownMenuOption =
  | XDSDropdownMenuItemData
  | XDSDropdownMenuDivider
  | XDSDropdownMenuSection;

// =============================================================================
// Type guards and utilities
// =============================================================================

function isItemData(
  option: XDSDropdownMenuOption,
): option is XDSDropdownMenuItemData {
  return !('type' in option);
}

function isDivider(
  option: XDSDropdownMenuOption,
): option is XDSDropdownMenuDivider {
  return 'type' in option && option.type === 'divider';
}

function isSection(
  option: XDSDropdownMenuOption,
): option is XDSDropdownMenuSection {
  return 'type' in option && option.type === 'section';
}

/**
 * Get all selectable items from options (flattening sections)
 */
function getSelectableItems(
  options: XDSDropdownMenuOption[],
): XDSDropdownMenuItemData[] {
  const items: XDSDropdownMenuItemData[] = [];

  for (const option of options) {
    if (isItemData(option)) {
      items.push(option);
    } else if (isSection(option)) {
      for (const item of option.items) {
        items.push(item);
      }
    }
  }

  return items;
}

// =============================================================================
// Props
// =============================================================================

/**
 * Props for customizing the dropdown button.
 * Extends XDSButtonProps but omits onClick since it's managed internally.
 *
 * When `icon` is set without `children`, renders as an icon-only button
 * (square, with `label` as aria-label). Pass `children` to get icon + visible text.
 */
export type XDSDropdownMenuButtonProps = Omit<XDSButtonProps, 'onClick'>;

export interface XDSDropdownMenuProps {
  /**
   * Props for customizing the trigger button.
   * Uses XDSButton internally - supports label, variant, size, icon, etc.
   */
  button?: XDSDropdownMenuButtonProps;

  /**
   * The items to display in the menu.
   * Can be item objects, dividers, or sections.
   */
  items: XDSDropdownMenuOption[];

  /**
   * Whether the menu is open (controlled mode).
   * When omitted, the component manages its own open state.
   * @default undefined
   */
  isMenuOpen?: boolean;

  /**
   * Callback fired when the menu visibility changes (controlled mode).
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Width of the dropdown menu.
   * By default matches the button width.
   * Can be a number (pixels) or CSS string value.
   */
  menuWidth?: number | string;

  /**
   * Callback when the button is clicked.
   */
  onClick?: () => void;

  /**
   * Whether to show a chevron indicator on the trigger button.
   * Automatically hidden for icon-only buttons (when `button.icon` is set
   * without `button.endContent`).
   * @default true
   */
  hasChevron?: boolean;

  /**
   * Custom render function for items.
   * Only called for selectable items (not dividers/sections).
   */
  children?: (item: XDSDropdownMenuItemData) => ReactNode;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

// =============================================================================
// Default item renderer
// =============================================================================

function DefaultItem({item}: {item: XDSDropdownMenuItemData}) {
  return <XDSDropdownMenuItem icon={item.icon} label={item.label} />;
}

// =============================================================================
// XDSDropdownMenu
// =============================================================================

/**
 * A dropdown menu component that displays a list of actionable items.
 *
 * Unlike XDSSelector, this component has no inherent selector state -
 * it's purely for displaying a menu of clickable items.
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
  items,
  isMenuOpen: controlledIsOpen,
  onOpenChange,
  menuWidth,
  onClick,
  hasChevron = true,
  children,
  'data-testid': testId,
}: XDSDropdownMenuProps) {
  const menuId = useId();

  // Derive menu item density from button size
  const menuSize = button?.size ?? 'md';

  const buttonRef = useRef<HTMLButtonElement>(null);

  // Internal state for uncontrolled mode
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Determine if controlled or uncontrolled
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Highlighted item for keyboard navigation
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Flatten items for keyboard navigation
  const selectableItems = useMemo(() => getSelectableItems(items), [items]);

  // Layer for dropdown positioning
  const handleLayerHide = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(false);
    } else {
      setInternalIsOpen(false);
    }
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  }, [isControlled, onOpenChange]);

  const handleLayerShow = useCallback(() => {
    if (isControlled) {
      onOpenChange?.(true);
    } else {
      setInternalIsOpen(true);
    }
  }, [isControlled, onOpenChange]);

  const popover = useXDSPopover({
    onHide: handleLayerHide,
    onShow: handleLayerShow,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  // Sync layer with controlled state
  React.useEffect(() => {
    if (isControlled) {
      if (controlledIsOpen && !popover.isOpen) {
        popover.show();
      } else if (!controlledIsOpen && popover.isOpen) {
        popover.hide();
      }
    }
  }, [controlledIsOpen, isControlled, popover]);

  const handleButtonClick = useCallback(() => {
    onClick?.();
    if (isControlled) {
      onOpenChange?.(!controlledIsOpen);
    } else {
      if (popover.isOpen) {
        popover.hide();
      } else {
        popover.show();
      }
    }
  }, [onClick, isControlled, onOpenChange, controlledIsOpen, popover]);

  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  // Generate item ID for accessibility
  const getItemId = useCallback(
    (index: number) => `${menuId}-item-${index}`,
    [menuId],
  );

  // Handle item click
  const handleItemClick = useCallback(
    (item: XDSDropdownMenuItemData) => {
      if (item.isDisabled) return;
      item.onClick?.();
      closeMenu();
    },
    [closeMenu],
  );

  // Handle item mouse enter
  const handleItemMouseEnter = useCallback(
    (item: XDSDropdownMenuItemData, index: number) => {
      if (item.isDisabled) return;
      setHighlightedIndex(index);
    },
    [],
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!popover.isOpen) {
        if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          popover.show();
          setHighlightedIndex(0);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => {
            let next = prev + 1;
            // Skip disabled items
            while (
              next < selectableItems.length &&
              selectableItems[next].isDisabled
            ) {
              next++;
            }
            return next < selectableItems.length ? next : prev;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => {
            let next = prev - 1;
            // Skip disabled items
            while (next >= 0 && selectableItems[next].isDisabled) {
              next--;
            }
            return next >= 0 ? next : prev;
          });
          break;
        case 'Home':
          e.preventDefault();
          {
            let index = 0;
            while (
              index < selectableItems.length &&
              selectableItems[index].isDisabled
            ) {
              index++;
            }
            setHighlightedIndex(index < selectableItems.length ? index : -1);
          }
          break;
        case 'End':
          e.preventDefault();
          {
            let index = selectableItems.length - 1;
            while (index >= 0 && selectableItems[index].isDisabled) {
              index--;
            }
            setHighlightedIndex(index >= 0 ? index : -1);
          }
          break;
        case 'Escape':
          e.preventDefault();
          closeMenu();
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < selectableItems.length
          ) {
            handleItemClick(selectableItems[highlightedIndex]);
          }
          break;
      }
    },
    [popover, selectableItems, highlightedIndex, closeMenu, handleItemClick],
  );

  // Render an individual item
  const renderItem = useCallback(
    (item: XDSDropdownMenuItemData, flatIndex: number) => {
      const isHighlighted = flatIndex === highlightedIndex;

      return (
        <div
          key={`${item.label}-${flatIndex}`}
          id={getItemId(flatIndex)}
          role="menuitem"
          tabIndex={-1}
          aria-disabled={item.isDisabled}
          onClick={() => handleItemClick(item)}
          onMouseEnter={() => handleItemMouseEnter(item, flatIndex)}
          {...mergeProps(
            xdsClassName('dropdown-menu-item', {size: menuSize}),
            stylex.props(
              styles.item,
              itemSizeStyles[menuSize],
              isHighlighted && styles.itemHighlighted,
              item.isDisabled && styles.itemDisabled,
            ),
          )}>
          {children ? children(item) : <DefaultItem item={item} />}
        </div>
      );
    },
    [
      children,
      menuSize,
      highlightedIndex,
      getItemId,
      handleItemClick,
      handleItemMouseEnter,
    ],
  );

  // Render all options (handling sections/dividers)
  const renderOptions = useCallback(() => {
    let flatIndex = 0;
    const elements: ReactNode[] = [];

    for (let i = 0; i < items.length; i++) {
      const option = items[i];

      if (isDivider(option)) {
        elements.push(
          <XDSDivider key={`divider-${i}`} xstyle={styles.divider} />,
        );
      } else if (isSection(option)) {
        const sectionItems: ReactNode[] = [];
        for (const item of option.items) {
          sectionItems.push(renderItem(item, flatIndex));
          flatIndex++;
        }
        elements.push(
          <div key={`section-${i}`} role="group" aria-label={option.title}>
            {option.title && (
              <div
                key={`section-heading-${i}`}
                {...stylex.props(styles.sectionHeading)}
                aria-hidden="true">
                {option.title}
              </div>
            )}
            {sectionItems}
          </div>,
        );
      } else if (isItemData(option)) {
        elements.push(renderItem(option, flatIndex));
        flatIndex++;
      }
    }

    return elements;
  }, [items, renderItem]);

  // Icon-only: when button has an icon and no children,
  // XDSButton handles icon-only rendering natively.
  const isIconOnly = button.icon != null && button.children == null;

  // Build endContent: use consumer's endContent if provided,
  // otherwise inject chevron (unless icon-only or hasChevron=false)
  const resolvedEndContent =
    button.endContent ??
    (hasChevron && !isIconOnly ? (
      <XDSIcon icon="chevronDown" size="sm" color="inherit" />
    ) : undefined);

  // Determine popover xstyle
  const popoverXstyle = menuWidth
    ? styles.popoverCustomWidth(menuWidth)
    : styles.popover;

  return (
    <>
      <XDSButton
        ref={el => {
          (
            buttonRef as React.MutableRefObject<HTMLButtonElement | null>
          ).current = el;
          popover.triggerRef(el);
        }}
        {...button}
        endContent={resolvedEndContent}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-activedescendant={
          isOpen && highlightedIndex >= 0
            ? getItemId(highlightedIndex)
            : undefined
        }
        data-testid={testId}
      />

      {popover.render(
        <div
          id={menuId}
          role="menu"
          {...mergeProps(
            xdsClassName('dropdown-menu'),
            stylex.props(styles.dropdown),
          )}>
          {renderOptions()}
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
