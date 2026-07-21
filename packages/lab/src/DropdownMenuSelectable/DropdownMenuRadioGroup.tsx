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
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {
  DropdownMenuRadioGroupContext,
  type DropdownMenuRadioGroupContextValue,
} from './DropdownMenuRadioGroupContext';

const styles = stylex.create({
  // Match the menu's own inter-item rhythm (2px) so grouped radio items keep
  // the same gap as ungrouped items instead of sitting flush against each
  // other inside the role="group" wrapper.
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
});

export interface DropdownMenuRadioGroupProps extends Omit<
  BaseProps,
  'onChange'
> {
  /**
   * The currently selected value in the group. Pass `undefined` when nothing
   * is selected yet.
   */
  value: string | undefined;
  /**
   * Callback fired when the selected value changes.
   */
  onChange: (value: string) => void;
  /**
   * Accessible label for the group. Required (together with `aria-labelledby`,
   * one of the two) so screen readers announce the radios as a named set,
   * e.g. "Sort by".
   */
  'aria-label'?: string;
  /**
   * The id of an element that labels the group, as an alternative to
   * `aria-label`.
   */
  'aria-labelledby'?: string;
  /**
   * Whether selecting a value closes the menu. Radio items default to closing
   * on selection (a single-choice commit), unlike checkbox items which stay
   * open.
   * @default true
   */
  hasCloseOnSelect?: boolean;
  /**
   * The `DropdownMenuRadioItem`s that make up the group.
   */
  children: ReactNode;
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
  hasCloseOnSelect = true,
  children,
  className,
  style,
  ...rest
}: DropdownMenuRadioGroupProps) {
  const contextValue = useMemo<DropdownMenuRadioGroupContextValue>(
    () => ({value, onChange, hasCloseOnSelect}),
    [value, onChange, hasCloseOnSelect],
  );

  return (
    <div
      {...rest}
      role="group"
      {...mergeProps(stylex.props(styles.group), {className, style})}>
      <DropdownMenuRadioGroupContext value={contextValue}>
        {children}
      </DropdownMenuRadioGroupContext>
    </div>
  );
}

DropdownMenuRadioGroup.displayName = 'DropdownMenuRadioGroup';
