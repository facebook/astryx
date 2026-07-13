// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Switch.tsx
 * @input Uses React, useId, ChangeEvent, FieldLabel, FieldStatus, IconType, InputStatus, useTooltip
 * @output Exports Switch component, SwitchProps, SwitchLabelPosition, SwitchLabelSpacing
 * @position Core implementation; consumed by index.ts, tested by Switch.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Switch/Switch.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Switch/Switch.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Switch/index.ts (exports if types change)
 * - /apps/storybook/stories/Switch.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Switch/ (showcase blocks)
 */

import {
  useId,
  useOptimistic,
  useTransition,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {FieldLabel} from '../Field/FieldLabel';
import {FieldStatus} from '../FieldStatus/FieldStatus';
import type {IconType} from '../Icon';
import type {InputStatus} from '../Field/types';
import {Spinner} from '../Spinner';
import {useTooltip} from '../Tooltip';
import {mergeProps, mergeRefs} from '../utils';
import {switchScope} from './switch.markers.stylex';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';
import {VisuallyHidden} from '../VisuallyHidden';

// Fixed dimensions: 40px width, 24px height, 16px thumb (off), 20px thumb (on)
const SWITCH_WIDTH = 40;
const SWITCH_HEIGHT = 24;
const THUMB_SIZE_OFF = 16;
const THUMB_SIZE_ON = 20;
const TRACK_PADDING = 4;
// Padding between thumb right edge and track inner edge when on
const ON_RIGHT_PADDING = 2;
// Travel distance for on state: positions thumb with ON_RIGHT_PADDING from right edge
const THUMB_TRAVEL_ON =
  SWITCH_WIDTH - TRACK_PADDING - THUMB_SIZE_ON - ON_RIGHT_PADDING;

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  containerSpread: {
    justifyContent: 'space-between',
    width: '100%',
  },
  statusGap: {
    marginTop: spacingVars['--spacing-2'],
  },
  switchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    isolation: 'isolate',
  },
  input: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
  },
  inputDisabled: {
    cursor: 'not-allowed',
  },
  inputBusy: {
    pointerEvents: 'none',
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    padding: TRACK_PADDING,
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'background-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    boxSizing: 'border-box',
  },
  trackFocus: {
    outline: {
      default: 'none',
      [stylex.when.ancestor(':has(:focus-visible)', switchScope)]:
        `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.ancestor(':has(:focus-visible)', switchScope)]: '2px',
    },
  },
  // State-dependent colors with ancestor hover behavior
  trackOff: {
    backgroundColor: {
      default: colorVars['--color-background-gray'],
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-background-gray']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  trackOn: {
    backgroundColor: {
      default: colorVars['--color-accent'],
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  trackDisabled: {
    opacity: 0.5,
  },
  trackDisabledOff: {
    backgroundColor: colorVars['--color-background-gray'],
  },
  thumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-background-surface'],
    transitionProperty: 'transform, width, height',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  thumbOff: {
    width: THUMB_SIZE_OFF,
    height: THUMB_SIZE_OFF,
    transform: 'translateX(0)',
  },
  thumbOn: {
    width: THUMB_SIZE_ON,
    height: THUMB_SIZE_ON,
    transform: `translateX(${THUMB_TRAVEL_ON}px)`,
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    justifyContent: 'center',
    minHeight: SWITCH_HEIGHT,
  },
  description: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

export type SwitchLabelPosition = 'start' | 'end';

export type SwitchLabelSpacing =
  | 'hug'
  | 'spread'
  /** @deprecated Use `'hug'` instead. */
  | 'default';

export interface SwitchProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLInputElement>;
  /**
   * Label text for the switch (always rendered for accessibility).
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
   * Callback fired when the switch state changes.
   */
  onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
  /**
   * Async action on change. Fires after onChange if not prevented.
   */
  changeAction?: (
    checked: boolean,
    e: ChangeEvent<HTMLInputElement>,
  ) => void | Promise<void>;
  /**
   * Whether the switch is in a loading state.
   * @default false
   */
  isLoading?: boolean;
  /**
   * Whether the switch is on or off.
   */
  value: boolean;
  /**
   * Whether the switch is disabled.
   * @default false
   */
  isDisabled?: boolean;

  /**
   * The HTML name attribute for the underlying checkbox input.
   * Useful for form submissions.
   */
  htmlName?: string;

  /**
   * Explains why the switch is disabled. When set together with `isDisabled`,
   * the switch shows a tooltip with this text on hover and keyboard focus, and
   * the control stays focusable (via `aria-disabled`) so the reason is
   * discoverable by keyboard and assistive technology. Activation stays
   * blocked.
   *
   * Use this instead of wrapping a disabled switch in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Switch
   *   label="Enable notifications"
   *   value={enabled}
   *   isDisabled
   *   disabledMessage="Notifications are turned off org-wide"
   * />
   * ```
   */
  disabledMessage?: string;
  /**
   * Whether the field is optional. Mutually exclusive with isRequired.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the switch is required. Mutually exclusive with isOptional.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Callback fired when the switch receives focus.
   */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Callback fired when the switch loses focus.
   */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /**
   * Icon to display before the label text.
   */
  labelIcon?: ReactNode | IconType;
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
   * Which side of the switch the label appears on.
   * - 'start': Label appears before the switch
   * - 'end': Label appears after the switch
   * @default 'end'
   */
  labelPosition?: SwitchLabelPosition;
  /**
   * Spacing behavior between label and switch.
   * - 'hug': Label and switch are positioned next to each other
   * - 'spread': Label and switch are pushed to opposite ends
   *
   * 'default' is a deprecated alias for 'hug'.
   * @default 'hug'
   */
  labelSpacing?: SwitchLabelSpacing;
  /**
   * Status indicator for the switch.
   * When set with a message, displays a colored message box below the switch.
   */
  status?: InputStatus;
}

// Dynamic field width (number -> px, string used as-is).
const dynamicWidthStyles = stylex.create({
  width: (width: SizeValue | null) => ({width}),
});

/**
 * A toggle switch component for boolean values.
 *
 * @example
 * ```
 * <Switch
 *   label="Enable notifications"
 *   value={enabled}
 *   onChange={setEnabled}
 * />
 * <Switch
 *   label="Dark mode"
 *   description="Switch to a darker color scheme"
 *   value={darkMode}
 *   onChange={setDarkMode}
 * />
 * ```
 */
export function Switch({
  label,
  isLabelHidden = false,
  description,
  onChange,
  changeAction,
  isLoading = false,
  value,
  isDisabled = false,
  htmlName,
  disabledMessage,
  isOptional = false,
  isRequired = false,
  onFocus,
  onBlur,
  labelIcon,
  labelTooltip,
  labelPosition = 'end',
  labelSpacing = 'hug',
  status,
  width,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: SwitchProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const isOn = optimisticValue === true;

  // 'default' is a deprecated alias for 'hug' (#2889).
  const resolvedLabelSpacing: SwitchLabelSpacing =
    labelSpacing === 'default' ? 'hug' : labelSpacing;

  // Disabled-reason tooltip. Disabled controls swallow pointer events, so the
  // tooltip listeners attach to the switch row (which already exists) and the
  // native checkbox stays perceivable via aria-disabled instead of the disabled
  // attribute. Toggling is blocked by the isDisabled guard in onChange.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The container row is not naturally focusable; focusin bubbles up from the
    // native input, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Build aria-describedby from description and status message
  // Only include descriptionID when the element actually renders
  const describedByParts: string[] = [];
  if (description && !isLabelHidden) {
    describedByParts.push(descriptionID);
  }
  if (status?.message) {
    describedByParts.push(statusMessageID);
  }
  if (showsDisabledMessage) {
    describedByParts.push(disabledMessageTooltip.describedBy);
  }
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  const switchElement = (
    <div {...stylex.props(styles.switchWrapper)}>
      <input
        ref={mergeRefs(ref, disabledMessageTooltip.positionRef)}
        id={id}
        type="checkbox"
        role="switch"
        // Withhold the name while disabled: with a disabledMessage the
        // input stays focusable (not natively disabled), and a disabled
        // control must not submit.
        name={isDisabled ? undefined : htmlName}
        checked={isOn}
        // With a disabledMessage the switch keeps focusability via aria-disabled
        // so the reason is focus-discoverable; toggling is still blocked by the
        // isDisabled guard in onChange below.
        disabled={isDisabled && !showsDisabledMessage}
        aria-disabled={showsDisabledMessage ? 'true' : undefined}
        required={isRequired}
        onChange={e => {
          if (isDisabled || isBusy) {
            return;
          }
          const checked = e.target.checked;
          onChange?.(checked, e);
          if (changeAction && !e.defaultPrevented) {
            startTransition(async () => {
              setOptimisticValue(checked);
              await changeAction(checked, e);
            });
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-describedby={ariaDescribedBy}
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-busy={isBusy || undefined}
        {...stylex.props(
          styles.input,
          isDisabled && styles.inputDisabled,
          isBusy && styles.inputBusy,
        )}
      />
      <div
        aria-hidden="true"
        {...mergeProps(
          themeProps('switch', {
            checked: isOn ? 'checked' : null,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            styles.track,
            isOn ? styles.trackOn : styles.trackOff,
            !isDisabled && styles.trackFocus,
            isDisabled && styles.trackDisabled,
            isDisabled && !isOn && styles.trackDisabledOff,
          ),
        )}>
        <div
          {...mergeProps(
            themeProps('switch-thumb', {checked: isOn ? 'checked' : null}),
            stylex.props(styles.thumb, isOn ? styles.thumbOn : styles.thumbOff),
          )}>
          {isBusy && <Spinner size="sm" />}
        </div>
      </div>
      {isBusy && <VisuallyHidden role="status">Loading</VisuallyHidden>}
    </div>
  );

  const labelElement = (
    <div {...stylex.props(styles.labelWrapper)}>
      <FieldLabel
        label={label}
        inputID={id}
        isLabelHidden={isLabelHidden}
        isDisabled={isDisabled}
        isOptional={isOptional}
        isRequired={isRequired}
        labelIcon={labelIcon}
        labelTooltip={labelTooltip}
        description={description}
        descriptionID={descriptionID}
      />
    </div>
  );

  return (
    <div
      {...mergeProps(
        themeProps('switch-field', {
          labelPosition: labelPosition !== 'end' ? labelPosition : undefined,
          labelSpacing:
            resolvedLabelSpacing !== 'hug' ? resolvedLabelSpacing : undefined,
        }),
        stylex.props(width != null && dynamicWidthStyles.width(width), xstyle),
        className,
        style,
      )}
      {...rest}>
      <div
        ref={el => {
          // Interaction (hover/focus) listeners for the disabled-message
          // tooltip attach to the whole row for a larger trigger target;
          // positioning anchors on the switch itself (above) so the tooltip
          // appears next to the control, not the far edge of the row.
          // Handlers are gated internally by isEnabled, so attaching
          // unconditionally is safe.
          disabledMessageTooltip.interactionRef(el);
        }}
        {...stylex.props(
          styles.container,
          resolvedLabelSpacing === 'spread' && styles.containerSpread,
          !isDisabled && switchScope,
        )}>
        {' '}
        {labelPosition === 'start' ? (
          <>
            {labelElement}
            {switchElement}
          </>
        ) : (
          <>
            {switchElement}
            {labelElement}
          </>
        )}
      </div>
      {status?.message && (
        <div {...stylex.props(styles.statusGap)}>
          <FieldStatus
            type={status.type}
            message={status.message}
            id={statusMessageID}
            variant="detached"
          />
        </div>
      )}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );
}

Switch.displayName = 'Switch';
