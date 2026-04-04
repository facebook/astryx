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
    borderRadius: radiusVars['--radius-full'],
    fontFamily: 'inherit',
    fontSize: typeScaleVars['--text-supporting-size'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    whiteSpace: 'nowrap',
  },
});

/**
 * Variant styles for different badge appearances.
 * Semantic variants use solid backgrounds; non-semantic use tinted backgrounds.
 */
const variants = stylex.create({
  // Semantic variants
  neutral: {
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-primary'],
  },
  info: {
    backgroundColor: colorVars['--color-accent'],
    color: colorVars['--color-on-accent'],
  },
  success: {
    backgroundColor: colorVars['--color-success'],
    color: colorVars['--color-on-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
    color: colorVars['--color-on-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
    color: colorVars['--color-on-error'],
  },
  // Non-semantic color variants — tinted backgrounds with colored text
  blue: {
    backgroundColor: colorVars['--color-background-blue'],
    color: colorVars['--color-text-blue'],
  },
  cyan: {
    backgroundColor: colorVars['--color-background-cyan'],
    color: colorVars['--color-text-cyan'],
  },
  green: {
    backgroundColor: colorVars['--color-background-green'],
    color: colorVars['--color-text-green'],
  },
  orange: {
    backgroundColor: colorVars['--color-background-orange'],
    color: colorVars['--color-text-orange'],
  },
  pink: {
    backgroundColor: colorVars['--color-background-pink'],
    color: colorVars['--color-text-pink'],
  },
  purple: {
    backgroundColor: colorVars['--color-background-purple'],
    color: colorVars['--color-text-purple'],
  },
  red: {
    backgroundColor: colorVars['--color-background-red'],
    color: colorVars['--color-text-red'],
  },
  teal: {
    backgroundColor: colorVars['--color-background-teal'],
    color: colorVars['--color-text-teal'],
  },
  yellow: {
    backgroundColor: colorVars['--color-background-yellow'],
    color: colorVars['--color-text-yellow'],
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
  blue: true;
  cyan: true;
  green: true;
  orange: true;
  pink: true;
  purple: true;
  red: true;
  teal: true;
  yellow: true;
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
   * The badge label text.
   */
  label: ReactNode;

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
 * <XDSBadge label="Active" />
 * <XDSBadge variant="success" label="Active" />
 * <XDSBadge variant="error" label="3" />
 * <XDSBadge variant="purple" label="Engineering" />
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
  return (
    <span
      ref={ref}
      {...mergeProps(
        xdsClassName('badge', {variant}),
        stylex.props(styles.base, variants[variant], xstyle),
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
