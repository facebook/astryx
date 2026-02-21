/**
 * @file XDSAvatarStatusDot.tsx
 * @input Uses React, StyleX, theme tokens, and XDSAvatarSizeContext
 * @output Exports XDSAvatarStatusDot component and XDSAvatarStatusDotProps type
 * @position Sub-component of XDSAvatar; renders a size-aware status indicator
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/README.md (features, files table)
 * - /packages/core/src/Avatar/index.ts (exports)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 */

import {useContext, type HTMLAttributes} from 'react';
import * as stylex from '@stylexjs/stylex';
import {colorVars} from '../theme/tokens.stylex';
import {XDSAvatarSizeContext} from './XDSAvatarSizeContext';

/**
 * Resolves the status dot size and border width based on the avatar size.
 *
 * Uses discrete size tiers rather than a continuous ratio so the dot
 * looks intentional at every avatar size:
 *
 *   | Avatar size  | Dot  | Border |
 *   |--------------|------|--------|
 *   | ≤ 36px       | 8px  | 1px    |
 *   | 40–72px      | 16px | 2px    |
 *   | ≥ 96px       | 24px | 4px    |
 */
function resolveStatusDotSize(avatarSize: number): {
  dotSize: number;
  borderWidth: number;
} {
  if (avatarSize <= 36) {
    return {dotSize: 8, borderWidth: 1};
  }
  if (avatarSize <= 72) {
    return {dotSize: 16, borderWidth: 2};
  }
  return {dotSize: 24, borderWidth: 4};
}

export type XDSAvatarStatusDotStatus = 'online' | 'offline' | 'busy';

export interface XDSAvatarStatusDotProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> {
  /**
   * The status to display.
   * - `online` — green dot
   * - `offline` — gray dot
   * - `busy` — red dot
   * @default 'online'
   */
  status?: XDSAvatarStatusDotStatus;
  /**
   * Accessible label for the status dot.
   * When omitted, falls back to the `status` value (e.g. "online").
   * Prefer a descriptive label like "John Doe is online" for better a11y.
   */
  label?: string;
}

const styles = stylex.create({
  dot: {
    borderRadius: '50%',
    borderStyle: 'solid',
    borderColor: colorVars['--color-surface'],
    boxSizing: 'border-box',
  },
  online: {
    backgroundColor: colorVars['--color-positive'],
  },
  offline: {
    backgroundColor: colorVars['--color-text-secondary'],
  },
  busy: {
    backgroundColor: colorVars['--color-negative'],
  },
});

const dynamicStyles = stylex.create({
  size: (dotSize: number, borderWidth: number) => ({
    width: dotSize,
    height: dotSize,
    borderWidth,
  }),
});

const statusStyleMap: Record<XDSAvatarStatusDotStatus, stylex.StyleXStyles> = {
  online: styles.online,
  offline: styles.offline,
  busy: styles.busy,
};

/**
 * A status indicator dot that automatically scales to match the parent
 * XDSAvatar's size.
 *
 * Must be used inside an XDSAvatar's `status` prop so it can read
 * the avatar size from context.
 *
 * @example
 * ```tsx
 * <XDSAvatar
 *   name="John Doe"
 *   size="medium"
 *   status={<XDSAvatarStatusDot status="online" label="John Doe is online" />}
 * />
 * ```
 */
export function XDSAvatarStatusDot({
  status = 'online',
  label,
  ...props
}: XDSAvatarStatusDotProps) {
  const avatarSize = useContext(XDSAvatarSizeContext);
  const {dotSize, borderWidth} = resolveStatusDotSize(avatarSize);

  return (
    <div
      aria-label={label ?? status}
      {...stylex.props(
        styles.dot,
        statusStyleMap[status],
        dynamicStyles.size(dotSize, borderWidth),
      )}
      {...props}
    />
  );
}
