/**
 * @file XDSCommandPaletteInput.tsx
 * @input Uses React, StyleX, XDSIcon
 * @output Exports XDSCommandPaletteInput component and props
 * @position Search input for the command palette
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 * - /apps/storybook/stories/CommandPalette.stories.tsx
 */

'use client';

import {forwardRef, useEffect, useRef, type InputHTMLAttributes} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSIcon} from '../Icon';
import {
  colorVars,
  lineHeightVars,
  spacingVars,
  typographyVars,
  textSizeVars,
} from '../theme/tokens.stylex';

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
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    lineHeight: lineHeightVars['--leading-normal'],
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
   * The current search value.
   */
  value?: string;

  /**
   * Called when the search value changes.
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
}

/**
 * Search input for the command palette.
 *
 * Renders a search icon and a text input. Auto-focuses when mounted
 * so users can start typing immediately.
 *
 * @compositionHint Place as the first child of XDSCommandPalette.
 *
 * @example
 * ```
 * <XDSCommandPalette isOpen={isOpen} onOpenChange={setIsOpen}>
 *   <XDSCommandPaletteInput
 *     value={search}
 *     onValueChange={setSearch}
 *     placeholder="Search commands..."
 *   />
 * </XDSCommandPalette>
 * ```
 */
export const XDSCommandPaletteInput = forwardRef<
  HTMLInputElement,
  XDSCommandPaletteInputProps
>(function XDSCommandPaletteInput(
  {
    value,
    onValueChange,
    placeholder = 'Search...',
    hasAutoFocus = true,
    onChange,
    ...props
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Merge refs
  const setRefs = (element: HTMLInputElement | null) => {
    (inputRef as React.MutableRefObject<HTMLInputElement | null>).current =
      element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      ref.current = element;
    }
  };

  // Auto-focus on mount
  useEffect(() => {
    if (hasAutoFocus && inputRef.current) {
      // Use requestAnimationFrame to ensure dialog is open first
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [hasAutoFocus]);

  return (
    <div {...stylex.props(styles.wrapper)}>
      <span {...stylex.props(styles.icon)}>
        <XDSIcon icon="search" size="sm" color="inherit" />
      </span>
      <input
        ref={setRefs}
        type="text"
        role="combobox"
        aria-expanded={true}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={value}
        onChange={e => {
          onValueChange?.(e.target.value);
          onChange?.(e);
        }}
        {...stylex.props(styles.input)}
        {...props}
      />
    </div>
  );
});

XDSCommandPaletteInput.displayName = 'XDSCommandPaletteInput';
