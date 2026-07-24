// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Step.tsx
 * @input Uses React, stylex, theme tokens, StepperContext
 * @output Exports Step component and StepProps
 * @position Individual step item; used inside Stepper
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Stepper/Stepper.doc.mjs
 * - /packages/lab/src/Stepper/Stepper.test.tsx
 * - /packages/lab/src/Stepper/index.ts
 * - /apps/storybook/stories/Stepper.stories.tsx
 * - /packages/cli/templates/blocks/components/Stepper/ (showcase blocks)
 */

import {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  typeScaleVars,
  durationVars,
  easeVars,
} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {Icon} from '@astryxdesign/core/Icon';
import {useStepperContext} from './StepperContext';
import {themeProps} from '@astryxdesign/core/utils';
import type {StepStatus} from './StepStatus';

/**
 * Built-in indicator presets. Anything other than these strings passed to
 * `indicator` is treated as a custom ReactNode (e.g. an `<Icon />`).
 * - 'auto': numbered badge for not-yet-reached steps, a check once completed
 *   (default)
 * - 'number': always a numbered badge
 * - 'none': no indicator — just the progress bar and label
 */
export type StepIndicatorPreset = 'auto' | 'number' | 'none';
export type StepDensity = 'compact' | 'balanced' | 'spacious';

export interface StepProps extends BaseProps<HTMLLIElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLLIElement>;
  /**
   * Zero-based index of this step. Used to derive progress (completed /
   * active / not-started) relative to the parent's `activeStep`.
   */
  step: number;
  /**
   * Step label text.
   */
  label: string;
  /**
   * Optional description shown below the label.
   */
  description?: string;
  /**
   * Content rendered below the label and description. Useful in vertical
   * steppers to show form fields or detailed content for each step.
   */
  children?: ReactNode;
  /**
   * Custom icon rendered inside the indicator. Accepts any ReactNode (for
   * example an `<Icon />`). Equivalent to passing the node directly to
   * `indicator`; takes precedence over the built-in number/check.
   */
  icon?: ReactNode;
  /**
   * Semantic status for the step, mapped to the global Astryx semantic tokens
   * (`accent`, `success`, `warning`, `error`). In the default `auto` indicator
   * mode it sets both the indicator color and a matching glyph: `success` shows
   * a green check-circle, `warning`/`error` show the shared Input status icons.
   * `accent` is color-only. The current (in-progress) step always keeps its
   * current-step indicator regardless of `status`. Never recolors the
   * connector/track.
   */
  status?: StepStatus;
  /**
   * Disable interaction for this step.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Marks the step as optional, appending an "Optional" affordance after the
   * label.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Trailing content rendered at the end of the label row (e.g. a timestamp
   * or status chip).
   */
  endContent?: ReactNode;
  /**
   * What to show as the step indicator. Accepts a preset string or any
   * ReactNode:
   * - 'auto': numbered badge until completed, then a check (default)
   * - 'number': always a numbered badge
   * - 'none': no indicator, just the bar + label
   * - ReactNode: any custom icon or element to render as the indicator
   * @default 'auto'
   */
  indicator?: StepIndicatorPreset | ReactNode;
  /**
   * Controls vertical padding of the step. Falls back to the stepper-level
   * density when unset.
   * - 'compact': minimal padding (4px block)
   * - 'balanced': default (8px block)
   * - 'spacious': generous (12px block, 12px inline)
   */
  density?: StepDensity;
}

// --- Default progress icons (16px) ---
//
// The `completed` progress state and the current-step ring are drawn as local
// glyphs: `completed` is a filled circle-check (a distinct "progress done"
// mark), deliberately different from the semantic `success` status — which
// defers to the themed Icon registry (an outline check). `warning` / `error`
// statuses also defer to the themed registry so they share one visual language.

/** Filled circle with a check — shown for a completed step in 'auto' mode. */
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M4.75 8.25 7 10.5l4.25-4.5"
        stroke={colorVars['--color-background-surface']}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Filled dot in a ring — shown for the active step in 'auto' mode. */
function CurrentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

// --- Styles ---

const BAR_WIDTH = '4px';
const ICON_SIZE = spacingVars['--spacing-4'];
const NUMBER_SIZE = spacingVars['--spacing-5'];

