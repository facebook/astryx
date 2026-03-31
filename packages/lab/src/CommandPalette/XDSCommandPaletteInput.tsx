/**
 * @file XDSCommandPaletteInput.tsx
 * @input Uses React, StyleX, XDSIcon, CommandPaletteContext
 * @output Exports XDSCommandPaletteInput component and props
 * @position Search input for the command palette; renders with built-in bottom separator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CommandPalette/README.md
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
  borderVars,
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
    // Built-in separator — no manual <XDSDivider /> needed
    borderBlockEndWidth: borderVars['--border-width'],
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
  },
  // The icon span needs explicit flex centering to avoid line-height offset
  icon: {
    display: 'flex',
    alignItems: 'center',
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

export interface XDSCommandPaletteInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'type' | 'role' | 'children' | 'autoFocus'
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

  /** StyleX styles for the wrapper element. */
  xstyle?: StyleXStyles;
}

/**
 * Search input for the command palette.
 *
 * Renders a search icon and a text input. Auto-focuses when mounted
 * so users can start typing immediately. Includes a built-in bottom
 * separator between the input and the results list — no XDSDivider needed.
 *
 * When used inside XDSCommandPalette, automatically wires to the
 * context for search state and keyboard navigation. Can also be used
 * standalone with explicit value/onValueChange props.
 *
 * @compositionHint Place as the first child of XDSCommandPalette.
 *
 * @example
 * ```
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <XDSCommandPaletteInput placeholder="Search commands..." />
 *   <XDSCommandPaletteList>...</XDSCommandPaletteList>
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

  // Keyboard navigation — walks visible (non-filtered, non-disabled) items by value
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (!ctx || e.defaultPrevented) return;

      // Build the navigable list: registered items that are enabled AND pass
      // the current filter. This is the ground truth for arrow key movement.
      const navigable = ctx.items.filter(item => {
        if (item.isDisabled) return false;
        if (!ctx.isFiltered || !ctx.search) return true;
        return ctx.filter(item.value, ctx.search) > 0;
      });
      if (navigable.length === 0) return;

      const currentIdx = navigable.findIndex(
        item => item.value === ctx.highlightedValue,
      );

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next =
            currentIdx < navigable.length - 1 ? currentIdx + 1 : currentIdx;
          ctx.setHighlightedValue(navigable[next].value);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIdx > 0 ? currentIdx - 1 : 0;
          ctx.setHighlightedValue(navigable[prev].value);
          break;
        }
        case 'Home': {
          e.preventDefault();
          ctx.setHighlightedValue(navigable[0].value);
          break;
        }
        case 'End': {
          e.preventDefault();
          ctx.setHighlightedValue(navigable[navigable.length - 1].value);
          break;
        }
        case 'Enter': {
          e.preventDefault();
          if (ctx.highlightedValue) {
            ctx.selectItem(ctx.highlightedValue);
            ctx.onClose();
          }
          break;
        }
      }
    },
    [ctx, onKeyDown],
  );

  // Derive the highlighted item's DOM id for aria-activedescendant
  const highlightedItemIndex = ctx
    ? ctx.items.findIndex(item => item.value === ctx.highlightedValue)
    : -1;

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
        aria-expanded={ctx?.isOpen ?? true}
        aria-autocomplete="list"
        aria-controls={ctx?.listId}
        aria-activedescendant={
          highlightedItemIndex >= 0
            ? `${ctx?.listId}-item-${highlightedItemIndex}`
            : undefined
        }
        placeholder={placeholder}
        value={value}
        onChange={e => {
          handleValueChange?.(e.target.value);
          onChange?.(e);
          // Reset highlight when search changes
          ctx?.setHighlightedValue('');
        }}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.input)}
        {...props}
      />
    </div>
  );
}

XDSCommandPaletteInput.displayName = 'XDSCommandPaletteInput';
