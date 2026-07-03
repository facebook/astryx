// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Slider.tsx
 * @input Uses React, useId, useRef, useCallback, Field, Tooltip, useTooltip
 * @output Exports Slider component, SliderProps, SliderSingleProps, SliderRangeProps, SliderBaseProps
 * @position Core implementation; consumed by index.ts, tested by Slider.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Slider/Slider.doc.mjs
 * - /packages/core/src/Slider/Slider.test.tsx
 * - /packages/core/src/Slider/index.ts
 * - /apps/storybook/stories/Slider.stories.tsx
 * - /packages/cli/templates/blocks/components/Slider/ (showcase blocks)
 */

import {
  useId,
  useMemo,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
  type PointerEvent,
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
import {Field} from '../Field/Field';
import {Tooltip} from '../Tooltip/Tooltip';
import {useTooltip} from '../Tooltip';
import type {InputStatus} from '../Field/types';
import {mergeProps, mergeRefs} from '../utils';
import type {BaseProps} from '../BaseProps';
import type {SizeValue} from '../utils/types';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Types
// =============================================================================

export interface SliderBaseProps extends Omit<
  BaseProps<HTMLDivElement>,
  'onChange'
> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /** Label text for the slider (always rendered for accessibility). */
  label: string;
  /** Whether to visually hide the label (still accessible to screen readers). @default false */
  isLabelHidden?: boolean;
  /** Description text displayed below the label. */
  description?: string;
  /** Whether the slider is disabled. @default false */
  isDisabled?: boolean;
  /**
   * Explains why the slider is disabled. When set together with `isDisabled`,
   * the slider shows a tooltip with this text on hover and keyboard focus, and
   * the thumb stays focusable (via `aria-disabled`) so the reason is
   * discoverable by keyboard and assistive technology. Value changes stay
   * blocked.
   *
   * Use this instead of wrapping a disabled slider in `Tooltip` — disabled
   * controls don't emit the pointer events an external tooltip needs.
   *
   * @example
   * ```
   * <Slider
   *   label="Volume"
   *   value={50}
   *   isDisabled
   *   disabledMessage="Volume is locked while sharing your screen"
   * />
   * ```
   */
  disabledMessage?: string;
  /** Whether the field is optional. @default false */
  isOptional?: boolean;
  /** Whether the field is required. @default false */
  isRequired?: boolean;
  /** Status indicator for the slider. */
  status?: InputStatus;
  /**
   * Width of the field. Numbers are treated as pixels, strings are used as-is
   * (e.g. `'100%'`). Sizes the whole field (label, control, and status) so they
   * stay aligned, unlike setting width via `xstyle`/`className`/`style`.
   */
  width?: SizeValue;
  /** Tooltip text to display in an info icon at the end of the label. */
  labelTooltip?: string;
  /** Minimum value. @default 0 */
  min?: number;
  /** Maximum value. @default 100 */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
  /** Orientation of the slider. @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  /** Custom value formatting function for display and aria-valuetext. */
  formatValue?: (value: number) => string;
  /** How the current value is displayed. @default "tooltip" */
  valueDisplay?: 'tooltip' | 'text' | 'none';
  /** Tick marks at specified positions with optional labels. */
  marks?: {value: number; label?: string}[];
  /** Test ID for the root element. */
  'data-testid'?: string;
}

export interface SliderSingleProps extends SliderBaseProps {
  /** Current value (single thumb mode). */
  value: number;
  /** Callback fired on value change during drag. */
  onChange?: (value: number) => void;
  /** Callback fired when drag ends (on pointer up or keyboard). */
  onChangeEnd?: (value: number) => void;
}

export interface SliderRangeProps extends SliderBaseProps {
  /** Current value (range mode: [min, max]). */
  value: [number, number];
  /** Callback fired on value change during drag. */
  onChange?: (value: [number, number]) => void;
  /** Callback fired when drag ends (on pointer up or keyboard). */
  onChangeEnd?: (value: [number, number]) => void;
  /** Minimum number of steps between thumbs. */
  minStepsBetweenThumbs?: number;
}

export type SliderProps = SliderSingleProps | SliderRangeProps;

