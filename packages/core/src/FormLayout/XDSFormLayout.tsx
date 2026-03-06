/**
 * @file XDSFormLayout.tsx
 * @input Uses React forwardRef, XDSFormLayoutContext, StyleX
 * @output Exports XDSFormLayout component and XDSFormLayoutProps
 * @position Core implementation; consumed by index.ts, tested by XDSFormLayout.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FormLayout/README.md (props table, features, implementation notes)
 * - /packages/core/src/FormLayout/XDSFormLayout.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/FormLayout/index.ts (exports if types change)
 * - /apps/storybook/stories/FormLayout.stories.tsx (storybook stories)
 */

'use client';

import {forwardRef, useMemo, type HTMLAttributes, type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {
  XDSFormLayoutContext,
  type XDSFormLayoutDirection,
} from './XDSFormLayoutContext';

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
    flexDirection: 'row',
    flexWrap: 'wrap',
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

export interface XDSFormLayoutProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'style' | 'className'
> {
  /**
   * Form fields to arrange. Accepts XDS inputs (XDSTextInput, XDSSelector, etc.)
   * and XDSField-wrapped custom controls.
   */
  children?: ReactNode;

  /**
   * Direction of field arrangement.
   *
   * - `'vertical'` — Fields stack top-to-bottom (default). Most common.
   * - `'horizontal'` — Fields arrange left-to-right, wrapping when needed.
   *   Each child gets equal flex-grow.
   * - `'horizontal-labels'` — CSS Grid with labels to the left of inputs.
   *   Collapses to vertical on narrow viewports (≤480px).
   *
   * @default 'vertical'
   */
  direction?: XDSFormLayoutDirection;

  /**
   * StyleX styles to apply to the layout container.
   */
  xstyle?: StyleXStyles;

  /**
   * Test ID for the root element.
   */
  'data-testid'?: string;
}

// =============================================================================
// Component
// =============================================================================

/**
 * Spatial layout container for form fields.
 *
 * Arranges form fields with consistent spacing and direction. Renders a `<div>`
 * (not a `<form>` — form submission is a separate concern). For label wrapping
 * of custom controls, use `XDSField` directly.
 *
 * Provides direction context to children via `XDSFormLayoutContext`.
 * Supports nesting — a horizontal layout inside a vertical layout works naturally.
 *
 * @example
 * ```tsx
 * // Vertical (default) — simple form
 * <XDSFormLayout>
 *   <XDSTextInput label="Name" value={name} onChange={setName} />
 *   <XDSTextInput label="Email" value={email} onChange={setEmail} />
 * </XDSFormLayout>
 *
 * // Horizontal — related fields side by side
 * <XDSFormLayout direction="horizontal">
 *   <XDSTextInput label="First Name" value={first} onChange={setFirst} />
 *   <XDSTextInput label="Last Name" value={last} onChange={setLast} />
 * </XDSFormLayout>
 *
 * // Horizontal labels — settings panel pattern
 * <XDSFormLayout direction="horizontal-labels">
 *   <XDSTextInput label="Display Name" value={name} onChange={setName} />
 *   <XDSSelector label="Timezone" value={tz} onChange={setTz} options={tzs} />
 * </XDSFormLayout>
 *
 * // Dialog composition via HTML form attribute
 * <form id="edit-form" onSubmit={handleSubmit}>
 *   <XDSFormLayout>
 *     <XDSTextInput label="Name" value={name} onChange={setName} />
 *   </XDSFormLayout>
 * </form>
 * <XDSButton label="Save" type="submit" form="edit-form" />
 * ```
 */
export const XDSFormLayout = forwardRef<HTMLDivElement, XDSFormLayoutProps>(
  function XDSFormLayout(
    {children, direction = 'vertical', xstyle, ...props},
    ref,
  ) {
    const contextValue = useMemo(() => ({direction}), [direction]);

    return (
      <XDSFormLayoutContext.Provider value={contextValue}>
        <div
          ref={ref}
          {...stylex.props(
            styles.base,
            direction === 'horizontal' && styles.horizontal,
            direction === 'horizontal-labels' && styles.horizontalLabels,
            xstyle,
          )}
          {...props}>
          {children}
        </div>
      </XDSFormLayoutContext.Provider>
    );
  },
);

XDSFormLayout.displayName = 'XDSFormLayout';
