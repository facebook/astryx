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

import {useId, useOptimistic, useTransition, type ReactNode} from 'react';
import type {StyleXStyles} from '@stylexjs/stylex';
import {XDSField} from '../Field/XDSField';
import type {XDSInputStatus} from '../Field/types';
import {XDSList} from '../List/XDSList';
import type {XDSListDensity} from '../List/XDSListContext';
import {xdsClassName} from '../utils';
import {
  XDSCheckboxListContext,
  type XDSCheckboxListContextValue,
} from './XDSCheckboxListContext';

const EMPTY_ARRAY: string[] = [];

export interface XDSCheckboxListProps {
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
   * While pending, items show reduced opacity and aria-busy.
   */
  changeAction?: (values: string[]) => void | Promise<void>;
  /**
   * Whether the checkbox group is in an external loading state.
   * @default false
   */
  isLoading?: boolean;
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
   * Checkbox list items to render.
   */
  children: ReactNode;
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /**
   * Test ID for the outer container.
   */
  'data-testid'?: string;
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
}: XDSCheckboxListProps) {
  const inputID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const isCollectionMode = value !== undefined;
  const effectiveValue = value ?? EMPTY_ARRAY;
  const [optimisticValue, setOptimisticValue] = useOptimistic(effectiveValue);
  const isBusy = isLoading || optimisticValue !== effectiveValue;

  const handleChange = (newValues: string[]) => {
    onChange?.(newValues);
    if (changeAction) {
      startTransition(async () => {
        setOptimisticValue(newValues);
        await changeAction(newValues);
      });
    }
  };

  const contextValue: XDSCheckboxListContextValue = {
    value: isCollectionMode ? optimisticValue : undefined,
    onChange: isCollectionMode ? handleChange : undefined,
    isDisabled,
    isReadOnly,
    isBusy,
  };

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
      xstyle={xstyle}
      className={
        xdsClassName('checkbox-list') + (className ? ` ${className}` : '')
      }
      style={style}>
      <XDSCheckboxListContext.Provider value={contextValue}>
        <XDSList density={density} hasDividers={hasDividers}>
          {children}
        </XDSList>
      </XDSCheckboxListContext.Provider>
    </XDSField>
  );
}

XDSCheckboxList.displayName = 'XDSCheckboxList';
