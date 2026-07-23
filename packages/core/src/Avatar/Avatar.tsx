// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Avatar.tsx
 * @input Uses React, HTMLAttributes, ReactNode, useState
 * @output Exports Avatar component, AvatarProps, AvatarSize types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/Avatar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Avatar/index.ts (exports if types change)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/Avatar/ (showcase blocks)
 */

import {useMemo, useState, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {AvatarSizeContext} from './AvatarSizeContext';
import {useAvatarGroup} from '../AvatarGroup/AvatarGroupContext';
import {mergeProps} from '../utils';
import {themeProps} from '../utils/themeProps';

/**
 * The offset ratio for positioning elements on a circle's edge at 45°.
 *
 * For a square with side length S containing an inscribed circle of diameter S,
 * a diagonal line from corner to corner intersects the circle at:
 *   x = S/2 × (1 ± 1/√2)
 *
 * The distance from the corner to this intersection point (along each axis) is:
 *   S/2 × (1 - 1/√2) ≈ 0.146S
 *
 * This constant represents that ratio: (1 - 1/√2) / 2 ≈ 0.146
 */
const CIRCLE_EDGE_OFFSET_RATIO = (1 - 1 / Math.SQRT2) / 2;

/**
 * The ratio of font size to avatar size for initials.
 *
 * At 40%, two-letter initials fit comfortably within the circle with adequate
 * padding. This ratio provides good legibility across all avatar sizes:
 *   - 24px avatar → 9.6px font
 *   - 48px avatar → 19.2px font
 *   - 128px avatar → 51.2px font
 */
const INITIALS_FONT_SIZE_RATIO = 0.4;

/**
 * Named size options.
 *
 * Avatar uses the same abbreviated scale as Icon (`xsm`/`sm`/`md`/`lg`/`xl`),
 * but the values are larger because avatars align with media rather than
 * glyphs. The tiers match EPS's avatar sizes.
 */
type AvatarNamedSize = 'xsm' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Numeric size options (in pixels)
 */
type AvatarNumericSize =
  16 | 20 | 24 | 32 | 36 | 40 | 48 | 60 | 64 | 72 | 96 | 128 | 144 | 180;

/**
 * Avatar size - can be a named size or a specific pixel value
 */
export type AvatarSize = AvatarNamedSize | AvatarNumericSize;

/**
 * Resolves named sizes to their numeric pixel values
 */
export function resolveSize(size: AvatarSize): number {
  if (typeof size === 'number') {
    return size;
  }
  switch (size) {
    case 'xsm':
      return 20;
    case 'sm':
      return 24;
    case 'md':
      return 36;
    case 'lg':
      return 48;
    case 'xl':
      return 128;
  }
}

/**
 * Base styles for the avatar
 * Uses a wrapper/content structure so status isn't clipped by overflow:hidden
 */
const styles = stylex.create({
  wrapper: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    overflow: 'hidden',
    userSelect: 'none',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  fallback: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: colorVars['--color-neutral'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    textTransform: 'uppercase',
  },
  status: {
    position: 'absolute',
  },
});

/**
 * Dynamic styles that depend on the avatar size
 */
const dynamicStyles = stylex.create({
  size: (size: number) => ({
    width: size,
    height: size,
  }),
  fontSize: (size: number) => ({
    fontSize: size * INITIALS_FONT_SIZE_RATIO,
  }),
  statusPosition: (size: number) => ({
    bottom: size * CIRCLE_EDGE_OFFSET_RATIO,
    right: size * CIRCLE_EDGE_OFFSET_RATIO,
    transform: 'translate(50%, 50%)',
  }),
});

const BORDER_WIDTH = 2;

const groupStyles = stylex.create({
  ring: {
    borderRadius: radiusVars['--radius-full'],
    borderWidth: BORDER_WIDTH,
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    backgroundColor: colorVars['--color-background-surface'],
    boxSizing: 'content-box',
  },
  overlap: {
    marginInlineStart: {
      default: null,
      ':not(:first-child)': 'var(--_avatar-group-overlap)',
    },
  },
});

const groupDynamicStyles = stylex.create({
  overlap: (offset: number) => ({
    '--_avatar-group-overlap': `${offset}px`,
  }),
});

export interface AvatarProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * The alt text shown on hover and made accessible to screen readers.
   * Falls back to `name` if not provided.
   */
  alt?: string;
  /**
   * testid for tests.
   */
  'data-testid'?: string;
  /**
   * Fallback image source when primary `src` fails to load.
   * If this also fails, shows initials derived from `name`.
   */
  fallbackSrc?: string;
  /**
   * The user's name. Used for:
   * - Generating initials when no image is available
   * - Default alt text if `alt` is not provided
   */
  name?: string;
  /**
   * The size of the avatar. A named size (`xsm` 20px, `sm` 24px, `md` 36px,
   * `lg` 48px, `xl` 128px) or a specific pixel value.
   * @default 'md'
   */
  size?: AvatarSize;
  /**
   * The primary image source for the avatar.
   */
  src?: string;
  /**
   * Content displayed in the corner of the avatar.
   * Typically used for status indicators or badges.
   */
  status?: ReactNode;
}

