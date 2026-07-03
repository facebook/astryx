// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MoreMenu.tsx
 * @input Uses DropdownMenu, getIcon
 * @output Exports MoreMenu component and MoreMenuProps type
 * @position Core implementation; consumed by index.ts
 *
 * Overflow menu with a three-dot icon trigger. A thin wrapper around
 * DropdownMenu with icon-only button defaults.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/MoreMenu/MoreMenu.test.tsx
 * - /packages/core/src/MoreMenu/index.ts
 * - /apps/storybook/stories/MoreMenu.stories.tsx
 * - /packages/cli/templates/blocks/components/MoreMenu/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import {getIcon} from '../Icon/globalIconRegistry';
import {DropdownMenu} from '../DropdownMenu/DropdownMenu';
import {useSize} from '../SizeContext/SizeContext';
import type {DropdownMenuOption} from '../DropdownMenu';
import type {ButtonVariant, ButtonSize} from '../Button';
import type {BaseProps} from '../BaseProps';
import {stableClassName} from '../naming';

export interface MoreMenuProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  /** Ref forwarded to the trigger button */
  ref?: React.Ref<HTMLButtonElement>;

  /**
   * Menu items \u2014 data array of actions, dividers, and sections.
   * Same type as DropdownMenu's `items` prop.
   */
  items: DropdownMenuOption[];

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
  variant?: ButtonVariant;

  /**
   * Size of the trigger button.
   * @default 'md'
   */
  size?: ButtonSize;

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
 * A convenience wrapper around DropdownMenu with icon-only button defaults.
 *
 * @example
 * ```
 * <MoreMenu
 *   items={[
 *     { label: 'Edit', onClick: handleEdit },
 *     { label: 'Delete', onClick: handleDelete },
 *   ]}
 * />
 * ```
 */
export function MoreMenu({
  items,
  label = 'More options',
  variant = 'ghost',
  size: sizeProp,
  icon,
  isDisabled = false,
  isMenuOpen,
  onOpenChange,
  xstyle,
  className: classNameProp,
  style,
  'data-testid': testId,
  ref,
}: MoreMenuProps) {
  const size = useSize(sizeProp, 'md');
  const moreIcon = getIcon('moreHorizontal');

  return (
    <DropdownMenu
      className={
        classNameProp
          ? `${stableClassName('more-menu')} ${classNameProp}`
          : stableClassName('more-menu')
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
      data-testid={testId}
    />
  );
}

MoreMenu.displayName = 'MoreMenu';
