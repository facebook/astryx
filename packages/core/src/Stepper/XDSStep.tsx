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
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {XDSIcon} from '../Icon';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useXDSStepperContext} from './XDSStepperContext';

export interface XDSStepProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Zero-based index of this step. Used to determine active/completed state
   * relative to the parent's activeStep.
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
   * Custom icon to replace the step number/check indicator.
   */
  icon?: ReactNode;
  /**
   * Override the auto-computed completed state.
   * By default, steps before activeStep are completed.
   */
  isCompleted?: boolean;
  /**
   * Disable interaction for this step.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Optional error state for this step.
   * @default false
   */
  hasError?: boolean;
}

const styles = stylex.create({
  // Horizontal layout
  horizontalRoot: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: {
      default: 1,
      ':last-child': 'none',
    },
    '--_show-connector': {
      default: 'flex',
      ':last-child': 'none',
    },
    position: 'relative',
  },
  horizontalContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  horizontalConnector: {
    flex: 1,
    display: 'var(--_show-connector)',
    alignItems: 'center',
    paddingInline: spacingVars['--spacing-2'],
    minWidth: spacingVars['--spacing-6'],
    height: spacingVars['--spacing-7'],
  },
  horizontalConnectorLine: {
    height: spacingVars['--spacing-0-5'],
    width: '100%',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },

  // Vertical layout
  verticalRoot: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    minHeight: spacingVars['--spacing-12'],
    '--_show-connector': {
      default: 'flex',
      ':last-child': 'none',
    },
  },
  verticalIndicatorColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: spacingVars['--spacing-7'],
    flexShrink: 0,
  },
  verticalConnector: {
    flex: 1,
    display: 'var(--_show-connector)',
    justifyContent: 'center',
    paddingBlock: spacingVars['--spacing-1'],
  },
  verticalConnectorLine: {
    width: spacingVars['--spacing-0-5'],
    height: '100%',
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  verticalContent: {
    display: 'flex',
    flexDirection: 'column',
    paddingInlineStart: spacingVars['--spacing-3'],
    paddingBlockEnd: spacingVars['--spacing-6'],
    flex: 1,
  },
  verticalLastContent: {
    paddingBlockEnd: spacingVars['--spacing-0'],
  },

  // Indicator circle
  indicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacingVars['--spacing-7'],
    height: spacingVars['--spacing-7'],
    borderRadius: radiusVars['--radius-full'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    transitionProperty: 'background-color, color, border-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
    flexShrink: 0,
    userSelect: 'none',
    borderWidth: spacingVars['--spacing-0-5'],
    borderStyle: 'solid',
    position: 'relative',
  },
  indicatorActive: {
    backgroundColor: colorVars['--color-accent'],
    borderColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  indicatorCompleted: {
    backgroundColor: colorVars['--color-accent'],
    borderColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  indicatorUpcoming: {
    backgroundColor: 'transparent',
    borderColor: colorVars['--color-border-emphasized'],
    color: colorVars['--color-text-secondary'],
  },
  indicatorDisabled: {
    backgroundColor: 'transparent',
    borderColor: colorVars['--color-border'],
    color: colorVars['--color-text-disabled'],
  },
  indicatorError: {
    backgroundColor: colorVars['--color-error'],
    borderColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  indicatorClickable: {
    cursor: 'pointer',
    ':hover': {
      '@media (hover: hover)': {
        opacity: 0.85,
      },
    },
  },

  // Connector line colors
  connectorCompleted: {
    backgroundColor: colorVars['--color-accent'],
  },
  connectorIncomplete: {
    backgroundColor: colorVars['--color-border-emphasized'],
  },

  // Label and description
  labelRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingBlockStart: spacingVars['--spacing-1'],
    // No spacing token at 120px — nearest are --spacing-12 (48px) and --spacing-14 (56px)
    maxWidth: '120px',
  },
  labelRowVertical: {
    alignItems: 'flex-start',
    maxWidth: 'none',
    paddingBlockStart: spacingVars['--spacing-0-5'],
  },
  label: {
    fontSize: typeScaleVars['--text-body-size'],
    lineHeight: typeScaleVars['--text-body-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    textAlign: 'center',
  },
  labelVertical: {
    textAlign: 'start',
  },
  labelActive: {
    color: colorVars['--color-text-primary'],
    fontWeight: fontWeightVars['--font-weight-semibold'],
  },
  labelCompleted: {
    color: colorVars['--color-text-primary'],
  },
  labelUpcoming: {
    color: colorVars['--color-text-secondary'],
  },
  labelDisabled: {
    color: colorVars['--color-text-disabled'],
  },
  labelError: {
    color: colorVars['--color-error'],
  },
  description: {
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    color: colorVars['--color-text-secondary'],
    textAlign: 'center',
  },
  descriptionVertical: {
    textAlign: 'start',
  },
  descriptionError: {
    color: colorVars['--color-error'],
  },

  // Button reset for clickable indicators
  buttonReset: {
    background: 'none',
    border: 'none',
    padding: 0,
    margin: 0,
    font: 'inherit',
  },

  // Step content (children)
  stepContent: {
    paddingBlockStart: spacingVars['--spacing-3'],
  },
});

/**
 * An individual step within an XDSStepper. Renders a numbered indicator
 * circle, a connector line to the next step, and a label with optional
 * description. Step state (active, completed, upcoming) is derived from
 * the parent's activeStep and this step's `step` prop.
 *
 * @example
 * ```
 * <XDSStep step={0} label="Account details" description="Enter your email" />
 * ```
 */
export function XDSStep({
  step,
  label,
  description,
  children,
  icon,
  isCompleted: isCompletedProp,
  isDisabled = false,
  hasError = false,
  xstyle,
  className,
  style,
  ref,
  'data-testid': dataTestId,
  ...rest
}: XDSStepProps) {
  const ctx = useXDSStepperContext();
  const {activeStep, orientation, isNonLinear, onStepClick} = ctx;

  const isActive = step === activeStep;
  const isCompleted = isCompletedProp ?? step < activeStep;
  const isVertical = orientation === 'vertical';

  const isClickable = isNonLinear && !isDisabled && (isCompleted || isActive);

  const handleClick = () => {
    if (isClickable && onStepClick) {
      onStepClick(step);
    }
  };

  const indicatorContent = hasError ? (
    <XDSIcon icon="warning" size="sm" color="inherit" />
  ) : icon != null ? (
    icon
  ) : isCompleted ? (
    <XDSIcon icon="check" size="sm" color="inherit" />
  ) : (
    <span>{step + 1}</span>
  );

  const indicatorVariantStyle = hasError
    ? styles.indicatorError
    : isDisabled
      ? styles.indicatorDisabled
      : isActive
        ? styles.indicatorActive
        : isCompleted
          ? styles.indicatorCompleted
          : styles.indicatorUpcoming;

  const stepState = hasError
    ? 'error'
    : isDisabled
      ? 'disabled'
      : isActive
        ? 'active'
        : isCompleted
          ? 'completed'
          : 'upcoming';

  const indicator = isClickable ? (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Go to step ${step + 1}: ${label}`}
      {...mergeProps(
        xdsClassName('step-indicator', {state: stepState}),
        stylex.props(
          styles.buttonReset,
          styles.indicator,
          indicatorVariantStyle,
          styles.indicatorClickable,
        ),
      )}>
      {indicatorContent}
    </button>
  ) : (
    <div
      aria-hidden="true"
      {...mergeProps(
        xdsClassName('step-indicator', {state: stepState}),
        stylex.props(styles.indicator, indicatorVariantStyle),
      )}>
      {indicatorContent}
    </div>
  );

  const labelNode = (
    <div
      {...stylex.props(styles.labelRow, isVertical && styles.labelRowVertical)}>
      <span
        {...stylex.props(
          styles.label,
          isVertical && styles.labelVertical,
          hasError
            ? styles.labelError
            : isDisabled
              ? styles.labelDisabled
              : isActive
                ? styles.labelActive
                : isCompleted
                  ? styles.labelCompleted
                  : styles.labelUpcoming,
        )}>
        {label}
      </span>
      {description != null && (
        <span
          {...stylex.props(
            styles.description,
            isVertical && styles.descriptionVertical,
            hasError && styles.descriptionError,
          )}>
          {description}
        </span>
      )}
    </div>
  );

  if (isVertical) {
    return (
      <div
        ref={ref}
        {...mergeProps(
          xdsClassName('step', {state: stepState}),
          stylex.props(styles.verticalRoot, xstyle),
          className,
          style,
        )}
        aria-current={isActive ? 'step' : undefined}
        data-testid={dataTestId}
        role="listitem"
        {...rest}>
        <div {...stylex.props(styles.verticalIndicatorColumn)}>
          {indicator}
          <div {...stylex.props(styles.verticalConnector)}>
            <div
              {...mergeProps(
                xdsClassName('step-connector'),
                stylex.props(
                  styles.verticalConnectorLine,
                  isCompleted
                    ? styles.connectorCompleted
                    : styles.connectorIncomplete,
                ),
              )}
            />
          </div>
        </div>
        <div {...stylex.props(styles.verticalContent)}>
          {labelNode}
          {children != null && (
            <div {...stylex.props(styles.stepContent)}>{children}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      {...mergeProps(
        xdsClassName('step', {state: stepState}),
        stylex.props(styles.horizontalRoot, xstyle),
        className,
        style,
      )}
      aria-current={isActive ? 'step' : undefined}
      data-testid={dataTestId}
      role="listitem"
      {...rest}>
      <div {...stylex.props(styles.horizontalContent)}>
        {indicator}
        {labelNode}
      </div>
      <div {...stylex.props(styles.horizontalConnector)}>
        <div
          {...mergeProps(
            xdsClassName('step-connector'),
            stylex.props(
              styles.horizontalConnectorLine,
              isCompleted
                ? styles.connectorCompleted
                : styles.connectorIncomplete,
            ),
          )}
        />
      </div>
    </div>
  );
}

XDSStep.displayName = 'XDSStep';
