// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSCheckboxList.tsx
 * @input Uses React, useId, useOptimistic, useTransition, XDSField, XDSList, XDSCheckboxListContext
 * @output Exports XDSCheckboxList component, XDSCheckboxListProps
 * @position Core implementation; consumed by index.ts, tested by XDSCheckboxList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CheckboxList/CheckboxList.doc.mjs
 * - /packages/core/src/CheckboxList/XDSCheckboxList.test.tsx
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
import type {XDSBaseProps} from '../XDSBaseProps';
import type {SizeValue} from '../utils/types';
import {XDSField} from '../Field/XDSField';
import type {XDSInputStatus} from '../Field/types';
import {XDSList} from '../List/XDSList';
import type {XDSListDensity} from '../List/XDSListContext';
import {mergeProps} from '../utils';
import {xdsThemeProps} from '../utils/xdsThemeProps';
import {
  XDSCheckboxListContext,
  type XDSCheckboxListContextValue,
} from './XDSCheckboxListContext';

const EMPTY_ARRAY: string[] = [];

export interface XDSCheckboxListProps extends Omit<
  XDSBaseProps<HTMLDivElement>,
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
  status?: XDSInputStatus;
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
  density?: XDSListDensity;
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
 * Composes XDSField (for label, description, status) and XDSList
 * (for density, dividers) with a context provider for collection mode.
 *
 * @example
 * ```
 * <XDSCheckboxList
 *   label="Notifications"
 *   value={selected}
 *   onChange={setSelected}>
 *   <XDSCheckboxListItem label="Email" value="email" />
 *   <XDSCheckboxListItem label="SMS" value="sms" />
 *   <XDSCheckboxListItem label="Push" value="push" />
 * </XDSCheckboxList>
 * ```
 */
export function XDSCheckboxList({
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
}: XDSCheckboxListProps) {
  const inputID = useId();
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

  const contextValue = useMemo<XDSCheckboxListContextValue>(
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
    <XDSField
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
      width={width}
      xstyle={xstyle}
      {...mergeProps(xdsThemeProps('checkbox-list'), {className, style})}>
      <XDSCheckboxListContext value={contextValue}>
        <XDSList density={density} hasDividers={hasDividers}>
          {children}
        </XDSList>
      </XDSCheckboxListContext>
    </XDSField>
  );
}

XDSCheckboxList.displayName = 'XDSCheckboxList';
