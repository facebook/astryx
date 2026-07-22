// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CheckboxListItem.tsx
 * @input Uses React, CheckboxInput, ListItem, CheckboxListContext
 * @output Exports CheckboxListItem component, CheckboxListItemProps
 * @position Core implementation; consumed by index.ts, tested by CheckboxList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxList/CheckboxList.doc.mjs
 * - /packages/core/src/CheckboxList/CheckboxList.test.tsx
 * - /packages/core/src/CheckboxList/index.ts
 * - /apps/storybook/stories/CheckboxList.stories.tsx
 * - /packages/cli/templates/blocks/components/CheckboxList/ (showcase blocks)
 */

import {use, type MouseEvent, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {composeEventHandlers} from '../utils';
import {CheckboxInput} from '../CheckboxInput/CheckboxInput';
import {ListItem} from '../List/ListItem';
import {ListContext} from '../List/ListContext';
import {CheckboxListContext} from './CheckboxListContext';
import {useTranslator} from '../i18n';

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

export interface CheckboxListItemProps extends BaseProps<HTMLLIElement> {
  /**
   * Primary text label for the item.
   *
   * Accepts a plain string (single-line truncation applied automatically)
   * or a ReactNode for rich content (no truncation constraints —
   * child components control their own text behavior).
   */
  label: ReactNode;
  /**
   * Identity key for collection mode (REQUIRED inside CheckboxList).
   * Throws a runtime error if missing when used inside CheckboxList.
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
   * Whether this item is in a loading state. Renders a spinner inside the
   * checkbox and blocks interaction on this item only.
   *
   * In collection mode, this is also driven automatically: when the parent
   * `CheckboxList` has a `changeAction`, the toggled item shows its
   * spinner while that promise is pending.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Direct checked state (standalone mode only).
   * Ignored when inside CheckboxList.
   */
  isChecked?: boolean | 'indeterminate';
  /**
   * Direct check handler (standalone mode only).
   * Ignored when inside CheckboxList.
   */
  onCheck?: (checked: boolean) => void;
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A checkbox item for use within CheckboxList (collection mode)
 * or List (standalone mode).
 *
 * In collection mode, checked state is derived from the parent's value array.
 * In standalone mode, uses isChecked/onCheck props directly.
 *
 * Composes ListItem internally — gets density, dividers, hover/press,
 * focus, and container alignment for free.
 *
 * @example
 * ```
 * <CheckboxListItem label="Email" value="email" />
 * <CheckboxListItem
 *   label="Accept terms"
 *   isChecked={accepted}
 *   onCheck={setAccepted}
 * />
 * ```
 */
export function CheckboxListItem({
  label,
  value,
  description,
  endContent,
  isDisabled: isItemDisabled = false,
  isLoading: isItemLoading = false,
  isChecked,
  onCheck,
  ref,
  xstyle,
  className,
  style,
  onClick: onClickProp,
  ...restProps
}: CheckboxListItemProps) {
  const t = useTranslator();
  const ctx = use(CheckboxListContext);

  if (ctx && ctx.value !== undefined && value === undefined) {
    throw new Error(
      'CheckboxListItem requires a `value` prop when used inside CheckboxList with a value array.',
    );
  }

  // Density from list context for checkbox sizing
  const listCtx = use(ListContext);
  const density = listCtx?.density ?? 'balanced';
  const checkboxSize = density === 'compact' ? 'sm' : 'md';

  // Disabled: parent-level OR item-level
  const effectiveDisabled = (ctx?.isDisabled ?? false) || isItemDisabled;
  const effectiveReadOnly = ctx?.isReadOnly ?? false;
  // Loading is per-item: explicit item prop OR (collection mode) the item
  // whose `changeAction` is currently pending in the parent.
  const isBusy =
    isItemLoading ||
    (ctx?.loadingValue != null && value !== undefined
      ? ctx.loadingValue === value
      : false);

  // Resolve checked state:
  // 1. Collection mode (inside CheckboxList with value[])
  // 2. Standalone mode (isChecked prop)
  // 3. Neither → unchecked
  let resolvedChecked: boolean | 'indeterminate' = false;
  if (ctx && ctx.value !== undefined && value !== undefined) {
    resolvedChecked = ctx.value.includes(value);
  } else if (isChecked !== undefined) {
    resolvedChecked = isChecked;
  }

  // Whether this item is interactive (has a toggle handler)
  const isInteractive = !effectiveReadOnly && (ctx != null || onCheck != null);

  const handleToggle = () => {
    if (effectiveDisabled || effectiveReadOnly || isBusy) {
      return;
    }

    if (ctx && ctx.value !== undefined && value !== undefined) {
      // Collection mode — pass the toggled value up so the list can show a
      // spinner on this item while a changeAction is pending.
      const currentlyChecked = ctx.value.includes(value);
      if (currentlyChecked) {
        ctx.onChange?.(
          ctx.value.filter(v => v !== value),
          value,
        );
      } else {
        ctx.onChange?.([...ctx.value, value], value);
      }
    } else {
      // Standalone mode
      const shouldCheck = resolvedChecked === true ? false : true;
      onCheck?.(shouldCheck);
    }
  };

  return (
    <ListItem
      {...restProps}
      ref={ref}
      label={label}
      description={description}
      endContent={endContent}
      isDisabled={effectiveDisabled}
      onClick={
        isInteractive || onClickProp
          ? composeEventHandlers<MouseEvent>(
              onClickProp as ((event: MouseEvent) => void) | undefined,
              isInteractive ? handleToggle : undefined,
            )
          : undefined
      }
      aria-busy={isBusy || undefined}
      xstyle={
        [
          resolvedChecked === true &&
            !effectiveDisabled &&
            !effectiveReadOnly &&
            styles.selected,
          xstyle,
        ] as StyleXStyles
      }
      className={className}
      style={style}
      startContent={
        <CheckboxInput
          label={
            typeof label === 'string'
              ? label
              : t('@astryx.checkboxList.item.checkbox')
          }
          isLabelHidden
          value={resolvedChecked}
          onChange={() => handleToggle()}
          isDisabled={effectiveDisabled}
          isReadOnly={effectiveReadOnly}
          isLoading={isBusy}
          size={checkboxSize}
        />
      }
    />
  );
}

CheckboxListItem.displayName = 'CheckboxListItem';
