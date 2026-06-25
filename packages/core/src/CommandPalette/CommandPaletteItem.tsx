// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';
/**
 * @file CommandPaletteItem.tsx
 * @input Uses React, StyleX, CommandPaletteContext, DialogContext
 * @output Exports CommandPaletteItem component
 * @position Sub-component; individual selectable item
 *
 * SYNC: When modified, update:
 * - /packages/cli/templates/blocks/components/CommandPalette/ (showcase blocks)
 */

import {useCallback, useEffect, useMemo, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {mergeProps, mergeRefs} from '../utils';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {useCommandPaletteContext} from './CommandPaletteContext';
import {useDialogContext} from '../Dialog/DialogContext';
import {themeProps} from '../utils/themeProps';

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
    fontSize: typeScaleVars['--text-label-size'],
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
    ':active': {
      backgroundColor: colorVars['--color-overlay-pressed'],
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

export interface CommandPaletteItemProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange' | 'onSelect'
> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /** Unique value for identification and selection. */
  value: string;
  /** Called when this item is selected (via click or Enter). */
  onSelect?: (value: string) => void;
  /**
   * Whether this item is visually highlighted (keyboard focus).
   * When omitted inside CommandPalette, derived from context.
   * @default false
   */
  isHighlighted?: boolean;
  /**
   * Whether this item is currently selected (picker mode).
   * @default false
   */
  isSelected?: boolean;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /** Item content. Fully custom — render icons, descriptions, shortcuts, etc. */
  children: ReactNode;
}

/**
 * A selectable item in the command palette.
 * Accepts arbitrary children for full rendering control.
 *
 * When used inside CommandPalette, registers with context for
 * keyboard navigation and selection. Can also be used
 * standalone with explicit isHighlighted/isSelected props.
 *
 * @compositionHint Place inside CommandPaletteList or CommandPaletteGroup.
 *
 * @example
 * ```
 * <CommandPaletteItem value="settings" onSelect={() => navigate('/settings')}>
 *   Settings
 * </CommandPaletteItem>
 * ```
 */
export function CommandPaletteItem({
  value,
  onSelect,
  isHighlighted: controlledHighlighted,
  isSelected: controlledSelected,
  isDisabled = false,
  children,
  ref,
  xstyle,
  className,
  style,
  ...props
}: CommandPaletteItemProps) {
  const ctx = useCommandPaletteContext();
  const dialogContext = useDialogContext();
  const isInlineDialog = dialogContext?.isInline === true;
  const itemRef = useRef<HTMLDivElement>(null);
  const didMountRef = useRef(false);

  // Find this item's index in the flat selectable items list (DOM order).
  // This aligns with useCombobox's index-based navigation.
  const itemIndex = useMemo(
    () => ctx?.selectableItems.findIndex(item => item.value === value) ?? -1,
    [ctx?.selectableItems, value],
  );

  // Highlight from useCombobox: index-based, matches DOM order
  const isHighlighted =
    controlledHighlighted ??
    (ctx ? ctx.highlightedIndex === itemIndex && itemIndex >= 0 : false);
  const isSelected = controlledSelected ?? (ctx ? ctx.value === value : false);

  useEffect(() => {
    // Inline dialogs are documentation/showcase previews. Avoid scrolling the
    // surrounding page when picker mode auto-highlights its selected item on
    // mount, while preserving scroll-into-view after user navigation.
    const shouldSkipInitialInlineScroll =
      isInlineDialog && !didMountRef.current;
    didMountRef.current = true;

    if (shouldSkipInitialInlineScroll) {
      return;
    }

    if (isHighlighted && itemRef.current) {
      itemRef.current.scrollIntoView?.({block: 'nearest'});
    }
  }, [isHighlighted, isInlineDialog]);

  const handleClick = useCallback(() => {
    if (isDisabled) {
      return;
    }
    onSelect?.(value);
    if (ctx) {
      ctx.selectItem(value);
      ctx.onClose();
    }
  }, [isDisabled, value, onSelect, ctx]);

  const handleMouseEnter = useCallback(() => {
    if (isDisabled || !ctx || itemIndex < 0) {
      return;
    }
    ctx.setHighlightedIndex(itemIndex);
  }, [isDisabled, itemIndex, ctx]);

  return (
    <div
      ref={mergeRefs(ref, itemRef)}
      id={ctx && itemIndex >= 0 ? ctx.getItemId(itemIndex) : undefined}
      role="option"
      aria-selected={isSelected}
      aria-disabled={isDisabled || undefined}
      data-value={value}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...mergeProps(
        themeProps('command-palette-item'),
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

CommandPaletteItem.displayName = 'CommandPaletteItem';
