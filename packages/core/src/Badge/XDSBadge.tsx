/**
 * @file XDSBadge.tsx
 * @input Uses React forwardRef, HTMLAttributes
 * @output Exports XDSBadge component, XDSBadgeProps, XDSBadgeVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Badge/Badge.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Badge/XDSBadge.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Badge/index.ts (exports if types change)
 * - /apps/storybook/stories/Badge.stories.tsx (storybook stories)
 */

'use client';

import {forwardRef, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Base badge styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacingVars['--spacing-1'],
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-rounded'],
    fontFamily: 'inherit',
    fontSize: textSizeVars['--text-xsm'],
    lineHeight: lineHeightVars['--leading-snug'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    letterSpacing: '-0.24px',
    whiteSpace: 'nowrap',
  },
  dot: {
    paddingBlock: spacingVars['--spacing-1'],
    paddingInline: spacingVars['--spacing-1'],
  },
});

/**
 * Variant styles for different badge appearances
 */
const variants = stylex.create({
  neutral: {
    backgroundColor: colorVars['--color-deemphasized'],
    color: colorVars['--color-text-primary'],
  },
  info: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-media'],
  },
  success: {
    backgroundColor: colorVars['--color-positive'],
    color: colorVars['--color-text-on-media'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-text-primary'],
  },
  error: {
    backgroundColor: colorVars['--color-negative'],
    color: colorVars['--color-text-on-media'],
  },
});

/**
 * Badge variant type derived from the variants StyleX object
 */
export type XDSBadgeVariant = keyof typeof variants;

export interface XDSBadgeProps extends XDSBaseProps<HTMLSpanElement> {
  /**
   * The visual style variant of the badge.
   * @default 'neutral'
   */
  variant?: XDSBadgeVariant;
  /**
   * The content to display in the badge.
   * If omitted, renders as a small dot indicator.
   */
  children?: ReactNode;
  /**
   * Optional icon to display before the label.
   */
  icon?: ReactNode;
}

/**
 * A badge component for displaying status indicators, counts, or labels.
 *
 * Styles use XDS theme tokens via StyleX.
 * Wrap your app in <Theme> to apply a theme.
 *
 * @example
 * ```
 * <XDSBadge>Default</XDSBadge>
 * <XDSBadge variant="success">Active</XDSBadge>
 * <XDSBadge variant="error">3</XDSBadge>
 * <XDSBadge variant="info" /> // Dot indicator
 * ```
 */
export const XDSBadge = forwardRef<HTMLSpanElement, XDSBadgeProps>(
  ({variant = 'neutral', children, icon, className, style, ...props}, ref) => {
    const isDot = children == null && icon == null;

    return (
      <span
        ref={ref}
        {...mergeProps(
          xdsClassName('badge', {variant}),
          stylex.props(styles.base, variants[variant], isDot && styles.dot),
          className,
          style,
        )}
        {...props}>
        {icon}
        {children}
      </span>
    );
  },
);

XDSBadge.displayName = 'XDSBadge';
