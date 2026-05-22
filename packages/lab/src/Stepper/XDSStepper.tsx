// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, Children, type ReactNode, type ReactElement} from 'react';
import * as stylex from '@stylexjs/stylex';

import {
  colorVars,
  radiusVars,
  durationVars,
  easeVars,
} from '@xds/core/theme/tokens.stylex';
import {xdsClassName, mergeProps} from '@xds/core/utils';
import type {XDSBaseProps} from '@xds/core';
import {
  XDSStepperContext,
  type XDSStepperOrientation,
  type XDSStepperContextValue,
} from './XDSStepperContext';
import {XDSStepStatus} from './XDSStepStatus';

export interface XDSStepperProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  activeStep: number;
  children: ReactNode;
  orientation?: XDSStepperOrientation;
  onStepClick?: (index: number) => void;
  label?: string;
  /**
   * Controls density (padding) of all steps.
   * @default 'balanced'
   */
  density?: 'compact' | 'balanced' | 'spacious';
}

const BAR_GAP = '2px';
const BAR_HEIGHT = '4px';
const STEP_GAP = '2px';

const styles = stylex.create({
  root: {
    display: 'flex',
    width: '100%',
    margin: 0,
    padding: 0,
  },
  horizontal: {
    flexDirection: 'column',
  },
  vertical: {
    flexDirection: 'column',
  },
  // Horizontal bar row
  horizontalBarRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: BAR_GAP,
    marginBlockEnd: '2px',
  },
  horizontalBarSegment: {
    flex: 1,
    height: BAR_HEIGHT,
    borderRadius: radiusVars['--radius-full'],
    transitionProperty: 'background-color',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  barCompleted: {
    backgroundColor: colorVars['--color-icon-primary'],
  },
  barIncomplete: {
    backgroundColor: colorVars['--color-border'],
  },
  // Horizontal steps row
  horizontalStepsRow: {
    display: 'flex',
    flexDirection: 'row',
    gap: STEP_GAP,
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  // Vertical steps list — 8px gap between steps
  verticalStepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: STEP_GAP,
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
});

export function XDSStepper({
  activeStep,
  children,
  orientation = 'horizontal',
  onStepClick,
  label = 'Progress',
  density = 'balanced',
  xstyle,
  className,
  style,
  ref,
  ...rest
}: XDSStepperProps) {
  const ctxValue = useMemo<XDSStepperContextValue>(
    () => ({
      activeStep,
      orientation,
      isNonLinear: onStepClick != null,
      onStepClick: onStepClick ?? null,
      density,
    }),
    [activeStep, orientation, onStepClick, density],
  );

  // eslint-disable-next-line @xds/no-react-introspection
  const childArray = Children.toArray(children) as ReactElement[];

  if (orientation === 'horizontal') {
    return (
      <XDSStepperContext value={ctxValue}>
        <nav ref={ref} aria-label={label} {...rest}>
          <div
            {...mergeProps(
              xdsClassName('stepper', {orientation}),
              stylex.props(styles.root, styles.horizontal, xstyle),
              className,
              style,
            )}>
            {/* Segmented progress bar */}
            <div {...stylex.props(styles.horizontalBarRow)} aria-hidden="true">
              {childArray.map((child, idx) => {
                const stepProp =
                  (
                    child as React.ReactElement<{
                      step?: number;
                      status?: string;
                    }>
                  ).props?.step ?? idx;
                const statusProp = (
                  child as React.ReactElement<{step?: number; status?: string}>
                ).props?.status;
                const isFilled = statusProp
                  ? statusProp === XDSStepStatus.Completed ||
                    statusProp === XDSStepStatus.InProgress
                  : stepProp <= activeStep;
                return (
                  <div
                    key={idx}
                    {...stylex.props(
                      styles.horizontalBarSegment,
                      isFilled ? styles.barCompleted : styles.barIncomplete,
                    )}
                  />
                );
              })}
            </div>
            {/* Steps row */}
            <ol {...stylex.props(styles.horizontalStepsRow)}>{children}</ol>
          </div>
        </nav>
      </XDSStepperContext>
    );
  }

  // Vertical
  return (
    <XDSStepperContext value={ctxValue}>
      <nav ref={ref} aria-label={label} {...rest}>
        <ol
          {...mergeProps(
            xdsClassName('stepper', {orientation}),
            stylex.props(styles.verticalStepsList, xstyle),
            className,
            style,
          )}>
          {children}
        </ol>
      </nav>
    </XDSStepperContext>
  );
}

XDSStepper.displayName = 'XDSStepper';
