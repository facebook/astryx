/**
 * @file XDSAvatarStatusDot.tsx
 * @input Uses React, StyleX, theme tokens, and XDSAvatarSizeContext
 * @output Exports XDSAvatarStatusDot component and XDSAvatarStatusDotProps type
 * @position Sub-component of XDSAvatar; renders a size-aware status indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/Avatar.doc.mjs (features, files table)
 * - /packages/core/src/Avatar/index.ts (exports)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 */

'use client';

import {useContext, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {XDSAvatarSizeContext} from './XDSAvatarSizeContext';
import {xdsClassName, mergeProps} from '../utils';

/**
 * Resolves the status dot size, border width, and icon size based on the
 * avatar size.
 *
 * Uses discrete size tiers rather than a continuous ratio so the dot
 * looks intentional at every avatar size:
 *
 *   | Avatar size  | Dot  | Border | Icon |
 *   |--------------|------|--------|------|
 *   | ≤ 36px       | 8px  | 1px    | —    |
 *   | 40–72px      | 16px | 2px    | 10px |
 *   | ≥ 96px       | 24px | 4px    | 14px |
 *
 * Icons are not rendered at the smallest tier — there isn't enough
 * room for them to be legible.
 */
function resolveStatusDotSize(avatarSize: number): {
  dotSize: number;
  borderWidth: number;
  iconSize: number;
} {
  if (avatarSize <= 36) {
    return {dotSize: 8, borderWidth: 1, iconSize: 0};
  }
  if (avatarSize <= 72) {
    return {dotSize: 16, borderWidth: 2, iconSize: 10};
  }
  return {dotSize: 24, borderWidth: 4, iconSize: 14};
}

export type XDSAvatarStatusDotVariant = 'positive' | 'neutral' | 'negative';

export interface XDSAvatarStatusDotProps extends XDSBaseProps<HTMLSpanElement> {
  /**
   * The semantic color variant of the dot.
   * - `positive` — green dot (e.g. online, accepted)
   * - `neutral` — gray dot (e.g. offline, pending)
   * - `negative` — red dot (e.g. busy, rejected)
   *
   * Matches the `variant` convention from `XDSStatusDot`.
   * @default 'positive'
   */
  variant?: XDSAvatarStatusDotVariant;
  /**
   * Accessible label for the status dot.
   * Describes the meaning of the indicator for screen readers
   * (e.g. "Online", "Accepted", "John Doe is busy").
   */
  label?: string;
  /**
   * Optional icon to render centered inside the dot.
   * Accepts any ReactNode (typically an SVG icon).
   * The icon is automatically sized to fit the dot and hidden
   * at the smallest avatar sizes where there isn't enough room.
   *
   * @example
   * ```
   * <XDSAvatarStatusDot variant="positive" label="Verified" icon={<CheckIcon />} />
   * ```
   */
  icon?: ReactNode;
}

const styles = stylex.create({
  dot: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: colorVars['--color-surface'],
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positive: {
    backgroundColor: colorVars['--color-positive'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
  negative: {
    backgroundColor: colorVars['--color-negative'],
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colorVars['--color-surface'],
    lineHeight: 0,
  },
});

const dynamicStyles = stylex.create({
  size: (dotSize: number, borderWidth: number) => ({
    width: dotSize,
    height: dotSize,
    borderWidth,
  }),
  iconSize: (size: number) => ({
    width: size,
    height: size,
  }),
});

const variantStyleMap: Record<XDSAvatarStatusDotVariant, stylex.StyleXStyles> =
  {
    positive: styles.positive,
    neutral: styles.neutral,
    negative: styles.negative,
  };

/**
 * A status indicator dot that automatically scales to match the parent
 * XDSAvatar's size.
 *
 * Must be used inside an XDSAvatar's `status` prop so it can read
 * the avatar size from context.
 *
 * @example
 * ```
 * // Presence indicator
 * <XDSAvatar
 *   name="John Doe"
 *   size="medium"
 *   status={<XDSAvatarStatusDot variant="positive" label="Online" />}
 * />
 *
 * // With icon (e.g. verified badge)
 * <XDSAvatar
 *   name="Jane Smith"
 *   size="large"
 *   status={<XDSAvatarStatusDot variant="positive" label="Verified" icon={<CheckIcon />} />}
 * />
 * ```
 */
export function XDSAvatarStatusDot({
  variant = 'positive',
  label,
  icon,
  className,
  style,
  ...props
}: XDSAvatarStatusDotProps) {
  const avatarSize = useContext(XDSAvatarSizeContext);
  const {dotSize, borderWidth, iconSize} = resolveStatusDotSize(avatarSize);

  return (
    <div
      {...(label ? {'aria-label': label} : undefined)}
      {...mergeProps(
        xdsClassName('avatar-status-dot', {variant}),
        stylex.props(
          styles.dot,
          variantStyleMap[variant],
          dynamicStyles.size(dotSize, borderWidth),
        ),
        className,
        style,
      )}
      {...props}>
      {icon && iconSize > 0 && (
        <span
          aria-hidden="true"
          {...stylex.props(styles.icon, dynamicStyles.iconSize(iconSize))}>
          {icon}
        </span>
      )}
    </div>
  );
}
