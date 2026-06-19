// Copyright (c) Meta Platforms, Inc. and affiliates.

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
 * - /packages/core/src/MoreMenu/XDSMoreMenu.test.tsx
 * - /packages/core/src/MoreMenu/index.ts
 * - /apps/storybook/stories/MoreMenu.stories.tsx
 * - /packages/cli/templates/blocks/components/MoreMenu/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import {getIcon} from '../Icon/globalIconRegistry';
import {XDSDropdownMenu} from '../DropdownMenu/XDSDropdownMenu';
import {useXDSSize} from '../SizeContext/XDSSizeContext';
import type {XDSDropdownMenuOption} from '../DropdownMenu';
import type {XDSButtonVariant, XDSButtonSize} from '../Button';
import type {XDSBaseProps} from '../XDSBaseProps';

export interface XDSMoreMenuProps extends Pick<
  XDSBaseProps,
  'xstyle' | 'className' | 'style'
> {
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

  /**
   * Whether to auto-focus the first menu item when the menu opens.
   * Set to `false` for inline showcases or documentation previews.
   * @default true
   */
  hasAutoFocus?: boolean;

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
  hasAutoFocus,
  xstyle,
  className: classNameProp,
  style,
  'data-testid': testId,
  ref,
}: XDSMoreMenuProps) {
  const size = useXDSSize(sizeProp, 'md');
  const moreIcon = getIcon('moreHorizontal');

  return (
    <XDSDropdownMenu
      className={
        classNameProp ? `xds-more-menu ${classNameProp}` : 'xds-more-menu'
      }
      xstyle={xstyle}
      style={style}
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
      hasAutoFocus={hasAutoFocus}
      data-testid={testId}
    />
  );
}

XDSMoreMenu.displayName = 'XDSMoreMenu';
