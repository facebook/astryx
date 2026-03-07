/**
 * @file XDSCommandPaletteItem.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteItem component
 * @position Sub-component; individual selectable item
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

'use client';

import {forwardRef, useCallback, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  textSizeVars,
} from '../theme/tokens.stylex';

const HOVER_HOVER = '@media (hover: hover)';

const styles = stylex.create({
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
    width: '100%',
    paddingInline: spacingVars['--spacing-3'],
    paddingBlock: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-content'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-base'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
    userSelect: 'none',
  },
  itemHover: {
    ':hover': {
      [HOVER_HOVER]: {
        backgroundColor: colorVars['--color-hover-overlay'],
      },
    },
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-hover-overlay'],
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  itemSelected: {
    backgroundColor: colorVars['--color-accent-deemphasized'],
  },
});

export interface XDSCommandPaletteItemProps {
  /**
   * Unique value for identification and selection.
   */
  value: string;

  /**
   * Called when this item is selected (via click or Enter).
   */
  onSelect?: (value: string) => void;

  /**
   * Whether this item is visually highlighted (e.g., via keyboard navigation).
   * @default false
   */
  isHighlighted?: boolean;

  /**
   * Whether this item is currently selected.
   * @default false
   */
  isSelected?: boolean;

  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Item content. Fully custom — render icons, descriptions, shortcuts, etc.
   */
  children: ReactNode;

  /**
   * StyleX overrides for the item.
   */
  xstyle?: StyleXStyles;
}

/**
 * A selectable item in the command palette.
 * Accepts arbitrary children for full rendering control.
 *
 * @compositionHint Place inside XDSCommandPaletteList or XDSCommandPaletteGroup.
 *
 * @example
 * ```
 * <XDSCommandPaletteItem value="settings" onSelect={() => navigate('/settings')}>
 *   Settings
 * </XDSCommandPaletteItem>
 * ```
 */
export const XDSCommandPaletteItem = forwardRef<
  HTMLDivElement,
  XDSCommandPaletteItemProps
>(function XDSCommandPaletteItem(
  {
    value,
    onSelect,
    isHighlighted = false,
    isSelected = false,
    isDisabled = false,
    children,
    xstyle,
  },
  ref,
) {
  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onSelect?.(value);
  }, [isDisabled, value, onSelect]);

  return (
    <div
      ref={ref}
      role="option"
      aria-selected={isHighlighted}
      aria-disabled={isDisabled || undefined}
      data-value={value}
      onClick={handleClick}
      {...stylex.props(
        styles.item,
        !isDisabled && styles.itemHover,
        isHighlighted && styles.itemHighlighted,
        isSelected && styles.itemSelected,
        isDisabled && styles.itemDisabled,
        xstyle,
      )}>
      {children}
    </div>
  );
});

XDSCommandPaletteItem.displayName = 'XDSCommandPaletteItem';
