// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioListItem.tsx
 * @input Uses React use, useId, RadioListContext
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
 * - /packages/cli/templates/blocks/components/RadioList/ (showcase blocks)
 */

import React, {use, useId, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  colorVars,
  spacingVars,
  durationVars,
  easeVars,
  borderVars,
} from '../theme/tokens.stylex';
import {RadioListContext} from './RadioList';
import {mergeProps} from '../utils';
import {radioScope} from './radio.markers.stylex';
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
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  radio: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderVars['--border-width'],
    borderStyle: 'solid',
    borderRadius: '50%',
    transitionProperty: 'background-color, border-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    boxSizing: 'border-box',
  },
  radioUnchecked: {
    borderColor: {
      default: colorVars['--color-border-emphasized'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-border-emphasized']}, ${colorVars['--color-tint-hover']} 20%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-background-surface']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  radioChecked: {
    borderColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', radioScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  radioWrapperFocus: {
    outline: {
      default: 'none',
      ':has(:focus-visible)': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':has(:focus-visible)': '2px',
    },
    borderRadius: '50%',
  },
  radioDisabled: {
    opacity: 0.5,
    borderColor: colorVars['--color-border'],
  },
  radioDisabledUnchecked: {
    backgroundColor: colorVars['--color-background-muted'],
  },
  innerDot: {
    borderRadius: '50%',
    backgroundColor: colorVars['--color-on-accent'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
    cursor: 'not-allowed',
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

const radioSizeStyles = stylex.create({
  sm: {
    width: 18,
    height: 18,
  },
  md: {
    width: 22,
    height: 22,
  },
});

const dotSizeStyles = stylex.create({
  sm: {
    width: 8,
    height: 8,
  },
  md: {
    width: 10,
    height: 10,
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

  const radioCircle = (
    <div
      {...stylex.props(
        styles.radioWrapper,
        wrapperSizeStyles[size],
        !isDisabled && styles.radioWrapperFocus,
      )}>
      <input
        id={id}
        type="radio"
        name={context.name}
        value={value}
        checked={isChecked}
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
      <div
        aria-hidden="true"
        {...mergeProps(
          themeProps('radio', {
            size,
            checked: isChecked ? 'checked' : null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            styles.radio,
            radioSizeStyles[size],
            isChecked ? styles.radioChecked : styles.radioUnchecked,
            isDisabled && styles.radioDisabled,
            isDisabled && !isChecked && styles.radioDisabledUnchecked,
          ),
        )}>
        {isChecked && (
          <div
            {...mergeProps(
              themeProps('radio-dot', {size}),
              stylex.props(styles.innerDot, dotSizeStyles[size]),
            )}
          />
        )}
      </div>
    </div>
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
