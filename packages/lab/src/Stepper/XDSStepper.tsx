// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {xdsClassName, mergeProps} from '@xds/core/utils';
import type {XDSBaseProps} from '@xds/core';
import {
  XDSStepperContext,
  type XDSStepperOrientation,
  type XDSStepperContextValue,
} from './XDSStepperContext';

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

const STEP_GAP = '2px';

const styles = stylex.create({
  root: {
    display: 'flex',
    width: '100%',
    margin: 0,
    padding: 0,
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

  if (orientation === 'horizontal') {
    return (
      <XDSStepperContext value={ctxValue}>
        <nav ref={ref} aria-label={label} {...rest}>
          <ol
            {...mergeProps(
              xdsClassName('stepper', {orientation}),
              stylex.props(styles.root, styles.horizontalStepsRow, xstyle),
              className,
              style,
            )}>
            {/* Each step renders its own progress bar segment; no child
                introspection needed — steps derive state from context. */}
            {children}
          </ol>
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
