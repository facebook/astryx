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
} from '@xds/core/theme/tokens.stylex';
import {mergeProps} from '@xds/core/utils';
import type {BaseProps} from '@xds/core';
import {useStepperContext} from './StepperContext';
import {xdsThemeProps} from '../../../core/src/utils/xdsThemeProps';
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
   * Semantic color for the step. Controls **color only** and maps to the
   * global XDS semantic tokens (`accent`, `success`, `warning`, `error`).
   * Leave unset to use the progress-derived default coloring.
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

/** Filled check — shown for completed steps in 'auto' mode. */
function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M5 8.5l2 2 4-4"
        stroke="white"
        strokeWidth="1.5"
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
  // Semantic status overrides for the bar — color only.
  barAccent: {
    backgroundColor: colorVars['--color-accent'],
  },
  barSuccess: {
    backgroundColor: colorVars['--color-success'],
  },
  barWarning: {
    backgroundColor: colorVars['--color-warning'],
  },
  barError: {
    backgroundColor: colorVars['--color-error'],
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
    lineHeight: typeScaleVars['--text-supporting-leading'],
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
});

/**
 * An individual step within an Stepper. Renders a 4px progress-bar segment,
 * an indicator (numbered badge, check, or any custom icon), a label with
 * optional description, and an optional content slot.
 *
 * Progress (completed / active / not-started) is derived from the parent's
 * `activeStep` and this step's `step` prop. The optional `status` prop layers a
 * semantic color (`accent` / `success` / `warning` / `error`) on top — color
 * only; it does not change layout or iconography.
 *
 * @example
 * ```
 * <Step step={0} label="Account details" description="Enter your email" />
 * ```
 *
 * @example
 * ```
 * // Generic icon + semantic color
 * <Step step={1} label="Payment" status="error" icon={<Icon icon="warning" />} />
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
  const {activeStep, orientation, onStepClick, density: ctxDensity} = ctx;

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

  // Bar fill is purely progress-based; `status` recolors it when set.
  const isBarFilled = progress === 'completed' || progress === 'in-progress';
  const statusBarStyle =
    status === 'accent'
      ? styles.barAccent
      : status === 'success'
        ? styles.barSuccess
        : status === 'warning'
          ? styles.barWarning
          : status === 'error'
            ? styles.barError
            : undefined;

  // --- Build indicator node ---
  // 'auto': number for not-started, check/dot icon once reached
  // 'number': always number badge
  // 'none': nothing
  // custom ReactNode (or `icon` prop): render as-is
  let indicatorNode: ReactNode = null;

  const customIcon = isCustomIndicator ? indicatorProp : (icon ?? null);

  if (indicator !== 'none') {
    const showNumber =
      customIcon == null &&
      (indicator === 'number' ||
        (indicator === 'auto' && progress === 'not-started'));

    if (showNumber) {
      const numberColorStyle = isDisabled
        ? styles.numberDisabled
        : status === 'accent'
          ? styles.numberAccent
          : status === 'success'
            ? styles.numberSuccess
            : status === 'warning'
              ? styles.numberWarning
              : status === 'error'
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
      // Custom icon takes priority, otherwise the progress-derived default.
      const iconContent =
        customIcon != null ? (
          customIcon
        ) : progress === 'completed' ? (
          <CheckCircleIcon />
        ) : (
          <CurrentIcon />
        );

      const iconColorStyle = isDisabled
        ? styles.iconDisabled
        : status === 'accent'
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
  const themeProps = xdsThemeProps('step', {
    progress,
    status: status ?? undefined,
  });

  // ======= VERTICAL =======
  if (isVertical) {
    return (
      <li
        ref={ref}
        {...mergeProps(
          themeProps,
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
            xdsThemeProps('step-bar'),
            stylex.props(
              styles.verticalBar,
              statusBarStyle ??
                (isBarFilled ? styles.barCompleted : styles.barIncomplete),
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
        themeProps,
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
          xdsThemeProps('step-bar'),
          stylex.props(
            styles.horizontalBar,
            statusBarStyle ??
              (isBarFilled ? styles.barCompleted : styles.barIncomplete),
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
