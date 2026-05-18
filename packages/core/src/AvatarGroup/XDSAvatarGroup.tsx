// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file XDSAvatarGroup.tsx
 * @input Uses React, StyleX, theme tokens, XDSAvatar
 * @output Exports XDSAvatarGroup component, XDSAvatarGroupProps, XDSAvatarGroupItem types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs (props table, features)
 * - /packages/core/src/AvatarGroup/index.ts (exports if types change)
 * - /apps/storybook/stories/AvatarGroup.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/AvatarGroup/ (showcase blocks)
 */

import type {XDSBaseProps} from '../XDSBaseProps';
import {XDSAvatar, resolveSize, type XDSAvatarSize} from '../Avatar';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';

const OVERLAP_RATIO = 0.25;
const BORDER_WIDTH = 2;
const OVERFLOW_FONT_RATIO = 0.35;

/**
 * Data for a single avatar in the group.
 */
export interface XDSAvatarGroupItem {
  /** Primary image source URL. */
  src?: string;
  /** Fallback image when primary fails. */
  fallbackSrc?: string;
  /** User name for initials and alt text. */
  name?: string;
  /** Alt text (falls back to name). */
  alt?: string;
  /** Unique key for React reconciliation. Falls back to index if not provided. */
  key?: string | number;
}

export interface XDSAvatarGroupProps extends XDSBaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Avatar data to display.
   */
  avatars: XDSAvatarGroupItem[];
  /**
   * Maximum number of avatars to show before overflow.
   * Remaining avatars are hidden and counted in the overflow indicator.
   * When not set, all avatars are shown.
   */
  maxVisibleCount?: number;
  /**
   * Additional count to add to the overflow indicator.
   * Use when the total count exceeds the rendered avatars
   * (e.g., server returns "47 participants" but you only pass 5).
   */
  overflowCount?: number;
  /**
   * Size applied to all avatars.
   * @default 'small'
   */
  size?: XDSAvatarSize;
  /**
   * Callback fired when the overflow indicator is clicked.
   */
  onClickOverflow?: () => void;
  /**
   * Test ID for integration testing.
   */
  'data-testid'?: string;
}

const styles = stylex.create({
  root: {
    display: 'inline-flex',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    borderRadius: radiusVars['--radius-full'],
    borderWidth: BORDER_WIDTH,
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    backgroundColor: colorVars['--color-background-surface'],
    boxSizing: 'content-box',
    lineHeight: 0,
  },
  overflow: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    userSelect: 'none',
    borderWidth: BORDER_WIDTH,
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    boxSizing: 'content-box',
  },
  overflowButton: {
    cursor: 'pointer',
    padding: 0,
  },
});

const dynamicStyles = stylex.create({
  overlap: (offset: number) => ({
    marginInlineStart: offset,
  }),
  zIndex: (z: number) => ({
    zIndex: z,
  }),
  size: (s: number) => ({
    width: s,
    height: s,
  }),
  fontSize: (s: number) => ({
    fontSize: s * OVERFLOW_FONT_RATIO,
  }),
});

/**
 * Stacked avatar display showing multiple avatars overlapping with an
 * overflow count indicator.
 *
 * @example
 * ```
 * <XDSAvatarGroup
 *   size="medium"
 *   maxVisibleCount={3}
 *   avatars={[
 *     {src: '/alice.jpg', name: 'Alice'},
 *     {src: '/bob.jpg', name: 'Bob'},
 *     {src: '/charlie.jpg', name: 'Charlie'},
 *     {src: '/diana.jpg', name: 'Diana'},
 *     {src: '/eve.jpg', name: 'Eve'},
 *   ]}
 * />
 * ```
 */
export function XDSAvatarGroup({
  avatars,
  maxVisibleCount,
  overflowCount,
  size = 'small',
  onClickOverflow,
  'data-testid': testId,
  'aria-label': ariaLabel = 'Avatars',
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSAvatarGroupProps) {
  const visibleAvatars =
    maxVisibleCount != null ? avatars.slice(0, maxVisibleCount) : avatars;
  const hiddenCount =
    maxVisibleCount != null ? Math.max(0, avatars.length - maxVisibleCount) : 0;
  const totalOverflow = hiddenCount + (overflowCount ?? 0);

  const numericSize = resolveSize(size);
  const overlap = Math.round(numericSize * OVERLAP_RATIO);
  const totalItems = visibleAvatars.length + (totalOverflow > 0 ? 1 : 0);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={ariaLabel}
      data-testid={testId}
      {...mergeProps(
        xdsClassName('avatar-group', {size}),
        stylex.props(styles.root, xstyle),
        className,
        style,
      )}
      {...props}>
      {visibleAvatars.map((avatar, index) => (
        <div
          key={avatar.key ?? index}
          {...stylex.props(
            styles.avatarWrapper,
            index > 0 && dynamicStyles.overlap(-overlap),
            dynamicStyles.zIndex(totalItems - index),
          )}>
          <XDSAvatar
            src={avatar.src}
            fallbackSrc={avatar.fallbackSrc}
            name={avatar.name}
            alt={avatar.alt}
            size={size}
          />
        </div>
      ))}
      {totalOverflow > 0 &&
        (onClickOverflow ? (
          <button
            type="button"
            onClick={onClickOverflow}
            aria-label={`${totalOverflow} more`}
            {...stylex.props(
              styles.overflow,
              styles.overflowButton,
              dynamicStyles.overlap(-overlap),
              dynamicStyles.zIndex(0),
              dynamicStyles.size(numericSize),
              dynamicStyles.fontSize(numericSize),
            )}>
            +{totalOverflow}
          </button>
        ) : (
          <span
            role="img"
            aria-label={`${totalOverflow} more`}
            {...stylex.props(
              styles.overflow,
              dynamicStyles.overlap(-overlap),
              dynamicStyles.zIndex(0),
              dynamicStyles.size(numericSize),
              dynamicStyles.fontSize(numericSize),
            )}>
            +{totalOverflow}
          </span>
        ))}
    </div>
  );
}

XDSAvatarGroup.displayName = 'XDSAvatarGroup';
