// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSStep.tsx
 * @input Uses React, stylex, theme tokens, XDSStepperContext
 * @output Exports XDSStep component and XDSStepProps
 * @position Individual step item; used inside XDSStepper
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs
 * - /packages/core/src/Stepper/XDSStepper.test.tsx
 * - /packages/core/src/Stepper/index.ts
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
import {xdsClassName, mergeProps} from '@xds/core/utils';
import type {XDSBaseProps} from '@xds/core';
import {useXDSStepperContext} from './XDSStepperContext';
import {XDSStepStatus} from './XDSStepStatus';

export type XDSStepIndicator = 'auto' | 'status' | 'number' | 'none';
export type XDSStepDensity = 'compact' | 'balanced' | 'spacious';

export interface XDSStepProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  step: number;
  label: string;
  description?: string;
  children?: ReactNode;
  icon?: ReactNode;
  status?: XDSStepStatus;
  isDisabled?: boolean;
  isOptional?: boolean;
  endContent?: ReactNode;
  /**
   * What to show as the step indicator.
   * - 'auto': number for not-started steps, status icon once there's a state (default)
   * - 'status': always show status icons (check, dot, error, etc.)
   * - 'number': always show numbered badge
   * - 'none': no indicator, just bar + label
   * @default 'auto'
   */
  indicator?: XDSStepIndicator;
  /** @deprecated Use indicator="none" instead */
  hideIcon?: boolean;
  /**
   * Controls vertical padding of the step.
   * - 'compact': minimal padding (4px block)
   * - 'balanced': default (8px block)
   * - 'spacious': generous (12px block, 12px inline)
   * @default 'balanced'
   */
  density?: XDSStepDensity;
}

// --- Status icons (16px) ---

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

function CurrentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

function CircleOutlineIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M8 5v4M8 11h.01"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="8" fill="currentColor" />
      <path
        d="M8 5v4M8 11h.01"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SkipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="2" />
      <path
        d="M5.5 5.5l5 5M10.5 5.5l-5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
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
    gap: '2px',
  },

  // 4px progress bar segment
  verticalBar: {
    width: BAR_WIDTH,
    borderRadius: radiusVars['--radius-full'],
    flexShrink: 0,
    alignSelf: 'stretch',
  },
  barCompleted: {
    backgroundColor: colorVars['--color-icon-primary'],
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
    // density padding applied via densityX styles below
  },

  // ===================== SHARED =====================

  // Icon + Label in one row
  iconLabelRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingVars['--spacing-2'],
  },

  // Status icon container
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: ICON_SIZE,
    height: ICON_SIZE,
    flexShrink: 0,
  },
  iconCompleted: {
    color: colorVars['--color-success'],
  },
  iconInProgress: {
    color: colorVars['--color-icon-primary'],
  },
  iconNotStarted: {
    color: colorVars['--color-icon-secondary'],
  },
  iconError: {
    color: colorVars['--color-error'],
  },
  iconWarning: {
    color: colorVars['--color-warning'],
  },
  iconSkipped: {
    color: colorVars['--color-icon-secondary'],
  },
  iconDisabled: {
    color: colorVars['--color-icon-disabled'],
    opacity: 0.5,
  },

  // Number badge
  numberBadge: {
    display: 'grid',
    placeItems: 'center',
    width: NUMBER_SIZE,
    height: NUMBER_SIZE,
    borderRadius: radiusVars['--radius-full'],
    // eslint-disable-next-line @xds/no-hardcoded-styles
    fontSize: '10px',
     
    paddingBlockEnd: '1px',
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: 1,
    flexShrink: 0,
    textAlign: 'center',
  },
  numberCompleted: {
    backgroundColor: colorVars['--color-icon-primary'],
    color: colorVars['--color-on-dark'],
  },
  numberInProgress: {
    backgroundColor: colorVars['--color-icon-primary'],
    color: colorVars['--color-on-dark'],
  },
  numberNotStarted: {
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-secondary'],
  },
  numberError: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  numberWarning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-on-warning'],
  },
  numberDisabled: {
    backgroundColor: colorVars['--color-background-muted'],
    color: colorVars['--color-text-disabled'],
    opacity: 0.5,
  },

  // Label
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-regular'],
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
  labelError: {
    color: colorVars['--color-text-primary'],
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
    paddingInlineStart: '0px',
  },
  descriptionRowWithIndicator: {
    // Align with label: icon/number + gap = 16+8=24 or 20+8=28
    paddingInlineStart: '24px',
  },
  descriptionRowWithNumber: {
    paddingInlineStart: '28px',
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
    paddingInlineStart: '24px',
  },
  stepContentWithNumber: {
    paddingInlineStart: '28px',
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

export function XDSStep({
  step,
  label,
  description,
  children,
  icon,
  status: statusProp,
  isDisabled = false,
  isOptional = false,
  endContent,
  indicator: indicatorProp,
  hideIcon = false,
  density: densityProp,
  xstyle,
  className,
  style,
  ref,
  'data-testid': dataTestId,
  ...rest
}: XDSStepProps) {
  const ctx = useXDSStepperContext();
  const {activeStep, orientation, onStepClick, density: ctxDensity} = ctx;

  const density = densityProp ?? ctxDensity;

  // Resolve indicator prop (hideIcon is deprecated compat)
  const indicator: XDSStepIndicator =
    indicatorProp ?? (hideIcon ? 'none' : 'auto');

  // Auto-derive status
  const status: XDSStepStatus =
    statusProp ??
    (step === activeStep
      ? XDSStepStatus.InProgress
      : step < activeStep
        ? XDSStepStatus.Completed
        : XDSStepStatus.NotStarted);

  const isVertical = orientation === 'vertical';
  const isSelected = status === XDSStepStatus.InProgress;
  const isClickable = !isDisabled;

  const handleClick = () => {
    if (isClickable && onStepClick) {
      onStepClick(step);
    }
  };

  // Bar: purely progress-based
  const isBarFilled =
    status === XDSStepStatus.Completed || status === XDSStepStatus.InProgress;

  // --- Build indicator node ---
  // 'auto': number for not-started, status icon for everything else
  // 'number': always number badge (color reflects progress)
  // 'status': always status icon
  // 'none': nothing
  let indicatorNode: ReactNode = null;

  if (indicator !== 'none') {
    // Determine if we should show a number
    const showNumber =
      indicator === 'number' ||
      (indicator === 'auto' && status === XDSStepStatus.NotStarted);

    if (showNumber) {
      const numberColorStyle = isDisabled
        ? styles.numberDisabled
        : status === XDSStepStatus.Completed
          ? styles.numberCompleted
          : status === XDSStepStatus.InProgress
            ? styles.numberInProgress
            : status === XDSStepStatus.Error
              ? styles.numberError
              : status === XDSStepStatus.Warning
                ? styles.numberWarning
                : styles.numberNotStarted;

      indicatorNode = (
        <div
          aria-hidden="true"
          {...stylex.props(styles.numberBadge, numberColorStyle)}>
          {step + 1}
        </div>
      );
    } else {
      // Show status icon
      const statusIcon =
        icon != null ? (
          icon
        ) : status === XDSStepStatus.Completed ? (
          <CheckCircleIcon />
        ) : status === XDSStepStatus.InProgress ? (
          <CurrentIcon />
        ) : status === XDSStepStatus.Error ? (
          <ErrorIcon />
        ) : status === XDSStepStatus.Warning ? (
          <WarningIcon />
        ) : status === XDSStepStatus.Skipped ? (
          <SkipIcon />
        ) : (
          <CircleOutlineIcon />
        );

      const iconColorStyle = isDisabled
        ? styles.iconDisabled
        : status === XDSStepStatus.Completed
          ? styles.iconCompleted
          : status === XDSStepStatus.InProgress
            ? styles.iconInProgress
            : status === XDSStepStatus.Error
              ? styles.iconError
              : status === XDSStepStatus.Warning
                ? styles.iconWarning
                : status === XDSStepStatus.Skipped
                  ? styles.iconSkipped
                  : styles.iconNotStarted;

      indicatorNode = (
        <div aria-hidden="true" {...stylex.props(styles.icon, iconColorStyle)}>
          {statusIcon}
        </div>
      );
    }
  }

  const hasIndicator = indicator !== 'none';
  const isNumber = indicator === 'number';

  const labelColorStyle = isDisabled
    ? styles.labelDisabled
    : status === XDSStepStatus.Error
      ? styles.labelError
      : status === XDSStepStatus.NotStarted
        ? styles.labelNotStarted
        : status === XDSStepStatus.InProgress
          ? styles.labelInProgress
          : undefined;

  // Icon/Number + Label row
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

  // ======= VERTICAL =======
  if (isVertical) {
    return (
      <div
        ref={ref}
        {...mergeProps(
          xdsClassName('step', {status}),
          stylex.props(styles.verticalRoot, xstyle),
          className,
          style,
        )}
        aria-current={isSelected ? 'step' : undefined}
        data-testid={dataTestId}
        role="listitem"
        {...rest}>
        {/* 4px progress bar */}
        <div
          {...mergeProps(
            xdsClassName('step-bar'),
            stylex.props(
              styles.verticalBar,
              isBarFilled ? styles.barCompleted : styles.barIncomplete,
            ),
          )}
        />
        {/* Body: button wraps only label area, children render outside */}
        <div {...stylex.props(styles.verticalBody)}>
          {isClickable ? (
            <button
              type="button"
              onClick={handleClick}
              aria-label={`Step ${step + 1}: ${label}`}
              aria-selected={isSelected}
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
      </div>
    );
  }

  // ======= HORIZONTAL =======
  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('step', {status}),
        stylex.props(styles.horizontalStep, xstyle),
        className,
        style,
      )}
      aria-current={isSelected ? 'step' : undefined}
      data-testid={dataTestId}
      role="listitem"
      {...rest}>
      {isClickable ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={`Step ${step + 1}: ${label}`}
          aria-selected={isSelected}
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
  );
}

XDSStep.displayName = 'XDSStep';
