'use client';

/**
 * @file XDSCheckboxListItem.tsx
 * @input Uses React, XDSCheckboxInput, XDSListItem, XDSCheckboxListContext
 * @output Exports XDSCheckboxListItem component, XDSCheckboxListItemProps
 * @position Core implementation; consumed by index.ts, tested by XDSCheckboxList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxList/CheckboxList.doc.mjs
 * - /packages/core/src/CheckboxList/XDSCheckboxList.test.tsx
 * - /packages/core/src/CheckboxList/index.ts
 * - /apps/storybook/stories/CheckboxList.stories.tsx
 */

import {useContext, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {XDSBaseProps} from '../XDSBaseProps';
import {XDSCheckboxInput} from '../CheckboxInput/XDSCheckboxInput';
import {XDSListItem} from '../List/XDSListItem';
import {XDSListContext} from '../List/XDSListContext';
import {XDSCheckboxListContext} from './XDSCheckboxListContext';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  selected: {
    backgroundColor: colorVars['--color-accent-muted'],
  },
});

// =============================================================================
// Types
// =============================================================================

export interface XDSCheckboxListItemProps extends XDSBaseProps<HTMLLIElement> {
  /**
   * Primary text label for the item.
   */
  label: string;
  /**
   * Identity key for collection mode (REQUIRED inside XDSCheckboxList).
   * Throws a runtime error if missing when used inside XDSCheckboxList.
   */
  value?: string;
  /**
   * Secondary text below the label.
   */
  description?: string;
  /**
   * Content rendered after the label area.
   */
  endContent?: ReactNode;
  /**
   * Whether this individual item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Direct checked state (standalone mode only).
   * Ignored when inside XDSCheckboxList.
   */
  isChecked?: boolean | 'indeterminate';
  /**
   * Direct check handler (standalone mode only).
   * Ignored when inside XDSCheckboxList.
   */
  onCheck?: (checked: boolean) => void;
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A checkbox item for use within XDSCheckboxList (collection mode)
 * or XDSList (standalone mode).
 *
 * In collection mode, checked state is derived from the parent's value array.
 * In standalone mode, uses isChecked/onCheck props directly.
 *
 * Composes XDSListItem internally — gets density, dividers, hover/press,
 * focus, and container alignment for free.
 *
 * @example
 * ```
 * <XDSCheckboxListItem label="Email" value="email" />
 * <XDSCheckboxListItem
 *   label="Accept terms"
 *   isChecked={accepted}
 *   onCheck={setAccepted}
 * />
 * ```
 */
export function XDSCheckboxListItem({
  label,
  value,
  description,
  endContent,
  isDisabled: isItemDisabled = false,
  isChecked,
  onCheck,
  ref,
  xstyle,
  className,
  style,
  ...restProps
}: XDSCheckboxListItemProps) {
  const ctx = useContext(XDSCheckboxListContext);

  if (ctx && value === undefined) {
    throw new Error(
      'XDSCheckboxListItem requires a `value` prop when used inside XDSCheckboxList.',
    );
  }

  const [isFocused, setIsFocused] = useState(false);

  // Density from list context for checkbox sizing
  const listCtx = useContext(XDSListContext);
  const density = listCtx?.density ?? 'balanced';
  const checkboxSize = density === 'compact' ? 'sm' : 'md';

  // Disabled: parent-level OR item-level
  const effectiveDisabled = (ctx?.isDisabled ?? false) || isItemDisabled;
  const isBusy = ctx?.isBusy ?? false;

  // Resolve checked state:
  // 1. Collection mode (inside XDSCheckboxList with value[])
  // 2. Standalone mode (isChecked prop)
  // 3. Neither → unchecked
  let resolvedChecked: boolean | 'indeterminate' = false;
  if (ctx && ctx.value !== undefined) {
    resolvedChecked = ctx.value.includes(value!);
  } else if (isChecked !== undefined) {
    resolvedChecked = isChecked;
  }

  // Whether this item is interactive (has a toggle handler)
  const isInteractive = ctx != null || onCheck != null;

  const handleToggle = () => {
    if (effectiveDisabled || isBusy) return;

    if (ctx && ctx.value !== undefined) {
      // Collection mode
      const currentlyChecked = ctx.value.includes(value!);
      if (currentlyChecked) {
        ctx.onChange?.(ctx.value.filter(v => v !== value));
      } else {
        ctx.onChange?.([...ctx.value, value!]);
      }
    } else {
      // Standalone mode
      const shouldCheck = resolvedChecked === true ? false : true;
      onCheck?.(shouldCheck);
    }
  };

  return (
    <XDSListItem
      {...restProps}
      ref={ref}
      label={label}
      description={description}
      endContent={endContent}
      isDisabled={effectiveDisabled}
      onClick={isInteractive ? handleToggle : undefined}
      aria-checked={
        resolvedChecked === 'indeterminate' ? 'mixed' : resolvedChecked
      }
      aria-busy={isBusy || undefined}
      xstyle={
        [
          resolvedChecked === true && !effectiveDisabled && styles.selected,
          xstyle,
        ] as StyleXStyles
      }
      className={className}
      style={style}
      startContent={
        <XDSCheckboxInput
          label={label}
          isLabelHidden
          value={resolvedChecked}
          onChange={() => handleToggle()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          isDisabled={effectiveDisabled}
          size={checkboxSize}
        />
      }
    />
  );
}

XDSCheckboxListItem.displayName = 'XDSCheckboxListItem';
