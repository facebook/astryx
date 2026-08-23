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
 * - /packages/cli/assets/templates/blocks/components/Switch/ (showcase blocks)
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
  focusVars,
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
import {useResolvedRequired} from '../hooks/useResolvedRequired';

const wrapperSizeStyles = stylex.create({
  sm: {
    width: 32,
    height: 20,
  },
  md: {
    width: 40,
    height: 24,
  },
});

const inputSizeStyles = stylex.create({
  sm: {
    width: 32,
    height: 20,
  },
  md: {
    width: 40,
    height: 24,
  },
});

const trackSizeStyles = stylex.create({
  sm: {
    width: 32,
    height: 20,
    padding: 2,
  },
  md: {
    width: 40,
    height: 24,
    padding: 4,
  },
});

const thumbOffSizeStyles = stylex.create({
  sm: {
    width: 14,
    height: 14,
    transform: 'translateX(0)',
  },
  md: {
    width: 16,
    height: 16,
    transform: 'translateX(0)',
  },
});

const thumbOnSizeStyles = stylex.create({
  sm: {
    width: 16,
    height: 16,
    // The thumb rests at the inline-start edge (flex-start, which flexbox
    // already mirrors under RTL). The on-state travel toward the inline-end
    // edge is a physical translateX, so it must flip sign under RTL — right
    // in LTR, left in RTL — so the switch mirrors per convention (Material,
    // iOS): off-thumb on the reading-start side, on-thumb on the reading-end.
    transform: {
      default: 'translateX(12px)',
      ':is([dir="rtl"] *)': 'translateX(-12px)',
    },
  },
  md: {
    width: 20,
    height: 20,
    transform: {
      default: 'translateX(14px)',
      ':is([dir="rtl"] *)': 'translateX(-14px)',
    },
  },
});

const labelWrapperSizeStyles = stylex.create({
  sm: {
    minHeight: 20,
  },
  md: {
    minHeight: 24,
  },
});

const styles = stylex.create({
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  // A hidden label is sr-only, so its wrapper is a zero-width flex item — the
  // row gap would still be painted beside the track, making the field box
  // wider than the control it contains. Matches CheckboxInput.
  containerLabelHidden: {
    gap: 0,
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
    isolation: 'isolate',
  },
  input: {
    position: 'absolute',
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
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
    cursor: 'default',
  },
  inputBusy: {
    pointerEvents: 'none',
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'background-color',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    boxSizing: 'border-box',
    // Forced colors (Windows High Contrast) strips painted backgrounds, which
    // would leave the track invisible. A system-color border keeps the
    // control's bounds perceivable (WCAG 1.4.11).
    borderWidth: {
      default: 0,
      '@media (forced-colors: active)': '1px',
    },
    borderStyle: {
      default: 'none',
      '@media (forced-colors: active)': 'solid',
    },
    borderColor: {
      default: null,
      '@media (forced-colors: active)': 'CanvasText',
    },
  },
  // The one ring in the system not drawn by focusOutlineStyles. The focusable
  // input is a sibling of the track, so the condition has to reach the shared
  // scope marker — and a marker cannot be shared across components without
  // leaking focus state from an outer one, so it cannot live in the utility.
  // StyleX also cannot inline a constant imported from another module, so the
  // values are read from the tokens the utility reads.
  trackFocus: {
    outline: {
      default: 'none',
      [stylex.when.ancestor(':has(:focus-visible)', switchScope)]:
        `${focusVars['--focus-outline-width']} ${focusVars['--focus-outline-style']} ${focusVars['--focus-outline-color']}`,
    },
    outlineOffset: {
      default: null,
      [stylex.when.ancestor(':has(:focus-visible)', switchScope)]:
        focusVars['--focus-outline-offset'],
    },
  },
  // State-dependent colors with ancestor hover behavior
  trackOff: {
    backgroundColor: {
      default: colorVars['--color-background-gray'],
      // Off = empty (Canvas) track; on = Highlight track, so the two states
      // stay distinguishable under forced colors.
      '@media (forced-colors: active)': 'Canvas',
      // The ancestor-hover tint is a non-system color-mix, and its rule
      // outranks the plain forced-colors rule above. Left ungated it would
      // reassert on hover under forced colors, where the UA flattens the
      // color-mix back to Canvas — so the HighlightText thumb would sit on a
      // white track (white-on-white). Gating on `forced-colors: none` keeps
      // the tint out of forced colors and lets the system-color track stand.
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover) and (forced-colors: none)': `color-mix(in srgb, ${colorVars['--color-background-gray']}, ${colorVars['--color-tint-hover']} 5%)`,
      },
    },
  },
  trackOn: {
    backgroundColor: {
      default: colorVars['--color-accent'],
      '@media (forced-colors: active)': 'Highlight',
      // See trackOff: gate the hover tint out of forced colors so it cannot
      // flatten the Highlight track to white under the HighlightText thumb.
      [stylex.when.ancestor(':hover', switchScope)]: {
        '@media (hover: hover) and (forced-colors: none)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  trackDisabled: {
    opacity: 0.5,
    // Opacity dimming does not survive forced colors; GrayText is the
    // platform's disabled affordance there.
    borderColor: {
      default: null,
      '@media (forced-colors: active)': 'GrayText',
    },
  },
  trackDisabledOff: {
    backgroundColor: colorVars['--color-background-gray'],
  },
  thumb: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'transform, width, height',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  // The thumb fill lives on the on/off styles (not the shared thumb style)
  // because forced colors needs a per-state system color: CanvasText on the
  // empty off track, HighlightText on the Highlight on track. Sizing stays in
  // thumbOffSizeStyles/thumbOnSizeStyles; only the fill is state-dependent.
  thumbOff: {
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      '@media (forced-colors: active)': 'CanvasText',
    },
  },
  thumbOn: {
    backgroundColor: {
      default: colorVars['--color-background-surface'],
      '@media (forced-colors: active)': 'HighlightText',
    },
  },
  labelWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
    justifyContent: 'center',
  },
  description: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
});

