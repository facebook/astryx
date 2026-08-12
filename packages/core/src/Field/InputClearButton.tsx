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
 *   `astryx-input-clear-icon` target.
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
  return (
    <Button
      variant="ghost"
      size="sm"
      label={label}
      icon={
        <Icon
          icon="close"
          size="sm"
          color="inherit"
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
