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
  dot: {
    width: spacingVars['--spacing-2'],
    height: spacingVars['--spacing-2'],
    paddingInline: 0,
    paddingBlock: 0,
    borderRadius: '50%',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
});

/**
 * Variant styles for different badge appearances
 */
const variants = stylex.create({
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
   * The badge label. Displayed as visible text for pill badges.
   * Used as the accessible name (visually hidden) for dot badges.
   */
  label: ReactNode;

  /**
   * Optional icon to display before the label.
   */
  icon?: ReactNode;

  /**
   * Visual shape of the badge.
   * - `'pill'`: Default rounded pill shape for text/icon content
   * - `'dot'`: Small circular indicator with no content
   *
   * When using `shape="dot"`, the `label` is rendered as visually hidden
   * text for screen reader accessibility.
   * @default 'pill'
   *
   * @example
   * ```
   * <XDSBadge variant="error" shape="dot" label="Unread" />
   * ```
   */
  shape?: 'pill' | 'dot';
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
 * <XDSBadge variant="info" shape="dot" label="New" />
 * ```
 */
export function XDSBadge({
  variant = 'neutral',
  label,
  icon,
  shape = 'pill',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSBadgeProps) {
  const isDot = shape === 'dot';

  return (
    <span
      ref={ref}
      {...mergeProps(
        xdsClassName('badge', {variant, shape}),
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
      {isDot && <span {...stylex.props(styles.visuallyHidden)}>{label}</span>}
      {!isDot && icon}
      {!isDot && label}
    </span>
  );
}

XDSBadge.displayName = 'XDSBadge';
