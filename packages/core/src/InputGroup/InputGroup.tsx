// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file InputGroup.tsx
 * @input Uses React, StyleX, theme tokens, InputGroupContext
 * @output Exports InputGroup component
 * @position Groups input with prefix/suffix addons; consumed by index.ts
 *
 * Children (TextInput, NumberInput) consume the InputGroup context
 * to remove their own border/radius so the group container provides
 * the unified border treatment.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/InputGroup/InputGroup.doc.mjs
 * - /packages/core/src/InputGroup/InputGroup.test.tsx
 * - /packages/core/src/InputGroup/index.ts
 * - /apps/storybook/stories/InputGroup.stories.tsx
 * - /packages/cli/templates/blocks/components/InputGroup/
 */

import {useId, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {sizeVars} from '../theme/tokens.stylex';
import {Field, type InputStatus} from '../Field';
import {SizeProvider, useSize} from '../SizeContext/SizeContext';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {InputGroupContext} from './InputGroupContext';
import {themeProps} from '../utils/themeProps';

export type InputGroupSize = 'sm' | 'md' | 'lg';

const styles = stylex.create({
  group: {
    display: 'inline-flex',
    alignItems: 'stretch',
    backgroundColor: 'transparent',
  },
  disabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
});

const sizeStyles = stylex.create({
  sm: {
    height: sizeVars['--size-element-sm'],
  },
  md: {
    height: sizeVars['--size-element-md'],
  },
  lg: {
    height: sizeVars['--size-element-lg'],
  },
});

export interface InputGroupProps extends Omit<
  BaseProps<HTMLDivElement>,
  'children'
> {
  /** Ref forwarded to the group container element */
  ref?: React.Ref<HTMLDivElement>;

  /**
   * Input and addon children.
   */
  children: ReactNode;

  /**
   * Label text for the group (required for accessibility).
   */
  label: string;

  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;

  /**
   * Description text displayed between the label and input group.
   */
  description?: string;

  /**
   * Whether the group is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * Whether the field is optional.
   * @default false
   */
  isOptional?: boolean;

  /**
   * Whether the field is required.
   * @default false
   */
  isRequired?: boolean;

  /**
   * Default size for inputs in the group.
   * @default 'md'
   */
  size?: InputGroupSize;

  /**
   * Status indicator applied to the group border.
   */
  status?: InputStatus;

  /**
   * Tooltip text at the end of the label.
   */
  labelTooltip?: string;

  /**
   * Test ID for testing frameworks.
   */
  'data-testid'?: string;
}

/**
 * Groups an input with prefix/suffix addons in a visually connected
 * container with shared border and focus ring.
 *
 * @example
 * ```
 * <InputGroup label="Price">
 *   <InputGroupText>$</InputGroupText>
 *   <TextInput label="Price" isLabelHidden value={price} onChange={setPrice} />
 * </InputGroup>
 * ```
 */
export function InputGroup({
  children,
  label,
  isLabelHidden = false,
  description,
  isDisabled = false,
  isOptional = false,
  isRequired = false,
  size: sizeProp,
  status,
  labelTooltip,
  xstyle,
  className,
  style,
  ref,
  'data-testid': testId,
  ...rest
}: InputGroupProps) {
  const size = useSize(sizeProp, 'md');
  const inputId = useId();
  const labelID = useId();
  const statusMessageId = useId();

  const contextValue = useMemo(() => ({isInGroup: true as const}), []);

  return (
    <InputGroupContext value={contextValue}>
      <SizeProvider value={size}>
        <Field
          label={label}
          isLabelHidden={isLabelHidden}
          description={description}
          inputID={inputId}
          labelID={labelID}
          isGroupLabel
          isOptional={isOptional}
          isRequired={isRequired}
          isDisabled={isDisabled}
          status={
            status
              ? {
                  type: status.type,
                  message: status.message,
                  messageID: status.message ? statusMessageId : undefined,
                }
              : undefined
          }
          statusVariant="detached"
          labelTooltip={labelTooltip}>
          <div
            ref={ref}
            role="group"
            aria-labelledby={labelID}
            data-testid={testId}
            {...rest}
            {...mergeProps(
              themeProps('input-group', {
                size,
                status: status?.type ?? null,
              }),
              stylex.props(
                styles.group,
                sizeStyles[size],
                isDisabled && styles.disabled,
                xstyle,
              ),
              className,
              style,
            )}>
            {children}
          </div>
        </Field>
      </SizeProvider>
    </InputGroupContext>
  );
}

InputGroup.displayName = 'InputGroup';
