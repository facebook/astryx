// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Rating.tsx
 * @input Uses React (useId, useState, pointer/keyboard events), theme tokens,
 *   VisuallyHidden, themeProps, mergeProps, IconType
 * @output Exports Rating component, RatingProps, RatingSize, RatingColor
 * @position Core implementation; consumed by index.ts, tested by Rating.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Rating/Rating.doc.mjs (props table, features, notes)
 * - /packages/core/src/Rating/Rating.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Rating/index.ts (exports if types change)
 * - /apps/storybook/stories/Rating.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Rating/ (showcase blocks)
 */

import {
  useId,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type Ref,
  type SVGProps,
} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  durationVars,
  easeVars,
  typographyVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import type {IconType} from '../Icon';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';
import {VisuallyHidden} from '../VisuallyHidden';

/** Pixel dimensions for each icon size. */
const SIZE_PX: Record<RatingSize, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

/** Default 5-point star glyph, sized to fill its container. */
function StarGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
  },
  label: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
  },
  body: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  // The interactive/display track that carries the slider/img role.
  track: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    width: 'fit-content',
    borderRadius: spacingVars['--spacing-1'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '2px',
    },
  },
  trackInteractive: {
    cursor: 'pointer',
  },
  trackDisabled: {
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  star: {
    position: 'relative',
    display: 'inline-block',
    flexShrink: 0,
  },
  // Empty (background) icon layer.
  emptyLayer: {
    position: 'absolute',
    inset: 0,
    color: colorVars['--color-icon-disabled'],
  },
  // Filled (foreground) icon layer, clipped horizontally to the fill fraction.
  fillLayer: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    overflow: 'hidden',
    height: '100%',
    transitionProperty: 'width',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  fillWarning: {color: colorVars['--color-warning']},
  fillAccent: {color: colorVars['--color-accent']},
  fillNeutral: {color: colorVars['--color-icon-primary']},
  glyph: {
    display: 'block',
    width: '100%',
    height: '100%',
  },
  valueLabel: {
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    color: colorVars['--color-text-secondary'],
    fontVariantNumeric: 'tabular-nums',
  },
});

// Dynamic dimensions (number -> px, fraction -> %). Kept out of the static
// `styles` object because their values depend on props/state.
const dynamic = stylex.create({
  square: (px: number) => ({width: px, height: px}),
  clip: (pct: number) => ({width: `${pct}%`}),
});

export type RatingSize = 'sm' | 'md' | 'lg';

export type RatingColor = 'warning' | 'accent' | 'neutral';

export interface RatingProps extends Omit<BaseProps, 'onChange'> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;
  /**
   * Accessible label for the rating (always required). Rendered as visible
   * text unless `isLabelHidden` is set.
   */
  label: string;
  /**
   * Visually hide the label while keeping it accessible to screen readers.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Controlled value. Provide together with `onChange`. Fractional values
   * render partial icons (e.g. `3.5`).
   */
  value?: number;
  /**
   * Uncontrolled initial value. Ignored when `value` is provided.
   * @default 0
   */
  defaultValue?: number;
  /**
   * Number of icons to render.
   * @default 5
   */
  max?: number;
  /**
   * Allow selecting half-icon increments when interactive.
   * @default false
   */
  hasHalfIcons?: boolean;
  /**
   * Read-only display: renders the value without interaction.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Disabled state: grays out and blocks interaction.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Allow clearing back to `0` by selecting the current value again.
   * @default true
   */
  isClearable?: boolean;
  /**
   * Icon size.
   * @default 'md'
   */
  size?: RatingSize;
  /**
   * Color of the filled icons.
   * @default 'warning'
   */
  color?: RatingColor;
  /**
   * Custom SVG icon component used for both the filled and empty layers.
   * Defaults to a star.
   */
  icon?: IconType;
  /**
   * Custom SVG icon component for the empty layer only. Defaults to `icon`.
   */
  emptyIcon?: IconType;
  /**
   * Show a text label of the current value next to the icons (e.g. "3 of 5").
   * @default false
   */
  hasValueLabel?: boolean;
  /**
   * Custom formatter for the value label and `aria-valuetext`.
   * @default `${value} of ${max}`
   */
  formatValueLabel?: (value: number, max: number) => string;
  /** Called when the value changes. */
  onChange?: (value: number) => void;
  /**
   * HTML name for the underlying hidden input, for native form submission.
   */
  htmlName?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * A star rating control for capturing or displaying a score.
 *
 * Supports controlled and uncontrolled use, half-icon precision, a read-only
 * display mode, and custom icons. Interactive ratings expose the WAI-ARIA
 * `slider` role — arrow keys adjust the value, `Home`/`End` jump to the
 * bounds, and pointer clicks set it directly.
 *
 * @example
 * ```
 * <Rating label="Rate this article" defaultValue={3} onChange={setScore} />
 * <Rating label="Average score" value={4.5} hasHalfIcons isReadOnly hasValueLabel />
 * ```
 */