export type SwitchLabelPosition = 'start' | 'end';

export type SwitchLabelSpacing = 'hug' | 'spread';

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
   * @default 'hug'
   */
  labelSpacing?: SwitchLabelSpacing;
  /**
   * Status indicator for the switch.
   * When set with a message, displays a colored message box below the switch.
   */
  status?: InputStatus;
  /**
   * Size variant controlling track and thumb dimensions.
   * - 'sm': 34x20px (matches sm checkbox/radio vertical rhythm)
   * - 'md': 40x24px (default, matches md checkbox/radio vertical rhythm)
   * @default 'md'
   */
  size?: 'sm' | 'md';
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
  size = 'md',
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
  // Announce the effective required state (form default included) while the
  // native `required` stays bound to the explicit `isRequired` so a layout
  // default never switches on browser validation.
  const isEffectivelyRequired = useResolvedRequired({isRequired, isOptional});

  const [, startTransition] = useTransition();
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;

  const isOn = optimisticValue === true;

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
  // Only include descriptionID when the element actually renders.
  // FieldLabel renders the description (with descriptionID) even when the
  // label is visually hidden — it's sr-only, so keep it linked.
  const describedByParts: string[] = [];
  if (description) {
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
    <div {...stylex.props(styles.switchWrapper, wrapperSizeStyles[size])}>
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
        form={showsDisabledMessage ? '' : undefined}
        required={isRequired}
        aria-required={isEffectivelyRequired ? 'true' : undefined}
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
          inputSizeStyles[size],
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
            size,
          }),
          stylex.props(
            styles.track,
            trackSizeStyles[size],
            isOn ? styles.trackOn : styles.trackOff,
            !isDisabled && styles.trackFocus,
            isDisabled && styles.trackDisabled,
            isDisabled && !isOn && styles.trackDisabledOff,
          ),
        )}>
        <div
          {...mergeProps(
            themeProps('switch-thumb', {
              checked: isOn ? 'checked' : null,
              size,
            }),
            stylex.props(
              styles.thumb,
              isOn ? thumbOnSizeStyles[size] : thumbOffSizeStyles[size],
              isOn ? styles.thumbOn : styles.thumbOff,
            ),
          )}>
          {isBusy && <Spinner size="sm" />}
        </div>
      </div>
      {isBusy && <VisuallyHidden role="status">Loading</VisuallyHidden>}
    </div>
  );

  const labelElement = (
    <div {...stylex.props(styles.labelWrapper, labelWrapperSizeStyles[size])}>
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
          labelSpacing: labelSpacing !== 'hug' ? labelSpacing : undefined,
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
          isLabelHidden && styles.containerLabelHidden,
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
        <FieldStatus
          type={status.type}
          message={status.message}
          id={statusMessageID}
          variant="detached"
          xstyle={styles.statusGap}
        />
      )}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </div>
  );
}

Switch.displayName = 'Switch';
