// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioListItem.tsx
 * @input Uses React use, useId, useRef, RadioListContext, Item
 * @output Exports RadioListItem component, RadioListItemProps
 * @position Core implementation; consumed by index.ts, tested by RadioList.test.tsx
 *
 * Composes Item for the shared start content + label + description + end content layout.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/RadioList.doc.mjs
 * - /packages/core/src/RadioList/RadioList.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioList.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/RadioList/ (showcase blocks)
 */

import React, {use, useId, useRef, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {spacingVars} from '../theme/tokens.stylex';
import {RadioListContext} from './RadioList';
import {mergeProps, isRenderable} from '../utils';
import {indicatorScope} from '../Indicator/indicator.markers.stylex';
import {useIndicatorFocusRing} from '../hooks/useIndicatorFocusRing';
import {useIndicator} from '../Indicator';
import {Item} from '../Item';
import {themeProps} from '../utils/themeProps';

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  radioWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    isolation: 'isolate',
  },
  input: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
    minInlineSize: {
      default: null,
      '@media (pointer: coarse)': '24px',
    },
    minBlockSize: {
      default: null,
      '@media (pointer: coarse)': '24px',
    },
    insetBlockStart: {
      default: null,
      '@media (pointer: coarse)': '50%',
    },
    insetInlineStart: {
      default: null,
      '@media (pointer: coarse)': '50%',
    },
    transform: {
      default: null,
      '@media (pointer: coarse)': 'translate(-50%, -50%)',
    },
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  // Holds only the indicator, so the focus ring has one unambiguous target.
  indicatorSlot: {
    display: 'contents',
  },
});

const wrapperSizeStyles = stylex.create({
  sm: {
    width: 20,
    height: 20,
  },
  md: {
    width: 24,
    height: 24,
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
  // When the whole group is disabled with a disabledMessage, radios stay
  // focusable via aria-disabled (instead of native `disabled`) so the group's
  // reason tooltip is keyboard-discoverable. Per-item disabling is unaffected
  // and always uses the native disabled attribute.
  const keepsFocusableForMessage =
    context.hasDisabledMessage && !isItemDisabled;
  const isChecked = context.value === value;
  const size = context.size;
  // The radio visual is an indicator: a theme can restyle it through the
  // `radio` / `radio-dot` targets or replace the component outright.
  const RadioControl = useIndicator('radio');
  // See CheckboxInput: the ring goes on the indicator's own element, because
  // the native input is visually hidden and only the indicator knows its shape.
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const {focusProps} = useIndicatorFocusRing(indicatorRef, isDisabled);

  // The radio is the row's single keyboard control and action. The row is an
  // enlarged click/tap target that delegates surface clicks — the description
  // and the empty hover area, not just the control and its label — to the
  // input via Item's `interactiveRef` (useClickableContainer). This matches
  // CheckboxListItem so the whole row is clickable, and keeps one tab stop per
  // option (WCAG 4.1.2). The radio carries its accessible name via `aria-label`
  // since the visible label is now a plain (non-`<label>`) text node — a real
  // `<label htmlFor>` would double-fire under delegation.
  const radioRef = useRef<HTMLInputElement>(null);

  const radioCircle = (
    <div
      {...stylex.props(styles.radioWrapper, wrapperSizeStyles[size])}
      {...focusProps}>
      <input
        ref={radioRef}
        id={id}
        type="radio"
        name={context.name}
        value={value}
        checked={isChecked}
        aria-label={label}
        disabled={isDisabled && !keepsFocusableForMessage}
        aria-disabled={keepsFocusableForMessage ? 'true' : undefined}
        // A focusable-disabled radio is not natively disabled, so detach it
        // from the form instead: it keeps its name (grouping) but is excluded
        // from submission, matching a natively disabled control.
        form={keepsFocusableForMessage ? '' : undefined}
        required={context.isRequired}
        onChange={() => {
          if (isDisabled) {
            return;
          }
          context.onChange(value);
        }}
        aria-describedby={description ? descriptionID : undefined}
        {...stylex.props(
          styles.input,
          wrapperSizeStyles[size],
          isDisabled && styles.inputDisabled,
        )}
      />
      <span ref={indicatorRef} {...stylex.props(styles.indicatorSlot)}>
        <RadioControl
          state={isChecked ? 'checked' : 'unchecked'}
          size={size}
          isDisabled={isDisabled}
        />
      </span>
    </div>
  );

  const mediaContent = isRenderable(startContent) ? (
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
        stylex.props(
          styles.container,
          // Hover reaches the radio visual through this ancestor marker rather
          // than props, so hovering the row tints the control.
          !isDisabled && indicatorScope,
          xstyle,
        ),
        className,
        style,
      )}
      {...rest}>
      <Item
        startContent={mediaContent}
        // Delegate row-surface clicks (label text, description, and the empty
        // hover area) to the radio input. The input stays the option's sole
        // focusable control, so the row adds no second tab stop.
        interactiveRef={radioRef}
        isDisabled={isDisabled}
        label={<span>{label}</span>}
        description={
          isRenderable(description) ? (
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
