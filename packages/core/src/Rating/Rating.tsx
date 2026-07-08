// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Rating.tsx
 * @input Uses React (useId, useState, useRef, pointer/keyboard events),
 *   theme tokens, Skeleton, useTooltip, VisuallyHidden, themeProps, mergeProps
 * @output Exports Rating and its public types
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
  useRef,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
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
import {mergeProps, mergeRefs} from '../utils';
import {themeProps} from '../utils/themeProps';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {Skeleton} from '../Skeleton';
import {useTooltip} from '../Tooltip';
import {VisuallyHidden} from '../VisuallyHidden';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type RatingSize = 'sm' | 'md' | 'lg';
export type RatingDensity = 'compact' | 'comfortable' | 'spacious';
export type RatingMode = 'interactive' | 'display';
export type RatingColor = 'gold' | 'brand' | 'warning' | 'positive' | 'neutral';
export type RatingLabelPlacement =
  'top' | 'bottom' | 'left' | 'right' | 'hidden';
export type RatingAnimation = 'none' | 'fill' | 'scale' | 'bounce';
export type RatingTooltip = 'none' | 'value' | 'label';

/** An SVG icon component (e.g. from the project icon library). */
export type RatingIconComponent = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Icon set for a rating unit. Supply icons from the project's icon system —
 * ideally a solid variant for `filled` and an outline variant for `empty` so
 * the family stays visually consistent.
 */
export interface RatingIcons {
  /** Selected/filled portion (typically a solid icon). */
  filled: RatingIconComponent;
  /** Unselected portion (typically the outline variant). Defaults to `filled`. */
  empty?: RatingIconComponent;
  /** Optional distinct icon for partially-filled units. */
  partial?: RatingIconComponent;
}

export interface RatingProps extends Omit<BaseProps, 'onChange' | 'color'> {
  /** Ref forwarded to the root element. */
  ref?: Ref<HTMLDivElement>;
  /** Accessible label (always required). */
  label: string;
  /**
   * Interaction mode.
   * - `interactive`: users can select/change the value (WAI-ARIA slider).
   * - `display`: read-only presentation (`role="img"`).
   * @default 'interactive'
   */
  mode?: RatingMode;
  /** Controlled value. Fractional values render partial icons. */
  value?: number;
  /** Uncontrolled initial value. @default 0 */
  defaultValue?: number;
  /** Number of icons. @default 5 */
  max?: number;
  /**
   * Smallest selectable/display increment: `1`, `0.5`, `0.25`, `0.1`, …
   * @default 1
   */
  precision?: number;
  /** Called when the value changes. */
  onChange?: (value: number) => void;
  /** Called as the hover preview changes (interactive only); null on leave. */
  onHoverChange?: (value: number | null) => void;

  /** Disabled state: grays out and blocks interaction. @default false */
  isDisabled?: boolean;
  /** Loading state: renders a skeleton placeholder. @default false */
  isLoading?: boolean;
  /** Selecting the current value again clears to 0. @default true */
  isClearable?: boolean;

  /** Icon size. @default 'md' */
  size?: RatingSize;
  /** Spacing between icons. @default 'comfortable' */
  density?: RatingDensity;
  /**
   * Fill color — a semantic preset or any CSS color string.
   * @default 'gold'
   */
  color?: RatingColor | (string & {});
  /**
   * Custom icon set from the project icon system. Defaults to a star.
   */
  icons?: RatingIcons;
  /** Micro-interaction on hover/press. @default 'none' */
  animation?: RatingAnimation;

  /** Where the label sits relative to the icons. @default 'top' */
  labelPlacement?: RatingLabelPlacement;
  /** Show the numeric value next to the icons. @default false */
  hasValueText?: boolean;
  /** Format the numeric value / `aria-valuetext`. */
  formatValue?: (value: number, max: number) => string;
  /** Show a review count, e.g. `(2,341 reviews)`. */
  reviewCount?: number;
  /** Format the review count text. */
  formatReviewCount?: (count: number) => string;
  /**
   * Descriptive labels per value (e.g. Poor…Excellent). Array is 1-indexed by
   * rounded value; a function receives the current value.
   */
  descriptiveLabels?: string[] | ((value: number) => string);
  /** Show hover preview before clicking (interactive). @default true */
  hasHoverPreview?: boolean;
  /** Tooltip content on hover/focus. @default 'none' */
  tooltip?: RatingTooltip;
  /** HTML name for the hidden form input. */
  htmlName?: string;
}

