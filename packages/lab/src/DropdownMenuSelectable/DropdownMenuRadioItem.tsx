// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuRadioItem.tsx
 * @input React, stylex, Item + Icon + DropdownMenu context from core
 * @output DropdownMenuRadioItem — a single option in a radio group.
 * @position @astryxdesign/lab; must be used inside a DropdownMenuRadioGroup.
 *
 * A menu item representing one option in a single-select group
 * (role="menuitemradio"). The row owns the role and aria-checked; there is no
 * nested native <input> (per the WAI-ARIA menuitemradio pattern). Selection
 * state + onChange come from DropdownMenuRadioGroupContext. Keyboard nav +
 * Enter/Space activation come from the parent DropdownMenu.
 *
 * The control visual is sized from the menu's item size and swaps to the
 * inline-end of the row on coarse-pointer devices — see
 * DropdownMenuSelectableControl.
 */

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {renderIconSlot, type IconType} from '@astryxdesign/core/Icon';
import {Item} from '@astryxdesign/core/Item';
import {useDropdownMenuContext} from '@astryxdesign/core/DropdownMenu';
import {colorVars, spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {useDropdownMenuRadioGroupContext} from './DropdownMenuRadioGroupContext';
import {
  DropdownMenuSelectableControl,
  menuSizeToControlSize,
} from './DropdownMenuSelectableControl';

const styles = stylex.create({
  root: {
    width: '100%',
    borderRadius: `max(0px, calc(var(--_dropdown-menu-radius, ${spacingVars['--spacing-2']}) - var(--_dropdown-menu-padding, ${spacingVars['--spacing-1']})))`,
    color: colorVars['--color-text-primary'],
    backgroundColor: {
      default: 'transparent',
      ':focus': colorVars['--color-overlay-hover'],
      ':hover': colorVars['--color-overlay-hover'],
    },
    cursor: 'pointer',
    outline: 'none',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});

export interface DropdownMenuRadioItemProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  /** The value this item represents within its group. */
  value: string;
  /** Primary label text. */
  label: ReactNode;
  /** Secondary description text displayed below the label. */
  description?: ReactNode;
  /** Icon to display before the label. */
  icon?: ReactNode | IconType;
  /** Whether the item is disabled. @default false */
  isDisabled?: boolean;
  /** Additional content to render after the label/description. */
  endContent?: ReactNode;
  'data-testid'?: string;
}

/**
 * A single option in a DropdownMenuRadioGroup (role="menuitemradio").
 *
 * @example
 * ```
 * <DropdownMenuRadioGroup value={sort} onChange={setSort} aria-label="Sort by">
 *   <DropdownMenuRadioItem value="newest" label="Newest" />
 *   <DropdownMenuRadioItem value="oldest" label="Oldest" icon="clock" />
 * </DropdownMenuRadioGroup>
 * ```
 */
export function DropdownMenuRadioItem({
  value,
  label,
  description,
  icon,
  isDisabled = false,
  endContent,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: DropdownMenuRadioItemProps) {
  const menuCtx = useDropdownMenuContext();
  const groupCtx = useDropdownMenuRadioGroupContext();
  if (!groupCtx) {
    throw new Error(
      'DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup',
    );
  }
  const menuSize = menuCtx?.menuSize ?? 'md';
  const controlSize = menuSizeToControlSize(menuSize);
  const isChecked = groupCtx.value === value;

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    groupCtx.onChange(value);
    if (groupCtx.closeOnSelect) {
      menuCtx?.closeMenu();
    }
  }, [isDisabled, groupCtx, value, menuCtx]);

  return (
    <Item
      role="menuitemradio"
      aria-checked={isChecked}
      tabIndex={isDisabled ? undefined : -1}
      marker={
        <DropdownMenuSelectableControl
          type="radio"
          size={controlSize}
          isChecked={isChecked}
          isDisabled={isDisabled}
        />
      }
      startContent={
        icon
          ? renderIconSlot(icon, {size: 'sm', color: 'secondary'})
          : undefined
      }
      label={label}
      description={description}
      endContent={endContent}
      onClick={handleClick}
      isDisabled={isDisabled}
      data-testid={testId}
      xstyle={[styles.root, isDisabled && styles.disabled, xstyle]}
      {...mergeProps(themeProps('dropdown-menu-item', {size: menuSize}), {
        className,
        style,
      })}
    />
  );
}

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
