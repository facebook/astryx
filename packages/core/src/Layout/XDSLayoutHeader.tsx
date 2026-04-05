'use client';

/**
 * @file XDSLayoutHeader.tsx
 * @input Uses React StyleX
 * @output Exports XDSLayoutHeader component and XDSLayoutHeaderProps
 * @position Top bar / header area for XDSLayout. Use for page titles, app bars,
 *   toolbar areas, or any fixed-height content at the top of a layout.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Layout/Layout.doc.mjs
 * - /apps/storybook/stories/Layout.stories.tsx
 */

import type {AriaRole, ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import {useContext} from 'react';
import * as stylex from '@stylexjs/stylex';
import {XDSLayoutDividerContext} from './XDSLayoutDividerContext';
import {colorVars, spacingVars} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import type {SpacingStep} from '../utils/types';
import {paddingStyles, containerPaddingInlineVarStyles} from './padding.stylex';

const styles = stylex.create({
  // Outer shell: owns border/divider and sizing. No padding — that lives on inner.
  header: {
    flexShrink: 0,
  },
  // Inner wrapper: owns padding and optional content-width constraint.
  // When --layout-content-width is not set, maxWidth defaults to 'none' (inert).
  inner: {
    boxSizing: 'border-box',
    maxWidth: 'var(--layout-content-width, none)',
    marginInline: 'auto',
    // Default: outer padding on edges that touch container, inner on interior edges
    paddingInlineStart: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    paddingInlineEnd: `var(--layout-padding-outer-x, ${spacingVars['--spacing-4']})`,
    paddingBlockStart: `var(--layout-padding-outer-y, ${spacingVars['--spacing-4']})`,
    paddingBlockEnd: `var(--layout-padding-inner-y, ${spacingVars['--spacing-4']})`,
  },
  fullBleed: {
    paddingInlineStart: 0,
    paddingInlineEnd: 0,
    paddingBlockStart: 0,
    paddingBlockEnd: 0,
  },
  divider: {
    borderBlockEndWidth: 1,
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: colorVars['--color-border'],
  },
});

// Dynamic styles for sizing props
const dynamicStyles = stylex.create({
  sizing: (height: number | string | null) => ({
    height,
  }),
});

export interface XDSLayoutHeaderProps extends XDSBaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLElement>;
  /**
   * Content to render inside the header.
   */
  children?: ReactNode;

  /**
   * Adds a themed border at the bottom edge.
   * When false, spacing collapse is applied automatically for seamless visual flow.
   * When not set, falls back to the parent XDSLayout's `defaultHasDividers`, then `false`.
   * @default false
   */
  hasDivider?: boolean;

  /**
   * Height of the header.
   * Numbers are treated as pixels, strings are used as-is.
   */
  height?: number | string;

  /**
   * Internal padding of the header using the spacing scale.
   * Accepts numeric spacing steps: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
   * Overrides the default padding from the layout container.
   */
  padding?: SpacingStep;

  /**
   * Accessible label for the landmark.
   * Required when role is set and multiple landmarks of the same type exist.
   */
  label?: string;

  /**
   * ARIA landmark role for accessibility.
   * Use 'banner' only for site-wide headers (not in nested layouts).
   */
  role?: AriaRole;
}

/**
 * Top bar / header for XDSLayout. Use for page titles, app bars, or toolbars.
 * Renders in the header slot with optional divider and padding control.
 *
 * Already provides its own padding — don't add padding to children.
 * Use `padding={0}` if your content manages its own padding (e.g. XDSTopNav).
 *
 * @example
 * ```
 * <XDSLayoutContainer variant="card">
 *   <XDSLayout
 *     header={<XDSLayoutHeader hasDivider>Page Title</XDSLayoutHeader>}
 *     content={<XDSLayoutContent>...</XDSLayoutContent>}
 *   />
 * </XDSLayoutContainer>
 * ```
 */
export function XDSLayoutHeader({
  children,
  hasDivider,
  height,
  label,
  padding,
  role,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSLayoutHeaderProps) {
  const dividerCtx = useContext(XDSLayoutDividerContext);
  const resolvedHasDivider =
    hasDivider ?? dividerCtx?.defaultHasDividers ?? false;
  const isZeroPadding = padding === 0;

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      role={role}
      aria-label={label}
      data-divider={resolvedHasDivider || undefined}
      {...mergeProps(
        xdsClassName('layout-header'),
        stylex.props(
          styles.header,
          dynamicStyles.sizing(height ?? null),
          resolvedHasDivider && styles.divider,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      <div
        {...stylex.props(
          styles.inner,
          isZeroPadding && styles.fullBleed,
          padding != null && paddingStyles[padding],
          padding != null && containerPaddingInlineVarStyles[padding],
        )}>
        {children}
      </div>
    </div>
  );
}

XDSLayoutHeader.displayName = 'XDSLayoutHeader';
