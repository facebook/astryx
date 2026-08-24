// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Slider.tsx
 * @input Uses React, useId, useRef, useCallback, Field, Tooltip, useTooltip, VisuallyHidden
 * @output Exports Slider component, SliderProps, SliderSingleProps, SliderRangeProps, SliderBaseProps
 * @position Core implementation; consumed by index.ts, tested by Slider.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Slider/Slider.doc.mjs
 * - /packages/core/src/Slider/Slider.test.tsx
 * - /packages/core/src/Slider/index.ts
 * - /apps/storybook/stories/Slider.stories.tsx
 * - /packages/cli/assets/templates/blocks/components/Slider/ (showcase blocks)
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
import {VisuallyHidden} from '../VisuallyHidden';
import type {InputStatus} from '../Field/types';
import {mergeProps, mergeRefs, rtlStyles} from '../utils';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import {isRtlElement} from '../hooks/isRtlElement';
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
  /**
   * The HTML name attribute for form submissions. When set, the slider
   * renders hidden inputs carrying the current value (two in range mode,
   * matching how paired native range inputs submit).
   */
  htmlName?: string;
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
    // The whole track is the tap target (a click anywhere on it moves the
    // slider), but it is only THUMB_SIZE (20px) tall — under the WCAG 2.5.8 AA
    // 24px minimum. Floor its block size to 24px on touch pointers only. The
    // rail and thumb center on 50%, so they stay put; only the invisible
    // tappable area grows. Desktop (fine pointer) is unchanged.
    minBlockSize: {
      default: null,
      '@media (pointer: coarse)': '24px',
    },
    width: '100%',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  trackContainerVertical: {
    width: THUMB_SIZE,
    height: 160,
    // Same tap target, rotated: the vertical track is the thing you press, and
    // it is only THUMB_SIZE (20px) wide. `minBlockSize` above floors the
    // horizontal track's short axis; here the short axis is the inline one
    // (the block size is already 160px), so floor that instead. The rail,
    // fill, marks and thumb all center on the inline 50%, so they stay put;
    // only the invisible tappable area grows. Desktop is unchanged.
    minInlineSize: {
      default: null,
      '@media (pointer: coarse)': '24px',
    },
    flexDirection: 'column',
    justifyContent: 'center',
    cursor: {
      default: 'pointer',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
  },
  trackContainerDisabled: {
    opacity: 0.5,
    cursor: 'default',
  },
  track: {
    position: 'absolute',
    backgroundColor: colorVars['--color-track'],
    borderRadius: radiusVars['--radius-full'],
  },
  trackHorizontal: {
    insetInlineStart: 0,
    insetInlineEnd: 0,
    height: TRACK_SIZE,
    top: '50%',
    transform: 'translateY(-50%)',
  },
  trackVertical: {
    top: 0,
    bottom: 0,
    width: TRACK_SIZE,
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
    cursor: {
      default: 'grab',
      ':is(:disabled,[aria-disabled="true"])': 'default',
    },
    zIndex: 1,
  },
  thumbHorizontal: {
    top: '50%',
    // The thumb is positioned via logical `insetInlineStart`, which resolves
    // from the right edge under RTL. The centering translate is a physical
    // (screen-space) transform, so it must flip its X direction under RTL to
    // keep the thumb centered on the value point.
    transform: {
      default: 'translate(-50%, -50%)',
      ':is([dir="rtl"] *)': 'translate(50%, -50%)',
    },
  },
  thumbHover: {
    backgroundColor: {
      default: colorVars['--color-accent'],
      ':hover:where(:not(:disabled,[aria-disabled="true"]))': {
        '@media (hover: hover)': `color-mix(in srgb, ${colorVars['--color-accent']}, ${colorVars['--color-tint-hover']} 15%)`,
      },
    },
  },
  thumbDisabled: {
    backgroundColor: colorVars['--color-background-muted'],
    cursor: 'default',
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
    insetInlineStart: 0,
    insetInlineEnd: 0,
    top: '50%',
  },
  marksContainerVertical: {
    top: 0,
    bottom: 0,
    insetInlineStart: '50%',
  },
  mark: {
    position: 'absolute',
    backgroundColor: colorVars['--color-border-emphasized'],
    borderRadius: radiusVars['--radius-full'],
  },
  markHorizontal: {
    width: 2,
    height: 8,
    transform: {
      default: 'translate(-50%, -50%)',
      ':is([dir="rtl"] *)': 'translate(50%, -50%)',
    },
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
    transform: {
      default: 'translateX(-50%)',
      ':is([dir="rtl"] *)': 'translateX(50%)',
    },
    top: THUMB_SIZE / 2 + 4,
  },
  markLabelVertical: {
    transform: 'translateY(50%)',
    insetInlineStart: THUMB_SIZE / 2 + 4,
  },
});

