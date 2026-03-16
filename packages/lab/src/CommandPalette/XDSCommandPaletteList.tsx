/**
 * @file XDSCommandPaletteList.tsx
 * @input Uses React, StyleX, CommandPaletteContext
 * @output Exports XDSCommandPaletteList component
 * @position Sub-component; scrollable results container
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

'use client';

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../../../../core/src/theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';

const styles = stylex.create({
  list: {
    overflowY: 'auto',
    maxHeight: '100%',
    padding: spacingVars['--spacing-1'],
    flex: 1,
  },
});

export interface XDSCommandPaletteListProps {
  /**
   * Command palette items, groups, empty states, etc.
   */
  children: ReactNode;

  /**
   * Accessible label for the listbox.
   * @default 'Commands'
   */
  label?: string;

  /**
   * StyleX overrides for the list container.
   */
  xstyle?: StyleXStyles;
}

/**
 * Scrollable results container for the command palette.
 * Renders as a listbox for ARIA compliance.
 *
 * When used inside XDSCommandPalette, automatically gets the correct
 * ID for aria-controls linking with the input.
 *
 * @compositionHint Place inside XDSCommandPalette, after XDSCommandPaletteInput.
 *   Contains XDSCommandPaletteItem and XDSCommandPaletteGroup children.
 *
 * @example
 * ```
 * <XDSCommandPaletteList>
 *   <XDSCommandPaletteItem value="home" onSelect={goHome}>
 *     Go Home
 *   </XDSCommandPaletteItem>
 * </XDSCommandPaletteList>
 * ```
 */
export function XDSCommandPaletteList({
  children,
  label = 'Commands',
  xstyle,
}: XDSCommandPaletteListProps) {
  const ctx = useCommandPaletteContext();

  return (
    <div
      id={ctx?.listId}
      role="listbox"
      aria-label={label}
      {...stylex.props(styles.list, xstyle)}>
      {children}
    </div>
  );
}

XDSCommandPaletteList.displayName = 'XDSCommandPaletteList';
