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
 * - /packages/cli/assets/templates/blocks/components/CheckboxList/ (showcase blocks)
 */

import {use, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {useDevWarning} from '../hooks/useDevWarning';
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
   * Plain-text accessible name for the checkbox when `label` is a ReactNode.
   *
   * A string `label` names the checkbox automatically. A rich (ReactNode)
   * `label` cannot, so pass a concise string equivalent via the standard
   * `aria-label` — otherwise the checkbox falls back to the generic name
   * "Checkbox" and every rich-label item in a list announces identically to
   * screen readers. Applied to the checkbox control, not the row.
   *
   * @example
   * ```
   * <CheckboxListItem
   *   label={<span>Pro plan <Badge label="Recommended" /></span>}
   *   aria-label="Pro plan"
   *   value="pro"
   * />
   * ```
   */
  'aria-label'?: string;
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
  'aria-label': ariaLabel,
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

  // Accessible name for the (visually hidden) checkbox label. A string
  // `label` names it directly; a rich label needs `aria-label`.
  const checkboxLabel =
    ariaLabel ??
    (typeof label === 'string'
      ? label
      : t('@astryx.checkboxList.item.checkbox'));

  // Dev-time guardrail: a rich label without `aria-label` leaves the
  // checkbox with the generic name "Checkbox".
  useDevWarning(
    'CheckboxListItem',
    '`label` is a ReactNode, so the checkbox falls ' +
      'back to the generic accessible name "Checkbox". Pass ' +
      '`aria-label` with a concise string equivalent of the visible ' +
      'label so screen readers can tell items apart.',
    typeof label !== 'string' && ariaLabel == null,
  );

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

  // The checkbox is the row's single keyboard control and action. The row is
  // an enlarged click/tap target that delegates surface clicks to it via
  // ListItem's `interactiveRef` (useClickableContainer), so each option is
  // exactly one tab stop. Delegate whenever the row should respond to clicks:
  // a toggleable item, or one carrying a consumer `onClick`.
  const checkboxRef = useRef<HTMLInputElement | null>(null);
  const hasRowInteraction = isInteractive || onClickProp != null;

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
      // Delegate row clicks to the checkbox instead of wiring onClick (which
      // would add an invisible row button = a second tab stop). The checkbox
      // stays the option's sole focusable control (WCAG 4.1.2 / APG checkbox
      // pattern). A consumer onClick rides on the checkbox itself (below), so
      // it still fires for both direct and delegated (row-surface) clicks.
      interactiveRef={hasRowInteraction ? checkboxRef : undefined}
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
          ref={checkboxRef}
          label={checkboxLabel}
          isLabelHidden
          value={resolvedChecked}
          onChange={() => handleToggle()}
          onClick={onClickProp}
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