// =============================================================================
// Constants
// =============================================================================

const TRACK_SIZE = 4;
const THUMB_SIZE = 20;

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  trackContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    touchAction: 'none',
    userSelect: 'none',
    isolation: 'isolate',
  },
  trackContainerHorizontal: {
    height: THUMB_SIZE,
    width: '100%',
    cursor: 'pointer',
  },
  trackContainerVertical: {
    width: THUMB_SIZE,
    height: 160,
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  trackContainerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  track: {
    position: 'absolute',
    backgroundColor: colorVars['--color-track'],
    borderRadius: radiusVars['--radius-full'],
  },
  trackHorizontal: {
    left: 0,
    right: 0,
    height: TRACK_SIZE,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  trackVertical: {
    top: 0,
    bottom: 0,
    width: TRACK_SIZE,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  filledTrack: {
    position: 'absolute',
    backgroundColor: colorVars['--color-accent'],
    borderRadius: radiusVars['--radius-full'],
  },
  filledTrackHorizontal: {
    height: TRACK_SIZE,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  filledTrackVertical: {
    width: TRACK_SIZE,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-accent'],
    transform: 'translate(-50%, -50%)',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    outline: 'none',
    cursor: 'grab',
    zIndex: 1,
  },
  thumbHorizontal: {
    top: '50%',
  },
  thumbVertical: {
    left: '50%',
    transform: 'translate(-50%, 50%)',
  },
  thumbHover: {
    backgroundColor: {
      default: colorVars['--color-accent'],
      ':hover': {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  thumbFocusVisible: {
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },
  thumbDisabled: {
    backgroundColor: colorVars['--color-background-muted'],
    cursor: 'not-allowed',
  },
  textValue: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-label-size'],
    color: colorVars['--color-text-primary'],
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  marksContainer: {
    position: 'absolute',
  },
  marksContainerHorizontal: {
    left: 0,
    right: 0,
    top: '50%',
  },
  marksContainerVertical: {
    top: 0,
    bottom: 0,
    left: '50%',
  },
  mark: {
    position: 'absolute',
    backgroundColor: colorVars['--color-border-emphasized'],
    borderRadius: radiusVars['--radius-full'],
  },
  markHorizontal: {
    width: 2,
    height: 8,
    transform: 'translate(-50%, -50%)',
  },
  markVertical: {
    height: 2,
    width: 8,
    transform: 'translate(-50%, 50%)',
  },
  markLabel: {
    position: 'absolute',
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
    whiteSpace: 'nowrap',
  },
  markLabelHorizontal: {
    transform: 'translateX(-50%)',
    top: THUMB_SIZE / 2 + 4,
  },
  markLabelVertical: {
    transform: 'translateY(50%)',
    left: THUMB_SIZE / 2 + 4,
  },
});

// =============================================================================
// Helpers
// =============================================================================

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

function snapToStep(val: number, min: number, step: number): number {
  if (step <= 0) {
    return val;
  }
  const steps = Math.round((val - min) / step);
  return min + steps * step;
}

function getPercent(val: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return ((val - min) / (max - min)) * 100;
}

// =============================================================================
// Component
// =============================================================================

/**
 * A slider component for selecting numeric values or ranges.
 *
 * @example
 * ```
 * <Slider label="Volume" value={50} onChange={setValue} />
 * <Slider label="Price range" value={[20, 80]} onChange={setRange} />
 * ```
 */
export function Slider({ref, ...props}: SliderProps) {
  const {
    label,
    isLabelHidden = false,
    description,
    isDisabled = false,
    disabledMessage,
    isOptional = false,
    isRequired = false,
    status,
    labelTooltip,
    min = 0,
    max = 100,
    step = 1,
    orientation = 'horizontal',
    formatValue,
    valueDisplay = 'tooltip',
    marks,
    width,
    xstyle,
    className,
    style,
    'data-testid': testId,
    value,
    onChange,
    onChangeEnd,
  } = props;

  const isRange = Array.isArray(value);
  const minStepsBetweenThumbs =
    isRange && 'minStepsBetweenThumbs' in props
      ? ((props as SliderRangeProps).minStepsBetweenThumbs ?? 0)
      : 0;

  const isHorizontal = orientation === 'horizontal';

  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumbRef = useRef<number | null>(null);
  const [draggingThumb, setDraggingThumb] = useState<number | null>(null);

  // Disabled-reason tooltip. This is a *separate* useTooltip instance from the
  // per-thumb value bubble (the `<Tooltip>` component below): it anchors to the
  // track container and fires on hover/focus of the whole control. Disabled
  // controls swallow pointer events, so the thumb stays perceivable via
  // aria-disabled while pointer/keyboard handlers early-return on isDisabled.
  const showsDisabledMessage = isDisabled && !!disabledMessage;
  const disabledMessageTooltip = useTooltip({
    placement: 'above',
    // The track container is not naturally focusable; focusin bubbles up from
    // the thumb, so always attach focus listeners.
    focusTrigger: 'always',
    isEnabled: showsDisabledMessage,
  });

  // Build aria-describedby
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

  // Value helpers — guard against undefined value (e.g. playground previews
  // that render the component without providing a value prop).
  const values: number[] = useMemo(
    () => (isRange ? value : [value != null ? value : min]),
    [isRange, value, min],
  );

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) {
        return min;
      }
      const rect = track.getBoundingClientRect();

      let percent: number;
      if (isHorizontal) {
        percent = (clientX - rect.left) / rect.width;
      } else {
        // Vertical: bottom = min, top = max
        percent = 1 - (clientY - rect.top) / rect.height;
      }
      percent = clamp(percent, 0, 1);
      const raw = min + percent * (max - min);
      return clamp(snapToStep(raw, min, step), min, max);
    },
    [min, max, step, isHorizontal],
  );

  const getClosestThumb = useCallback(
    (newValue: number): number => {
      if (!isRange) {
        return 0;
      }
      const [v0, v1] = values;
      const d0 = Math.abs(newValue - v0);
      const d1 = Math.abs(newValue - v1);
      // Prefer the lower thumb if equidistant
      return d0 <= d1 ? 0 : 1;
    },
    [isRange, values],
  );

  const updateValue = useCallback(
    (thumbIndex: number, newVal: number) => {
      if (isDisabled) {
        return;
      }
      const clamped = clamp(snapToStep(newVal, min, step), min, max);

      if (isRange) {
        const currentValues = [...values] as [number, number];
        currentValues[thumbIndex] = clamped;

        // Enforce minStepsBetweenThumbs
        const minGap = minStepsBetweenThumbs * step;
        if (thumbIndex === 0) {
          currentValues[0] = Math.min(
            currentValues[0],
            currentValues[1] - minGap,
          );
        } else {
          currentValues[1] = Math.max(
            currentValues[1],
            currentValues[0] + minGap,
          );
        }

        // Keep within bounds
        currentValues[0] = clamp(currentValues[0], min, max);
        currentValues[1] = clamp(currentValues[1], min, max);

        (onChange as SliderRangeProps['onChange'])?.(currentValues);
      } else {
        (onChange as SliderSingleProps['onChange'])?.(clamped);
      }
    },
    [
      isDisabled,
      isRange,
      values,
      min,
      max,
      step,
      minStepsBetweenThumbs,
      onChange,
    ],
  );

  const onChangeEndRef = useRef(onChangeEnd);
  onChangeEndRef.current = onChangeEnd;

  const fireChangeEnd = useCallback(
    (newValues?: number[]) => {
      const currentValues = newValues ?? valuesRef.current;
      const cb = onChangeEndRef.current;
      if (isRange) {
        (cb as SliderRangeProps['onChangeEnd'])?.(
          currentValues as unknown as [number, number],
        );
      } else {
        (cb as SliderSingleProps['onChangeEnd'])?.(currentValues[0]);
      }
    },
    [isRange],
  );

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }
      e.preventDefault();

      // If the click originated from a mark element, snap to that mark's value
      // instead of calculating from pointer position (avoids off-by-one when
      // clicking on wide labels like "100").
      const markEl = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-mark-value]',
      );
      const newVal = markEl
        ? Number(markEl.dataset.markValue)
        : getValueFromPosition(e.clientX, e.clientY);
      const thumbIndex = getClosestThumb(newVal);
      draggingThumbRef.current = thumbIndex;
      setDraggingThumb(thumbIndex);
      updateValue(thumbIndex, newVal);

      // Focus the closest thumb
      const track = trackRef.current;
      if (track) {
        const thumbs = track.querySelectorAll<HTMLElement>('[role="slider"]');
        thumbs[thumbIndex]?.focus();
      }

      if (
        typeof (e.currentTarget as HTMLElement).setPointerCapture === 'function'
      ) {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [isDisabled, getValueFromPosition, getClosestThumb, updateValue],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (draggingThumbRef.current === null || isDisabled) {
        return;
      }
      const newVal = getValueFromPosition(e.clientX, e.clientY);
      updateValue(draggingThumbRef.current, newVal);
    },
    [isDisabled, getValueFromPosition, updateValue],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent<HTMLDivElement>) => {
      if (draggingThumbRef.current !== null) {
        draggingThumbRef.current = null;
        setDraggingThumb(null);
        fireChangeEnd();
      }
    },
    [fireChangeEnd],
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (thumbIndex: number, e: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }
      const currentVal = values[thumbIndex];
      let newVal: number;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowUp':
          newVal = currentVal + step;
          break;
        case 'ArrowLeft':
        case 'ArrowDown':
          newVal = currentVal - step;
          break;
        case 'PageUp':
          newVal = currentVal + step * 10;
          break;
        case 'PageDown':
          newVal = currentVal - step * 10;
          break;
        case 'Home':
          newVal = min;
          break;
        case 'End':
          newVal = max;
          break;
        default:
          return;
      }

      e.preventDefault();
      const clamped = clamp(snapToStep(newVal, min, step), min, max);
      updateValue(thumbIndex, newVal);

      // Compute exact post-update values so onChangeEnd reports the correct
      // value even before React batches the state update.
      if (isRange) {
        const newValues = [...values] as [number, number];
        newValues[thumbIndex] = clamped;
        const minGap = minStepsBetweenThumbs * step;
        if (thumbIndex === 0) {
          newValues[0] = Math.min(newValues[0], newValues[1] - minGap);
        } else {
          newValues[1] = Math.max(newValues[1], newValues[0] + minGap);
        }
        newValues[0] = clamp(newValues[0], min, max);
        newValues[1] = clamp(newValues[1], min, max);
        fireChangeEnd(newValues);
      } else {
        fireChangeEnd([clamped]);
      }
    },
    [
      isDisabled,
      isRange,
      values,
      step,
      min,
      max,
      minStepsBetweenThumbs,
      updateValue,
      fireChangeEnd,
    ],
  );

  // Format display value
  const displayValue = (val: number): string => {
    if (formatValue) {
      return formatValue(val);
    }
    return String(val);
  };

  // Render a thumb
  const renderThumb = (thumbIndex: number) => {
    const val = values[thumbIndex];
    const percent = getPercent(val, min, max);

    const positionStyle = isHorizontal
      ? {left: `${percent}%`}
      : {bottom: `${percent}%`, left: '50%'};

    const thumbLabel = isRange
      ? thumbIndex === 0
        ? `${label}, minimum value`
        : `${label}, maximum value`
      : label;

    // Suppress the per-thumb value bubble while the disabled-message tooltip is
    // showing, so a disabled slider surfaces the *reason* on hover/focus rather
    // than stacking two tooltips over the same thumb.
    const useValueTooltip = valueDisplay === 'tooltip' && !showsDisabledMessage;
    const tooltipPlacement = isHorizontal ? 'above' : 'start';

    const thumbElement = (
      <div
        key={thumbIndex}
        id={!isRange ? id : undefined}
        role="slider"
        // With a disabledMessage the thumb keeps focusability so the reason is
        // focus-discoverable; value changes stay blocked by the isDisabled
        // guards in the pointer/keyboard handlers.
        tabIndex={isDisabled && !showsDisabledMessage ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        aria-valuetext={formatValue ? formatValue(val) : undefined}
        aria-orientation={orientation}
        aria-disabled={isDisabled || undefined}
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-label={thumbLabel}
        aria-describedby={ariaDescribedBy}
        onKeyDown={e => handleKeyDown(thumbIndex, e)}
        {...mergeProps(
          themeProps('slider-thumb', {
            orientation,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            styles.thumb,
            isHorizontal ? styles.thumbHorizontal : styles.thumbVertical,
            !isDisabled && styles.thumbHover,
            !isDisabled && styles.thumbFocusVisible,
            isDisabled && styles.thumbDisabled,
          ),
          undefined,
          positionStyle,
        )}
      />
    );

    if (useValueTooltip) {
      return (
        <Tooltip
          key={thumbIndex}
          content={displayValue(val)}
          placement={tooltipPlacement}
          delay={0}
          focusTrigger="always"
          isOpen={draggingThumb === thumbIndex ? true : undefined}>
          {thumbElement}
        </Tooltip>
      );
    }

    return thumbElement;
  };

  // Filled track position
  const filledStyle = (() => {
    if (isRange) {
      const [v0, v1] = values;
      const p0 = getPercent(v0, min, max);
      const p1 = getPercent(v1, min, max);
      if (isHorizontal) {
        return {left: `${p0}%`, width: `${p1 - p0}%`};
      }
      return {bottom: `${p0}%`, height: `${p1 - p0}%`};
    }
    const p = getPercent(values[0], min, max);
    if (isHorizontal) {
      return {left: '0%', width: `${p}%`};
    }
    return {bottom: '0%', height: `${p}%`};
  })();

  // Text value display
  const textDisplay =
    valueDisplay === 'text' ? (
      <span {...stylex.props(styles.textValue)}>
        {isRange
          ? `${displayValue(values[0])} – ${displayValue(values[1])}`
          : displayValue(values[0])}
      </span>
    ) : null;

  return (
    <Field
      data-testid={testId}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
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
        {...mergeProps(
          themeProps('slider', {
            orientation,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(styles.sliderRow),
        )}>
        <div
          ref={mergeRefs(ref, trackRef, disabledMessageTooltip.ref)}
          {...(isRange ? {role: 'group', 'aria-label': label} : undefined)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          {...stylex.props(
            styles.trackContainer,
            isHorizontal
              ? styles.trackContainerHorizontal
              : styles.trackContainerVertical,
            isDisabled && styles.trackContainerDisabled,
          )}>
          {/* Background track */}
          <div
            aria-hidden="true"
            {...mergeProps(
              themeProps('slider-track', {orientation}),
              stylex.props(
                styles.track,
                isHorizontal ? styles.trackHorizontal : styles.trackVertical,
              ),
            )}
          />

          {/* Filled track */}
          <div
            aria-hidden="true"
            {...mergeProps(
              stylex.props(
                styles.filledTrack,
                isHorizontal
                  ? styles.filledTrackHorizontal
                  : styles.filledTrackVertical,
              ),
              {style: filledStyle},
            )}
          />

          {/* Marks */}
          {marks && (
            <div
              aria-hidden="true"
              {...stylex.props(
                styles.marksContainer,
                isHorizontal
                  ? styles.marksContainerHorizontal
                  : styles.marksContainerVertical,
              )}>
              {marks.map(mark => {
                const percent = getPercent(mark.value, min, max);
                const markPos = isHorizontal
                  ? {left: `${percent}%`}
                  : {bottom: `${percent}%`};
                return (
                  <div key={mark.value}>
                    <div
                      data-testid="slider-mark"
                      data-mark-value={mark.value}
                      {...mergeProps(
                        stylex.props(
                          styles.mark,
                          isHorizontal
                            ? styles.markHorizontal
                            : styles.markVertical,
                        ),
                        {style: markPos},
                      )}
                    />
                    {mark.label && (
                      <span
                        data-testid="slider-mark-label"
                        data-mark-value={mark.value}
                        {...mergeProps(
                          stylex.props(
                            styles.markLabel,
                            isHorizontal
                              ? styles.markLabelHorizontal
                              : styles.markLabelVertical,
                          ),
                          {style: markPos},
                        )}>
                        {mark.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Thumbs */}
          {values.map((_, i) => renderThumb(i))}
        </div>

        {textDisplay}
      </div>
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

Slider.displayName = 'Slider';
