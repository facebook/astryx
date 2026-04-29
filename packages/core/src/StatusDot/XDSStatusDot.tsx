'use client';

/**
 * @file XDSStatusDot.tsx
 * @input Uses React
 * @output Exports XDSStatusDot component, XDSStatusDotProps, XDSStatusDotVariant types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/StatusDot/StatusDot.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/StatusDot/XDSStatusDot.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/StatusDot/index.ts (exports if types change)
 * - /apps/storybook/stories/StatusDot.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/StatusDot/ (showcase blocks)
 */

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {XDSBaseProps} from '../XDSBaseProps';
import {xdsClassName, mergeProps} from '../utils';

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
  positive: {
    backgroundColor: colorVars['--color-success'],
  },
  warning: {
    backgroundColor: colorVars['--color-warning'],
  },
  negative: {
    backgroundColor: colorVars['--color-error'],
  },
  info: {
    backgroundColor: colorVars['--color-accent'],
  },
  neutral: {
    backgroundColor: colorVars['--color-neutral'],
  },
});

/**
 * Extensible variant map for XDSStatusDot.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@xds/core/StatusDot' {
 *   interface XDSStatusDotVariantMap {
 *     'critical': true;
 *   }
 * }
 * ```
 */
export interface XDSStatusDotVariantMap {
  positive: true;
  warning: true;
  negative: true;
  info: true;
  neutral: true;
}

/**
 * Status dot variant type derived from XDSStatusDotVariantMap.
 * Extensible via module augmentation of XDSStatusDotVariantMap.
 */
export type XDSStatusDotVariant = keyof XDSStatusDotVariantMap;

export interface XDSStatusDotProps extends XDSBaseProps<HTMLSpanElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * The semantic color variant.
   */
  variant: XDSStatusDotVariant;
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
}

/**
 * A small colored dot indicator for status display (online/offline, severity, etc).
 *
 * Fixed 8px size. Renders as a non-focusable `<span>` with `role="img"` and
 * `aria-label` for accessibility. Styles use XDS theme tokens via StyleX.
 * Wrap your app in `<Theme>` to apply a theme.
 *
 * @example
 * ```
 * <XDSStatusDot variant="positive" label="Online" />
 * <XDSStatusDot variant="negative" label="Offline" />
 * <XDSStatusDot variant="positive" label="Live" isPulsing />
 * ```
 */
export function XDSStatusDot({
  variant,
  label,
  isPulsing = false,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSStatusDotProps) {
  return (
    <span
      ref={ref}
      role="img"
      aria-label={label}
      {...mergeProps(
        xdsClassName('statusdot', {variant}),
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
}

XDSStatusDot.displayName = 'XDSStatusDot';
