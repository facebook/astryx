// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file CheckboxList.tsx
 * @input Uses React, useId, useOptimistic, useTransition, Field, List, CheckboxListContext
 * @output Exports CheckboxList component, CheckboxListProps
 * @position Core implementation; consumed by index.ts, tested by CheckboxList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxList/CheckboxList.doc.mjs
 * - /packages/core/src/CheckboxList/CheckboxList.test.tsx
 * - /packages/core/src/CheckboxList/index.ts
 * - /apps/storybook/stories/CheckboxList.stories.tsx
 * - /packages/cli/templates/blocks/components/CheckboxList/ (showcase blocks)
 */

import {
  useCallback,
  useId,
  useMemo,
  useOptimistic,
  useTransition,
  type ReactNode,
} from 'react';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {Field} from '../Field/Field';
import type {InputStatus} from '../Field/types';
import {List} from '../List/List';
import type {ListDensity} from '../List/ListContext';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {
  CheckboxListContext,
  type CheckboxListContextValue,
} from './CheckboxListContext';

const EMPTY_ARRAY: string[] = [];

export interface CheckboxListProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Label text for the checkbox group (always rendered for accessibility).
   */
  label: string;
  /**
   * Whether to visually hide the label (still accessible to screen readers).
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Status indicator for the checkbox group.
   * When set with a message, displays a colored message box below the group.
   */
  status?: InputStatus;
  /**
   * The currently selected values (collection mode).
   */
  value?: string[];
  /**
   * Callback fired when the selected values change (collection mode).
   */
  onChange?: (values: string[]) => void;
  /**
   * Async action on change. Fires after onChange.
   * While the returned promise is pending, the toggled item shows a spinner
   * inside its checkbox and is marked `aria-busy`, and re-toggling it is
   * blocked. Other items remain interactive.
   */
  changeAction?: (values: string[]) => void | Promise<void>;
  /**
   * Spacing density for list items.
   * @default 'balanced'
   */
  density?: ListDensity;
  /**
   * Whether to show dividers between list items.
   * @default false
   */
  hasDividers?: boolean;
  /**
   * Whether all checkbox items are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether all checkbox items are read-only.
   * Displays the current state at full opacity but prevents interaction.
   * Unlike `isDisabled`, read-only checkboxes are not visually dimmed.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Checkbox list items to render.
   */
  children: ReactNode;
}

/**
 * A checkbox group component for multi-value selection.
 *
 * Composes Field (for label, description, status) and List
 * (for density, dividers) with a context provider for collection mode.
 *
 * @example
 * ```
 * <CheckboxList
 *   label="Notifications"
 *   value={selected}
 *   onChange={setSelected}>
 *   <CheckboxListItem label="Email" value="email" />
 *   <CheckboxListItem label="SMS" value="sms" />
 *   <CheckboxListItem label="Push" value="push" />
 * </CheckboxList>
 * ```
 */
export function CheckboxList({
  label,
  isLabelHidden = false,
  description,
  status,
  value,
  onChange,
  changeAction,
  density = 'balanced',
  hasDividers = false,
  isDisabled = false,
  isReadOnly = false,
  children,
  ref,
  width,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
}: CheckboxListProps) {
  const inputID = useId();
  const labelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const isCollectionMode = value !== undefined;
  const effectiveValue = value ?? EMPTY_ARRAY;
  const [optimisticValue, setOptimisticValue] = useOptimistic(effectiveValue);
  // Tracks which item has a pending `changeAction`. Auto-reverts to null when
  // the transition settles, so the spinner clears without manual cleanup.
  const [loadingValue, setLoadingValue] = useOptimistic<string | null>(null);

  const handleChange = useCallback(
    (newValues: string[], toggledValue?: string) => {
      onChange?.(newValues);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValues);
          if (toggledValue !== undefined) {
            setLoadingValue(toggledValue);
          }
          await changeAction(newValues);
        });
      }
    },
    [
      onChange,
      changeAction,
      startTransition,
      setOptimisticValue,
      setLoadingValue,
    ],
  );

  const contextValue = useMemo<CheckboxListContextValue>(
    () => ({
      value: isCollectionMode ? optimisticValue : undefined,
      onChange: isCollectionMode ? handleChange : undefined,
      isDisabled,
      isReadOnly,
      loadingValue,
    }),
    [
      isCollectionMode,
      optimisticValue,
      handleChange,
      isDisabled,
      isReadOnly,
      loadingValue,
    ],
  );

  return (
    <Field
      ref={ref}
      data-testid={dataTestId}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={inputID}
      labelID={labelID}
      isGroupLabel
      descriptionID={description ? descriptionID : undefined}
      isDisabled={isDisabled}
      status={
        status
          ? {
              type: status.type,
              message: status.message,
              messageID: status.message ? statusMessageID : undefined,
            }
          : undefined
      }
      statusVariant="detached"
      width={width}
      xstyle={xstyle}
      {...mergeProps(themeProps('checkbox-list'), {className, style})}>
      <CheckboxListContext value={contextValue}>
        <div
          role="group"
          aria-labelledby={labelID}
          aria-describedby={
            [
              description ? descriptionID : null,
              status?.message ? statusMessageID : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }>
          <List density={density} hasDividers={hasDividers}>
            {children}
          </List>
        </div>
      </CheckboxListContext>
    </Field>
  );
}

CheckboxList.displayName = 'CheckboxList';