/**
 * Generates initials from a name string.
 * Takes the first letter of the first two words.
 * @example
 * ```
 * getInitials('John Doe')
 * getInitials('Alice')
 * ```
 */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 0) {
    return '';
  }
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

/**
 * Default person icon SVG for when no image or name is provided
 */
function DefaultIcon({size}: {size: number}) {
  return (
    <svg
      width={size * 0.6}
      height={size * 0.6}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

/**
 * Avatar component for displaying user profile pictures.
 *
 * Displays an image when available, falling back to initials derived from
 * the name prop, or a generic person icon if neither is provided.
 *
 * @example
 * ```
 * <Avatar src="/user.jpg" name="John Doe" />
 * <Avatar name="Jane Smith" size="xl" />
 * <Avatar src="/user.jpg" status={<OnlineIndicator />} />
 * ```
 */
export function Avatar({
  alt,
  'data-testid': testId,
  fallbackSrc,
  name,
  size = 'md',
  src,
  status,
  xstyle,
  className,
  style,
  ref,
  ...props
}: AvatarProps) {
  // Track the exact src that failed (rather than a boolean) so a changed
  // src/fallbackSrc gets a fresh load attempt instead of the stale error.
  const [erroredSrc, setErroredSrc] = useState<string | undefined>(undefined);
  const [erroredFallbackSrc, setErroredFallbackSrc] = useState<
    string | undefined
  >(undefined);

  const showImage = src && erroredSrc !== src;
  const showFallbackImage =
    !showImage && fallbackSrc && erroredFallbackSrc !== fallbackSrc;
  const showInitials = !showImage && !showFallbackImage && name;
  const showIcon = !showImage && !showFallbackImage && !name;

  // A meaningful accessible name comes from `alt` or `name`. With neither, the
  // avatar is decorative — expose it as `presentation`/`aria-hidden` rather than
  // announcing a meaningless generic "Avatar" (obs-9).
  const accessibleName = alt || name;
  const isDecorative = !accessibleName;
  const avatarGroup = useAvatarGroup();
  const resolvedSize = avatarGroup?.size ?? size;
  const numericSize = useMemo(() => resolveSize(resolvedSize), [resolvedSize]);

  return (
    <AvatarSizeContext value={numericSize}>
      <div
        {...props}
        ref={ref}
        role={isDecorative ? 'presentation' : 'img'}
        aria-label={isDecorative ? undefined : accessibleName}
        aria-hidden={isDecorative || undefined}
        data-testid={testId}
        {...mergeProps(
          themeProps('avatar', {size: resolvedSize}),
          stylex.props(
            styles.wrapper,
            avatarGroup && groupStyles.ring,
            avatarGroup && groupStyles.overlap,
            avatarGroup && groupDynamicStyles.overlap(-avatarGroup.overlap),
            xstyle,
          ),
          className,
          style,
        )}>
        <div {...stylex.props(styles.content, dynamicStyles.size(numericSize))}>
          {showImage && (
            <img
              src={src}
              alt=""
              onError={() => setErroredSrc(src)}
              {...stylex.props(styles.image)}
            />
          )}
          {showFallbackImage && (
            <img
              src={fallbackSrc}
              alt=""
              onError={() => setErroredFallbackSrc(fallbackSrc)}
              {...stylex.props(styles.image)}
            />
          )}
          {showInitials && (
            <div
              {...stylex.props(
                styles.fallback,
                dynamicStyles.fontSize(numericSize),
              )}>
              {getInitials(name)}
            </div>
          )}
          {showIcon && (
            <div {...stylex.props(styles.fallback)}>
              <DefaultIcon size={numericSize} />
            </div>
          )}
        </div>
        {status && (
          <div
            {...stylex.props(
              styles.status,
              dynamicStyles.statusPosition(numericSize),
            )}>
            {status}
          </div>
        )}
      </div>
    </AvatarSizeContext>
  );
}

Avatar.displayName = 'Avatar';
