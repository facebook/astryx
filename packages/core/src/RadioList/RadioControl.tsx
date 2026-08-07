// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file RadioControl.tsx
 * @input Uses React useId, use, mergeProps, mergeRefs, useTooltip, themeProps
 * @output Exports RadioControl component, RadioControlProps, RadioControlSize
 * @position Core implementation; consumed by RadioListItem and index.ts
 *
 * The self-contained radio control primitive: the visually-hidden native
 * `<input type="radio">` plus its `astryx-radio` circle and `astryx-radio-dot`
 * inner dot. It renders only the control (no visible label text) and takes
 * everything as props, so it composes into bespoke surfaces — cards, table
 * cells, custom rows — without a `RadioList`. `RadioListItem` composes it for
 * the labeled/grouped case.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/RadioList/RadioControl.doc.mjs
 * - /packages/core/src/RadioList/RadioControl.test.tsx
 * - /packages/core/src/RadioList/index.ts
 * - /apps/storybook/stories/RadioControl.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/RadioList/ (showcase blocks)
 */

import React, {useId, use, type ChangeEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {BaseProps} from '../BaseProps';
import {
  colorVars,
  durationVars,
  easeVars,
  borderVars,
} from '../theme/tokens.stylex';
import {mergeProps, mergeRefs} from '../utils';
import {useTooltip} from '../Tooltip';
import {radioScope} from './radio.markers.stylex';
import {RadioListContext} from './RadioList';
import {themeProps} from '../utils/themeProps';

/**
 * Size of the radio control, matching RadioListSize.
 */
export type RadioControlSize = 'sm' | 'md';

const styles = stylex.create({
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
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
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
    backgroundColor: {
      default: colorVars['--color-on-accent'],
      // Forced colors (Windows High Contrast) strips painted backgrounds,
      // which would make the selected dot invisible — checked and unchecked
      // radios would look identical. CanvasText keeps the dot perceivable on
      // the Canvas circle fill (WCAG 1.4.11).
      '@media (forced-colors: active)': 'CanvasText',
    },
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
    width: 20,
    height: 20,
  },
  md: {
    width: 24,
    height: 24,
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

export interface RadioControlProps extends Omit<
  BaseProps<HTMLInputElement>,
  'onChange'
> {
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Accessible name for the control, applied as `aria-label`. Required so a
   * standalone control always has a name — this mirrors the icon-only `Button`
   * convention, where `label` becomes `aria-label` when there is no visible
   * text. When `RadioListItem` composes the control it passes the row's label
   * here and also renders that text as the visible, clickable row label; the
   * accessible name resolves to this string either way.
   */
  label: string;
  /**
   * Whether the radio is selected (controlled).
   */
  isChecked: boolean;
  /**
   * Callback fired with the selected `value` (and the change event) when the
   * user selects this radio. No-op while disabled.
   */
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * The value submitted / reported when this radio is selected.
   */
  value: string;
  /**
   * The HTML `name` shared by the radio group so the browser roves and
   * single-selects within it. When omitted, a unique name is generated so a
   * lone control still behaves as its own group.
   */
  htmlName?: string;
  /**
   * The size of the radio control.
   * @default 'md'
   */
  size?: RadioControlSize;
  /**
   * Whether the radio is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the radio is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Explains why the radio is disabled. When set together with `isDisabled`,
   * the control shows a tooltip with this text on hover and keyboard focus, and
   * stays focusable (via `aria-disabled` instead of the native `disabled`
   * attribute) so the reason is discoverable by keyboard and assistive
   * technology. Selection stays blocked. Mirrors `CheckboxInput`.
   */
  disabledMessage?: string;
  /**
   * Id applied to the input so an external `<label htmlFor>` can target it. When
   * omitted, a unique id is generated.
   */
  id?: string;
}

/**
 * A self-contained radio control primitive: the native `<input type="radio">`
 * and its `astryx-radio` circle. Renders only the control (no visible label),
 * works standalone, and is composed by `RadioListItem`.
 *
 * `label` is the accessible name (applied as `aria-label`), following the
 * icon-only `Button` convention for controls with no visible text. Pair the
 * control with your own visible text for a labeled option.
 *
 * @example
 * ```
 * <RadioControl
 *   label="Email"
 *   htmlName="notify"
 *   value="email"
 *   isChecked={value === 'email'}
 *   onChange={setValue}
 * />
 * ```
 */
export function RadioControl({
  ref,
  label,
  isChecked,
  onChange,
  value,
  htmlName,
  size = 'md',
  isDisabled = false,
  isRequired = false,
  disabledMessage,
  id,
  xstyle,
  className,
  style,
  'aria-describedby': ariaDescribedByProp,
  ...rest
}: RadioControlProps) {
  const generatedID = useId();
  const inputID = id ?? generatedID;
  // Radios single-select within a shared `name`. A lone control still needs a
  // name to be its own group, so fall back to a generated one when `htmlName`
  // is omitted (unlike a checkbox, which doesn't group).
  const generatedName = useId();
  const groupName = htmlName ?? generatedName;

  // Disabled-reason handling mirrors CheckboxInput. A control renders its own
  // reason tooltip when it has a `disabledMessage`; a control inside a
  // RadioList whose whole group is disabled-with-message stays focusable so the
  // group's single tooltip (rendered on the radiogroup container) is
  // keyboard-discoverable, without rendering a tooltip of its own.
  const showsOwnDisabledMessage = isDisabled && !!disabledMessage;
  const radioListContext = use(RadioListContext);
  const isFocusableDisabled =
    isDisabled &&
    (showsOwnDisabledMessage ||
      (radioListContext?.hasDisabledMessage ?? false));

  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The control is not naturally focusable while disabled; focusin bubbles up
    // from the input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsOwnDisabledMessage,
  });

  const ariaDescribedBy =
    [
      ariaDescribedByProp,
      showsOwnDisabledMessage ? disabledMessageTooltip.describedBy : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <div
      ref={el => {
        // Interaction (hover/focus) listeners for the disabled-message tooltip
        // attach to the control's own wrapper. Gated internally by isEnabled,
        // so attaching unconditionally is safe.
        disabledMessageTooltip.interactionRef(el);
      }}
      {...mergeProps(
        stylex.props(
          styles.radioWrapper,
          wrapperSizeStyles[size],
          // Own hover scope so a standalone control gets a hover state;
          // RadioListItem also applies radioScope on the row so row-hover still
          // drives the circle.
          !isDisabled && radioScope,
          (!isDisabled || isFocusableDisabled) && styles.radioWrapperFocus,
          xstyle,
        ),
        className,
        style,
      )}>
      <input
        {...rest}
        ref={mergeRefs(ref, disabledMessageTooltip.positionRef)}
        id={inputID}
        type="radio"
        // Withhold the name while disabled: with a disabledMessage (or in a
        // disabled-with-message group) the input stays focusable (not natively
        // disabled), and a disabled control must not submit.
        name={isDisabled ? undefined : groupName}
        value={value}
        checked={isChecked}
        disabled={isDisabled && !isFocusableDisabled}
        aria-disabled={isFocusableDisabled ? 'true' : undefined}
        required={isRequired}
        aria-label={label}
        aria-describedby={ariaDescribedBy}
        // `onChange` is the value-based handler declared on this interface (the
        // native DOM `onChange` is omitted from the props), so there is no
        // separate consumer DOM handler to compose with here — just guard the
        // disabled state and report the value. Placed after `{...rest}` so a
        // stray consumer handler can't clobber the selection contract.
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          if (isDisabled) {
            return;
          }
          onChange(value, e);
        }}
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
      {showsOwnDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );
}

RadioControl.displayName = 'RadioControl';
