// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file XDSCommandPaletteInput.tsx
 * @input Uses React, StyleX, XDSIcon, CommandPaletteContext, DialogContext
 * @output Exports XDSCommandPaletteInput component and props
 * @position Search input for the command palette
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 * - /packages/cli/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSIcon} from '../Icon';
import {XDSSpinner} from '../Spinner';
import {xdsClassName, mergeProps, mergeRefs} from '../utils';
import {
  colorVars,
  typeScaleVars,
  spacingVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';
import {useDialogContext} from '../Dialog/DialogContext';
import type {XDSBaseProps} from '../XDSBaseProps';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    flexShrink: 0,
  },
  // The icon span needs explicit flex centering to avoid line-height offset
  icon: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    color: colorVars['--color-text-secondary'],
  },
  // Groups spinner + endContent on the right with a consistent gap
  end: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    flexShrink: 0,
  },
  // Delay spinner appearance to avoid flickering on near-instant searches.
  // Uses @starting-style + transition-delay so the spinner only appears
  // if the search is still pending after 150ms.
  spinner: {
    opacity: 1,
    transitionProperty: 'opacity',
    transitionDuration: '1ms',
    transitionDelay: '150ms',
    '@starting-style': {
      opacity: 0,
    },
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    padding: 0,
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
});

export interface XDSCommandPaletteInputProps extends Omit<
  XDSBaseProps<HTMLInputElement>,
  'onChange'
> {
  /** Ref forwarded to the input element (for focus management). */
  ref?: React.Ref<HTMLInputElement>;

  /**
   * The current search value.
   * When omitted inside XDSCommandPalette, reads from context.
   */
  value?: string;

  /**
   * Called when the search value changes.
   * When omitted inside XDSCommandPalette, writes to context.
   */
  onValueChange?: (value: string) => void;

  /**
   * Placeholder text for the input.
   * @default 'Search...'
   */
  placeholder?: string;

  /**
   * Whether to auto-focus the input when mounted.
   * @default true
   */
  hasAutoFocus?: boolean;

  /**
   * Content rendered at the trailing end of the input, after the spinner.
   * Use for clear buttons, keyboard shortcuts, or other trailing actions.
   * The spinner (when busy) appears immediately before this content with a 4px gap.
   */
  endContent?: ReactNode;

  /** Native onChange handler for the input element. */
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

/**
 * Search input for the command palette.
 *
 * Renders a search icon and a text input. Auto-focuses when mounted
 * so users can start typing immediately.
 *
 * When used inside XDSCommandPalette, automatically wires to the
 * context for search state and keyboard navigation (via useCombobox).
 * Can also be used standalone with explicit value/onValueChange props.
 *
 * @compositionHint Place as the first child of XDSCommandPalette.
 *
 * @example
 * ```
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <XDSCommandPaletteInput placeholder="Search commands..." />
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPaletteInput({
  value: controlledValue,
  onValueChange,
  placeholder = 'Search...',
  hasAutoFocus = true,
  endContent,
  onChange,
  onKeyDown,
  ref,
  xstyle,
  ...props
}: XDSCommandPaletteInputProps) {
  const ctx = useCommandPaletteContext();
  const dialogContext = useDialogContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Use context values as fallback
  const value = controlledValue ?? ctx?.search;
  const handleValueChange = onValueChange ?? ctx?.setSearch;

  // When rendered inside an inline dialog, disable auto-focus by default
  // to avoid stealing focus from the surrounding page.
  const effectiveAutoFocus = hasAutoFocus && dialogContext?.isInline !== true;

  // Auto-focus on mount
  useEffect(() => {
    if (effectiveAutoFocus && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [effectiveAutoFocus]);

  // Keyboard navigation — delegates to useCombobox via context
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) {
        return;
      }
      // Delegate to useCombobox's keyboard handler from context
      ctx?.onKeyDown(e);
    },
    [ctx, onKeyDown],
  );

  return (
    <div
      {...mergeProps(
        xdsClassName('command-palette-input'),
        stylex.props(styles.wrapper, xstyle),
      )}>
      <span {...stylex.props(styles.icon)}>
        <XDSIcon icon="search" size="sm" color="inherit" />
      </span>
      <input
        ref={mergeRefs(ref, inputRef)}
        type="text"
        role="combobox"
        aria-expanded={ctx?.isOpen ?? true}
        aria-autocomplete="list"
        aria-controls={ctx?.listId}
        aria-activedescendant={
          ctx && ctx.highlightedIndex >= 0
            ? ctx.getItemId(ctx.highlightedIndex)
            : undefined
        }
        placeholder={placeholder}
        value={value}
        data-autofocus={effectiveAutoFocus || undefined}
        onChange={e => {
          handleValueChange?.(e.target.value);
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.input)}
        {...props}
      />
      {(ctx?.isBusy || endContent) && (
        <span {...stylex.props(styles.end)}>
          {ctx?.isBusy && (
            <span {...stylex.props(styles.icon, styles.spinner)}>
              <XDSSpinner size="sm" />
            </span>
          )}
          {endContent}
        </span>
      )}{' '}
    </div>
  );
}

XDSCommandPaletteInput.displayName = 'XDSCommandPaletteInput';
