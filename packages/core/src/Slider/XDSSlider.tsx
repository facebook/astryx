'use client';

/**
 * @file XDSSlider.tsx
 * @input Uses React, useId, useRef, useCallback, XDSField, XDSTooltip
 * @output Exports XDSSlider component, XDSSliderProps, XDSSliderSingleProps, XDSSliderRangeProps, XDSSliderBaseProps
 * @position Core implementation; consumed by index.ts, tested by XDSSlider.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Slider/Slider.doc.mjs
 * - /packages/core/src/Slider/XDSSlider.test.tsx
 * - /packages/core/src/Slider/index.ts
 * - /apps/storybook/stories/Slider.stories.tsx
 */


import {
  useId,
  useRef,
  useCallback,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {XDSField} from '../Field/XDSField';
import {XDSTooltip} from '../Tooltip/XDSTooltip';
import type {XDSInputStatus} from '../Field/types';
import {xdsClassName, mergeProps} from '../utils';

// =============================================================================
// Types
// =============================================================================

export interface XDSSliderBaseProps {
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
  /** Whether the field is optional. @default false */
  isOptional?: boolean;
  /** Whether the field is required. @default false */
  isRequired?: boolean;
  /** Status indicator for the slider. */
  status?: XDSInputStatus;
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
  marks?: Array<{value: number; label?: string}>;
  /**
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
  /** Test ID for the root element. */
  'data-testid'?: string;
}

export interface XDSSliderSingleProps extends XDSSliderBaseProps {
  /** Current value (single thumb mode). */
  value: number;
  /** Callback fired on value change during drag. */
  onChange?: (value: number) => void;
  /** Callback fired when drag ends (on pointer up or keyboard). */
  onChangeEnd?: (value: number) => void;
}

export interface XDSSliderRangeProps extends XDSSliderBaseProps {
  /** Current value (range mode: [min, max]). */
  value: [number, number];
  /** Callback fired on value change during drag. */
  onChange?: (value: [number, number]) => void;
  /** Callback fired when drag ends (on pointer up or keyboard). */
  onChangeEnd?: (value: [number, number]) => void;
  /** Minimum number of steps between thumbs. */
  minStepsBetweenThumbs?: number;
}

export type XDSSliderProps = XDSSliderSingleProps | XDSSliderRangeProps;

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
    backgroundColor: colorVars['--color-muted'],
    borderRadius: radiusVars['--radius-rounded'],
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
    borderRadius: radiusVars['--radius-rounded'],
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
    borderRadius: radiusVars['--radius-rounded'],
    backgroundColor: colorVars['--color-accent'],
    transform: 'translate(-50%, -50%)',
    transitionProperty: 'background-color, box-shadow',
    transitionDuration: durationVars['--duration-fast'],
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
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-hover-tint']} 15%)`,
      },
    },
  },
  thumbFocusWithin: {
    outline: {
      default: 'none',
      ':focus-within': `2px solid ${colorVars['--color-ring-focus']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-within': '2px',
    },
  },
  thumbDisabled: {
    backgroundColor: colorVars['--color-muted'],
    cursor: 'not-allowed',
  },
  textValue: {
    fontFamily: typographyVars['--font-body'],
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
    borderRadius: radiusVars['--radius-rounded'],
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
    fontFamily: typographyVars['--font-body'],
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
  const steps = Math.round((val - min) / step);
  return min + steps * step;
}

function getPercent(val: number, min: number, max: number): number {
  if (max === min) return 0;
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
 * <XDSSlider label="Volume" value={50} onChange={setValue} />
 * <XDSSlider label="Price range" value={[20, 80]} onChange={setRange} />
 * ```
 */
export function XDSSlider({ref, ...props}: XDSSliderProps) {
  const {
    label,
    isLabelHidden = false,
    description,
    isDisabled = false,
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
      ? ((props as XDSSliderRangeProps).minStepsBetweenThumbs ?? 0)
      : 0;

  const isHorizontal = orientation === 'horizontal';

  const id = useId();
  const descriptionID = useId();
  const statusMessageID = useId();

  const trackRef = useRef<HTMLDivElement>(null);
  const draggingThumbRef = useRef<number | null>(null);

  // Build aria-describedby
  const describedByParts: string[] = [];
  if (description) describedByParts.push(descriptionID);
  if (status?.message) describedByParts.push(statusMessageID);
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  // Value helpers
  const values: number[] = isRange
    ? (value as [number, number])
    : [value as number];

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) return min;
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
      if (!isRange) return 0;
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
      if (isDisabled) return;
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

        (onChange as XDSSliderRangeProps['onChange'])?.(currentValues);
      } else {
        (onChange as XDSSliderSingleProps['onChange'])?.(clamped);
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

  const fireChangeEnd = useCallback(() => {
    if (isRange) {
      (onChangeEnd as XDSSliderRangeProps['onChangeEnd'])?.(
        values as unknown as [number, number],
      );
    } else {
      (onChangeEnd as XDSSliderSingleProps['onChangeEnd'])?.(values[0]);
    }
  }, [isRange, values, onChangeEnd]);

  // Pointer handlers
  const handlePointerDown = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      e.preventDefault();
      const newVal = getValueFromPosition(e.clientX, e.clientY);
      const thumbIndex = getClosestThumb(newVal);
      draggingThumbRef.current = thumbIndex;
      updateValue(thumbIndex, newVal);
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
      if (draggingThumbRef.current === null || isDisabled) return;
      const newVal = getValueFromPosition(e.clientX, e.clientY);
      updateValue(draggingThumbRef.current, newVal);
    },
    [isDisabled, getValueFromPosition, updateValue],
  );

  const handlePointerUp = useCallback(
    (_e: PointerEvent<HTMLDivElement>) => {
      if (draggingThumbRef.current !== null) {
        draggingThumbRef.current = null;
        fireChangeEnd();
      }
    },
    [fireChangeEnd],
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (thumbIndex: number, e: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) return;
      const currentVal = values[thumbIndex];
      let newVal = currentVal;

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
      updateValue(thumbIndex, newVal);
    },
    [isDisabled, values, step, min, max, updateValue],
  );

  // Format display value
  const displayValue = (val: number): string => {
    if (formatValue) return formatValue(val);
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
        ? 'Minimum value'
        : 'Maximum value'
      : label;

    const useTooltip = valueDisplay === 'tooltip';
    const tooltipPlacement = isHorizontal ? 'above' : 'start';

    const thumbElement = (
      <div
        key={thumbIndex}
        role="slider"
        tabIndex={isDisabled ? -1 : 0}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={val}
        aria-valuetext={formatValue ? formatValue(val) : undefined}
        aria-orientation={orientation}
        aria-disabled={isDisabled || undefined}
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-label={thumbLabel}
        aria-describedby={ariaDescribedBy}
        style={positionStyle}
        onKeyDown={e => handleKeyDown(thumbIndex, e)}
        {...mergeProps(
          xdsClassName('slider-thumb', {orientation}),
          stylex.props(
            styles.thumb,
            isHorizontal ? styles.thumbHorizontal : styles.thumbVertical,
            !isDisabled && styles.thumbHover,
            !isDisabled && styles.thumbFocusWithin,
            isDisabled && styles.thumbDisabled,
          ),
        )}
      />
    );

    if (useTooltip) {
      return (
        <XDSTooltip
          key={thumbIndex}
          content={displayValue(val)}
          placement={tooltipPlacement}
          delay={0}
          focusTrigger="always">
          {thumbElement}
        </XDSTooltip>
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
    <XDSField
      data-testid={testId}
      label={label}
      isLabelHidden={isLabelHidden}
      description={description}
      inputID={id}
      descriptionID={description ? descriptionID : undefined}
      isOptional={isOptional}
      isRequired={isRequired}
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
      xstyle={xstyle}
      className={className}
      style={style}>
      <div
        {...mergeProps(
          xdsClassName('slider', {orientation}),
          stylex.props(styles.sliderRow),
        )}>
        <div
          ref={node => {
            // Merge refs
            (
              trackRef as React.MutableRefObject<HTMLDivElement | null>
            ).current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current =
                node;
            }
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          {...stylex.props(
            styles.trackContainer,
            isHorizontal
              ? styles.trackContainerHorizontal
              : styles.trackContainerVertical,
            isDisabled && styles.trackContainerDisabled,
          )}>
          {/* Background track */}
          <div
            {...mergeProps(
              xdsClassName('slider-track', {orientation}),
              stylex.props(
                styles.track,
                isHorizontal ? styles.trackHorizontal : styles.trackVertical,
              ),
            )}
          />

          {/* Filled track */}
          <div
            style={filledStyle}
            {...stylex.props(
              styles.filledTrack,
              isHorizontal
                ? styles.filledTrackHorizontal
                : styles.filledTrackVertical,
            )}
          />

          {/* Marks */}
          {marks && (
            <div
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
                      style={markPos}
                      {...stylex.props(
                        styles.mark,
                        isHorizontal
                          ? styles.markHorizontal
                          : styles.markVertical,
                      )}
                    />
                    {mark.label && (
                      <span
                        data-testid="slider-mark-label"
                        style={markPos}
                        {...stylex.props(
                          styles.markLabel,
                          isHorizontal
                            ? styles.markLabelHorizontal
                            : styles.markLabelVertical,
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
    </XDSField>
  );
}

XDSSlider.displayName = 'XDSSlider';