// ---------------------------------------------------------------------------
// Default icons (vendored from Heroicons, MIT — keeps core icon-lib-agnostic)
// ---------------------------------------------------------------------------

function StarFilledDefault(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
      />
    </svg>
  );
}

function StarEmptyDefault(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
      {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIZE_PX: Record<RatingSize, number> = {sm: 16, md: 20, lg: 24};
const fmt = (n: number) => Math.round(n * 100) / 100;

/**
 * Reliable, theme-independent fills for color presets. `gold` uses a fixed
 * amber so stars read as stars in any theme; the rest follow theme tokens.
 * Any CSS color string is also accepted.
 */
const COLOR_PRESETS: Record<RatingColor, string> = {
  gold: 'light-dark(#F5A623, #FFC53D)',
  brand: colorVars['--color-accent'],
  warning: colorVars['--color-warning'],
  positive: colorVars['--color-icon-green'],
  neutral: colorVars['--color-icon-primary'],
};

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

/**
 * Group thousands with commas deterministically. Avoids `toLocaleString`, whose
 * locale-dependent output can differ between server and client and cause
 * hydration mismatches. Consumers needing locale grouping pass `formatReviewCount`.
 */
function groupThousands(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Snap a raw value to the nearest precision step, avoiding FP drift. */
function snap(v: number, precision: number): number {
  const snapped = Math.round(v / precision) * precision;
  // Round to the precision's decimal places so 0.1/0.25 steps don't emit
  // values like 4.6000000000000005.
  const decimals = (String(precision).split('.')[1] ?? '').length;
  return Number(snapped.toFixed(decimals));
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const bounce = stylex.keyframes({
  '0%': {transform: 'scale(1)'},
  '40%': {transform: 'scale(1.25)'},
  '70%': {transform: 'scale(0.92)'},
  '100%': {transform: 'scale(1)'},
});

const styles = stylex.create({
  root: {display: 'inline-flex', gap: spacingVars['--spacing-1']},
  rootTop: {flexDirection: 'column', alignItems: 'flex-start'},
  rootBottom: {flexDirection: 'column-reverse', alignItems: 'flex-start'},
  rootLeft: {flexDirection: 'row', alignItems: 'center'},
  rootRight: {flexDirection: 'row-reverse', alignItems: 'center'},
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
  track: {
    display: 'inline-flex',
    alignItems: 'center',
    width: 'fit-content',
    borderRadius: spacingVars['--spacing-1'],
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {default: null, ':focus-visible': '2px'},
  },
  trackInteractive: {cursor: 'pointer'},
  trackDisabled: {cursor: 'not-allowed', opacity: 0.5},
  gapCompact: {gap: spacingVars['--spacing-0-5']},
  gapComfortable: {gap: spacingVars['--spacing-1']},
  gapSpacious: {gap: spacingVars['--spacing-2']},
  // A single unit (one icon). Fixed-size flex item → never overlaps.
  unit: {display: 'block', flexShrink: 0, position: 'relative'},
  animFill: {
    transitionProperty: 'transform, opacity',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  animScale: {
    transitionProperty: 'transform',
    transitionDuration: {
      default: durationVars['--duration-fast'],
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: easeVars['--ease-standard'],
    transform: {
      default: 'scale(1)',
      ':hover': {'@media (hover: hover)': 'scale(1.18)'},
    },
  },
  animBounce: {
    animationName: {
      default: 'none',
      ':hover': {
        '@media (hover: hover)': bounce,
        '@media (prefers-reduced-motion: reduce)': 'none',
      },
    },
    animationDuration: '400ms',
    animationTimingFunction: easeVars['--ease-standard'],
  },
  // Stacked full-size layers; the filled layer is clipped to the fraction.
  layer: {
    position: 'absolute',
    insetBlock: 0,
    insetInlineStart: 0,
    overflow: 'hidden',
  },
  // Fade a solid glyph reused as the empty state so it reads as "unfilled".
  emptyGhost: {opacity: 0.35},
  iconGlyph: {display: 'block', width: '100%', height: '100%'},
  text: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: spacingVars['--spacing-1'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
  },
  value: {
    color: colorVars['--color-text-primary'],
    fontVariantNumeric: 'tabular-nums',
  },
  reviews: {color: colorVars['--color-text-secondary']},
  descriptive: {color: colorVars['--color-text-secondary']},
});

// Dynamic (prop/state dependent) styles.
const dynamic = stylex.create({
  square: (px: number) => ({width: px, height: px}),
  color: (c: string) => ({color: c}),
  // Clip the filled layer to `fraction` of the icon width, from the leading
  // edge (right in RTL).
  clipEnd: (pct: number) => ({clipPath: `inset(0 ${pct}% 0 0)`}),
  clipStart: (pct: number) => ({clipPath: `inset(0 0 0 ${pct}%)`}),
});

const DENSITY_GAP: Record<RatingDensity, keyof typeof styles> = {
  compact: 'gapCompact',
  comfortable: 'gapComfortable',
  spacious: 'gapSpacious',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * An enterprise-grade rating control — a single source of truth for scores
 * across products.
 *
 * Renders any icon from the project's icon system (defaulting to a star) as a
 * solid filled layer clipped over an outline empty layer. Supports two modes
 * (`interactive` / `display`), configurable `max` and `precision` (whole, 0.5,
 * 0.25, 0.1…), semantic and custom colors, flexible label placement, review
 * counts, descriptive labels, tooltips, density and animation options, RTL,
 * loading skeletons, and full keyboard + screen-reader accessibility.
 *
 * @example
 * ```
 * <Rating label="Rate this article" defaultValue={3} onChange={setScore} />
 * <Rating label="Average" value={4.6} mode="display" precision={0.1} hasValueText reviewCount={2341} />
 * <Rating label="Love" icons={{filled: HeartSolid, empty: HeartOutline}} color="positive" defaultValue={4} />
 * ```
 */
export function Rating({
  label,
  mode = 'interactive',
  value,
  defaultValue = 0,
  max = 5,
  precision = 1,
  onChange,
  onHoverChange,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  size = 'md',
  density = 'comfortable',
  color = 'gold',
  icons,
  animation = 'none',
  labelPlacement = 'top',
  hasValueText = false,
  formatValue,
  reviewCount,
  formatReviewCount,
  descriptiveLabels,
  hasHoverPreview = true,
  tooltip = 'none',
  htmlName,
  xstyle,
  className,
  style,
  ref,
  ...rest
}: RatingProps) {
  const labelID = useId();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const step = precision > 0 ? precision : 1;
  const currentValue = clamp(isControlled ? value : internalValue, 0, max);
  const isInteractive = mode === 'interactive' && !isDisabled && !isLoading;
  const px = SIZE_PX[size];

  // RTL detection (fill direction + pointer math follow text direction).
  const trackRef = useRef<HTMLDivElement>(null);
  const [isRtl, setIsRtl] = useState(false);
  useIsomorphicLayoutEffect(() => {
    if (trackRef.current) {
      setIsRtl(getComputedStyle(trackRef.current).direction === 'rtl');
    }
  }, []);

  const FilledIcon = icons?.filled ?? StarFilledDefault;
  const EmptyIcon = icons?.empty ?? icons?.filled ?? StarEmptyDefault;
  const PartialIcon = icons?.partial;
  // When a custom filled icon is reused as the empty state (no outline
  // variant supplied), fade it so it reads as "empty" rather than a heavy
  // solid glyph. The built-in star has a real outline, so it stays crisp.
  const emptyIsGhost = !!icons?.filled && !icons?.empty;

  const fillColor = COLOR_PRESETS[color as RatingColor] ?? color;
  const emptyColor = colorVars['--color-icon-disabled'];
  const displayValue = hoverValue != null ? hoverValue : currentValue;

  const formatNumber = (v: number) =>
    formatValue ? formatValue(v, max) : String(fmt(v));
  const describe = (v: number): string | undefined => {
    if (typeof descriptiveLabels === 'function') {
      return descriptiveLabels(v);
    }
    if (Array.isArray(descriptiveLabels)) {
      return descriptiveLabels[Math.ceil(v) - 1];
    }
    return undefined;
  };
  const valueText =
    describe(currentValue) ?? `${formatNumber(currentValue)} of ${max}`;

  // Tooltip (numeric value or descriptive label) on hover/focus.
  const tooltipEnabled = tooltip !== 'none';
  const ratingTooltip = useTooltip({
    placement: 'above',
    focusTrigger: 'always',
    isEnabled: tooltipEnabled,
  });
  const tooltipText =
    tooltip === 'label'
      ? (describe(displayValue) ?? formatNumber(displayValue))
      : formatNumber(displayValue);

  // Apply a value, but only fire when it actually changes (avoids redundant
  // onChange at the bounds or when reselecting with isClearable=false).
  const applyValue = (next: number) => {
    const clamped = clamp(next, 0, max);
    if (clamped === currentValue) {
      return;
    }
    if (!isControlled) {
      setInternalValue(clamped);
    }
    onChange?.(clamped);
  };

  const commit = (raw: number) => {
    let next = clamp(snap(raw, step), 0, max);
    // Reselecting the current value clears it (when allowed).
    if (isClearable && next === currentValue) {
      next = 0;
    }
    applyValue(next);
  };

  // Resolve the pointed-at value, honoring precision and RTL.
  const valueFromPointer = (e: MouseEvent<HTMLDivElement>): number | null => {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-rating-index]',
    );
    if (!target) {
      return null;
    }
    const index = Number(target.getAttribute('data-rating-index'));
    const rect = target.getBoundingClientRect();
    // Not laid out (e.g. jsdom) → treat as selecting the whole icon.
    if (!rect.width) {
      return index;
    }
    const ratio = isRtl
      ? (rect.right - e.clientX) / rect.width
      : (e.clientX - rect.left) / rect.width;
    const frac = clamp(ratio, 0, 1);
    const stepsPerIcon = Math.max(1, Math.round(1 / step));
    const seg = Math.max(1, Math.ceil(frac * stepsPerIcon));
    return index - 1 + Math.min(1, seg / stepsPerIcon);
  };

  const updateHover = (v: number | null) => {
    setHoverValue(v);
    onHoverChange?.(v);
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
      case ' ':
      case 'Enter':
        // Prevent page scroll / form submit; value is already committed.
        e.preventDefault();
        return;
      default:
        return;
    }
    e.preventDefault();
    applyValue(snap(next, step));
  };

  // -- Rendering a single unit --------------------------------------------

  const animStyle =
    animation === 'scale'
      ? styles.animScale
      : animation === 'bounce'
        ? styles.animBounce
        : animation === 'fill'
          ? styles.animFill
          : null;

  const clipFor = (fraction: number) => {
    const pct = fmt((1 - fraction) * 100);
    return isRtl ? dynamic.clipStart(pct) : dynamic.clipEnd(pct);
  };

  const renderUnit = (fraction: number): ReactNode => {
    // Distinct partial icon for fractional units, when supplied.
    if (PartialIcon && fraction > 0 && fraction < 1) {
      return (
        <span {...stylex.props(styles.iconGlyph, dynamic.color(fillColor))}>
          <PartialIcon {...stylex.props(styles.iconGlyph)} />
        </span>
      );
    }
    return (
      <>
        <span
          {...stylex.props(
            styles.layer,
            dynamic.square(px),
            dynamic.color(emptyColor),
            emptyIsGhost && styles.emptyGhost,
          )}>
          <EmptyIcon {...stylex.props(styles.iconGlyph)} />
        </span>
        <span
          {...stylex.props(
            styles.layer,
            dynamic.square(px),
            dynamic.color(fillColor),
            clipFor(fraction),
          )}>
          <FilledIcon {...stylex.props(styles.iconGlyph)} />
        </span>
      </>
    );
  };

  const units = Array.from({length: max}, (_, i) => {
    const idx = i + 1;
    const fraction = clamp(displayValue - i, 0, 1);
    return (
      <span
        key={idx}
        data-rating-index={idx}
        {...stylex.props(styles.unit, dynamic.square(px), animStyle)}>
        {renderUnit(fraction)}
      </span>
    );
  });

  // -- Loading skeleton ----------------------------------------------------

  if (isLoading) {
    return (
      <div
        ref={ref}
        {...mergeProps(
          themeProps('rating', {
            size: size !== 'md' ? size : undefined,
            loading: 'loading',
          }),
          stylex.props(styles.root, styles.rootTop, xstyle),
          className,
          style,
        )}
        {...rest}>
        {labelPlacement !== 'hidden' && (
          <span {...stylex.props(styles.label)}>{label}</span>
        )}
        <div
          role="status"
          aria-label={`${label} loading`}
          {...stylex.props(styles.track, styles[DENSITY_GAP[density]])}>
          {Array.from({length: max}, (_, i) => (
            <Skeleton key={i} width={px} height={px} radius="rounded" />
          ))}
        </div>
      </div>
    );
  }

  // -- Text (value / descriptive / reviews) --------------------------------

  const descriptiveText = describe(displayValue);
  const reviewText =
    reviewCount != null
      ? formatReviewCount
        ? formatReviewCount(reviewCount)
        : `${groupThousands(reviewCount)} ${reviewCount === 1 ? 'review' : 'reviews'}`
      : null;
  const hasText = hasValueText || descriptiveText != null || reviewText != null;

  const rootPlacement =
    labelPlacement === 'bottom'
      ? styles.rootBottom
      : labelPlacement === 'left'
        ? styles.rootLeft
        : labelPlacement === 'right'
          ? styles.rootRight
          : styles.rootTop;

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps('rating', {
          size: size !== 'md' ? size : undefined,
          density: density !== 'comfortable' ? density : undefined,
          mode: mode !== 'interactive' ? mode : undefined,
          disabled: isDisabled ? 'disabled' : undefined,
        }),
        stylex.props(styles.root, rootPlacement, xstyle),
        className,
        style,
      )}
      {...rest}>
      {labelPlacement === 'hidden' ? (
        <VisuallyHidden id={labelID}>{label}</VisuallyHidden>
      ) : (
        <span id={labelID} {...stylex.props(styles.label)}>
          {label}
        </span>
      )}

      <div {...stylex.props(styles.body)}>
        <div
          ref={mergeRefs(trackRef, tooltipEnabled ? ratingTooltip.ref : null)}
          role={isInteractive ? 'slider' : 'img'}
          aria-labelledby={labelID}
          aria-label={isInteractive ? undefined : valueText}
          aria-valuemin={isInteractive ? 0 : undefined}
          aria-valuemax={isInteractive ? max : undefined}
          aria-valuenow={isInteractive ? currentValue : undefined}
          aria-valuetext={isInteractive ? valueText : undefined}
          aria-readonly={mode === 'display' || undefined}
          aria-disabled={isDisabled || undefined}
          aria-describedby={
            tooltipEnabled ? ratingTooltip.describedBy : undefined
          }
          tabIndex={isInteractive ? 0 : undefined}
          onKeyDown={handleKeyDown}
          onPointerMove={
            isInteractive && hasHoverPreview
              ? e => updateHover(valueFromPointer(e))
              : undefined
          }
          onPointerLeave={
            isInteractive && hasHoverPreview
              ? () => updateHover(null)
              : undefined
          }
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
            styles[DENSITY_GAP[density]],
            isInteractive && styles.trackInteractive,
            isDisabled && styles.trackDisabled,
          )}>
          {units}
        </div>

        {hasText && (
          <span {...stylex.props(styles.text)}>
            {hasValueText && (
              <span {...stylex.props(styles.value)}>
                {formatNumber(displayValue)}
              </span>
            )}
            {descriptiveText != null && (
              <span {...stylex.props(styles.descriptive)}>
                {descriptiveText}
              </span>
            )}
            {reviewText != null && (
              <span {...stylex.props(styles.reviews)}>({reviewText})</span>
            )}
          </span>
        )}
      </div>

      {/* Screen-reader announcement of the committed value. */}
      <VisuallyHidden aria-live="polite">{valueText}</VisuallyHidden>

      {htmlName != null && !isDisabled && (
        <input type="hidden" name={htmlName} value={currentValue} />
      )}

      {tooltipEnabled && ratingTooltip.renderTooltip(tooltipText)}
    </div>
  );
}

Rating.displayName = 'Rating';
