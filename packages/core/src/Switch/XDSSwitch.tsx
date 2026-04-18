'use client';

/**
 * @file XDSSwitch.tsx
 * @input Uses React, useId, ChangeEvent, XDSFieldLabel, XDSFieldStatus, XDSIconType, XDSInputStatus
 * @output Exports XDSSwitch component, XDSSwitchProps, XDSSwitchLabelPosition, XDSSwitchLabelSpacing
 * @position Core implementation; consumed by index.ts, tested by XDSSwitch.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Switch/Switch.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Switch/XDSSwitch.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Switch/index.ts (exports if types change)
 * - /apps/storybook/stories/Switch.stories.tsx (storybook stories)
 */

import {
  useId,
  useOptimistic,
  useTransition,
  type ChangeEvent,
  type FocusEvent,
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
import {XDSFieldLabel} from '../Field/XDSFieldLabel';
import {XDSFieldStatus} from '../Field/XDSFieldStatus';
import type {XDSIconType} from '../Icon';
import type {XDSInputStatus} from '../Field/types';
import {XDSSpinner} from '../Spinner';
import {xdsClassName, mergeProps} from '../utils';
import {switchScope} from './switch.markers.stylex';
import {XDSBaseProps} from '../XDSBaseProps';

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
      [stylex.when.ancestor(':focus-within', switchScope)]:
        `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.ancestor(':focus-within', switchScope)]: '2px',
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
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

export type XDSSwitchLabelPosition = 'start' | 'end';

export type XDSSwitchLabelSpacing = 'default' | 'spread';

export interface XDSSwitchProps extends Omit<XDSBaseProps, 'onChange'> {
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
  onChangeAction?: (
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
  labelIcon?: XDSIconType;
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
  labelPosition?: XDSSwitchLabelPosition;
  /**
   * Spacing behavior between label and switch.
   * - 'default': Label and switch are positioned next to each other
   * - 'spread': Label and switch are pushed to opposite ends
   * @default 'default'
   */
  labelSpacing?: XDSSwitchLabelSpacing;
  /**
   * Status indicator for the switch.
   * When set with a message, displays a colored message box below the switch.
   */
  status?: XDSInputStatus;
}

/**
 * A toggle switch component for boolean values.
 *
 * @example
 * ```
 * <XDSSwitch
 *   label="Enable notifications"
 *   value={enabled}
 *   onChange={setEnabled}
 * />
 * <XDSSwitch
 *   label="Dark mode"
 *   description="Switch to a darker color scheme"
 *   value={darkMode}
 *   onChange={setDarkMode}
 * />
 * ```
 */
export function XDSSwitch({
  label,
  isLabelHidden = false,
  description,
  onChange,
  onChangeAction,
  isLoading = false,
  value,
  isDisabled = false,
  isOptional = false,
  isRequired = false,
  onFocus,
  onBlur,
  labelIcon,
  labelTooltip,
  labelPosition = 'end',
  labelSpacing = 'default',
  status,
  xstyle,
  className,
  style,
  ref,
}: XDSSwitchProps) {
  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const isOn = optimisticValue === true;

  // Build aria-describedby from description and status message
  // Only include descriptionID when the element actually renders
  const describedByParts: string[] = [];
  if (description && !isLabelHidden) describedByParts.push(descriptionID);
  if (status?.message) describedByParts.push(statusMessageID);
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  const switchElement = (
    <div {...stylex.props(styles.switchWrapper)}>
      <input
        ref={ref}
        id={id}
        type="checkbox"
        role="switch"
        checked={isOn}
        disabled={isDisabled}
        required={isRequired}
        onChange={e => {
          if (isBusy) return;
          const checked = e.target.checked;
          onChange?.(checked, e);
          if (onChangeAction && !e.defaultPrevented) {
            startTransition(async () => {
              setOptimisticValue(checked);
              await onChangeAction(checked, e);
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
          xdsClassName('switch', {
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
            xdsClassName('switch-thumb', {checked: isOn ? 'checked' : null}),
            stylex.props(styles.thumb, isOn ? styles.thumbOn : styles.thumbOff),
          )}>
          {isBusy && <XDSSpinner size="sm" />}
        </div>
      </div>
      {isBusy && (
        <span {...stylex.props(styles.srOnly)} role="status">
          Loading
        </span>
      )}
    </div>
  );

  const labelElement = (
    <div {...stylex.props(styles.labelWrapper)}>
      <XDSFieldLabel
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
        xdsClassName('switch-field', {
          labelPosition: labelPosition !== 'end' ? labelPosition : undefined,
          labelSpacing: labelSpacing !== 'default' ? labelSpacing : undefined,
        }),
        stylex.props(xstyle),
        className,
        style,
      )}>
      <div
        {...stylex.props(
          styles.container,
          labelSpacing === 'spread' && styles.containerSpread,
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
          <XDSFieldStatus
            type={status.type}
            message={status.message}
            id={statusMessageID}
            variant="detached"
          />
        </div>
      )}
    </div>
  );
}

XDSSwitch.displayName = 'XDSSwitch';
