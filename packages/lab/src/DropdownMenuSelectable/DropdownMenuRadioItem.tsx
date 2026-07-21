// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuRadioItem.tsx
 * @input React, stylex, Item + Icon + DropdownMenu context + tokens from core
 * @output DropdownMenuRadioItem — a single option in a radio group.
 * @position @astryxdesign/lab; must be used inside a DropdownMenuRadioGroup.
 *
 * A menu item representing one option in a single-select group
 * (role="menuitemradio"). The row owns the role and aria-checked; there is no
 * nested native <input> (per the WAI-ARIA menuitemradio pattern). Selection
 * state + onChange come from DropdownMenuRadioGroupContext. Keyboard nav +
 * Enter/Space activation come from the parent DropdownMenu.
 *
 * The round radio visual (circle + center dot) is decorative (aria-hidden) —
 * the row owns the checked state. Its size is derived from the menu's item size
 * and it swaps to the inline-end of the row on coarse-pointer (touch) devices
 * via CSS `order`. The dot is a shaped element, not an icon (a filled circle
 * has no registry glyph).
 */

import {useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {renderIconSlot, type IconType} from '@astryxdesign/core/Icon';
import {Item} from '@astryxdesign/core/Item';
import {useDropdownMenuContext} from '@astryxdesign/core/DropdownMenu';
import {
  colorVars,
  spacingVars,
  durationVars,
  easeVars,
  borderVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {useDropdownMenuRadioGroupContext} from './DropdownMenuRadioGroupContext';

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
  // Rendered in Item's `marker` slot as a raw flex child. On touch it moves to
  // the inline-end of the row via `order`.
  circle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxSizing: 'border-box',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: '50%',
    transitionProperty: 'background-color, border-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    order: {
      default: 0,
      '@media (pointer: coarse)': 1,
    },
    marginInlineStart: {
      default: 0,
      '@media (pointer: coarse)': 'auto',
    },
  },
  unchecked: {
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: colorVars['--color-background-surface'],
  },
  checked: {
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  dot: {
    borderRadius: '50%',
    backgroundColor: colorVars['--color-on-accent'],
  },
});

const circleSizeStyles = stylex.create({
  sm: {width: 18, height: 18},
  md: {width: 22, height: 22},
});

const dotSizeStyles = stylex.create({
  sm: {width: 6, height: 6},
  md: {width: 8, height: 8},
});

export interface DropdownMenuRadioItemProps extends Omit<
  BaseProps,
  'role' | 'aria-checked' | 'tabIndex'
> {
  /**
   * The value this item represents within its group. The group's `value`
   * matches against this to determine the checked state.
   */
  value: string;
  /**
   * Primary label text identifying the option.
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
   * Whether this individual radio item is disabled. Disabled items stay
   * focusable (via `aria-disabled`) so they remain discoverable by keyboard
   * and assistive technology, but selection is blocked.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Content to render after the label and description, such as a badge or
   * metadata.
   */
  endContent?: ReactNode;
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
  ...rest
}: DropdownMenuRadioItemProps) {
  const menuCtx = useDropdownMenuContext();
  const groupCtx = useDropdownMenuRadioGroupContext();
  if (!groupCtx) {
    throw new Error(
      'DropdownMenuRadioItem must be used within a DropdownMenuRadioGroup',
    );
  }
  const menuSize = menuCtx?.menuSize ?? 'md';
  const controlSize = menuSize === 'sm' ? 'sm' : 'md';
  const isChecked = groupCtx.value === value;

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    groupCtx.onChange(value);
    if (groupCtx.hasCloseOnSelect) {
      menuCtx?.closeMenu();
    }
  }, [isDisabled, groupCtx, value, menuCtx]);

  return (
    <Item
      {...rest}
      role="menuitemradio"
      aria-checked={isChecked}
      tabIndex={isDisabled ? undefined : -1}
      marker={
        <span
          aria-hidden="true"
          {...mergeProps(
            themeProps('radio', {
              size: controlSize,
              checked: isChecked ? 'checked' : null,
              disabled: isDisabled ? 'disabled' : null,
            }),
            stylex.props(
              styles.circle,
              circleSizeStyles[controlSize],
              isChecked ? styles.checked : styles.unchecked,
            ),
          )}>
          {isChecked && (
            <span {...stylex.props(styles.dot, dotSizeStyles[controlSize])} />
          )}
        </span>
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

DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';