// =============================================================================
// Helpers
// =============================================================================

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Number of decimal places a value carries, including values in exponent
 * notation (e.g. 1e-7 → 7). Used to round away binary floating-point error
 * after step arithmetic.
 */
function getDecimalPrecision(num: number): number {
  if (Math.abs(num) < 1) {
    const parts = num.toExponential().split('e-');
    if (parts.length === 2) {
      const mantissaDecimals = parts[0].split('.')[1]?.length ?? 0;
      return mantissaDecimals + parseInt(parts[1], 10);
    }
  }
  const decimalPart = String(num).split('.')[1];
  return decimalPart ? decimalPart.length : 0;
}

function snapToStep(val: number, min: number, step: number): number {
  if (step <= 0) {
    return val;
  }
  const steps = Math.round((val - min) / step);
  const snapped = min + steps * step;
  // `min + steps * step` accumulates binary floating-point error with
  // fractional steps (0 + 3 * 0.1 → 0.30000000000000004), which leaks into
  // onChange/onChangeEnd payloads, aria-valuenow, and the value tooltip.
  // Snapped values can never carry more decimals than min/step combined, so
  // rounding to that precision removes only the error.
  const precision = Math.min(
    Math.max(getDecimalPrecision(min), getDecimalPrecision(step)),
    20, // toFixed() throws past 20 digits
  );
  return Number(snapped.toFixed(precision));
}

function getPercent(val: number, min: number, max: number): number {
  if (max === min) {
    return 0;
  }
  return ((val - min) / (max - min)) * 100;
}

/**
 * Thumb travel is inset by half a thumb at each end — the geometry a native
 * `input[type=range]` uses — so the thumb stays inside the component box at
 * min and max instead of overhanging it by half its width (#5050). The fill
 * and the marks map through the same inset, and `travelFraction` inverts it,
 * so the thumb tracks the pointer that grabbed it. Both directions read
 * THUMB_SIZE, so a theme cannot resize the thumb through CSS alone.
 */
const THUMB_INSET = THUMB_SIZE / 2;

function insetPosition(percent: number): string {
  return cssLength(percent, THUMB_INSET - (percent / 100) * THUMB_SIZE);
}

/** Distance between two inset positions; the inset itself cancels out. */
function insetSpan(fromPercent: number, toPercent: number): string {
  const delta = toPercent - fromPercent;
  return cssLength(delta, -(delta / 100) * THUMB_SIZE);
}

/** Inverse of `insetPosition`: an offset from the box start back to 0–1. */
function travelFraction(offset: number, size: number): number {
  const travel = size - THUMB_SIZE;
  if (travel > 0) {
    return (offset - THUMB_INSET) / travel;
  }
  // Narrower than the thumb, so there is no travel to map onto: fall back to
  // the raw fraction rather than dividing by zero.
  return size > 0 ? offset / size : 0;
}

