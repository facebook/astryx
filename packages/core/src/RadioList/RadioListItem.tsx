// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioListItem.tsx
 * @input Uses React use, useId, RadioListContext
 * @output Exports RadioListItem component, RadioListItemProps
 * @position Core implementation; consumed by index.ts, tested by RadioList.test.tsx
 *
 * Composes Item for the shared start content + label + description + end content layout.
 * Delegates the radio input + circle to RadioControl.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/RadioControl.tsx
 * - /packages/core/src/RadioList/RadioList.doc.mjs
 * - /packages/core/src/RadioList/RadioList.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioList.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/RadioList/ (showcase blocks)
 */

import React, {use, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {RadioListContext} from './RadioList';
import {mergeProps} from '../utils';
import {radioScope} from './radio.markers.stylex';
import {RadioControl} from './RadioControl';
import {Item} from '../Item';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
  },
});

const embeddedStyles = stylex.create({
  root: {
    paddingBlock: 0,
    paddingInline: 0,
    borderRadius: 0,
    flex: 1,
    minWidth: 0,
  },
});

export interface RadioListItemProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Label text for the radio item.
   */
  label: string;
  /**
   * Value of this radio item.
   */
  value: string;
  /**
   * Description text displayed below the label.
   */
  description?: string;
  /**
   * Whether this individual radio item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Content to render before the radio circle.
   */
  startContent?: ReactNode;
  /**
   * Content to render after the label.
   */
  endContent?: ReactNode;
}

/**
 * An individual radio item within an RadioList.
 *
 * @example
 * ```
 * <RadioListItem label="Email" value="email" />
 * <RadioListItem
 *   label="SMS"
 *   value="sms"
 *   description="Standard messaging rates apply"
 * />
 * ```
 */
export function RadioListItem({
  ref,
  label,
  value,
  description,
  isDisabled: isItemDisabled = false,
  startContent,
  endContent,
  xstyle,
  className,
  style,
  ...rest
}: RadioListItemProps) {
  const context = use(RadioListContext);
  if (!context) {
    throw new Error('RadioListItem must be used within an RadioList');
  }

  const id = useId();
  const descriptionID = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;
  const size = context.size;

  const radioCircle = (
    <RadioControl
      id={id}
      label={label}
      isChecked={isChecked}
      value={value}
      htmlName={context.name}
      size={size}
      isDisabled={isDisabled}
      isRequired={context.isRequired}
      // The group's onChange is value-only (RadioListProps.onChange:
      // (value) => void); drop the control's DOM event so the group contract
      // stays unchanged.
      onChange={selectedValue => context.onChange(selectedValue)}
      aria-describedby={description ? descriptionID : undefined}
    />
  );

  const mediaContent =
    startContent != null ? (
      <>
        {radioCircle}
        {startContent}
      </>
    ) : (
      radioCircle
    );

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('radio-list-item'),
        stylex.props(styles.container, !isDisabled && radioScope, xstyle),
        className,
        style,
      )}
      {...rest}>
      <Item
        startContent={mediaContent}
        label={
          <label
            htmlFor={id}
            {...stylex.props(isDisabled && styles.labelDisabled)}>
            {label}
          </label>
        }
        description={
          description != null ? (
            <span id={descriptionID}>{description}</span>
          ) : undefined
        }
        endContent={endContent}
        xstyle={embeddedStyles.root}
      />
    </div>
  );
}

RadioListItem.displayName = 'RadioListItem';
