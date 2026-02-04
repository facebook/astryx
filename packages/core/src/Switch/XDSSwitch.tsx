/**
 * @file XDSSwitch.tsx
 * @input Uses React forwardRef, useId, ChangeEvent, XDSFieldLabel, XDSIconType
 * @output Exports XDSSwitch component, XDSSwitchProps, XDSSwitchLabelPosition, XDSSwitchLabelSpacing
 * @position Core implementation; consumed by index.ts, tested by XDSSwitch.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Switch/README.md (props table, features, implementation notes)
 * - /packages/core/src/Switch/XDSSwitch.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Switch/index.ts (exports if types change)
 * - /apps/storybook/stories/Switch.stories.tsx (storybook stories)
 */

import {forwardRef, useId, type ChangeEvent, type FocusEvent} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  transitionVars,
  typographyVars,
  elevationVars,
} from '../theme/tokens.stylex';
import {XDSFieldLabel} from '../Field/XDSFieldLabel';
import type {XDSIconType} from '../Icon';

// Fixed dimensions: 40px width, 24px height, 16px thumb (off), 20px thumb (on)
const SWITCH_WIDTH = 40;
const SWITCH_HEIGHT = 24;
const THUMB_SIZE_OFF = 16;
const THUMB_SIZE_ON = 20;
const TRACK_PADDING = 4;
const BORDER_WIDTH = 1;
// Travel distance for on state: accounts for larger thumb with tighter right padding
const THUMB_TRAVEL_ON =
  SWITCH_WIDTH - TRACK_PADDING * 2 - BORDER_WIDTH * 2 - THUMB_SIZE_ON + 2;

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacingVars['--spacing-2'],
  },
  containerSpread: {
    justifyContent: 'space-between',
    width: '100%',
  },
  // Default CSS variables for off state
  containerOff: {
    '--xds-switch-track-bg': colorVars['--color-deemphasized'],
    '--xds-switch-track-border': colorVars['--color-divider-emphasized'],
  },
  // Default CSS variables for on state
  containerOn: {
    '--xds-switch-track-bg': colorVars['--color-accent'],
    '--xds-switch-track-border': colorVars['--color-accent'],
  },
  // Hover overrides for off state (only applied when not disabled)
  containerHoverOff: {
    ':hover': {
      '--xds-switch-track-bg': `color-mix(in srgb, ${colorVars['--color-deemphasized']}, ${colorVars['--color-hover-tint']} 5%)`,
      '--xds-switch-track-border': `color-mix(in srgb, ${colorVars['--color-divider-emphasized']}, ${colorVars['--color-hover-tint']} 20%)`,
    },
  },
  // Hover overrides for on state (only applied when not disabled)
  containerHoverOn: {
    ':hover': {
      '--xds-switch-track-bg': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
      '--xds-switch-track-border': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
    },
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
  track: {
    display: 'flex',
    alignItems: 'center',
    width: SWITCH_WIDTH,
    height: SWITCH_HEIGHT,
    padding: TRACK_PADDING,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--xds-switch-track-border)',
    borderRadius: radiusVars['--radius-rounded'],
    backgroundColor: 'var(--xds-switch-track-bg)',
    transitionProperty: 'background-color, border-color',
    transitionDuration: transitionVars['--transition-fast'],
    boxSizing: 'border-box',
  },
  trackFocused: {
    outline: `2px solid ${colorVars['--color-focus-outline']}`,
    outlineOffset: 2,
  },
  trackDisabled: {
    opacity: 0.5,
    borderColor: colorVars['--color-divider'],
  },
  trackDisabledOff: {
    backgroundColor: colorVars['--color-deemphasized'],
  },
  thumb: {
    borderRadius: radiusVars['--radius-rounded'],
    backgroundColor: colorVars['--color-surface'],
    boxShadow: elevationVars['--elevation-thumb'],
    transitionProperty: 'transform, width, height',
    transitionDuration: transitionVars['--transition-fast'],
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
    marginTop: 3,
  },
  description: {
    fontFamily: typographyVars['--font-body'],
    fontSize: '0.75rem',
    color: colorVars['--color-text-secondary'],
  },
});

export type XDSSwitchLabelPosition = 'start' | 'end';
export type XDSSwitchLabelSpacing = 'default' | 'spread';

export interface XDSSwitchProps {
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
  onChange: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void;
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
}

/**
 * A toggle switch component for boolean values.
 *
 * @example
 * ```tsx
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
export const XDSSwitch = forwardRef<HTMLInputElement, XDSSwitchProps>(
  (
    {
      label,
      isLabelHidden = false,
      description,
      onChange,
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
    },
    ref
  ) => {
    const id = useId();
    const descriptionID = useId();

    const isOn = value === true;

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
          onChange={e => onChange(e.target.checked, e)}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-describedby={description ? descriptionID : undefined}
          {...stylex.props(styles.input, isDisabled && styles.inputDisabled)}
        />
        <div
          aria-hidden="true"
          {...stylex.props(
            styles.track,
            isDisabled && styles.trackDisabled,
            isDisabled && !isOn && styles.trackDisabledOff
          )}>
          <div
            {...stylex.props(
              styles.thumb,
              isOn ? styles.thumbOn : styles.thumbOff
            )}
          />
        </div>
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
          startIcon={labelIcon}
          tooltip={labelTooltip}
        />
        {description && (
          <span id={descriptionID} {...stylex.props(styles.description)}>
            {description}
          </span>
        )}
      </div>
    );

    return (
      <div
        {...stylex.props(
          styles.container,
          labelSpacing === 'spread' && styles.containerSpread,
          isOn ? styles.containerOn : styles.containerOff,
          !isDisabled &&
            (isOn ? styles.containerHoverOn : styles.containerHoverOff)
        )}>
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
    );
  }
);

XDSSwitch.displayName = 'XDSSwitch';
