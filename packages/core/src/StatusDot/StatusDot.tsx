// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file StatusDot.tsx
 * @input Uses React
 * @output Exports StatusDot component, StatusDotProps, StatusDotVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/StatusDot/StatusDot.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/StatusDot/StatusDot.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/StatusDot/index.ts (exports if types change)
 * - /apps/storybook/stories/StatusDot.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/StatusDot/ (showcase blocks)
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import type {BaseProps} from '../BaseProps';
import {Tooltip} from '../Tooltip/Tooltip';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Pulse animation keyframes
 */
const pulseKeyframes = stylex.keyframes({
  '0%': {opacity: 1},
  '50%': {opacity: 0.5},
  '100%': {opacity: 1},
});

/**
 * Base styles
 */
const styles = stylex.create({
  base: {
    display: 'inline-block',
    borderRadius: '50%',
    flexShrink: 0,
    width: '8px',
    height: '8px',
  },
  pulsing: {
    animationName: pulseKeyframes,
    animationDuration: '2s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite',
  },
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      animationName: 'none',
    },
  },
});

/**
 * Variant styles mapping to theme color tokens
 */
const variants = stylex.create({
  success: {
    backgroundColor: colorVars['--color-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
  },
  accent: {
    backgroundColor: colorVars['--color-accent'],
  },
  neutral: {
    backgroundColor: colorVars['--color-icon-secondary'],
  },
});

/**
 * Extensible variant map for StatusDot.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/StatusDot' {
 *   interface StatusDotVariantMap {
 *     'critical': true;
 *   }
 * }
 * ```
 */
export interface StatusDotVariantMap {
  success: true;
  warning: true;
  error: true;
  accent: true;
  neutral: true;
}

/**
 * Status dot variant type derived from StatusDotVariantMap.
 * Extensible via module augmentation of StatusDotVariantMap.
 */
export type StatusDotVariant = keyof StatusDotVariantMap;

export interface StatusDotProps extends BaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The semantic color variant.
   */
  variant: StatusDotVariant;
  /**
   * Accessible label describing the status. Required for a11y.
   */
  label: string;
  /**
   * Whether the dot should pulse to indicate activity.
   * Respects `prefers-reduced-motion`.
   * @default false
   */
  isPulsing?: boolean;
  /**
   * Tooltip text shown on hover to explain the status meaning.
   * When omitted, no tooltip is rendered.
   */
  tooltip?: string;
}

/**
 * A small colored dot indicator for status display (online/offline, severity, etc).
 *
 * Fixed 8px size. Renders as a non-focusable `<span>` with `role="img"` and
 * `aria-label` for accessibility. Styles use Astryx theme tokens via StyleX.
 * Wrap your app in `<Theme>` to apply a theme.
 *
 * @example
 * ```
 * <StatusDot variant="success" label="Online" />
 * <StatusDot variant="error" label="Offline" />
 * <StatusDot variant="success" label="Live" isPulsing />
 * <StatusDot variant="success" label="Online" tooltip="Online" />
 * ```
 */
export function StatusDot({
  variant,
  label,
  isPulsing = false,
  tooltip,
  xstyle,
  className,
  style,
  ref,
  ...props
}: StatusDotProps) {
  const dot = (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      {...mergeProps(
        themeProps('statusdot', {variant}),
        stylex.props(
          styles.base,
          variants[variant],
          isPulsing && styles.pulsing,
          isPulsing && styles.reducedMotion,
          xstyle,
        ),
        className,
        style,
      )}
      {...props}
    />
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{dot}</Tooltip>;
  }

  return dot;
}

StatusDot.displayName = 'StatusDot';
