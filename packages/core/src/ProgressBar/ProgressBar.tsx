// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file ProgressBar.tsx
 * @input Uses React, useId, stylex, color/spacing/radius/transition tokens
 * @output Exports ProgressBar component, ProgressBarProps, ProgressBarVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/ProgressBar/ProgressBar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/ProgressBar/ProgressBar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/ProgressBar/ProgressBarMarkTooltip.tsx (the lazy Tooltip wrapper for labeled marks)
 * - /packages/core/src/ProgressBar/index.ts (exports if types change)
 * - /apps/storybook/stories/ProgressBar.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/ProgressBar/ (showcase blocks)
 */

import {lazy, Suspense, useId} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  durationVars,
  easeVars,
  typeScaleVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {focusOutlineStyles} from '../utils/focusOutline.stylex';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
import {VisuallyHidden} from '../VisuallyHidden';
import type {ProgressBarVariantMap} from './index';

// Every mark is wrapped in a Tooltip (marks always carry a label), so load it
// lazily: a ProgressBar with no marks never bundles the Tooltip chunk. While it
// loads, the Suspense fallback shows the bare mark, so nothing disappears; the
// tooltip simply attaches once the chunk is ready.
const LazyProgressBarMarkTooltip = lazy(
  async () => import('./ProgressBarMarkTooltip'),
);

/**
 * Progress bar variant type — maps to semantic color tokens.
 * Extensible via module augmentation of ProgressBarVariantMap.
 */
export type ProgressBarVariant = keyof ProgressBarVariantMap;

/**
 * A fixed target mark drawn on the progress track.
 *
 * Positioned by `value` in the same `0..max` scale as the bar's `value` prop —
 * mirroring the object shape of Slider's `marks` so the two APIs stay
 * consistent.
 */
export interface ProgressBarMark {
  /**
   * Position of the mark in the same `0..max` scale as `value`. Values
   * outside the range are clamped to the track edges.
   */
  value: number;
  /**
   * Names the mark. A mark stands for something meaningful on the track — a
   * goal, a threshold, a quarter target — so a label is required: it is the
   * mark's accessible name and the text revealed in a `Tooltip` on hover and
   * keyboard focus. Can be the value itself (e.g. `'70%'`) or something richer
   * (e.g. `'Q1 target: 50%'`).
   */
  label: string;
}

export interface ProgressBarProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Current value of the progress bar.
   * Ignored when `isIndeterminate` is true.
   */
  value?: number;
  /**
   * Maximum value of the progress bar.
   * @default 100
   */
  max?: number;
  /**
   * Accessible label for the progress bar. Required for a11y.
   * Shown visually above the bar unless `isLabelHidden` is true.
   */
  label: string;
  /**
   * When true, the label is visually hidden but remains accessible to screen readers.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * When true, displays the formatted value (e.g. "75%") next to the label.
   * Ignored when `isIndeterminate` is true.
   * @default false
   */
  hasValueLabel?: boolean;
  /**
   * Custom formatter for the value label.
   * @default (value, max) => `${Math.round((value / max) * 100)}%`
   */
  formatValueLabel?: (value: number, max: number) => string;
  /**
   * Visual style variant mapped to semantic color tokens.
   * @default 'accent'
   */
  variant?: ProgressBarVariant;
  /**
   * When true, renders an animated indeterminate progress indicator.
   * Use when the progress amount is unknown (e.g. loading, processing).
   * The `value` and `hasValueLabel` props are ignored in this mode.
   * Respects `prefers-reduced-motion` by slowing the animation.
   * @default false
   */
  isIndeterminate?: boolean;
  /**
   * Target marks drawn on the track at fixed points in the same `0..max`
   * scale as `value` — e.g. a goal line. Marks stay visible whether progress
   * is below or past them, and take their color from what they sit on: a mark
   * inside the filled area uses the fill variant's on-color (on-accent,
   * on-warning, on-error, …), while a mark still out on the bare track uses
   * `--color-text-primary` (`--color-text-secondary` on a disabled bar, which
   * dims everything it draws). Each mark's required `label` names it for
   * assistive tech and is revealed via a `Tooltip` on hover/focus. Ignored when
   * `isIndeterminate` is true.
   */
  marks?: ReadonlyArray<ProgressBarMark>;
  /**
   * When true, the progress bar is visually disabled — the fill bar and
   * text use disabled colors. Use for canceled or inactive operations.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Test ID for testing utilities.
   */
  'data-testid'?: string;
}

// =============================================================================
// Indeterminate animation
// =============================================================================

const indeterminateSlide = stylex.keyframes({
  '0%': {
    transform: 'translateX(-100%)',
  },
  '100%': {
    transform: 'translateX(250%)',
  },
});

