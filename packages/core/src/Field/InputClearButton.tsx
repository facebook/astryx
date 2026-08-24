// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InputClearButton.tsx
 * @input Uses React, Button, Icon
 * @output Exports InputClearButton, the shared clear (✕) button rendered by
 *   every clearable input in the family.
 * @position Shared primitive. Every input that renders a clear affordance —
 *   TextInput, NumberInput, TimeInput, DateInput, DateTimeInput,
 *   DateRangeInput, Selector, MultiSelector, Typeahead, Tokenizer, FileInput —
 *   routes it through here, so the glyph is themed in one place via the
 *   `astryx-input-clear-icon` target and the button wrapper is themed via the
 *   `astryx-input-clear-button` target.
 */

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  button: {
    height: '20px',
    flexShrink: 0,
    // Containing block for the ::after hit overlay below. Button sets its own
    // `position: relative`, so the overlay would resolve correctly without
    // this — but that is another component's internal, and if it ever changes
    // the overlay silently reattaches to some ancestor and the hit area lands
    // in the wrong place. Declaring it here keeps the containing block
    // colocated with the thing that depends on it. No-op at runtime.
    position: 'relative',
    // Expand the tap target to 24px ONLY on touch (WCAG 2.5.8 AA is a touch
    // requirement, and its floor is 24x24). On a fine pointer the 20px glyph
    // is precise enough, and an unconditional overlay could overlap
    // neighboring controls in dense layouts. The inset is 0 by default (hit
    // area == visual glyph) and grows to -2px (=> 24x24) under a coarse
    // pointer — no further, because at -4px the overlay reaches into the 8px
    // adornment gap and, on the inline-start side, over the input's own caret
    // area. Driven through a custom property because StyleX only allows plain
    // values inside a pseudo-element; the conditional lives on this top-level
    // property instead. Private (--_) because it is an internal implementation
    // detail, not a themeable target.
    '--_input-clear-hit-inset': {
      default: '0px',
      '@media (pointer: coarse)': '-2px',
    },
    // The overlay itself is gated too, not just its size. An ::after that is
    // generated on a fine pointer sits exactly over the button at inset 0,
    // where it adds no hit area but is the topmost hit-test box — so hover
    // stops reaching the descendants and `.astryx-input-clear-icon:hover`, a
    // public theme target, no longer matches. `content: none` means the
    // pseudo-element is not generated at all, so on a fine pointer the
    // overlay does not exist.
    '--_input-clear-hit-content': {
      default: 'none',
      '@media (pointer: coarse)': '""',
    },
    '::after': {
      content: 'var(--_input-clear-hit-content)',
      position: 'absolute',
      inset: 'var(--_input-clear-hit-inset)',
    },
  },
});

export interface InputClearButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  xstyle?: stylex.StyleXStyles;
  /**
   * Extra class(es) for the clear glyph itself, merged onto the shared
   * `astryx-input-clear-icon` target. Used by inputs that shipped a
   * component-specific clear-icon target before the family converged here
   * (e.g. `astryx-date-input-clear-icon`) to keep emitting it for a
   * deprecation window; new callers don't need it.
   */
  iconClassName?: string;
}

export function InputClearButton({
  label,
  onClick,
  xstyle,
  iconClassName,
}: InputClearButtonProps): ReactNode {
  const {className: iconTargetClassName} = themeProps('input-clear-icon');
  const {className: buttonTargetClassName} = themeProps('input-clear-button');
  return (
    <Button
      variant="ghost"
      size="sm"
      label={label}
      className={buttonTargetClassName}
      icon={
        <Icon
          icon="close"
          size="sm"
          color="secondary"
          className={
            iconClassName != null
              ? `${iconTargetClassName} ${iconClassName}`
              : iconTargetClassName
          }
        />
      }
      onClick={onClick}
      isIconOnly
      xstyle={[styles.button, xstyle]}
    />
  );
}

InputClearButton.displayName = 'InputClearButton';
