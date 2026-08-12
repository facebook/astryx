// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PanelSearchInput.tsx
 * @input Uses React, StyleX, Icon, InputClearButton, theme tokens
 * @output Exports PanelSearchInput — the search row that sits at the top of a
 *   dropdown panel
 * @position Shared internal primitive; used by Selector and MultiSelector
 *
 * A dropdown panel is already a bordered, elevated surface. Nesting a bordered
 * TextInput inside it draws a second box within that box, so the field reads as
 * a control dropped into the menu rather than part of it. This row is the
 * seamless alternative — magnifier, borderless input, clear button — separated
 * from the options by a divider the panel owns. It is the same shape
 * CommandPaletteInput renders inside the command palette dialog.
 *
 * The clear button is the shared `InputClearButton`, so the affordance and its
 * ghost-button behavior match every other input's clear. It renders AFTER the
 * input in DOM order: the selector components' Tab handling depends on that
 * order to keep the popup open while focus moves onto it.
 *
 * Not exported from the package: it is an implementation detail of the panels
 * that use it, not public API.
 */

import {useCallback, type Ref} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {InputClearButton} from './InputClearButton';
import {mergeProps} from '../utils';
import {
  colorVars,
  spacingVars,
  typeScaleVars,
  typographyVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
  },
  // The icon span needs explicit flex centering to avoid a line-height offset.
  icon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
    borderStyle: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    // Matches the option rows below it, so the query reads as the first line of
    // the list. The coarse-pointer floor keeps iOS from zooming on focus.
    fontSize: {
      default: typeScaleVars['--text-label-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-label-size']})`,
    },
    lineHeight: typeScaleVars['--text-label-leading'],
    // The panel is the focus indicator here: the field fills the top of an
    // already-elevated surface and takes focus on open, so a ring around it
    // would outline the panel's own edge. The caret marks the focus, as it
    // does in CommandPaletteInput.
    outline: 'none',
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
});

export interface PanelSearchInputProps extends Omit<
  BaseProps<HTMLInputElement>,
  'onChange'
> {
  /** Ref forwarded to the input element (for focus management). */
  ref?: Ref<HTMLInputElement>;

  /**
   * Accessible name for the input. Rendered as `aria-label`: the panel has no
   * visible label for the field, and a placeholder is not a reliable name.
   */
  label: string;

  /** Accessible name for the clear (✕) button, e.g. `Clear Search options`. */
  clearLabel: string;

  /** Placeholder text shown while the query is empty. */
  placeholder?: string;

  /** The current query. */
  value: string;

  /** Called with the next query on every keystroke and on clear. */
  onValueChange: (value: string) => void;

  /** Key handler for the input itself. */
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;

  /**
   * Key handler for the row. Events from the input are handled by `onKeyDown`;
   * this one exists for keys pressed on the clear button, which has no other
   * handler of its own.
   */
  onContainerKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}

/**
 * Search row for the top of a dropdown panel: magnifier, borderless input, and
 * a clear button once a query is typed.
 *
 * `className`/`style`/`xstyle` apply to the row; every other prop (`role`,
 * `aria-*`, `id`, …) passes through to the `<input>`, so the caller owns the
 * combobox wiring.
 */
export function PanelSearchInput({
  ref,
  label,
  clearLabel,
  placeholder,
  value,
  onValueChange,
  onKeyDown,
  onContainerKeyDown,
  xstyle,
  className,
  style,
  ...props
}: PanelSearchInputProps) {
  const handleClear = useCallback(() => {
    onValueChange('');
    // Clearing puts the caret back where the user was typing, matching
    // TextInput's built-in clear.
    if (typeof ref === 'object' && ref?.current) {
      ref.current.focus();
    }
  }, [onValueChange, ref]);

  return (
    <div
      onKeyDown={onContainerKeyDown}
      {...mergeProps(stylex.props(styles.wrapper, xstyle), className, style)}>
      <Icon icon="search" size="sm" color="secondary" xstyle={styles.icon} />
      <input
        ref={ref}
        type="text"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={e => onValueChange(e.target.value)}
        onKeyDown={onKeyDown}
        {...stylex.props(styles.input)}
        {...props}
      />
      {value !== '' && (
        <InputClearButton label={clearLabel} onClick={handleClear} />
      )}
    </div>
  );
}

PanelSearchInput.displayName = 'PanelSearchInput';