// RTL: mirror the slide so the indeterminate bar travels along the reading
// flow (inline-start → inline-end, i.e. right → left) instead of always
// physically left → right. The magnitudes mirror the LTR keyframe.
const indeterminateSlideRtl = stylex.keyframes({
  '0%': {
    transform: 'translateX(100%)',
  },
  '100%': {
    transform: 'translateX(-250%)',
  },
});

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-1'],
    width: '100%',
    minWidth: '48px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    color: colorVars['--color-text-primary'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  valueLabel: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-secondary'],
  },
  valueLabelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  // The `role="progressbar"` element. In determinate mode it does NOT clip its
  // content (`overflow` stays visible) so a themed mark taller than the bar can
  // overhang it; the determinate fill rounds its own corners via `border-radius`
  // (see `fill`) and is always inside the track box, so dropping the clip does
  // not change its appearance at any progress. Indeterminate mode re-adds the
  // clip via `trackClipped` (see below) — its sliding fill travels outside the
  // track and must be clipped, and marks are ignored while indeterminate, so
  // there is nothing to overhang.
  track: {
    position: 'relative',
    width: '100%',
    height: '8px',
    backgroundColor: colorVars['--color-background-muted'],
    borderRadius: radiusVars['--radius-full'],
  },
  // Indeterminate-only clip. The indeterminate fill slides from translateX
  // -100% to 250%, so it deliberately overshoots the track on both sides and
  // relies on the track clipping it to the visible window. Applied only when
  // `isIndeterminate` (marks are suppressed then, so nothing needs to overhang)
  // so it never re-clips a themed tall mark in determinate mode.
  trackClipped: {
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'width',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  indeterminateFill: {
    height: '100%',
    width: '40%',
    borderRadius: radiusVars['--radius-full'],
    animationName: {
      default: indeterminateSlide,
      ':is([dir="rtl"] *)': indeterminateSlideRtl,
    },
    animationDuration: {
      default: '1.5s',
      '@media (prefers-reduced-motion: reduce)': '3s',
    },
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  // A mark is a vertical tick centered on the track, a child of the
  // `role="progressbar"` element (unchanged DOM). The track no longer clips, so
  // its height — 8px by default — may exceed the bar and overhang; the centering
  // translate keeps any overhang symmetric. Positioned horizontally via
  // `insetInlineStart`; the translate mirrors under RTL.
  //
  // The dimensions read private vars rather than being plain declarations: a
  // theme writes `width`/`height` on the `progressbar-mark` target as usual and
  // the derived-var registry emits them as these vars instead of as competing
  // properties. Nothing else declares them, so the theme value lands whatever
  // the consumer's cascade looks like — a source-build app that compiles StyleX
  // without `useCSSLayers` leaves the atomics unlayered, where they outrank
  // every rule in `@layer astryx-theme` and made sizing the mark impossible
  // without `!important`.
  //
  // The tick's color is not set here: it depends on what the mark sits on, so
  // it comes from `markOnFillStyles[variant]` (mark inside the filled area) or
  // `markOnTrackStyles.track` (mark out on the bare track).
  mark: {
    position: 'absolute',
    top: '50%',
    width: 'var(--_progressbar-mark-width, 2px)',
    height: 'var(--_progressbar-mark-height, 8px)',
    transform: {
      default: 'translate(-50%, -50%)',
      ':is([dir="rtl"] *)': 'translate(50%, -50%)',
    },
  },
});

