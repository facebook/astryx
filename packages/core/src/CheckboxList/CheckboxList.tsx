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
import {Field} from '../Field/Field';
import type {InputStatus} from '../Field/types';
import {List} from '../List/List';
import type {ListDensity} from '../List/ListContext';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';
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
   * While the returned promise is pending, items are dimmed (reduced
   * opacity) and marked `aria-busy`, and interaction is blocked.
   */
  changeAction?: (values: string[]) => void | Promise<void>;
  /**
   * Whether the checkbox group is in an external loading state.
   * While loading, items are dimmed (reduced opacity) and marked
   * `aria-busy`, and interaction is blocked.
   * @default false
   */
  isLoading?: boolean;
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
  isLoading = false,
  density = 'balanced',
  hasDividers = false,
  isDisabled = false,
  isReadOnly = false,
  children,
  ref,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
}: CheckboxListProps) {
  const inputID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const isCollectionMode = value !== undefined;
  const effectiveValue = value ?? EMPTY_ARRAY;
  const [optimisticValue, setOptimisticValue] = useOptimistic(effectiveValue);
  const isBusy = isLoading || optimisticValue !== effectiveValue;

  const handleChange = useCallback(
    (newValues: string[]) => {
      onChange?.(newValues);
      if (changeAction) {
        startTransition(async () => {
          setOptimisticValue(newValues);
          await changeAction(newValues);
        });
      }
    },
    [onChange, changeAction, startTransition, setOptimisticValue],
  );

  const contextValue = useMemo<CheckboxListContextValue>(
    () => ({
      value: isCollectionMode ? optimisticValue : undefined,
      onChange: isCollectionMode ? handleChange : undefined,
      isDisabled,
      isReadOnly,
      isBusy,
    }),
    [
      isCollectionMode,
      optimisticValue,
      handleChange,
      isDisabled,
      isReadOnly,
      isBusy,
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
      xstyle={xstyle}
      {...mergeProps(xdsThemeProps('checkbox-list'), {className, style})}>
      <CheckboxListContext value={contextValue}>
        <List density={density} hasDividers={hasDividers}>
          {children}
        </List>
      </CheckboxListContext>
    </Field>
  );
}

CheckboxList.displayName = 'CheckboxList';