const styles = stylex.create({
  // ===================== VERTICAL LAYOUT =====================
  verticalRoot: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    gap: spacingVars['--spacing-0-5'],
  },

  // 4px progress bar segment
  verticalBar: {
    width: BAR_WIDTH,
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  barCompleted: {
    backgroundColor: colorVars['--color-accent'],
  },
  barIncomplete: {
    backgroundColor: colorVars['--color-border'],
  },

  // Step body — the selectable area
  verticalBody: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },

  // ===================== HORIZONTAL LAYOUT =====================
  horizontalStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    flex: 1,
    // density padding applied via density styles below
  },

  // Full-width progress bar segment sitting above each horizontal step.
  // Each step owns its own segment (filled from its derived progress) so the
  // parent never has to introspect children to build the bar.
  horizontalBar: {
    width: '100%',
    height: BAR_WIDTH,
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    marginBlockEnd: spacingVars['--spacing-0-5'],
  },

  // ===================== SHARED =====================

  // Icon + Label in one row
  iconLabelRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },

  // Indicator icon container
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON_SIZE,
    height: ICON_SIZE,
    flexShrink: 0,
  },
  iconCompleted: {
    color: colorVars['--color-accent'],
  },
  iconInProgress: {
    color: colorVars['--color-accent'],
  },
  iconNotStarted: {
    color: colorVars['--color-icon-secondary'],
  },
  iconDisabled: {
    color: colorVars['--color-icon-disabled'],
    opacity: 0.5,
  },
  // Semantic status overrides for the icon — color only.
  iconAccent: {
    color: colorVars['--color-accent'],
  },
  iconSuccess: {
    color: colorVars['--color-success'],
  },
  iconWarning: {
    color: colorVars['--color-warning'],
  },
  iconError: {
    color: colorVars['--color-error'],
  },

  // Number badge
  numberBadge: {
    display: 'grid',
    placeItems: 'center',
    width: NUMBER_SIZE,
    height: NUMBER_SIZE,
    borderRadius: radiusVars['--radius-full'],
    // 10px is below the smallest type token (--text-supporting-size, 12px);
    // intentional micro-type for the compact 20px numeric badge.
    fontSize: '10px',
    paddingBlockEnd: '1px',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1,
    flexShrink: 0,
    textAlign: 'center',
  },
  numberCompleted: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-background-surface'],
  },
  numberInProgress: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-background-surface'],
  },
  numberNotStarted: {
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-secondary'],
  },
  numberDisabled: {
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-disabled'],
    opacity: 0.5,
  },
  // Semantic status overrides for the number badge — color only.
  numberAccent: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  numberSuccess: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-on-success'],
  },
  numberWarning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-on-warning'],
  },
  numberError: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },

  // Label
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-normal'],
    color: colorVars['--color-text-primary'],
  },
  labelInProgress: {
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  labelNotStarted: {
    color: colorVars['--color-text-secondary'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
  },

  // Optional tag
  optionalDot: {
    fontSize: typeScaleVars['--text-body-size'],
    color: colorVars['--color-text-secondary'],
  },
  optionalText: {
    fontSize: typeScaleVars['--text-body-size'],
    color: colorVars['--color-text-secondary'],
  },

  // Description
  descriptionRow: {
    paddingInlineStart: spacingVars['--spacing-0'],
  },
  descriptionRowWithIndicator: {
    // Align with label: icon (16px) + gap (8px) = 24px
    paddingInlineStart: spacingVars['--spacing-6'],
  },
  descriptionRowWithNumber: {
    // Align with label: number badge (20px) + gap (8px) = 28px
    paddingInlineStart: spacingVars['--spacing-7'],
  },
  description: {
    fontSize: typeScaleVars['--text-supporting-size'],
    // The supporting-leading token (1.667 → 20px at 12px) reads too loose for
    // a caption sitting under its label; a fixed 16px line box (1.33) is
    // tighter without collapsing the text the way capsize trim did.
    lineHeight: '16px',
    color: colorVars['--color-text-secondary'],
  },

  // Step content (children / flex slot)
  stepContent: {
    paddingBlockStart: spacingVars['--spacing-2'],
  },
  stepContentWithIndicator: {
    paddingInlineStart: spacingVars['--spacing-6'],
  },
  stepContentWithNumber: {
    paddingInlineStart: spacingVars['--spacing-7'],
  },

  // Density
  densityCompact: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
  },
  densityBalanced: {
    paddingBlock: spacingVars['--spacing-2'],
    paddingInline: spacingVars['--spacing-2'],
  },
  densitySpacious: {
    paddingBlock: spacingVars['--spacing-3'],
    paddingInline: spacingVars['--spacing-3'],
  },

  // Button reset for clickable steps
  buttonReset: {
    all: 'unset',
    textAlign: 'start',
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
  },

  focusRing: {
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: '0',
      ':focus-visible': '2px',
    },
  },

  // ===================== ON-TRACK LAYOUT =====================
  // Indicator is slotted into the connector line as a node on the track.
  // Each step draws the connector segments that flank its own indicator; the
  // segment *before* the indicator is hidden on the first step (step === 0) so
  // the track starts at the first node. Segments abut the indicator directly,
  // so no child introspection or total-count is needed.

  otVerticalRoot: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  otHorizontalRoot: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
  },

  // Interactive wrapper (indicator + label act as one click target).
  otInteractive: {
    all: 'unset',
    boxSizing: 'border-box',
    // `all: unset` leaves the <button> UA default of centered text; force
    // start so vertical labels/descriptions read left-aligned. Horizontal
    // labels re-center via otLabelWrapH (a deeper element).
    textAlign: 'start',
    cursor: 'pointer',
    borderRadius: radiusVars['--radius-element'],
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast-min'],
    transitionTimingFunction: easeVars['--ease-standard'],
    backgroundColor: {
      default: 'transparent',
      ':hover': {
        '@media (hover: hover)': colorVars['--color-overlay-hover'],
      },
      ':active': colorVars['--color-overlay-pressed'],
    },
  },

  otRowWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacingVars['--spacing-2'],
    width: '100%',
  },
  otColWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
  },

  // Vertical indicator column: [segment] [indicator] [segment] stacked.
  otIndicatorColV: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: NUMBER_SIZE,
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  // Shared segment base: square ends so stacked segments read as one
  // continuous line (no radius).
  otSegBaseV: {
    width: BAR_WIDTH,
    flexShrink: 0,
    borderRadius: 0,
  },
  // Flexible segment (below the node) — grows to fill the step height and
  // meets the next node's leading segment.
  otSegFlexV: {
    flex: 1,
    minHeight: spacingVars['--spacing-2'],
  },
  // Fixed leading segment (above the node) — its height offsets the node down
  // so it aligns with the label's first line instead of the step's center.
  otSegLeadV: (value: string) => ({
    height: value,
  }),

  // Horizontal track row: [segment] [indicator] [segment] in a line.
  otTrackRowH: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  otSegH: {
    height: BAR_WIDTH,
    flex: 1,
    minWidth: spacingVars['--spacing-2'],
    borderRadius: 0,
  },

  otSegHidden: {
    visibility: 'hidden',
  },

  // Connector fill colors (progress-derived; status recolors when set).
  lineFilled: {
    backgroundColor: colorVars['--color-accent'],
  },
  lineUnfilled: {
    backgroundColor: colorVars['--color-border'],
  },

  otBodyV: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flex: 1,
    gap: spacingVars['--spacing-0-5'],
    minWidth: 0,
  },
  otLabelWrapH: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacingVars['--spacing-0-5'],
    textAlign: 'center',
  },
  otLabelRowStart: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },
  otLabelRowCenter: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: spacingVars['--spacing-1'],
  },

  otContentV: {
    paddingInlineStart: spacingVars['--spacing-7'],
    paddingBlockStart: spacingVars['--spacing-2'],
  },
  otContentH: {
    paddingBlockStart: spacingVars['--spacing-2'],
  },

  // Density-driven spacing. The connector runs along the "track axis"
  // (vertical = block, horizontal = inline), so density is only ever applied
  // to the *cross* axis — padding the track axis would break the line into
  // gapped segments.
  //
  // Vertical: pad the whole step row (indicator rail + label) so density adds
  // breathing room *around the indicators*, not just the text. Applied to the
  // hover target itself.
  otRowPadV: (value: string) => ({
    paddingBlock: value,
    paddingInline: value,
  }),
  // The rail draws the connector, so it must span the row's full block extent
  // to keep the line continuous. A negative block margin cancels the wrapper's
  // block padding, letting the line bridge step-to-step while the label still
  // sits inside the padding.
  otRailBridgeV: (value: string) => ({
    marginBlock: `calc(-1 * ${value})`,
  }),
  // Horizontal: block padding around the track+label column (inside the hover
  // target) adds vertical breathing room while the inline track stays flush.
  otPadBlock: (value: string) => ({
    paddingBlock: value,
  }),
  otMarginTop: (value: string) => ({
    marginBlockStart: value,
  }),
});

