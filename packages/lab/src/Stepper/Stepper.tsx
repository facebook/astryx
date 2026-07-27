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

import {Children, useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {spacingVars} from '@astryxdesign/core/theme/tokens.stylex';
import {mergeProps} from '@astryxdesign/core/utils';
import type {BaseProps} from '@astryxdesign/core';
import {themeProps} from '@astryxdesign/core/utils';
import {
  StepperContext,
  type StepperOrientation,
  type StepperIndicatorPosition,
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
  /**
   * Controls where each step's indicator sits relative to the connector track.
   * - 'separated': indicator lives in the label row, distinct from the progress
   *   bar (the original Astryx layout).
   * - 'on-track': indicator is slotted into the connector line as a node on the
   *   track (EPS-aligned design).
   * @default 'separated'
   */
  indicatorPosition?: StepperIndicatorPosition;
}

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
    gap: spacingVars['--spacing-0-5'],
  },
  vertical: {
    flexDirection: 'column',
    gap: spacingVars['--spacing-0-5'],
  },
  // On-track: steps must abut so their connector segments form one continuous
  // line, so the inter-step gap collapses to zero.
  horizontalOnTrack: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 0,
  },
  verticalOnTrack: {
    flexDirection: 'column',
    gap: 0,
  },
});

/**
 * A stepper component for multi-step workflows. Displays numbered steps
 * with visual indicators for completed, active, and upcoming states.
 *
 * Each Step child must provide a `step` prop (zero-based index) so it
 * can derive its state from the parent's activeStep. The parent supplies
 * the total `stepCount` via context so the on-track layout can hide the
 * trailing connector on the final step.
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
  indicatorPosition = 'separated',
  xstyle,
  className,
  style,
  ref,
  ...rest
}: StepperProps) {
  const stepCount = Children.count(children);
  const ctxValue = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      orientation,
      isNonLinear: onStepClick != null,
      onStepClick: onStepClick ?? null,
      density,
      indicatorPosition,
      stepCount,
    }),
    [
      activeStep,
      orientation,
      onStepClick,
      density,
      indicatorPosition,
      stepCount,
    ],
  );

  const isOnTrack = indicatorPosition === 'on-track';
  const orientationStyle =
    orientation === 'horizontal'
      ? isOnTrack
        ? styles.horizontalOnTrack
        : styles.horizontal
      : isOnTrack
        ? styles.verticalOnTrack
        : styles.vertical;

  return (
    <StepperContext value={ctxValue}>
      <ol
        ref={ref}
        aria-label={label}
        {...rest}
        {...mergeProps(
          themeProps('stepper', {orientation, indicatorPosition}),
          stylex.props(styles.root, orientationStyle, xstyle),
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
