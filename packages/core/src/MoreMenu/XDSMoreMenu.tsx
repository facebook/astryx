'use client';

/**
 * @file XDSMoreMenu.tsx
 * @input Uses XDSDropdownMenu, getIcon
 * @output Exports XDSMoreMenu component and XDSMoreMenuProps type
 * @position Core implementation; consumed by index.ts
 *
 * Overflow menu with a three-dot icon trigger. A thin wrapper around
 * XDSDropdownMenu with icon-only button defaults.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MoreMenu/README.md
 * - /packages/core/src/MoreMenu/XDSMoreMenu.test.tsx
 * - /packages/core/src/MoreMenu/index.ts
 * - /apps/storybook/stories/MoreMenu.stories.tsx
 */

import {type ReactNode} from 'react';
import {getIcon} from '../Icon/globalIconRegistry';
import {XDSDropdownMenu} from '../DropdownMenu/XDSDropdownMenu';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import type {XDSDropdownMenuOption} from '../DropdownMenu';
import type {XDSButtonVariant, XDSButtonSize} from '../Button';

export interface XDSMoreMenuProps {
  /** Ref forwarded to the trigger button */
  ref?: React.Ref<HTMLButtonElement>;

  /**
   * Menu items \u2014 data array of actions, dividers, and sections.
   * Same type as XDSDropdownMenu's `items` prop.
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
   * @default 'ghost'
   */
  variant?: XDSButtonVariant;

  /**
   * Size of the trigger button.
   * @default 'md'
   */
  size?: XDSButtonSize;

  /**
   * Override the default three-dot icon.
   * @default Three horizontal dots from the icon registry ('moreHorizontal')
   */
  icon?: ReactNode;

  /**
   * Whether the menu trigger is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Controlled open state for the menu.
   */
  isMenuOpen?: boolean;

  /**
   * Callback fired when the menu visibility changes.
   */
  onOpenChange?: (isOpen: boolean) => void;

  /** Test ID for testing frameworks. */
  'data-testid'?: string;
}

/**
 * Overflow menu with a three-dot icon trigger.
 *
 * A convenience wrapper around XDSDropdownMenu with icon-only button defaults.
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
  size: sizeProp,
  icon,
  isDisabled = false,
  isMenuOpen,
  onOpenChange,
  'data-testid': testId,
  ref,
}: XDSMoreMenuProps) {
  const size = useXDSSize(sizeProp, 'md');
  const moreIcon = getIcon('moreHorizontal');

  return (
    <XDSDropdownMenu
      className="xds-more-menu"
      isMenuOpen={isMenuOpen}
      onOpenChange={onOpenChange}
      button={{
        label,
        icon: icon ?? moreIcon,
        variant,
        size,
        isDisabled,
        tooltip: label,
        isIconOnly: true,
        ref,
      }}
      items={items}
      hasChevron={false}
      data-testid={testId}
    />
  );
}

XDSMoreMenu.displayName = 'XDSMoreMenu';
