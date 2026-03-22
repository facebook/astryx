'use client';

/**
 * @file XDSFormLayout.tsx
 * @input Uses React, XDSFormLayoutContext, StyleX
 * @output Exports XDSFormLayout component and XDSFormLayoutProps
 * @position Core implementation; consumed by index.ts, tested by XDSFormLayout.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/FormLayout/README.md (props table, features, implementation notes)
 * - /packages/core/src/FormLayout/XDSFormLayout.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/FormLayout/index.ts (exports if types change)
 * - /apps/storybook/stories/FormLayout.stories.tsx (storybook stories)
 */


import {useMemo, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {spacingVars} from '../theme/tokens.stylex';
import {
  XDSFormLayoutContext,
  type XDSFormLayoutDirection,
} from './XDSFormLayoutContext';
import {xdsClassName, mergeProps} from '../utils';

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

export interface XDSFormLayoutProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
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
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;

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
 * ```
 * <XDSFormLayout>
 *   <XDSTextInput label="Name" value={name} onChange={setName} />
 *   <XDSTextInput label="Email" value={email} onChange={setEmail} />
 * </XDSFormLayout>
 * ```
 */
export function XDSFormLayout({
  children,
  direction = 'vertical',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSFormLayoutProps) {
  const contextValue = useMemo(() => ({direction}), [direction]);

  return (
    <XDSFormLayoutContext.Provider value={contextValue}>
      <div
        ref={ref}
        {...mergeProps(
          xdsClassName('form-layout', {direction}),
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
    </XDSFormLayoutContext.Provider>
  );
}

XDSFormLayout.displayName = 'XDSFormLayout';
