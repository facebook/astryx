// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CommandPaletteInput.tsx
 * @input Uses React, StyleX, Icon, CommandPaletteContext, DialogContext
 * @output Exports CommandPaletteInput component and props
 * @position Search input for the command palette
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 * - /apps/storybook/stories/CommandPaletteInput.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {Icon} from '../Icon';
import {Spinner} from '../Spinner';
import {isRenderable, mergeProps} from '../utils';
import {
  colorVars,
  typeScaleVars,
  spacingVars,
  typographyVars,
} from '../theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';
import {useDialogContext} from '../Dialog/DialogContext';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

import {useMergedRefs} from '../hooks/useMergedRefs';
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
    borderWidth: 0,
    borderStyle: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    // The 16px floor is iOS-only: iOS Safari zooms the page when a focused
    // control sits under 16px, and only iOS WebKit implements
    // -webkit-touch-callout to key the coarse-pointer floor to it.
    fontSize: {
      default: typeScaleVars['--text-body-size'],
      '@media (pointer: coarse)': {
        '@supports (-webkit-touch-callout: none)': `max(1rem, ${typeScaleVars['--text-body-size']})`,
      },
    },
    lineHeight: typeScaleVars['--text-body-leading'],
    padding: 0,
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
});

export interface CommandPaletteInputProps extends Omit<
  BaseProps<HTMLInputElement>,
  'onChange'
> {
  /** Ref forwarded to the input element (for focus management). */
  ref?: React.Ref<HTMLInputElement>;

  /**
   * The current search value.
   * When omitted inside CommandPalette, reads from context.
   */
  value?: string;

  /**
   * Called when the search value changes.
   * When omitted inside CommandPalette, writes to context.
   */
  onValueChange?: (value: string) => void;

  /**
   * Placeholder text for the input.
   * @default 'Search…'
   */
  placeholder?: string;

  /**
   * Accessible label for the query field, announced by screen readers.
   * Falls back to the placeholder text (`'Search…'` by default); provide a
   * purpose-specific label so placeholder text is not the field's only name.
   */
  label?: string;

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
 * When used inside CommandPalette, automatically wires to the
 * context for search state and keyboard navigation (via useCombobox).
 * Can also be used standalone with explicit value/onValueChange props.
 *
 * @compositionHint Place as the first child of CommandPalette.
 *
 * @example
 * ```
 * <CommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <CommandPaletteInput placeholder="Search commands..." />
 * </CommandPalette>
 * ```
 */
export function CommandPaletteInput({
  value: controlledValue,
  onValueChange,
  placeholder: placeholderFromProps,
  label,
  hasAutoFocus = true,
  endContent,
  onChange,
  onKeyDown,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteInputProps) {
  const t = useTranslator();
  const placeholder =
    placeholderFromProps ?? t('@astryx.commandPalette.input.placeholder');
  const ctx = useCommandPaletteContext();
  const dialogContext = useDialogContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Use context values as fallback
  const value = controlledValue ?? ctx?.search;
  const handleValueChange = onValueChange ?? ctx?.setSearch;
  const accessibleLabel = props['aria-label'] ?? label ?? placeholder;
  const hasEndContent = isRenderable(endContent);
  // A popup attribute the caller passes is caller-owned even while its value
  // is undefined (`aria-expanded={open || undefined}`), so the role stays
  // stable as the caller's popup opens and closes, and a present value is
  // passed through unchanged.
  // `aria-haspopup` counts unless it says there is no popup.
  const callerSets = (key: keyof typeof props) => Object.hasOwn(props, key);
  const callerDeclaresPopup =
    callerSets('aria-haspopup') &&
    props['aria-haspopup'] !== false &&
    props['aria-haspopup'] !== 'false';
  const callerOwnsPopup =
    !ctx &&
    (props.role === 'combobox' ||
      callerSets('aria-expanded') ||
      callerSets('aria-autocomplete') ||
      callerSets('aria-controls') ||
      callerSets('aria-owns') ||
      callerSets('aria-activedescendant') ||
      callerDeclaresPopup);
  const standaloneRole = callerSets('role')
    ? props.role
    : callerOwnsPopup
      ? 'combobox'
      : 'searchbox';

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
        themeProps('command-palette-input'),
        stylex.props(styles.wrapper, xstyle),
        className,
        style,
      )}>
      <span {...stylex.props(styles.icon)}>
        <Icon icon="search" size="sm" color="inherit" />
      </span>
      <input
        {...props}
        ref={useMergedRefs(ref, inputRef)}
        {...stylex.props(styles.input)}
        type="text"
        role={ctx ? 'combobox' : standaloneRole}
        aria-expanded={
          ctx
            ? ctx.isOpen
            : callerSets('aria-expanded')
              ? props['aria-expanded']
              : callerOwnsPopup || undefined
        }
        aria-autocomplete={
          ctx
            ? 'list'
            : callerSets('aria-autocomplete')
              ? props['aria-autocomplete']
              : callerOwnsPopup
                ? 'list'
                : undefined
        }
        aria-controls={ctx ? ctx.listId : props['aria-controls']}
        aria-activedescendant={
          ctx
            ? ctx.highlightedIndex >= 0
              ? ctx.getItemId(ctx.highlightedIndex)
              : undefined
            : props['aria-activedescendant']
        }
        // Consumers should provide a purpose-specific label. The released
        // placeholder fallback remains until its incompatible correction has
        // an approved migration path.
        aria-label={accessibleLabel}
        placeholder={placeholder}
        value={value}
        data-autofocus={effectiveAutoFocus || undefined}
        onChange={e => {
          handleValueChange?.(e.target.value);
          onChange?.(e);
        }}
        onKeyDown={handleKeyDown}
      />
      {(ctx?.isBusy || hasEndContent) && (
        <span {...stylex.props(styles.end)}>
          {ctx?.isBusy && (
            <span {...stylex.props(styles.icon, styles.spinner)}>
              <Spinner size="sm" />
            </span>
          )}
          {hasEndContent && endContent}
        </span>
      )}
    </div>
  );
}

CommandPaletteInput.displayName = 'CommandPaletteInput';