function cssLength(percent: number, px: number): string {
  // Percentages of the box and step arithmetic both carry binary
  // floating-point error into the DOM (`calc(33% + 3.3999999999999995px)`).
  const round = (n: number) => Number(n.toFixed(3));
  return `calc(${round(percent)}% ${px < 0 ? '-' : '+'} ${Math.abs(round(px))}px)`;
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
    htmlName,
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
  const labelID = useId();
  const descriptionID = useId();
  const statusMessageID = useId();
  const requiredID = useId();

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

  // Required state. `aria-required` is not a supported property of
  // role="slider" in WAI-ARIA 1.2, so the thumb instead points its
  // aria-describedby at a visually hidden "Required" span — mirroring the
  // Field label's visible indicator (where isOptional takes precedence).
  const conveysRequired = isRequired && !isOptional;

  // Build aria-describedby
  const describedByParts: string[] = [];
  if (description) {
    describedByParts.push(descriptionID);
  }
  if (status?.message) {
    describedByParts.push(statusMessageID);
  }
  if (conveysRequired) {
    describedByParts.push(requiredID);
  }
  if (showsDisabledMessage) {
    describedByParts.push(disabledMessageTooltip.describedBy);
  }
  const ariaDescribedBy =
    describedByParts.length > 0 ? describedByParts.join(' ') : undefined;

  // Value helpers — guard against undefined value (e.g. playground previews
  // that render the component without providing a value prop).
  const values: number[] = useMemo(() => {
    const currentValues = Array.isArray(value)
      ? value
      : [value != null ? value : min];
    return currentValues.map(currentValue => clamp(currentValue, min, max));
  }, [value, min, max]);

  const valuesRef = useRef(values);
  valuesRef.current = values;

  const getValueFromPosition = useCallback(
    (clientX: number, clientY: number): number => {
      const track = trackRef.current;
      if (!track) {
        return min;
      }
      const rect = track.getBoundingClientRect();

      // Inverse of `insetPosition`: the pointer maps onto the thumb's travel
      // (the box minus half a thumb at each end), so pressing on the thumb
      // leaves it where it is instead of jumping.
      let percent: number;
      if (isHorizontal) {
        // In RTL the inline-start (value = min) is the right edge, so measure
        // the pointer fraction from the right instead of the left. Detected
        // from the track's computed direction (lazy, only on pointer move).
        percent = travelFraction(
          isRtlElement(track) ? rect.right - clientX : clientX - rect.left,
          rect.width,
        );
      } else {
        // Vertical: bottom = min, top = max
        percent = 1 - travelFraction(clientY - rect.top, rect.height);
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
      ? {insetInlineStart: insetPosition(percent)}
      : {bottom: insetPosition(percent), left: '50%'};

    // In range mode each thumb keeps a short individual name that composes
    // with the group label (announced via the group's aria-labelledby), per
    // the APG multi-thumb slider pattern. In single mode the thumb takes its
    // name from the visible label element via aria-labelledby.
    const thumbLabel = isRange
      ? thumbIndex === 0
        ? 'Minimum value'
        : 'Maximum value'
      : undefined;

    // ARIA bounds must agree with the movement clamping in updateValue: in
    // range mode a thumb can't cross its sibling (minus the
    // minStepsBetweenThumbs gap), and the result is always clamped to
    // [min, max].
    const minGap = minStepsBetweenThumbs * step;
    const ariaValueMin =
      isRange && thumbIndex === 1 ? clamp(values[0] + minGap, min, max) : min;
    const ariaValueMax =
      isRange && thumbIndex === 0 ? clamp(values[1] - minGap, min, max) : max;

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
        aria-valuemin={ariaValueMin}
        aria-valuemax={ariaValueMax}
        aria-valuenow={val}
        aria-valuetext={formatValue ? formatValue(val) : undefined}
        aria-orientation={orientation}
        aria-disabled={isDisabled || undefined}
        aria-invalid={status?.type === 'error' ? true : undefined}
        aria-label={thumbLabel}
        aria-labelledby={!isRange ? labelID : undefined}
        aria-describedby={ariaDescribedBy}
        onKeyDown={e => handleKeyDown(thumbIndex, e)}
        {...mergeProps(
          themeProps('slider-thumb', {
            orientation,
            disabled: isDisabled ? 'disabled' : null,
          }),
          stylex.props(
            styles.thumb,
            isHorizontal
              ? styles.thumbHorizontal
              : rtlStyles.centerInline('50%'),
            !isDisabled && styles.thumbHover,
            !isDisabled && focusOutlineStyles.focusVisible,
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

  // Filled track position — ends at the thumb centre, so it uses the same
  // inset mapping as the thumb.
  const filledStyle = (() => {
    if (isRange) {
      const [v0, v1] = values;
      const p0 = getPercent(v0, min, max);
      const p1 = getPercent(v1, min, max);
      if (isHorizontal) {
        return {insetInlineStart: insetPosition(p0), width: insetSpan(p0, p1)};
      }
      return {bottom: insetPosition(p0), height: insetSpan(p0, p1)};
    }
    const p = getPercent(values[0], min, max);
    if (isHorizontal) {
      return {insetInlineStart: '0%', width: insetPosition(p)};
    }
    return {bottom: '0%', height: insetPosition(p)};
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
      labelID={labelID}
      // The thumb is a div[role="slider"], which a <label htmlFor> can't
      // name (only form-associated elements are labelable). Render the label
      // as a group label and associate it via aria-labelledby instead: the
      // single thumb references it directly, and in range mode the
      // role="group" container references it while each thumb keeps its own
      // "Minimum value"/"Maximum value" name.
      isGroupLabel
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
        {htmlName != null &&
          values.map((v, i) => (
            <input
              // Positional identity: index 0 is the start thumb, 1 the end.
              key={i === 0 ? 'start' : 'end'}
              type="hidden"
              name={htmlName}
              value={String(v)}
              // Disabled native controls are excluded from form submission;
              // mirror that for the hidden carrier.
              disabled={isDisabled}
            />
          ))}
        <div
          ref={mergeRefs(ref, trackRef, disabledMessageTooltip.ref)}
          {...(isRange
            ? {role: 'group', 'aria-labelledby': labelID}
            : undefined)}
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
                isHorizontal
                  ? styles.trackHorizontal
                  : [styles.trackVertical, rtlStyles.centerInline('0px')],
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
                  : [styles.filledTrackVertical, rtlStyles.centerInline('0px')],
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
                  ? {insetInlineStart: insetPosition(percent)}
                  : {bottom: insetPosition(percent)};
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
      {conveysRequired && (
        <VisuallyHidden id={requiredID}>Required</VisuallyHidden>
      )}
      {showsDisabledMessage &&
        disabledMessageTooltip.renderTooltip(disabledMessage)}
    </Field>
  );
}

Slider.displayName = 'Slider';
