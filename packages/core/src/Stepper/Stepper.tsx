// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Stepper.tsx
 * @input Uses React, stylex, theme tokens, StepperContext
 * @output Exports Stepper component and StepperProps
 * @position Core container component; consumed by index.ts
 *
 * Besides the props it is given, this component tracks the `activeStep` it
 * last rendered with and publishes it on the context. Steps need the distance
 * and direction of a change to choreograph their connector fill; see the
 * CONNECTOR FILL block in Step.tsx.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Stepper/Stepper.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Stepper/index.ts (exports if types change)
 * - /apps/storybook/stories/Stepper.stories.tsx (storybook stories)
 * - /packages/cli/assets/templates/blocks/components/Stepper/ (showcase blocks)
 */

import {useCallback, useMemo, useRef, useState, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {spacingVars} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils';
import {useTranslator} from '../i18n';
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
   * Accessible label describing the set of steps. Defaults to a translated
   * "Progress" when unset.
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
   *   track (the on-track indicator design).
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
 * can derive its state from the parent's activeStep. The on-track layout
 * hides the leading connector on the first step and the trailing connector
 * on the last step structurally, from each step's own `<li>` position, so
 * it works regardless of how the steps are grouped.
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
  label: labelFromProps,
  density = 'balanced',
  indicatorPosition = 'separated',
  xstyle,
  className,
  style,
  ref,
  ...rest
}: StepperProps) {
  const t = useTranslator();
  const label = labelFromProps ?? t('@astryx.stepper.label');

  // Dev-mode duplicate step index detection. Steps register on mount and
  // deregister on unmount; a Map tracks count per index so we can warn when
  // two Steps share the same `step` value (which breaks aria-current).
  const stepCountsRef = useRef<Map<number, number>>(new Map());
  const registerStep = useCallback((index: number) => {
    const counts = stepCountsRef.current;
    const prev = counts.get(index) ?? 0;
    counts.set(index, prev + 1);
    if (process.env.NODE_ENV !== 'production' && prev + 1 > 1) {
      console.warn(
        `[Stepper] Duplicate step index ${index}: two <Step> elements share the same \`step\` value. ` +
          `This breaks \`aria-current="step"\` and causes both to show as active simultaneously.`,
      );
    }
    return () => {
      const cur = counts.get(index) ?? 1;
      if (cur <= 1) {
        counts.delete(index);
      } else {
        counts.set(index, cur - 1);
      }
    };
  }, []);

  // The step we came *from*. Steps need it to stagger their connector fill:
  // the distance and direction of the change decide which segment moves first
  // and how long the whole sweep may take (see Step.tsx's CONNECTOR FILL).
  //
  // Derived during render from state rather than written in an effect. An
  // effect runs after paint, so the browser would already have committed the
  // new fill states with last render's delays — the first frame of the sweep
  // would be wrong, and on a jump of one that is the entire animation. React
  // discards and re-runs a render that sets its own state before committing,
  // so this costs a re-render but never a wrong frame.
  //
  // Seeding both halves from the current `activeStep` is what suppresses the
  // cascade on mount: a stepper that opens on step 3 has no previous step to
  // have travelled from, so its completed segments paint filled at once. That
  // also makes the first render pure and identical on the server, so there is
  // nothing for hydration to disagree about. Storing the pair in one state
  // object keeps the update idempotent under StrictMode's double render — both
  // invocations read the same `seen` and queue the same successor.
  const [seen, setSeen] = useState(() => ({
    current: activeStep,
    previous: activeStep,
  }));
  if (seen.current !== activeStep) {
    setSeen({current: activeStep, previous: seen.current});
  }
  const previousActiveStep =
    seen.current === activeStep ? seen.previous : seen.current;

  const ctxValue = useMemo<StepperContextValue>(
    () => ({
      activeStep,
      previousActiveStep,
      orientation,
      isNonLinear: onStepClick != null,
      onStepClick: onStepClick ?? null,
      density,
      indicatorPosition,
      registerStep,
    }),
    [
      activeStep,
      previousActiveStep,
      orientation,
      onStepClick,
      density,
      indicatorPosition,
      registerStep,
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
