// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file DropdownMenuRadioGroup.tsx
 * @output DropdownMenuRadioGroup — a single-select group of menu items.
 * @position @astryxdesign/lab; wraps DropdownMenuRadioItem inside a DropdownMenu.
 *
 * Owns single-selection state (value/onChange) for its child
 * DropdownMenuRadioItems and exposes it via context. Renders role="group" with
 * an accessible name so the radios are announced as a set. Keyboard navigation
 * comes from the parent DropdownMenu's useListFocus, which matches
 * menuitemradio rows.
 */

import {useMemo, type ReactNode} from 'react';
import {mergeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {
  DropdownMenuRadioGroupContext,
  type DropdownMenuRadioGroupContextValue,
} from './DropdownMenuRadioGroupContext';

export interface DropdownMenuRadioGroupProps extends Pick<
  BaseProps,
  'className' | 'style'
> {
  /** The currently selected value. */
  value: string | undefined;
  /** Callback fired with the newly selected value. */
  onChange: (value: string) => void;
  /**
   * Accessible label for the group. Required so screen readers announce the
   * set of radios with a name (e.g. "Sort by").
   */
  'aria-label'?: string;
  /** id of an element labelling the group, as an alternative to aria-label. */
  'aria-labelledby'?: string;
  /** Whether selecting a value closes the menu. @default true */
  closeOnSelect?: boolean;
  /** The DropdownMenuRadioItems. */
  children: ReactNode;
  'data-testid'?: string;
}

/**
 * A single-select group of radio menu items (role="group" of menuitemradio).
 *
 * @example
 * ```
 * import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
 * import {DropdownMenuRadioGroup, DropdownMenuRadioItem} from '@astryxdesign/lab';
 *
 * <DropdownMenu button={{label: 'Sort'}}>
 *   <DropdownMenuRadioGroup value={sort} onChange={setSort} aria-label="Sort by">
 *     <DropdownMenuRadioItem value="newest" label="Newest" />
 *     <DropdownMenuRadioItem value="oldest" label="Oldest" />
 *   </DropdownMenuRadioGroup>
 * </DropdownMenu>
 * ```
 */
export function DropdownMenuRadioGroup({
  value,
  onChange,
  closeOnSelect = true,
  children,
  className,
  style,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  'data-testid': testId,
}: DropdownMenuRadioGroupProps) {
  const contextValue = useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({value, onChange, closeOnSelect}),
    [value, onChange, closeOnSelect],
  );

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      data-testid={testId}
      {...mergeProps({className, style})}>
      <DropdownMenuRadioGroupContext value={contextValue}>
        {children}
      </DropdownMenuRadioGroupContext>
    </div>
  );
}

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
