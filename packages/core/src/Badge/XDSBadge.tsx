'use client';

/**
 * @file XDSBadge.tsx
 * @input Uses React, HTMLAttributes
 * @output Exports XDSBadge component, XDSBadgeProps, XDSBadgeVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Badge/Badge.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Badge/XDSBadge.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Badge/index.ts (exports if types change)
 * - /apps/storybook/stories/Badge.stories.tsx (storybook stories)
 */


import {type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  fontWeightVars,
  lineHeightVars,
  typeScaleVars,
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
    height: spacingVars['--spacing-5'],
    paddingBlock: 0,
    paddingInline: spacingVars['--spacing-2'],
    borderRadius: radiusVars['--radius-rounded'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: lineHeightVars['--leading-tight'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
  },
  dot: {
    paddingInline: spacingVars['--spacing-1'],
  },
});

/**
 * Variant styles for different badge appearances
 */
const variants = stylex.create({
  neutral: {
    backgroundColor: colorVars['--color-secondary'],
    color: colorVars['--color-text-primary'],
  },
  info: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-text-on-dark-media'],
  },
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-text-on-dark-media'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-text-primary'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-text-on-dark-media'],
  },
});

/**
 * Extensible variant map for XDSBadge.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/Badge' {
 *   interface XDSBadgeVariantMap {
 *     'premium': true;
 *   }
 * }
 * ```
 */
export interface XDSBadgeVariantMap {
  neutral: true;
  info: true;
  success: true;
  warning: true;
  error: true;
}

/**
 * Badge variant type derived from XDSBadgeVariantMap.
 * Extensible via module augmentation of XDSBadgeVariantMap.
 */
export type XDSBadgeVariant = keyof XDSBadgeVariantMap;

export interface XDSBadgeProps extends XDSBaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The visual style variant of the badge.
   * @default 'neutral'
   */
  variant?: XDSBadgeVariant;
  /**
   * The content to display in the badge.
   * If omitted (and no icon), renders as a small dot indicator.
   */
  label?: ReactNode;

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
 * <XDSBadge label="Default" />
 * <XDSBadge variant="success" label="Active" />
 * <XDSBadge variant="error" label="3" />
 * <XDSBadge variant="info" />
 * ```
 */
export function XDSBadge({
  variant = 'neutral',
  label,
  icon,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSBadgeProps) {
  const isDot = label == null && icon == null;

  return (
    <span
      ref={ref}
      {...mergeProps(
        xdsClassName('badge', {variant}),
        stylex.props(
          styles.base,
          variants[variant],
          isDot && styles.dot,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}>
      {icon}
      {label}
    </span>
  );
}

XDSBadge.displayName = 'XDSBadge';
