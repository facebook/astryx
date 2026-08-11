// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuCheckboxItem.tsx
 * @input React, stylex, Item + CheckboxInput + DropdownMenu context + tokens from core
 * @output DropdownMenuCheckboxItem — a standalone checkable menu item.
 * @position Sub-component; used inside DropdownMenu.
 *
 * A menu item that toggles an independent boolean (role="menuitemcheckbox").
 * Unlike CheckboxInput, there is no nested native <input> that participates in
 * accessibility: the row itself owns the role and aria-checked, per the
 * WAI-ARIA menuitemcheckbox pattern. Keyboard navigation (arrows/typeahead) and
 * Enter/Space activation come from the parent DropdownMenu's useListFocus +
 * activation path, which matches menuitemcheckbox alongside plain menuitem rows.
 *
 * The checkbox visual composes the real CheckboxInput primitive so its checkmark
 * matches CheckboxListItem and picks up the standard `checkbox` theming slots.
 * It is purely decorative: the composed control is wrapped in an element that is
 * both `aria-hidden` and `inert`, so it contributes nothing to the row's
 * accessible name, and its native <input> and sr-only label stay out of the tab
 * order and the accessibility tree while pointer clicks fall through to the row
 * — the same shim MultiSelector uses. The row owns the checked state and
 * accessible name. The control size is derived from the menu's item size (a
 * `sm` menu gets the compact control; `md`/`lg` get the standard one) and it
 * swaps to the inline-end of the row on coarse-pointer (touch) devices via CSS
 * `order`, so it lands where selection toggles are conventionally placed on
 * mobile.
 */

import {useCallback, type PointerEvent, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {renderIconSlot, type IconType} from '../Icon';
import {CheckboxInput} from '../CheckboxInput/CheckboxInput';
import {Item} from '../Item';
import {useDropdownMenuContext} from './DropdownMenuContext';
import {focusMenuItemOnHover} from './menuItemHover';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {mergeProps, themeProps} from '../utils';
import type {BaseProps} from '../BaseProps';

const styles = stylex.create({
  root: {
    width: '100%',
    borderRadius: `max(0px, calc(var(--_dropdown-menu-radius, ${spacingVars['--spacing-2']}) - var(--_dropdown-menu-padding, ${spacingVars['--spacing-1']})))`,
    color: colorVars['--color-text-primary'],
    backgroundColor: {
      default: 'transparent',
      ':focus': colorVars['--color-overlay-hover'],
    },
    cursor: 'pointer',
    outline: 'none',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  // Rendered in Item's `marker` slot as a raw flex child, so `order` moves it
  // relative to the label within the row. On touch it moves to the inline-end.
  // `aria-hidden` + `inert` + pointer-events:none keep the composed CheckboxInput
  // decorative: it adds no accessible name, and clicks fall through to the row,
  // which owns the role and activation.
  markerBox: {
    display: 'flex',
    flexShrink: 0,
    pointerEvents: 'none',
    order: {
      default: 0,
      '@media (pointer: coarse)': 1,
    },
    marginInlineStart: {
      default: 0,
      '@media (pointer: coarse)': 'auto',
    },
  },
});

export interface DropdownMenuCheckboxItemProps extends Omit<
  BaseProps,
  'onChange' | 'role' | 'aria-checked' | 'tabIndex'
> {
  /**
   * Primary label text identifying the item.
   */
  label: ReactNode;
  /**
   * Secondary description text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Icon to display before the label. Accepts a semantic icon name (see
   * `npx astryx docs icons`) or a rendered node.
   */
  icon?: ReactNode | IconType;
  /**
   * Whether the item is checked. Controlled — pair with `onChange`.
   */
  value: boolean;
  /**
   * Callback fired with the next checked state when the item is toggled.
   */
  onChange?: (checked: boolean) => void;
  /**
   * Whether the item is disabled. Disabled items stay focusable (via
   * `aria-disabled`) so they remain discoverable by keyboard and assistive
   * technology, but activation is blocked.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether toggling the item closes the menu. Checkbox items default to
   * staying open so several can be toggled in a single session, unlike radio
   * items which default to closing on selection.
   * @default false
   */
  hasCloseOnSelect?: boolean;
  /**
   * Content to render after the label and description, such as a keyboard
   * shortcut hint or badge.
   */
  endContent?: ReactNode;
}

/**
 * A checkable dropdown menu item (role="menuitemcheckbox").
 *
 * Must be used inside a DropdownMenu. Toggles an independent boolean; for a
 * one-of-N choice use DropdownMenuRadioGroup + DropdownMenuRadioItem instead.
 *
 * @example
 * ```
 * import {DropdownMenuCheckboxItem} from '@astryxdesign/core/DropdownMenu';
 * <DropdownMenu button={{label: 'View'}}>
 *   <DropdownMenuCheckboxItem
 *     label="Show archived"
 *     value={showArchived}
 *     onChange={setShowArchived}
 *   />
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuCheckboxItem({
  label,
  description,
  icon,
  value,
  onChange,
  isDisabled = false,
  hasCloseOnSelect = false,
  endContent,
  xstyle,
  className,
  style,
  ...rest
}: DropdownMenuCheckboxItemProps) {
  const ctx = useDropdownMenuContext();
  const menuSize = ctx?.menuSize ?? 'md';
  const controlSize = menuSize === 'sm' ? 'sm' : 'md';

  // The composed checkbox is decorative and inert, so its label never reaches
  // the accessibility tree — the row's `label` prop provides the announced
  // name. CheckboxInput still requires a string label, so pass one through when
  // the row label is a plain string.
  const checkboxLabel = typeof label === 'string' ? label : '';

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    onChange?.(!value);
    if (hasCloseOnSelect) {
      ctx?.closeMenu();
    }
  }, [isDisabled, onChange, value, hasCloseOnSelect, ctx]);

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLElement>) => focusMenuItemOnHover(e, isDisabled),
    [isDisabled],
  );

  return (
    <Item
      {...rest}
      role="menuitemcheckbox"
      aria-checked={value}
      tabIndex={isDisabled ? undefined : -1}
      onPointerMove={handlePointerMove}
      marker={
        <div aria-hidden="true" inert {...stylex.props(styles.markerBox)}>
          <CheckboxInput
            label={checkboxLabel}
            isLabelHidden
            value={value}
            isDisabled={isDisabled}
            size={controlSize}
          />
        </div>
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
      xstyle={[styles.root, isDisabled && styles.disabled, xstyle]}
      {...mergeProps(themeProps('dropdown-menu-item', {size: menuSize}), {
        className,
        style,
      })}
    />
  );
}

DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';