const variantStyles = stylex.create({
  accent: {
    backgroundColor: colorVars['--color-accent'],
  },
  success: {
    backgroundColor: colorVars['--color-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
  disabled: {
    backgroundColor: colorVars['--color-text-disabled'],
  },
});

// A mark sitting inside the filled area is drawn *on* the bar, so it takes the
// on-color that pairs with the fill's own variant color — the same pairing
// Badge uses for solid semantic backgrounds.
//
// `neutral` and `disabled` both fill with the muted `--color-text-disabled`
// gray, which carries no semantic weight and has no dedicated on-token, so
// they fall back to a plain foreground. They pick different ones: a `neutral`
// bar is live, so its mark keeps the full-contrast `--color-text-primary` a
// mark uses out on the track; a `disabled` bar is deliberately low-emphasis —
// its own label and value text drop to muted colors — so its mark steps down
// to `--color-text-secondary` rather than becoming the loudest thing on a
// grayed-out component.
const markOnFillStyles = stylex.create({
  accent: {
    backgroundColor: colorVars['--color-on-accent'],
  },
  success: {
    backgroundColor: colorVars['--color-on-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-on-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-on-error'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-primary'],
  },
  disabled: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
});

// A mark out on the bare track is a foreground tick over the muted track
// background, so it takes `--color-text-primary`.
//
// The obvious candidate was `--color-border-emphasized` — the emphasized
// divider color `Divider`'s `strong` variant and `Slider`'s marks use — but
// divider tokens sit a step or two from the track on the same neutral ramp, so
// a mark drawn in one is at or near invisible: measured against each shipped
// theme's track it lands between 1.00:1 (theme-neutral, both modes, where the
// track is aliased to that very token) and 2.9:1, under the 3:1 WCAG 1.4.11
// non-text floor in 7 of 8 themes. `--color-text-secondary` still misses in
// two. `--color-text-primary` is the one foreground guaranteed to read against
// every surface a theme defines: 5.8:1 to 15.7:1 on the track across all
// themes and both modes.
const markOnTrackStyles = stylex.create({
  track: {
    backgroundColor: colorVars['--color-text-primary'],
  },
  // A disabled bar dims everything it draws, so its track marks step down to
  // the secondary foreground for the same reason the disabled on-fill mark
  // does — matching the muted label and value text.
  trackDisabled: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
});

function defaultFormatValueLabel(value: number, max: number): string {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return `${pct}%`;
}

/**
 * A progress bar for displaying determinate or indeterminate progress.
 *
 * In determinate mode, displays a known value within a range (upload progress,
 * disk usage, etc). In indeterminate mode, shows an animated loading indicator
 * for unknown progress.
 *
 * ProgressBar is intentionally minimal — compose additional labels, status
 * icons, and descriptions alongside the bar using layout components rather
 * than adding props to ProgressBar itself. The exception is on-track content
 * like `marks`, which are positioned by value over the track.
 *
 * Styles use Astryx theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <ProgressBar value={75} label="Upload progress" />
 * <ProgressBar isIndeterminate label="Loading..." />
 * <ProgressBar value={3.2} max={5} label="Disk usage" hasValueLabel
 *   formatValueLabel={(v, m) => `${v} GB / ${m} GB`} />
 * <ProgressBar value={30} label="Canceled" isDisabled hasValueLabel />
 * <ProgressBar value={45} label="Fundraiser" marks={[{value: 80, label: 'Goal'}]} />
 * ```
 *
 * A mark's height, width, and color are directly themeable via the
 * `progressbar-mark` target. The target reflects `data-placement`
 * (`"fill"` when the mark sits inside the filled area, `"track"` when it is
 * still out on the bare track) and `data-variant` (the fill's variant), so a
 * theme can style the two cases separately — e.g. a taller "goal flag" tick
 * that overhangs the bar (centered, so the overhang is symmetric):
 *
 * @example
 * ```
 * defineTheme({
 *   name: 'campaign',
 *   components: {
 *     'progressbar-mark': {base: {height: '16px', backgroundColor: 'red'}},
 *   },
 * });
 * ```
 */
export function ProgressBar({
  value = 0,
  max = 100,
  label,
  isLabelHidden = false,
  hasValueLabel = false,
  formatValueLabel = defaultFormatValueLabel,
  variant = 'accent',
  isIndeterminate = false,
  isDisabled = false,
  marks,
  xstyle,
  className,
  style,
  'data-testid': dataTestId,
  ref,
  ...rest
}: ProgressBarProps) {
  const labelId = useId();
  // A non-finite value or max (e.g. a NaN from an upstream `loaded / total`
  // with total 0) would otherwise leak into aria-valuenow, the value label,
  // and the fill width as the string "NaN". Treat it as empty progress,
  // matching the max=0 handling below.
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(max) ? max : 0;
  const clampedValue = Math.min(Math.max(0, safeValue), safeMax);
  const percentage = safeMax > 0 ? (clampedValue / safeMax) * 100 : 0;
  const valueText = formatValueLabel(clampedValue, safeMax);

  const showValueLabel = hasValueLabel && !isIndeterminate;

  const fillVariant = isDisabled ? 'disabled' : variant;

  // Marks make no sense without a determinate value, so they are only drawn
  // in determinate mode. Non-finite mark values are dropped; the rest are
  // clamped to the track edges, matching the bar's own `clampedValue`.
  //
  // Each mark also records whether it lands on the filled part of the bar
  // (`isOnFill`), which decides its color: a mark inside the fill reads against
  // the variant color, one out on the bare track reads against the track. A
  // mark exactly at the fill's leading edge counts as on the fill — it is the
  // "reached the target" moment — except at zero progress, where there is no
  // fill for it to sit on.
  const resolvedMarks =
    !isIndeterminate && marks
      ? marks
          .filter(mark => Number.isFinite(mark.value))
          .map(mark => {
            const clamped = Math.min(Math.max(0, mark.value), safeMax);
            const pct = safeMax > 0 ? (clamped / safeMax) * 100 : 0;
            return {
              value: mark.value,
              label: mark.label,
              pct,
              isOnFill: percentage > 0 && pct <= percentage,
            };
          })
      : [];

  return (
    <div
      ref={ref}
      {...mergeProps(
        themeProps(
          'progress-bar',
          {variant},
          // `progressbar` ran the compound name together; themes styling it
          // keep working until the next major.
          {legacyNames: ['progressbar']},
        ),
        stylex.props(styles.container, xstyle),
        className,
        style,
      )}
      data-testid={dataTestId}
      {...rest}>
      {/* Label row */}
      {!isLabelHidden || showValueLabel ? (
        <div {...stylex.props(styles.header)}>
          <span
            id={labelId}
            {...stylex.props(
              styles.label,
              isLabelHidden && styles.visuallyHidden,
              isDisabled && styles.labelDisabled,
            )}>
            {label}
          </span>
          {showValueLabel && (
            <span
              {...stylex.props(
                styles.valueLabel,
                isDisabled && styles.valueLabelDisabled,
              )}>
              {valueText}
            </span>
          )}
        </div>
      ) : (
        <VisuallyHidden id={labelId}>{label}</VisuallyHidden>
      )}

      {/* Progress track — the `role="progressbar"` element, holding the fill
          and marks as its children (unchanged DOM shape). It no longer clips
          (`overflow` is visible), so a themed taller mark can overhang it;
          the fill preserves its rounded shape via its own `border-radius`. */}
      <div
        role="progressbar"
        aria-valuenow={isIndeterminate ? undefined : clampedValue}
        aria-valuemin={isIndeterminate ? undefined : 0}
        aria-valuemax={isIndeterminate ? undefined : safeMax}
        aria-labelledby={labelId}
        aria-valuetext={isIndeterminate ? undefined : valueText}
        {...mergeProps(
          themeProps('progress-bar-track', undefined, {
            legacyNames: ['progressbar-track'],
          }),
          stylex.props(styles.track, isIndeterminate && styles.trackClipped),
        )}>
        {isIndeterminate ? (
          <div
            {...mergeProps(
              themeProps(
                'progress-bar-fill',
                {variant: fillVariant},
                {legacyNames: ['progressbar-fill']},
              ),
              stylex.props(
                styles.indeterminateFill,
                variantStyles[fillVariant],
              ),
            )}
          />
        ) : (
          <div
            {...mergeProps(
              themeProps(
                'progress-bar-fill',
                {variant: fillVariant},
                {legacyNames: ['progressbar-fill']},
              ),
              stylex.props(styles.fill, variantStyles[fillVariant]),
            )}
            style={{width: `${percentage}%`}}
          />
        )}
        {/* Target marks — children of the progressbar element (unchanged),
            layered above the fill so they show whether progress is below or
            past them. A mark's color follows what it sits on: inside the fill
            it uses the fill variant's on-color, out on the bare track it uses
            the emphasized divider color. Each mark is labeled, so it is a
            focusable Tooltip trigger: the label is visible on hover/focus and
            names the mark for assistive tech via the Tooltip's
            aria-describedby, without adding a labeled child to the
            progressbar's own a11y subtree. */}
        {resolvedMarks.map(mark => {
          // The tick element. It is both the Tooltip's anchor and the Suspense
          // fallback shown while the lazy Tooltip chunk loads, so the tick is
          // always visible and the label attaches once ready. The list `key`
          // lives on the mapped <Suspense>, not here.
          //
          // `placement` is reflected as `data-placement` (and a class) so a
          // theme can style the two cases separately on the
          // `progressbar-mark` target; `variant` mirrors the fill's variant
          // for the same reason.
          const markEl = (
            <span
              tabIndex={0}
              {...mergeProps(
                themeProps(
                  'progress-bar-mark',
                  {
                    variant: fillVariant,
                    placement: mark.isOnFill ? 'fill' : 'track',
                  },
                  {legacyNames: ['progressbar-mark']},
                ),
                stylex.props(
                  focusOutlineStyles.focusVisible,
                  styles.mark,
                  mark.isOnFill
                    ? markOnFillStyles[fillVariant]
                    : isDisabled
                      ? markOnTrackStyles.trackDisabled
                      : markOnTrackStyles.track,
                ),
              )}
              style={{insetInlineStart: `${mark.pct}%`}}
            />
          );
          return (
            <Suspense key={`${mark.value}:${mark.label}`} fallback={markEl}>
              <LazyProgressBarMarkTooltip content={mark.label}>
                {markEl}
              </LazyProgressBarMarkTooltip>
            </Suspense>
          );
        })}
      </div>
    </div>
  );
}

ProgressBar.displayName = 'ProgressBar';
