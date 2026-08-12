// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file MoreMenu.tsx
 * @input Uses DropdownMenu data or compound children, useIcon
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
 * - /packages/cli/assets/templates/blocks/components/MoreMenu/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import {useIcon} from '../Icon';
import {DropdownMenu} from '../DropdownMenu/DropdownMenu';
import {useSize} from '../SizeContext/SizeContext';
import type {DropdownMenuOption} from '../DropdownMenu';
import type {ButtonVariant, ButtonSize} from '../Button';
import type {BaseProps} from '../BaseProps';
import {stableClassName} from '../naming';
import {useTranslator} from '../i18n';

interface MoreMenuBaseProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  /** Ref forwarded to the trigger button */
  ref?: React.Ref<HTMLButtonElement>;

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

interface MoreMenuDataProps extends MoreMenuBaseProps {
  /**
   * Menu items \u2014 data array of actions, dividers, and sections.
   * Same type as DropdownMenu's `items` prop. Mutually exclusive with
   * `children`.
   */
  items: DropdownMenuOption[];
  children?: undefined;
}

interface MoreMenuCompoundProps extends MoreMenuBaseProps {
  /**
   * Compound DropdownMenu item components for dynamic or stateful menus.
   * Mutually exclusive with `items`.
   */
  children: ReactNode;
  items?: undefined;
}

export type MoreMenuProps = MoreMenuDataProps | MoreMenuCompoundProps;

/**
 * Overflow menu with a three-dot icon trigger.
 *
 * A convenience wrapper around DropdownMenu with icon-only button defaults.
 * Supports the same data-driven `items` and compound `children` modes.
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
  children,
  label: labelFromProps,
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
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.moreMenu.label');
  const size = useSize(sizeProp, 'md');
  const moreIcon = useIcon('moreHorizontal');

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
      hasChevron={false}
      data-testid={testId}
      {...(items !== undefined ? {items} : {children})}
    />
  );
}

MoreMenu.displayName = 'MoreMenu';
