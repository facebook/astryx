// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuCheckboxItem.tsx
 * @input React, stylex, Item + Icon + DropdownMenu context from core
 * @output DropdownMenuCheckboxItem — a standalone checkable menu item.
 * @position @astryxdesign/lab; used inside a core DropdownMenu.
 *
 * A menu item that toggles an independent boolean (role="menuitemcheckbox").
 * Unlike CheckboxInput, there is no nested native <input>: the row itself owns
 * the role and aria-checked, per the WAI-ARIA menuitemcheckbox pattern.
 * Keyboard navigation (arrows/typeahead) and Enter/Space activation come from
 * the parent DropdownMenu's useListFocus + activation path, which matches
 * menuitemcheckbox alongside plain menuitem rows.
 *
 * The control visual is sized from the menu's item size (menuSize) and swaps to
 * the inline-end of the row on coarse-pointer devices — see
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

export interface DropdownMenuCheckboxItemProps extends Pick<
  BaseProps,
  'xstyle' | 'className' | 'style'
> {
  /** Primary label text. */
  label: ReactNode;
  /** Secondary description text displayed below the label. */
  description?: ReactNode;
  /** Icon to display before the label. */
  icon?: ReactNode | IconType;
  /** Whether the item is checked. */
  isChecked: boolean;
  /** Callback fired with the next checked state when toggled. */
  onCheckedChange?: (checked: boolean) => void;
  /** Whether the item is disabled. @default false */
  isDisabled?: boolean;
  /**
   * Whether toggling closes the menu. Checkbox items usually stay open so
   * multiple toggles are possible in one session. @default false
   */
  closeOnSelect?: boolean;
  /** Additional content to render after the label/description. */
  endContent?: ReactNode;
  'data-testid'?: string;
}

/**
 * A checkable dropdown menu item (role="menuitemcheckbox").
 *
 * Must be used inside a DropdownMenu. Toggles an independent boolean; for a
 * one-of-N choice use DropdownMenuRadioGroup + DropdownMenuRadioItem instead.
 *
 * @example
 * ```
 * import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
 * import {DropdownMenuCheckboxItem} from '@astryxdesign/lab';
 *
 * <DropdownMenu button={{label: 'View'}}>
 *   <DropdownMenuCheckboxItem
 *     label="Show archived"
 *     isChecked={showArchived}
 *     onCheckedChange={setShowArchived}
 *   />
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuCheckboxItem({
  label,
  description,
  icon,
  isChecked,
  onCheckedChange,
  isDisabled = false,
  closeOnSelect = false,
  endContent,
  xstyle,
  className,
  style,
  'data-testid': testId,
}: DropdownMenuCheckboxItemProps) {
  const ctx = useDropdownMenuContext();
  const menuSize = ctx?.menuSize ?? 'md';
  const controlSize = menuSizeToControlSize(menuSize);

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    onCheckedChange?.(!isChecked);
    if (closeOnSelect) {
      ctx?.closeMenu();
    }
  }, [isDisabled, onCheckedChange, isChecked, closeOnSelect, ctx]);

  return (
    <Item
      role="menuitemcheckbox"
      aria-checked={isChecked}
      tabIndex={isDisabled ? undefined : -1}
      marker={
        <DropdownMenuSelectableControl
          type="checkbox"
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

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
