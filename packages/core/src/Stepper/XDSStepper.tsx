// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file XDSStepper.tsx
 * @input Uses React, stylex, theme tokens, XDSStepperContext
 * @output Exports XDSStepper component and XDSStepperProps
 * @position Core container component; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Stepper/Stepper.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Stepper/XDSStepper.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Stepper/index.ts (exports if types change)
 * - /apps/storybook/stories/Stepper.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Stepper/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';

import {xdsClassName, mergeProps} from '../utils';
import type {XDSBaseProps} from '../XDSBaseProps';
import {
  XDSStepperContext,
  type XDSStepperOrientation,
  type XDSStepperContextValue,
} from './XDSStepperContext';

export interface XDSStepperProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Zero-based index of the active step.
   */
  activeStep: number;
  /**
   * XDSStep elements to render.
   */
  children: ReactNode;
  /**
   * Layout direction of the stepper.
   * @default 'horizontal'
   */
  orientation?: XDSStepperOrientation;
  /**
   * Called when a step indicator is clicked. Enables non-linear navigation.
   * When provided, completed and current steps become clickable.
   */
  onStepClick?: (index: number) => void;
  /**
   * Accessible label for the stepper navigation landmark.
   * @default 'Progress'
   */
  label?: string;
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
  },
  vertical: {
    flexDirection: 'column',
  },
});

/**
 * A stepper component for multi-step workflows. Displays numbered steps
 * with visual indicators for completed, active, and upcoming states.
 *
 * Each XDSStep child must provide a `step` prop (zero-based index) so it
 * can derive its state from the parent's activeStep. CSS :last-child
 * handles connector hiding — no child introspection needed.
 *
 * @example
 * ```
 * <XDSStepper activeStep={1}>
 *   <XDSStep step={0} label="Account" />
 *   <XDSStep step={1} label="Profile" />
 *   <XDSStep step={2} label="Review" />
 * </XDSStepper>
 * ```
 */
export function XDSStepper({
  activeStep,
  children,
  orientation = 'horizontal',
  onStepClick,
  label = 'Progress',
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
    }),
    [activeStep, orientation, onStepClick],
  );

  return (
    <XDSStepperContext.Provider value={ctxValue}>
      <nav ref={ref} aria-label={label} {...rest}>
        <ol
          {...mergeProps(
            xdsClassName('stepper', {orientation}),
            stylex.props(
              styles.root,
              orientation === 'horizontal'
                ? styles.horizontal
                : styles.vertical,
              xstyle,
            ),
            className,
            style,
          )}>
          {children}
        </ol>
      </nav>
    </XDSStepperContext.Provider>
  );
}

XDSStepper.displayName = 'XDSStepper';