export function Rating({
  label,
  isLabelHidden = false,
  value,
  defaultValue = 0,
  max = 5,
  hasHalfIcons = false,
  isReadOnly = false,
  isDisabled = false,
  isClearable = true,
  size = 'md',
  color = 'warning',
  icon: FilledIcon = StarGlyph,
  emptyIcon,
  hasValueLabel = false,
  formatValueLabel,
  onChange,
  htmlName,
  xstyle,
  className,
  style,
  ref,
}: RatingProps) {
  const labelID = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const currentValue = clamp(isControlled ? value : internalValue, 0, max);
  const isInteractive = !isReadOnly && !isDisabled;
  const step = hasHalfIcons ? 0.5 : 1;
  const px = SIZE_PX[size];
  const EmptyIcon = emptyIcon ?? FilledIcon;

  // Hover preview takes precedence while pointing at the control.
  const displayValue = hoverValue != null ? hoverValue : currentValue;

  const formatValue = (v: number) =>
    formatValueLabel ? formatValueLabel(v, max) : `${v} of ${max}`;
  const valueText = formatValue(currentValue);

  const commit = (next: number) => {
    let clamped = clamp(next, 0, max);
    // Selecting the current value again clears it (when allowed).
    if (isClearable && clamped === currentValue) {
      clamped = 0;
    }
    if (!isControlled) {
      setInternalValue(clamped);
    }
    onChange?.(clamped);
  };

  // Resolve the value pointed at, honoring half-icon precision. Accepts pointer
  // and click events alike (PointerEvent extends MouseEvent).
  const valueFromPointer = (e: MouseEvent<HTMLDivElement>): number | null => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-rating-index]',
    );
    if (!target) {
      return null;
    }
    const index = Number(target.getAttribute('data-rating-index'));
    if (!hasHalfIcons) {
      return index;
    }
    const rect = target.getBoundingClientRect();
    const isFirstHalf = e.clientX - rect.left < rect.width / 2;
    return isFirstHalf ? index - 0.5 : index;
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!isInteractive) {
      return;
    }
    let next: number;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        next = currentValue + step;
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        next = currentValue - step;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = max;
        break;
      default:
        return;
    }
    e.preventDefault();
    const clamped = clamp(next, 0, max);
    if (!isControlled) {
      setInternalValue(clamped);
    }
    onChange?.(clamped);
  };

  const stars = Array.from({length: max}, (_, i) => {
    const starIndex = i + 1;
    // Continuous fill fraction so fractional values (e.g. 3.7) render cleanly.
    const fraction = clamp(displayValue - i, 0, 1);
    return (
      <span
        key={starIndex}
        data-rating-index={starIndex}
        {...stylex.props(styles.star, dynamic.square(px))}>
        <span {...stylex.props(styles.emptyLayer)}>
          <EmptyIcon {...stylex.props(styles.glyph)} />
        </span>
        <span
          {...stylex.props(
            styles.fillLayer,
            color === 'warning' && styles.fillWarning,
            color === 'accent' && styles.fillAccent,
            color === 'neutral' && styles.fillNeutral,
            dynamic.clip(fraction * 100),
          )}>
          <span {...stylex.props(styles.star, dynamic.square(px))}>
            <FilledIcon {...stylex.props(styles.glyph)} />
          </span>
        </span>
      </span>
    );
  });

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('rating', {
          size: size !== 'md' ? size : undefined,
          color: color !== 'warning' ? color : undefined,
          readonly: isReadOnly ? 'readonly' : undefined,
          disabled: isDisabled ? 'disabled' : undefined,
        }),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}>
      {isLabelHidden ? (
        <VisuallyHidden id={labelID}>{label}</VisuallyHidden>
      ) : (
        <span id={labelID} {...stylex.props(styles.label)}>
          {label}
        </span>
      )}
      <div {...stylex.props(styles.body)}>
        <div
          role={isInteractive ? 'slider' : 'img'}
          aria-labelledby={labelID}
          aria-label={isInteractive ? undefined : valueText}
          aria-valuemin={isInteractive ? 0 : undefined}
          aria-valuemax={isInteractive ? max : undefined}
          aria-valuenow={isInteractive ? currentValue : undefined}
          aria-valuetext={isInteractive ? valueText : undefined}
          aria-readonly={isReadOnly || undefined}
          aria-disabled={isDisabled || undefined}
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={handleKeyDown}
          onPointerMove={
            isInteractive ? e => setHoverValue(valueFromPointer(e)) : undefined
          }
          onPointerLeave={isInteractive ? () => setHoverValue(null) : undefined}
          onClick={
            isInteractive
              ? e => {
                  const next = valueFromPointer(e);
                  if (next != null) {
                    commit(next);
                  }
                }
              : undefined
          }
          {...stylex.props(
            styles.track,
            isInteractive && styles.trackInteractive,
            isDisabled && styles.trackDisabled,
          )}>
          {stars}
        </div>
        {hasValueLabel && (
          <span {...stylex.props(styles.valueLabel)}>{valueText}</span>
        )}
      </div>
      {htmlName != null && !isDisabled && (
        <input type="hidden" name={htmlName} value={currentValue} />
      )}
    </div>
  );
}

Rating.displayName = 'Rating';
