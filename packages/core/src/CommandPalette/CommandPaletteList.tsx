// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CommandPaletteList.tsx
 * @input Uses React, StyleX, CommandPaletteContext
 * @output Exports CommandPaletteList component
 * @position Sub-component; scrollable results container
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/index.ts
 * - /packages/cli/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps} from '../utils';
import {spacingVars} from '../theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  list: {
    overflowY: 'auto',
    maxHeight: '100%',
    padding: spacingVars['--spacing-1'],
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
});

export interface CommandPaletteListProps extends BaseProps<HTMLDivElement> {
  /**
   * Ref forwarded to the root element.
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Command palette items, groups, empty states, etc.
   */
  children: ReactNode;

  /**
   * Accessible label for the listbox.
   * @default 'Commands'
   */
  label?: string;
}

/**
 * Scrollable results container for the command palette.
 * Renders as a listbox for ARIA compliance.
 *
 * When used inside CommandPalette, automatically gets the correct
 * ID for aria-controls linking with the input.
 *
 * @compositionHint Place inside CommandPalette, after CommandPaletteInput.
 *   Contains CommandPaletteItem and CommandPaletteGroup children.
 *
 * @example
 * ```
 * <CommandPaletteList>
 *   <CommandPaletteItem value="home" onSelect={goHome}>
 *     Go Home
 *   </CommandPaletteItem>
 * </CommandPaletteList>
 * ```
 */
export function CommandPaletteList({
  children,
  label = 'Commands',
  ref,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteListProps) {
  const ctx = useCommandPaletteContext();

  return (
    <div
      ref={ref}
      id={ctx?.listId}
      role="listbox"
      aria-label={label}
      {...mergeProps(
        themeProps('command-palette-list'),
        stylex.props(styles.list, xstyle),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

CommandPaletteList.displayName = 'CommandPaletteList';
