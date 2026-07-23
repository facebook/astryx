// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AvatarStatusDot.tsx
 * @input Uses React, StyleX, theme tokens, and AvatarSizeContext
 * @output Exports AvatarStatusDot component and AvatarStatusDotProps type
 * @position Sub-component of Avatar; renders a size-aware status indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/Avatar.doc.mjs (features, files table)
 * - /packages/core/src/Avatar/index.ts (exports)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Avatar/ (showcase blocks)
 */

import React, {use, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {colorVars, radiusVars} from '../theme/tokens.stylex';
import {AvatarSizeContext} from './AvatarSizeContext';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * Resolves the status dot size, border width, and icon size based on the
 * avatar size.
 *
 * Uses discrete size tiers rather than a continuous ratio so the dot
 * looks intentional at every avatar size:
 *
 *   | Avatar size  | Dot  | Border | Icon |
 *   |--------------|------|--------|------|
 *   | ≤ 36px       | 10px | 1px    | —    |
 *   | 40–72px      | 20px | 2px    | 12px |
 *   | ≥ 96px       | 32px | 4px    | 18px |
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
    return {dotSize: 10, borderWidth: 1, iconSize: 0};
  }
  if (avatarSize <= 72) {
    return {dotSize: 20, borderWidth: 2, iconSize: 12};
  }
  return {dotSize: 32, borderWidth: 4, iconSize: 18};
}

/**
 * Extensible variant map for AvatarStatusDot.
 *
 * Theme packages can add custom variants via TypeScript module augmentation:
 * @example
 * ```
 * declare module '@astryxdesign/core/Avatar' {
 *   interface AvatarStatusDotVariantMap {
 *     'away': true;
 *   }
 * }
 * ```
 */
export interface AvatarStatusDotVariantMap {
  success: true;
  neutral: true;
  error: true;
}

/**
 * AvatarStatusDot variant type. Extensible via module augmentation of AvatarStatusDotVariantMap.
 */
export type AvatarStatusDotVariant = keyof AvatarStatusDotVariantMap;

export interface AvatarStatusDotProps extends BaseProps<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The semantic color variant of the dot.
   * - `success` — green dot (e.g. online, accepted)
   * - `neutral` — gray dot (e.g. offline, pending)
   * - `error` — red dot (e.g. busy, rejected)
   *
   * Matches the `variant` convention from `StatusDot`.
   * @default 'success'
   */
  variant?: AvatarStatusDotVariant;
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
   * <AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />
   * ```
   */
  icon?: ReactNode;
}

const styles = stylex.create({
  dot: {
    borderRadius: radiusVars['--radius-full'],
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  success: {
    backgroundColor: colorVars['--color-success'],
  },
  neutral: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
  error: {
    backgroundColor: colorVars['--color-error'],
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colorVars['--color-background-surface'],
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

const variantStyleMap: Partial<
  Record<AvatarStatusDotVariant, stylex.StyleXStyles>
> = {
  success: styles.success,
  neutral: styles.neutral,
  error: styles.error,
};

/**
 * A status indicator dot that automatically scales to match the parent
 * Avatar's size.
 *
 * Must be used inside an Avatar's `status` prop so it can read
 * the avatar size from context.
 *
 * @example
 * ```
 * <Avatar
 *   name="John Doe"
 *   size="lg"
 *   status={<AvatarStatusDot variant="success" label="Online" />}
 * />
 * <Avatar
 *   name="Jane Smith"
 *   size="xl"
 *   status={<AvatarStatusDot variant="success" label="Verified" icon={<CheckIcon />} />}
 * />
 * ```
 */
export function AvatarStatusDot({
  ref,
  variant = 'success',
  label,
  icon,
  xstyle,
  className,
  style,
  ...props
}: AvatarStatusDotProps) {
  const avatarSize = use(AvatarSizeContext);
  const {dotSize, borderWidth, iconSize} = resolveStatusDotSize(avatarSize);

  return (
    <div
      {...props}
      ref={ref}
      {...(label ? {role: 'img', 'aria-label': label} : undefined)}
      {...mergeProps(
        themeProps('avatar-status-dot', {variant}),
        stylex.props(
          styles.dot,
          variantStyleMap[variant],
          dynamicStyles.size(dotSize, borderWidth),
          xstyle,
        ),
        className,
        style,
      )}>
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

AvatarStatusDot.displayName = 'AvatarStatusDot';
