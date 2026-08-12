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
    // Expand the tap target to >=24px ONLY on touch (WCAG 2.5.8 is a touch
    // requirement). On a fine pointer the 20px glyph is precise enough, and an
    // unconditional overlay could overlap neighboring controls in dense
    // layouts. The inset is 0 by default (hit area == visual glyph) and grows
    // to -4px (=> 28x28) under a coarse pointer. Driven through a custom
    // property because StyleX only allows plain values inside a pseudo-element;
    // the conditional lives on this top-level property instead.
    '--clear-hit-inset': {
      default: '0px',
      '@media (pointer: coarse)': '-4px',
    },
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 'var(--clear-hit-inset)',
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
