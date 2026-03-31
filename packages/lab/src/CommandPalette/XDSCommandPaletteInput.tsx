/**
 * @file XDSCommandPaletteInput.tsx
 * @input Uses React, StyleX, XDSIcon, CommandPaletteContext
 * @output Exports XDSCommandPaletteInput component and props
 * @position Search input for the command palette
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

'use client';

import {useCallback, useEffect, useRef, type InputHTMLAttributes} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSIcon} from '@xds/core/Icon';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {
  colorVars,
  typeScaleVars,
  spacingVars,
  typographyVars,
  textSizeVars,
} from '@xds/core/theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-4'],
    paddingBlock: spacingVars['--spacing-3'],
    flexShrink: 0,
  },
  icon: {
    flexShrink: 0,
    color: colorVars['--color-text-secondary'],
  },
  input: {
    flex: 1,
    minWidth: 0,
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    color: colorVars['--color-text-primary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: textSizeVars['--font-size-base'],
    lineHeight: typeScaleVars['--text-body-leading'],
    padding: 0,
    '::placeholder': {
      color: colorVars['--color-text-secondary'],
    },
  },
});

export interface XDSCommandPaletteInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'role' | 'children' | 'autoFocus'
> {
  /**
   * Ref forwarded to the input element (for focus management).
   */
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
   * StyleX styles for the wrapper element.
   */
  xstyle?: StyleXStyles;
}

/**
 * Search input for the command palette.
 *
 * Renders a search icon and a text input. Auto-focuses when mounted
 * so users can start typing immediately.
 *
 * When used inside XDSCommandPalette, automatically wires to the
 * context for search state. Can also be used standalone with explicit
 * value/onValueChange props.
 *
 * @compositionHint Place as the first child of XDSCommandPalette.
 *
 * @example
 * ```
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <XDSCommandPaletteInput
 *     placeholder="Search commands..."
 *   />
 * </XDSCommandPalette>
 * ```
 */
export function XDSCommandPaletteInput({
  value: controlledValue,
  onValueChange,
  placeholder = 'Search...',
  hasAutoFocus = true,
  onChange,
  onKeyDown,
  ref,
  xstyle,
  ...props
}: XDSCommandPaletteInputProps) {
  const ctx = useCommandPaletteContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Use context values as fallback
  const value = controlledValue ?? ctx?.search;
  const handleValueChange = onValueChange ?? ctx?.setSearch;

  // Merge refs
  const setRefs = (element: HTMLInputElement | null) => {
    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
      element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current =
        element;
    }
  };

  // Auto-focus on mount
  useEffect(() => {
    if (hasAutoFocus && inputRef.current) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [hasAutoFocus]);

  // Keyboard navigation when context is available
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (!ctx || e.defaultPrevented) return;

      const items = ctx.items.filter(item => !item.isDisabled);
      if (items.length === 0) return;

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          ctx.setHighlightedIndex(
            Math.min(ctx.highlightedIndex + 1, items.length - 1),
          );
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          ctx.setHighlightedIndex(Math.max(ctx.highlightedIndex - 1, 0));
          break;
        }
        case 'Home': {
          e.preventDefault();
          ctx.setHighlightedIndex(0);
          break;
        }
        case 'End': {
          e.preventDefault();
          ctx.setHighlightedIndex(items.length - 1);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          const highlighted = items[ctx.highlightedIndex];
          if (highlighted) {
            ctx.selectItem(highlighted.value);
          }
          break;
        }
      }
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
        ref={setRefs}
        type="text"
        role="combobox"
        aria-expanded={true}
        aria-autocomplete="list"
        aria-controls={ctx?.listId}
        aria-activedescendant={
          ctx && ctx.highlightedIndex >= 0
            ? `${ctx.listId}-item-${ctx.highlightedIndex}`
            : undefined
        }
        placeholder={placeholder}
        value={value}
        onChange={e => {
          handleValueChange?.(e.target.value);
          onChange?.(e);
          // Reset highlight when search changes
          ctx?.setHighlightedIndex(0);
        }}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.input)}
        {...props}
      />
    </div>
  );
}

XDSCommandPaletteInput.displayName = 'XDSCommandPaletteInput';
