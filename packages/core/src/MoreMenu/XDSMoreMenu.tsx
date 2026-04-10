'use client';

/**
 * @file XDSMoreMenu.tsx
 * @input Uses React, StyleX, useXDSPopover, XDSButton, getIcon, XDSDropdownMenuItem, XDSDivider
 * @output Exports XDSMoreMenu component and XDSMoreMenuProps type
 * @position Core implementation; consumed by index.ts
 *
 * Overflow menu with a three-dot icon trigger. A convenience wrapper
 * that composes XDSButton (icon-only) + useXDSPopover for the dropdown.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MoreMenu/README.md
 * - /packages/core/src/MoreMenu/XDSMoreMenu.test.tsx
 * - /packages/core/src/MoreMenu/index.ts
 * - /apps/storybook/stories/MoreMenu.stories.tsx
 */

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {useXDSPopover} from '../Popover/useXDSPopover';
import {XDSButton, type XDSButtonVariant, type XDSButtonSize} from '../Button';
import {getIcon} from '../Icon/globalIconRegistry';
import {XDSDropdownMenuItem} from '../DropdownMenu/XDSDropdownMenuItem';
import {XDSDivider} from '../Divider';
import type {
  XDSDropdownMenuOption,
  XDSDropdownMenuItemData,
  XDSDropdownMenuDivider,
  XDSDropdownMenuSection,
} from '../DropdownMenu';
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

// =============================================================================
// Styles
// =============================================================================

/**
 * Size-aware item padding.
 * sm triggers → tighter vertical padding (4px block, 8px inline)
 * md/lg triggers → standard padding (8px all around, inherited from base item style)
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
  dropdown: {
    boxSizing: 'border-box',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: spacingVars['--spacing-1'],
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  popover: {
    minWidth: '160px',
  },
  popoverGap: {
    marginBlockStart: spacingVars['--spacing-1'],
    marginBlockEnd: spacingVars['--spacing-1'],
  },
  sectionHeading: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    userSelect: 'none',
  },
  divider: {
    marginBlock: spacingVars['--spacing-1'],
  },
  item: {
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    padding: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-element'],
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

export interface XDSMoreMenuProps {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLButtonElement>;
  /**
   * Menu items — data array of actions, dividers, and sections.
   * Same type as XDSDropdownMenu's `items` prop.
   *
   * For advanced menu content that can't be expressed as data,
   * compose XDSButton + useXDSPopover + XDSDropdownMenuItem directly.
   */
  items: XDSDropdownMenuOption[];

  /**
   * Accessible label for the trigger button.
   * Always used as aria-label (the button is always icon-only).
   * @default 'More options'
   */
  label?: string;

  /**
   * Visual style variant of the trigger button.
   * Matches XDSButton variant values.
   * @default 'ghost'
   */
  variant?: XDSButtonVariant;

  /**
   * Size of the trigger button.
   * Matches XDSButton size values.
   * @default 'md'
   */
  size?: XDSButtonSize;

  /**
   * Override the default three-dot icon.
   * Accepts any ReactNode (same as XDSButton's `icon` prop).
   * @default Three horizontal dots from the icon registry ('moreHorizontal')
   */
  icon?: ReactNode;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Custom render function for items.
   * Passed through to render custom item content.
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
// XDSMoreMenu
// =============================================================================

/**
 * Overflow menu with a three-dot icon trigger.
 *
 * A convenience wrapper that composes an icon-only XDSButton with a
 * dropdown menu. Eliminates the boilerplate of wiring up state management,
 * positioning, and accessibility attributes for the common "more actions"
 * pattern.
 *
 * For full control over trigger rendering or menu content, compose
 * XDSButton + useXDSPopover + XDSDropdownMenuItem directly.
 *
 * @example
 * ```
 * <XDSMoreMenu
 *   items={[
 *     { label: 'Edit', onClick: handleEdit },
 *     { label: 'Delete', onClick: handleDelete },
 *   ]}
 * />
 * ```
 */
export function XDSMoreMenu({
  items,
  label = 'More options',
  variant = 'ghost',
  size = 'md',
  icon,
  isDisabled = false,
  children,
  'data-testid': testId,
  ref,
}: XDSMoreMenuProps) {
  const moreIcon = getIcon('moreHorizontal');
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuId = useId();
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const selectableItems = useMemo(() => getSelectableItems(items), [items]);

  const handleLayerHide = useCallback(() => {
    setHighlightedIndex(-1);
    buttonRef.current?.focus();
  }, []);

  const popover = useXDSPopover({
    onHide: handleLayerHide,
    hasLightDismiss: true,
    hasCloseButton: false,
    hasAutoFocus: false,
  });

  const handleButtonClick = useCallback(() => {
    if (popover.isOpen) {
      popover.hide();
    } else {
      popover.show();
    }
  }, [popover]);

  const closeMenu = useCallback(() => {
    popover.hide();
  }, [popover]);

  const getItemId = useCallback(
    (index: number) => `${menuId}-item-${index}`,
    [menuId],
  );

  const handleItemClick = useCallback(
    (item: XDSDropdownMenuItemData) => {
      if (item.isDisabled) return;
      item.onClick?.();
      closeMenu();
    },
    [closeMenu],
  );

  const handleItemMouseEnter = useCallback(
    (item: XDSDropdownMenuItemData, index: number) => {
      if (item.isDisabled) return;
      setHighlightedIndex(index);
    },
    [],
  );

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
          {...stylex.props(
            styles.item,
            itemSizeStyles[size],
            isHighlighted && styles.itemHighlighted,
            item.isDisabled && styles.itemDisabled,
          )}>
          {children ? children(item) : <DefaultItem item={item} />}
        </div>
      );
    },
    [
      children,
      size,
      highlightedIndex,
      getItemId,
      handleItemClick,
      handleItemMouseEnter,
    ],
  );

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

  return (
    <>
      <XDSButton
        ref={el => {
          buttonRef.current = el;
          popover.triggerRef(el);
          if (typeof ref === 'function') {
            ref(el);
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
              el;
          }
        }}
        label={label}
        icon={icon ?? moreIcon}
        variant={variant}
        size={size}
        isDisabled={isDisabled}
        tooltip={popover.isOpen ? undefined : label}
        onClick={handleButtonClick}
        onKeyDown={handleKeyDown}
        aria-haspopup="menu"
        aria-expanded={popover.isOpen}
        aria-controls={menuId}
        aria-activedescendant={
          popover.isOpen && highlightedIndex >= 0
            ? getItemId(highlightedIndex)
            : undefined
        }
        data-testid={testId}
        isIconOnly
      />
      {popover.render(
        <div
          id={menuId}
          role="menu"
          {...mergeProps(
            xdsClassName('more-menu'),
            stylex.props(styles.dropdown),
          )}>
          {renderOptions()}
        </div>,
        {
          placement: 'below',
          alignment: 'end',
          xstyle: [styles.popover, styles.popoverGap],
        },
      )}
    </>
  );
}

XDSMoreMenu.displayName = 'XDSMoreMenu';
