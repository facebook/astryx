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

'use client';

import {useCallback, useEffect, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {XDSBaseProps} from '@xds/core/XDSBaseProps';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  textSizeVars,
} from '@xds/core/theme/tokens.stylex';
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
    borderRadius: radiusVars['--radius-inner'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: textSizeVars['--font-size-base'],
    color: colorVars['--color-text-primary'],
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left' as const,
    outline: 'none',
    userSelect: 'none',
  },
  itemHover: {
    ':hover': {
      [HOVER_HOVER]: {
        backgroundColor: colorVars['--color-overlay-hover'],
      },
    },
  },
  itemHighlighted: {
    backgroundColor: colorVars['--color-overlay-hover'],
  },
  itemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  itemSelected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
});

export interface XDSCommandPaletteItemProps extends XDSBaseProps<HTMLDivElement> {
  /**
   * Ref forwarded to the root element.
   */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Unique value for identification and selection.
   */
  value: string;

  /**
   * Called when this item is selected (via click or Enter).
   */
  onSelect?: (value: string) => void;

  /**
   * Additional search terms for filtering (used by context filter).
   */
  keywords?: string[];

  /**
   * Whether this item is visually highlighted (e.g., via keyboard navigation).
   * When omitted inside XDSCommandPalette, derived from context.
   * @default false
   */
  isHighlighted?: boolean;

  /**
   * Whether this item is currently selected.
   * When omitted inside XDSCommandPalette, derived from context.
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
}

/**
 * A selectable item in the command palette.
 * Accepts arbitrary children for full rendering control.
 *
 * When used inside XDSCommandPalette, registers with context for
 * filtering, keyboard navigation, and selection. Can also be used
 * standalone with explicit isHighlighted/isSelected props.
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
export function XDSCommandPaletteItem({
  value,
  onSelect,
  keywords,
  isHighlighted: controlledHighlighted,
  isSelected: controlledSelected,
  isDisabled = false,
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
}: XDSCommandPaletteItemProps) {
  const ctx = useCommandPaletteContext();
  const itemRef = useRef<HTMLDivElement>(null);

  // Merge refs
  const setRefs = (element: HTMLDivElement | null) => {
    (itemRef as React.MutableRefObject<HTMLDivElement | null>).current =
      element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLDivElement | null>).current = element;
    }
  };

  // Register with context on mount
  useEffect(() => {
    if (!ctx) return;
    const unregister = ctx.registerItem(value, isDisabled);
    return unregister;
  }, [value, isDisabled, ctx]);

  // Derive state from context or props
  const itemIndex = ctx?.items.findIndex(item => item.value === value) ?? -1;
  const isHighlighted =
    controlledHighlighted ?? (ctx ? itemIndex === ctx.highlightedIndex : false);
  const isSelected = controlledSelected ?? (ctx ? ctx.value === value : false);

  // Filter: check if this item matches the search
  const score =
    ctx?.isFiltered && ctx.search ? ctx.filter(value, ctx.search, keywords) : 1;

  // Scroll highlighted item into view
  useEffect(() => {
    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView?.({block: 'nearest'});
    }
  }, [isHighlighted]);

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    onSelect?.(value);
    if (ctx) {
      ctx.selectItem(value);
      ctx.onClose();
    }
  }, [isDisabled, value, onSelect, ctx]);

  const handleMouseEnter = useCallback(() => {
    if (isDisabled || !ctx) return;
    ctx.setHighlightedIndex(itemIndex);
  }, [isDisabled, itemIndex, ctx]);

  // Don't render if filtered out
  if (score === 0) return null;

  return (
    <div
      ref={setRefs}
      id={ctx ? `${ctx.listId}-item-${itemIndex}` : undefined}
      role="option"
      aria-selected={isHighlighted}
      aria-disabled={isDisabled || undefined}
      data-value={value}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...mergeProps(
        xdsClassName('command-palette-item'),
        stylex.props(
          styles.item,
          !isDisabled && styles.itemHover,
          isHighlighted && styles.itemHighlighted,
          isSelected && styles.itemSelected,
          isDisabled && styles.itemDisabled,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {children}
    </div>
  );
}

XDSCommandPaletteItem.displayName = 'XDSCommandPaletteItem';
