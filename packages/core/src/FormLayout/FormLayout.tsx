// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file FormLayout.tsx
 * @input Uses React, FormLayoutContext, StyleX
 * @output Exports FormLayout component and FormLayoutProps
 * @position Core implementation; consumed by index.ts, tested by FormLayout.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FormLayout/FormLayout.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/FormLayout/index.ts (exports if types change)
 * - /apps/storybook/stories/FormLayout.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/FormLayout/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {
  FormLayoutContext,
  type FormLayoutDirection,
} from './FormLayoutContext';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

// =============================================================================
// Responsive breakpoint for horizontal-labels collapse
// =============================================================================

const HORIZONTAL_LABELS_COLLAPSE = '@media (max-width: 480px)';

// =============================================================================
// Styles
// =============================================================================

const styles = stylex.create({
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacingVars['--spacing-4'],
  },
  horizontal: {
    display: 'grid',
    gridAutoFlow: 'column',
    gridAutoColumns: '1fr',
  },
  horizontalLabels: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gap: `${spacingVars['--spacing-3']} ${spacingVars['--spacing-4']}`,
    alignItems: 'start',
    [HORIZONTAL_LABELS_COLLAPSE]: {
      display: 'flex',
      flexDirection: 'column',
      gap: spacingVars['--spacing-4'],
    },
  },
});

// =============================================================================
// Props
// =============================================================================

export interface FormLayoutProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Form fields to arrange. Accepts Astryx inputs (TextInput, Selector, etc.)
   * and Field-wrapped custom controls.
   */
  children?: ReactNode;

  /**
   * Direction of field arrangement.
   *
   * - `'vertical'` — Fields stack top-to-bottom (default). Most common.
   * - `'horizontal'` — Fields arrange left-to-right in equal-width columns
   *   using CSS Grid. Each child occupies one equal column.
   * - `'horizontal-labels'` — CSS Grid with labels to the left of inputs.
   *   Collapses to vertical when the container is narrow (≤480px).
   *
   * @default 'vertical'
   */
  direction?: FormLayoutDirection;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Spatial layout container for form fields.
 *
 * Arranges form fields with consistent spacing and direction. Renders a `<div>`
 * (not a `<form>` — form submission is a separate concern). For label wrapping
 * of custom controls, use `Field` directly.
 *
 * Provides direction context to children via `FormLayoutContext`.
 * Supports nesting — a horizontal layout inside a vertical layout works naturally.
 *
 * @example
 * ```
 * <FormLayout>
 *   <TextInput label="Name" value={name} onChange={setName} />
 *   <TextInput label="Email" value={email} onChange={setEmail} />
 * </FormLayout>
 * ```
 */
export function FormLayout({
  children,
  direction = 'vertical',
  xstyle,
  className,
  style,
  ref,
  ...props
}: FormLayoutProps) {
  const contextValue = useMemo(() => ({direction}), [direction]);

  return (
    <FormLayoutContext value={contextValue}>
      <div
        ref={ref}
        {...mergeProps(
          themeProps('form-layout', {direction}),
          stylex.props(
            styles.base,
            direction === 'horizontal' && styles.horizontal,
            direction === 'horizontal-labels' && styles.horizontalLabels,
            xstyle,
          ),
          className,
          style,
        )}
        {...props}>
        {children}
      </div>
    </FormLayoutContext>
  );
}

FormLayout.displayName = 'FormLayout';