/**
 * An individual step within an Stepper. Renders a 4px progress-bar segment,
 * an indicator (numbered badge, check, or any custom icon), a label with
 * optional description, and an optional content slot.
 *
 * Progress (completed / active / not-started) is derived from the parent's
 * `activeStep` and this step's `step` prop. The optional `status` prop layers a
 * semantic meaning on top: in the default `auto` indicator mode it recolors the
 * indicator and swaps in a matching glyph (`success` → green check-circle,
 * `warning`/`error` → the shared Input status icons). The current step always
 * keeps its current-step ring. `status` never recolors the connector/track.
 *
 * @example
 * ```
 * <Step step={0} label="Account details" description="Enter your email" />
 * ```
 *
 * @example
 * ```
 * <Step step={1} label="Payment" status="error" />
 * ```
 */
export function Step({
  step,
  label,
  description,
  children,
  icon,
  status,
  isDisabled = false,
  isOptional = false,
  endContent,
  indicator: indicatorProp,
  density: densityProp,
  xstyle,
  className,
  style,
  ref,
  'data-testid': dataTestId,
  ...rest
}: StepProps) {
  const ctx = useStepperContext();
  const {
    activeStep,
    orientation,
    onStepClick,
    density: ctxDensity,
    indicatorPosition,
    stepCount,
  } = ctx;

  const density = densityProp ?? ctxDensity;

  // Resolve indicator prop — may be a preset string or a custom ReactNode.
  const isCustomIndicator =
    indicatorProp != null && typeof indicatorProp !== 'string';
  const indicator: StepIndicatorPreset = isCustomIndicator
    ? 'auto'
    : ((indicatorProp as StepIndicatorPreset | undefined) ?? 'auto');

  // Internal progress, derived from the parent's activeStep. This is NOT the
  // public `status` prop — `status` controls semantic color only.
  const progress: 'completed' | 'in-progress' | 'not-started' =
    step === activeStep
      ? 'in-progress'
      : step < activeStep
        ? 'completed'
        : 'not-started';

  const isVertical = orientation === 'vertical';
  const isActive = progress === 'in-progress';
  // Any non-disabled step is navigable when an onStepClick handler is provided,
  // including not-started steps (free navigation across the flow).
  const isClickable = !isDisabled && onStepClick != null;

  const handleClick = () => {
    if (isClickable && onStepClick) {
      onStepClick(step);
    }
  };

  // Bar fill is purely progress-based. `status` never recolors the bar — it
  // only recolors the indicator (icon / number badge) below.
  const isBarFilled = progress === 'completed' || progress === 'in-progress';

  // --- Build indicator node ---
  // 'auto': number for not-started, check/dot icon once reached
  // 'number': always number badge
  // 'none': nothing
  // custom ReactNode (or `icon` prop): render as-is
  let indicatorNode: ReactNode = null;

  const customIcon = isCustomIndicator ? indicatorProp : (icon ?? null);

  // Semantic `status` drives a distinct indicator glyph (default 'auto' mode,
  // no custom icon), all sourced from the themed Icon registry so a step reads
  // the same as the rest of the system:
  //  - success → the themed `success` glyph (same check-circle as a completed
  //    step), tinted success — i.e. a green check
  //  - warning → the themed `warning` glyph
  //  - error   → the themed `error` glyph
  // The current (in-progress) step always shows the current-step ring — its
  // indicator "replaces" any status glyph. `accent` has no distinct glyph and
  // falls through to the progress-derived default.
  const statusGlyph: 'success' | 'warning' | 'error' | null =
    indicator === 'auto' &&
    customIcon == null &&
    !isActive &&
    (status === 'success' || status === 'warning' || status === 'error')
      ? status
      : null;

  if (indicator !== 'none') {
    const showNumber =
      customIcon == null &&
      statusGlyph == null &&
      (indicator === 'number' ||
        (indicator === 'auto' && progress === 'not-started'));

    if (showNumber) {
      // Status only fills the badge once the step is reached. A not-started
      // step stays neutral — otherwise `accent` (which has no glyph to swap in)
      // would paint an inverted accent badge on an upcoming step, making it
      // read as active/completed.
      const isReached = progress === 'completed' || progress === 'in-progress';
      const numberColorStyle = isDisabled
        ? styles.numberDisabled
        : isReached && status === 'accent'
          ? styles.numberAccent
          : isReached && status === 'success'
            ? styles.numberSuccess
            : isReached && status === 'warning'
              ? styles.numberWarning
              : isReached && status === 'error'
                ? styles.numberError
                : progress === 'completed'
                  ? styles.numberCompleted
                  : progress === 'in-progress'
                    ? styles.numberInProgress
                    : styles.numberNotStarted;

      indicatorNode = (
        <div
          aria-hidden="true"
          {...stylex.props(styles.numberBadge, numberColorStyle)}>
          {step + 1}
        </div>
      );
    } else {
      // Priority: explicit custom icon → status glyph (non-current steps) →
      // progress-derived default (check when completed, ring when current).
      const iconContent: ReactNode =
        customIcon != null ? (
          customIcon
        ) : statusGlyph === 'success' ? (
          <Icon
            icon="success"
            size="sm"
            color={isDisabled ? 'disabled' : 'success'}
          />
        ) : statusGlyph === 'warning' ? (
          <Icon
            icon="warning"
            size="sm"
            color={isDisabled ? 'disabled' : 'warning'}
          />
        ) : statusGlyph === 'error' ? (
          <Icon
            icon="error"
            size="sm"
            color={isDisabled ? 'disabled' : 'error'}
          />
        ) : progress === 'completed' ? (
          <CheckCircleIcon />
        ) : (
          <CurrentIcon />
        );

      // Wrapper tint drives the currentColor glyphs (check-circle / ring /
      // custom icon). The <Icon> status glyphs set their own color, but we tint
      // the wrapper to match so the indicator's color reflects `status` too.
      const iconColorStyle = isDisabled
        ? styles.iconDisabled
        : customIcon != null
          ? status === 'accent'
            ? styles.iconAccent
            : status === 'success'
              ? styles.iconSuccess
              : status === 'warning'
                ? styles.iconWarning
                : status === 'error'
                  ? styles.iconError
                  : progress === 'completed'
                    ? styles.iconCompleted
                    : progress === 'in-progress'
                      ? styles.iconInProgress
                      : styles.iconNotStarted
          : statusGlyph === 'success'
            ? styles.iconSuccess
            : statusGlyph === 'warning'
              ? styles.iconWarning
              : statusGlyph === 'error'
                ? styles.iconError
                : progress === 'completed'
                  ? styles.iconCompleted
                  : progress === 'in-progress'
                    ? styles.iconInProgress
                    : styles.iconNotStarted;

      indicatorNode = (
        <div aria-hidden="true" {...stylex.props(styles.icon, iconColorStyle)}>
          {iconContent}
        </div>
      );
    }
  }

  const hasIndicator = indicator !== 'none';
  const isNumber =
    hasIndicator &&
    customIcon == null &&
    statusGlyph == null &&
    (indicator === 'number' ||
      (indicator === 'auto' && progress === 'not-started'));

  const labelColorStyle = isDisabled
    ? styles.labelDisabled
    : progress === 'not-started'
      ? styles.labelNotStarted
      : isActive
        ? styles.labelInProgress
        : undefined;

  // Indicator + Label row
  const iconLabelNode = (
    <div {...stylex.props(styles.iconLabelRow)}>
      {indicatorNode}
      <span {...stylex.props(styles.label, labelColorStyle)}>{label}</span>
      {isOptional && (
        <>
          <span {...stylex.props(styles.optionalDot)}>•</span>
          <span {...stylex.props(styles.optionalText)}>Optional</span>
        </>
      )}
      {endContent}
    </div>
  );

  const descriptionNode =
    description != null ? (
      <div
        {...stylex.props(
          hasIndicator
            ? isNumber
              ? styles.descriptionRowWithNumber
              : styles.descriptionRowWithIndicator
            : styles.descriptionRow,
        )}>
        <span {...stylex.props(styles.description)}>{description}</span>
      </div>
    ) : null;

  const contentNode =
    children != null ? (
      <div
        {...stylex.props(
          styles.stepContent,
          hasIndicator &&
            (isNumber
              ? styles.stepContentWithNumber
              : styles.stepContentWithIndicator),
        )}>
        {children}
      </div>
    ) : null;

  // Theme data attributes reflect progress + optional semantic status.
  const stepThemeProps = themeProps('step', {
    progress,
    status: status ?? undefined,
  });

  // ======= ON-TRACK (EPS-aligned): indicator is a node on the connector =======
  if (indicatorPosition === 'on-track') {
    // Connector fill is purely progress-based (matches the separated bar):
    // the segment before the indicator is "reached" once we're at/past this
    // step; the segment after is filled only once this step is completed.
    // `status` never recolors the connector — only the indicator.
    const beforeFilled = step <= activeStep;
    const afterFilled = step < activeStep;
    const beforeSegStyle = beforeFilled
      ? styles.lineFilled
      : styles.lineUnfilled;
    const afterSegStyle = afterFilled ? styles.lineFilled : styles.lineUnfilled;
    const isFirst = step === 0;
    // The last step has no next node, so its trailing segment is hidden.
    const isLast = step === stepCount - 1;

    const densitySpace =
      density === 'compact'
        ? spacingVars['--spacing-1']
        : density === 'spacious'
          ? spacingVars['--spacing-3']
          : spacingVars['--spacing-2'];

    const labelLineNode = (
      <div
        {...stylex.props(
          isVertical ? styles.otLabelRowStart : styles.otLabelRowCenter,
        )}>
        <span {...stylex.props(styles.label, labelColorStyle)}>{label}</span>
        {isOptional && (
          <>
            <span {...stylex.props(styles.optionalDot)}>•</span>
            <span {...stylex.props(styles.optionalText)}>Optional</span>
          </>
        )}
        {endContent}
      </div>
    );

    const otDescriptionNode =
      description != null ? (
        <span {...stylex.props(styles.description)}>{description}</span>
      ) : null;

    const otContentNode =
      children != null ? (
        <div
          {...stylex.props(isVertical ? styles.otContentV : styles.otContentH)}>
          {children}
        </div>
      ) : null;

    if (isVertical) {
      const inner = (
        <>
          <div
            {...stylex.props(
              styles.otIndicatorColV,
              styles.otRailBridgeV(densitySpace),
            )}>
            <div
              aria-hidden="true"
              {...mergeProps(
                themeProps('step-connector'),
                stylex.props(
                  styles.otSegBaseV,
                  styles.otSegLeadV(densitySpace),
                  beforeSegStyle,
                  isFirst && styles.otSegHidden,
                ),
              )}
            />
            {indicatorNode}
            <div
              aria-hidden="true"
              {...mergeProps(
                themeProps('step-connector'),
                stylex.props(
                  styles.otSegBaseV,
                  styles.otSegFlexV,
                  afterSegStyle,
                  isLast && styles.otSegHidden,
                ),
              )}
            />
          </div>
          <div {...stylex.props(styles.otBodyV)}>
            {labelLineNode}
            {otDescriptionNode}
          </div>
        </>
      );

      return (
        <li
          ref={ref}
          {...mergeProps(
            stepThemeProps,
            stylex.props(styles.otVerticalRoot, xstyle),
            className,
            style,
          )}
          aria-current={isActive ? 'step' : undefined}
          data-testid={dataTestId}
          {...rest}>
          {isClickable ? (
            <button
              type="button"
              onClick={handleClick}
              aria-label={`Go to step ${step + 1}: ${label}`}
              {...stylex.props(
                styles.otInteractive,
                styles.otRowWrap,
                styles.otRowPadV(densitySpace),
                styles.focusRing,
              )}>
              {inner}
            </button>
          ) : (
            <div
              {...stylex.props(
                styles.otRowWrap,
                styles.otRowPadV(densitySpace),
              )}>
              {inner}
            </div>
          )}
          {otContentNode}
        </li>
      );
    }

    // Horizontal on-track
    const innerH = (
      <>
        <div {...stylex.props(styles.otTrackRowH)}>
          <div
            aria-hidden="true"
            {...mergeProps(
              themeProps('step-connector'),
              stylex.props(
                styles.otSegH,
                beforeSegStyle,
                isFirst && styles.otSegHidden,
              ),
            )}
          />
          {indicatorNode}
          <div
            aria-hidden="true"
            {...mergeProps(
              themeProps('step-connector'),
              stylex.props(
                styles.otSegH,
                afterSegStyle,
                isLast && styles.otSegHidden,
              ),
            )}
          />
        </div>
        <div
          {...stylex.props(
            styles.otLabelWrapH,
            styles.otMarginTop(densitySpace),
          )}>
          {labelLineNode}
          {otDescriptionNode}
        </div>
      </>
    );

    return (
      <li
        ref={ref}
        {...mergeProps(
          stepThemeProps,
          stylex.props(styles.otHorizontalRoot, xstyle),
          className,
          style,
        )}
        aria-current={isActive ? 'step' : undefined}
        data-testid={dataTestId}
        {...rest}>
        {isClickable ? (
          <button
            type="button"
            onClick={handleClick}
            aria-label={`Go to step ${step + 1}: ${label}`}
            {...stylex.props(
              styles.otInteractive,
              styles.otColWrap,
              styles.otPadBlock(densitySpace),
              styles.focusRing,
            )}>
            {innerH}
          </button>
        ) : (
          <div
            {...stylex.props(
              styles.otColWrap,
              styles.otPadBlock(densitySpace),
            )}>
            {innerH}
          </div>
        )}
        {otContentNode}
      </li>
    );
  }

  // ======= VERTICAL =======
  if (isVertical) {
    return (
      <li
        ref={ref}
        {...mergeProps(
          stepThemeProps,
          stylex.props(styles.verticalRoot, xstyle),
          className,
          style,
        )}
        aria-current={isActive ? 'step' : undefined}
        data-testid={dataTestId}
        {...rest}>
        {/* 4px progress bar */}
        <div
          {...mergeProps(
            themeProps('step-bar'),
            stylex.props(
              styles.verticalBar,
              isBarFilled ? styles.barCompleted : styles.barIncomplete,
            ),
          )}
          aria-hidden="true"
        />
        {/* Body: button wraps only label area, children render outside */}
        <div {...stylex.props(styles.verticalBody)}>
          {isClickable ? (
            <button
              type="button"
              onClick={handleClick}
              aria-label={`Go to step ${step + 1}: ${label}`}
              {...stylex.props(
                styles.buttonReset,
                styles.focusRing,
                density === 'compact' && styles.densityCompact,
                density === 'balanced' && styles.densityBalanced,
                density === 'spacious' && styles.densitySpacious,
              )}>
              {iconLabelNode}
              {descriptionNode}
            </button>
          ) : (
            <div
              {...stylex.props(
                density === 'compact' && styles.densityCompact,
                density === 'balanced' && styles.densityBalanced,
                density === 'spacious' && styles.densitySpacious,
              )}>
              {iconLabelNode}
              {descriptionNode}
            </div>
          )}
          {contentNode}
        </div>
      </li>
    );
  }

  // ======= HORIZONTAL =======
  return (
    <li
      ref={ref}
      {...mergeProps(
        stepThemeProps,
        stylex.props(styles.horizontalStep, xstyle),
        className,
        style,
      )}
      aria-current={isActive ? 'step' : undefined}
      data-testid={dataTestId}
      {...rest}>
      {/* 4px progress bar segment for this step */}
      <div
        {...mergeProps(
          themeProps('step-bar'),
          stylex.props(
            styles.horizontalBar,
            isBarFilled ? styles.barCompleted : styles.barIncomplete,
          ),
        )}
        aria-hidden="true"
      />
      {isClickable ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={`Go to step ${step + 1}: ${label}`}
          {...stylex.props(
            styles.buttonReset,
            styles.focusRing,
            density === 'compact' && styles.densityCompact,
            density === 'balanced' && styles.densityBalanced,
            density === 'spacious' && styles.densitySpacious,
          )}>
          {iconLabelNode}
          {descriptionNode}
        </button>
      ) : (
        <div
          {...stylex.props(
            density === 'compact' && styles.densityCompact,
            density === 'balanced' && styles.densityBalanced,
            density === 'spacious' && styles.densitySpacious,
          )}>
          {iconLabelNode}
          {descriptionNode}
        </div>
      )}
      {contentNode}
    </li>
  );
}

Step.displayName = 'Step';
