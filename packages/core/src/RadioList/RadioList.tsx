// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioList.tsx
 * @input Uses React useId, createContext, ReactNode, Field, InputStatus
 * @output Exports RadioList component, RadioListProps, RadioListContext
 * @position Core implementation; consumed by index.ts, tested by RadioList.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/RadioList.doc.mjs
 * - /packages/core/src/RadioList/RadioList.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioList.stories.tsx
 * - /packages/cli/templates/blocks/components/RadioList/ (showcase blocks)
 */

import React, {createContext, useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {Field} from '../Field/Field';
import type {InputStatus} from '../Field/types';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

/**
 * Size of the radio controls, matching CheckboxInput sizes.
 */
export type RadioListSize = 'sm' | 'md';

export interface RadioListContextValue {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isRequired: boolean;
  size: RadioListSize;
  status?: InputStatus;
}

export const RadioListContext =
  createContext<RadioListContextValue | null>(null);
RadioListContext.displayName = 'RadioListContext';

const styles = stylex.create({
  radiogroup: {
    display: 'flex',
  },
  vertical: {
    flexDirection: 'column',
    gap: spacingVars['--spacing-2'],
  },
  horizontal: {
    flexDirection: 'row',
    gap: spacingVars['--spacing-5'],
  },
});

export interface RadioListProps extends Omit<
  BaseProps<HTMLElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Label text for the radio group (always rendered for accessibility).
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
   * The currently selected value.
   */
  value: string;
  /**
   * Callback fired when the selected value changes.
   */
  onChange: (value: string) => void;
  /**
   * Layout direction of the radio items.
   * @default "vertical"
   */
  orientation?: 'vertical' | 'horizontal';
  /**
   * Whether all radio items are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the radio group is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Status indicator for the radio group.
   * When set with a message, displays a colored message box below the group.
   */
  status?: InputStatus;
  /**
   * The size of the radio controls.
   * - 'sm': Compact size (18px radio, 20px wrapper)
   * - 'md': Default size (22px radio, 24px wrapper)
   * @default 'md'
   */
  size?: RadioListSize;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /**
   * Tooltip text to display in an info icon at the end of the label.
   */
  labelTooltip?: string;
  /**
   * Test ID for the outer container.
   */
  'data-testid'?: string;
  /**
   * Radio list items to render.
   */
  children: ReactNode;
}

/**
 * A radio group component for single-value selection.
 *
 * @example
 * ```
 * <RadioList
 *   label="Notification preference"
 *   value={selected}
 *   onChange={setSelected}>
 *   <RadioListItem label="Email" value="email" />
 *   <RadioListItem label="SMS" value="sms" />
 *   <RadioListItem label="Push" value="push" />
 * </RadioList>
 * ```
 */
export function RadioList({
  ref,
  label,
  isLabelHidden = false,
  description,
  value,
  onChange,
  orientation = 'vertical',
  isDisabled = false,
  isRequired = false,
  isOptional = false,
  size = 'md',
  status,
  labelTooltip,
  width,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  children,
}: RadioListProps) {
  const name = useId();
  const inputID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const contextValue = useMemo<RadioListContextValue>(
    () => ({name, value, onChange, isDisabled, isRequired, size, status}),
    [name, value, onChange, isDisabled, isRequired, size, status],
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
      isOptional={isOptional}
      isRequired={isRequired}
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
      labelTooltip={labelTooltip}
      statusVariant="detached"
      width={width}
      xstyle={xstyle}
      className={className}
      style={style}>
      <div
        role="radiogroup"
        aria-label={label}
        aria-describedby={
          [
            description ? descriptionID : null,
            status?.message ? statusMessageID : null,
          ]
            .filter(Boolean)
            .join(' ') || undefined
        }
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-required={isRequired || undefined}
        {...mergeProps(
          themeProps('radio-list', {orientation, size}),
          stylex.props(
            styles.radiogroup,
            orientation === 'vertical' ? styles.vertical : styles.horizontal,
          ),
        )}>
        <RadioListContext value={contextValue}>
          {children}
        </RadioListContext>
      </div>
    </Field>
  );
}

RadioList.displayName = 'RadioList';
