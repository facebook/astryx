// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Stepper.tsx
 * @input Uses React, stylex, theme tokens, StepperContext
 * @output Exports Stepper component and StepperProps
 * @position Core container component; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/lab/src/Stepper/Stepper.doc.mjs (props table, features, implementation notes)
 * - /packages/lab/src/Stepper/Stepper.test.tsx (tests for new/changed behavior)
 * - /packages/lab/src/Stepper/index.ts (exports if types change)
 * - /apps/storybook/stories/Stepper.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Stepper/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {mergeProps} from '@xds/core/utils';
import type {BaseProps} from '@xds/core';
import {xdsThemeProps} from '../../../core/src/utils/xdsThemeProps';
import {
  StepperContext,
  type StepperOrientation,
  type StepperContextValue,
} from './StepperContext';

export interface StepperProps extends BaseProps<HTMLOListElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLOListElement>;
  /**
   * Zero-based index of the active step.
   */
  activeStep: number;
  /**
   * Step elements to render.
   */
  children: ReactNode;
  /**
   * Layout direction of the stepper.
   * @default 'horizontal'
   */
  orientation?: StepperOrientation;
  /**
   * Called when a step indicator is clicked. Enables non-linear navigation.
   * When provided, completed and current steps become clickable.
   */
  onStepClick?: (index: number) => void;
  /**
   * Accessible label describing the set of steps.
   * @default 'Progress'
   */
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
    listStyleType: 'none',
    margin: 0,
    padding: 0,
  },
  horizontal: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: STEP_GAP,
  },
  vertical: {
    flexDirection: 'column',
    gap: STEP_GAP,
  },
});

/**
 * A stepper component for multi-step workflows. Displays numbered steps
 * with visual indicators for completed, active, and upcoming states.
 *
 * Each Step child must provide a `step` prop (zero-based index) so it
 * can derive its state from the parent's activeStep. CSS :last-child
 * handles connector hiding — no child introspection needed.
 *
 * Rendered as an ordered list (`<ol>`/`<li>`) rather than a `nav`
 * landmark: a stepper communicates *progress through a sequence*, not a
 * set of site navigation links. The active step is marked with
 * `aria-current="step"` (handled per-step) and the list carries an
 * accessible `label`. This follows the WAI-ARIA pattern for steppers /
 * progress sequences and avoids polluting the page's landmark map.
 *
 * @example
 * ```
 * <Stepper activeStep={1}>
 *   <Step step={0} label="Account" />
 *   <Step step={1} label="Profile" />
 *   <Step step={2} label="Review" />
 * </Stepper>
 * ```
 */
export function Stepper({
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
}: StepperProps) {
  const ctxValue = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      orientation,
      isNonLinear: onStepClick != null,
      onStepClick: onStepClick ?? null,
      density,
    }),
    [activeStep, orientation, onStepClick, density],
  );

  return (
    <StepperContext value={ctxValue}>
      <ol
        ref={ref}
        aria-label={label}
        {...rest}
        {...mergeProps(
          xdsThemeProps('stepper', {orientation}),
          stylex.props(
            styles.root,
            orientation === 'horizontal' ? styles.horizontal : styles.vertical,
            xstyle,
          ),
          className,
          style,
        )}>
        {/* Each step renders its own progress bar segment; no child
            introspection needed — steps derive state from context. */}
        {children}
      </ol>
    </StepperContext>
  );
}

Stepper.displayName = 'Stepper';
