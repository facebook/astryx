/**
 * @file XDSCommandPaletteInput.tsx
 * @input Uses React, StyleX, XDSIcon, XDSSpinner, CommandPaletteContext
 * @output Exports XDSCommandPaletteInput component and props
 * @position Search input for the command palette
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/CommandPalette/README.md
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

'use client';

import {
  useCallback,
  useEffect,
  useOptimistic,
  useRef,
  useTransition,
  type ChangeEvent,
  type InputHTMLAttributes,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSIcon} from '@xds/core/Icon';
import {XDSSpinner} from '@xds/core/Spinner';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {
  colorVars,
  typeScaleVars,
  spacingVars,
  typographyVars,
  textSizeVars,
} from '@xds/core/theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';
import {getNavigableItems} from './getNavigableItems';

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
  'type' | 'role' | 'children' | 'autoFocus' | 'onChange'
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
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;

  /**
   * Async action on change. Fires after onChange if not prevented.
   * Uses React transitions for built-in loading state.
   * The input shows a spinner while the action is pending.
   */
  onChangeAction?: (
    value: string,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;

  /**
   * Manual loading override. Shows a spinner in place of the search icon.
   * @default false
   */
  isLoading?: boolean;

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
 * so users can start typing immediately.
 *
 * Supports async search via `onChangeAction` — the input automatically
 * shows a spinner while the action is pending, following the same
 * transition pattern as XDSTextInput.
 *
 * When used inside XDSCommandPalette, automatically wires to the
 * context for search state and keyboard navigation. Can also be used
 * standalone with explicit value/onChange props.
 *
 * @compositionHint Place as the first child of XDSCommandPalette.
 *
 * @example
 * ```
 * <XDSCommandPaletteInput
 *   placeholder="Search commands..."
 *   onChangeAction={async (search) => {
 *     const results = await api.search(search);
 *     setResults(results);
 *   }}
 * />
 * ```
 */
export function XDSCommandPaletteInput({
  value: controlledValue,
  onChange,
  onChangeAction,
  isLoading = false,
  placeholder = 'Search...',
  hasAutoFocus = true,
  onKeyDown,
  ref,
  xstyle,
  ...props
}: XDSCommandPaletteInputProps) {
  const ctx = useCommandPaletteContext();
  const inputRef = useRef<HTMLInputElement>(null);

  // Use context values as fallback
  const value = controlledValue ?? ctx?.search ?? '';
  const handleValueChange = onChange
    ? (v: string, e: ChangeEvent<HTMLInputElement>) => onChange(v, e)
    : ctx?.setSearch
      ? (v: string) => ctx.setSearch(v)
      : undefined;

  // Transition support (matches XDSTextInput pattern)
  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

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

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      handleValueChange?.(newValue, e);
      if (onChangeAction && !e.defaultPrevented) {
        startTransition(async () => {
          setOptimisticValue(newValue);
          await onChangeAction(newValue, e);
        });
      }
    },
    [handleValueChange, onChangeAction, startTransition, setOptimisticValue],
  );

  // Keyboard navigation — walks non-disabled items by value
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(e);
      if (!ctx || e.defaultPrevented) return;

      const navigable = getNavigableItems(ctx.items);
      if (navigable.length === 0) return;

      const currentIdx = navigable.findIndex(
        item => item.value === ctx.highlightedValue,
      );

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const next = currentIdx < navigable.length - 1 ? currentIdx + 1 : 0; // cycle to top
          ctx.setHighlightedValue(navigable[next].value);
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prev = currentIdx > 0 ? currentIdx - 1 : navigable.length - 1; // cycle to bottom
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
            // Trigger click on the highlighted item — its handler calls onSelect + onClose
            const el = document.querySelector(
              `[data-value="${CSS.escape(ctx.highlightedValue)}"]`,
            ) as HTMLElement | null;
            el?.click();
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
        {isBusy ? (
          <XDSSpinner size="sm" />
        ) : (
          <XDSIcon icon="search" size="sm" color="inherit" />
        )}
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
        aria-busy={isBusy || undefined}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...stylex.props(styles.input)}
        {...props}
      />
    </div>
  );
}

XDSCommandPaletteInput.displayName = 'XDSCommandPaletteInput';
