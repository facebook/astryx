// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuSelectableControl.tsx
 * @input React, stylex, color/radius/duration/ease/border tokens from core
 * @output DropdownMenuSelectableControl — decorative checkbox/radio visual.
 * @position Internal to @astryxdesign/lab; used by the selectable menu items.
 *
 * Renders the checkbox box + checkmark or the radio circle + dot. Purely
 * decorative (aria-hidden): the selectable menu item owns the
 * menuitemcheckbox/menuitemradio role and aria-checked, so there is no nested
 * native <input> (unlike CheckboxInput/RadioListItem, which are form controls).
 * Visuals mirror those core form controls for consistency.
 *
 * Control size is derived from the parent menu's item size (menuSize): a `lg`
 * menu reuses the `md` control (there is no `lg` control visual); `sm`/`md` map
 * 1:1. This keeps the control proportional to the row it sits in.
 *
 * On coarse-pointer (touch) devices the control swaps to the inline-end of the
 * row via CSS `order` — a thumb-reachable target on the side where selection
 * toggles are conventionally placed on mobile. Pure-CSS (@media pointer:
 * coarse), so it is SSR-safe with no hydration flash.
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  radiusVars,
  durationVars,
  easeVars,
  borderVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps, themeProps} from '@astryxdesign/core/utils';
import type {DropdownMenuSize} from '@astryxdesign/core/DropdownMenu';

/**
 * Menu sizes map to the two control sizes shared with CheckboxInput/RadioList.
 * `lg` menus reuse the `md` control (there is no `lg` control visual).
 */
export type ControlSize = 'sm' | 'md';

export function menuSizeToControlSize(menuSize: DropdownMenuSize): ControlSize {
  return menuSize === 'sm' ? 'sm' : 'md';
}

const styles = stylex.create({
  // Rendered in Item's `marker` slot as a raw flex child, so `order` here
  // moves it relative to the label/description content within the row.
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    // On touch, move the control to the inline-end of the row and detach it
    // from the leading gap so it sits flush to the trailing edge.
    order: {
      default: 0,
      '@media (pointer: coarse)': 1,
    },
    marginInlineStart: {
      default: 0,
      '@media (pointer: coarse)': 'auto',
    },
  },
  box: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: radiusVars['--radius-inner'],
    boxSizing: 'border-box',
    transitionProperty: 'background-color, border-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  circle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: '50%',
    boxSizing: 'border-box',
    transitionProperty: 'background-color, border-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  unchecked: {
    borderColor: colorVars['--color-border-emphasized'],
    backgroundColor: colorVars['--color-background-surface'],
  },
  checked: {
    borderColor: colorVars['--color-accent'],
    backgroundColor: colorVars['--color-accent'],
  },
  disabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: colorVars['--color-on-accent'],
  },
  dot: {
    borderRadius: '50%',
    backgroundColor: colorVars['--color-on-accent'],
  },
});

const boxSizeStyles = stylex.create({
  sm: {width: 18, height: 18},
  md: {width: 22, height: 22},
});

const checkmarkSizeStyles = stylex.create({
  sm: {width: 12, height: 12},
  md: {width: 14, height: 14},
});

const dotSizeStyles = stylex.create({
  sm: {width: 6, height: 6},
  md: {width: 8, height: 8},
});

interface ControlProps {
  type: 'checkbox' | 'radio';
  size: ControlSize;
  isChecked: boolean;
  isDisabled?: boolean;
}

/**
 * Decorative checkbox/radio visual for a selectable menu item. Not focusable
 * and aria-hidden — the item row owns the role + aria-checked.
 */
export function DropdownMenuSelectableControl({
  type,
  size,
  isChecked,
  isDisabled = false,
}: ControlProps) {
  const shape = type === 'checkbox' ? styles.box : styles.circle;
  return (
    <span aria-hidden="true" {...stylex.props(styles.wrapper)}>
      <span
        {...mergeProps(
          themeProps(type === 'checkbox' ? 'checkbox' : 'radio', {
            size,
            checked: isChecked ? 'checked' : null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            shape,
            boxSizeStyles[size],
            isChecked ? styles.checked : styles.unchecked,
            isDisabled && styles.disabled,
          ),
        )}>
        {type === 'checkbox' && isChecked && (
          <svg
            viewBox="0 0 16 16"
            fill="none"
            {...stylex.props(styles.checkmark, checkmarkSizeStyles[size])}>
            <path
              d="M13 4.5L6.5 11.5L3.5 8.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        {type === 'radio' && isChecked && (
          <span {...stylex.props(styles.dot, dotSizeStyles[size])} />
        )}
      </span>
    </span>
  );
}

DropdownMenuSelectableControl.displayName = 'DropdownMenuSelectableControl';
