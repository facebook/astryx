/**
 * @file XDSCommandPaletteItem.tsx
 * @input Uses React, StyleX, CommandPaletteContext
 * @output Exports XDSCommandPaletteItem component
 * @position Sub-component; individual selectable item
 *
 * SYNC: When modified, update:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  textSizeVars,
} from '../theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';

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
   * Unique value for filtering and selection.
   */
  value: string;

  /**
   * Called when this item is selected (via click or Enter).
   */
  onSelect?: (value: string) => void;

  /**
   * Additional search terms for filtering.
   */
  keywords?: string[];

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
 * @example
 * ```
 * <XDSCommandPaletteItem value="settings" onSelect={() => navigate("/settings")}>
 *   <XDSIcon icon="settings" size="sm" />
 *   <span>Settings</span>
 *   <XDSCommandPaletteShortcut keys="mod+," />
 * </XDSCommandPaletteItem>
 * ```
 */
export function XDSCommandPaletteItem({
  value,
  onSelect,
  keywords,
  isDisabled = false,
  children,
  xstyle,
}: XDSCommandPaletteItemProps) {
  const ctx = useCommandPaletteContext();
  const itemRef = useRef<HTMLDivElement>(null);

  // Register with context on mount
  useEffect(() => {
    const unregister = ctx.registerItem(value, isDisabled);
    return unregister;
  }, [value, isDisabled, ctx.registerItem]);

  // Determine this item's index in the items array
  const itemIndex = ctx.items.findIndex(item => item.value === value);
  const isHighlighted = itemIndex === ctx.highlightedIndex;
  const isSelected = ctx.value === value;

  // Filter: check if this item matches the search
  const score = ctx.isFiltered ? ctx.filter(value, ctx.search, keywords) : 1;

  // Scroll highlighted item into view
  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView?.({block: 'nearest'});
    }
  }, [isHighlighted]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onSelect?.(value);
    ctx.selectItem(value);
    ctx.onClose();
  }, [isDisabled, value, onSelect, ctx]);

  const handleMouseEnter = useCallback(() => {
    if (isDisabled) return;
    ctx.setHighlightedIndex(itemIndex);
  }, [isDisabled, itemIndex, ctx]);

  // Don't render if filtered out
  if (score === 0) return null;

  return (
    <div
      ref={itemRef}
      id={`${ctx.listId}-item-${itemIndex}`}
      role="option"
      aria-selected={isHighlighted}
      aria-disabled={isDisabled || undefined}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
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
}

XDSCommandPaletteItem.displayName = 'XDSCommandPaletteItem';
