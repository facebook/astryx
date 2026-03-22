'use client';

/**
 * @file XDSAvatar.tsx
 * @input Uses React, HTMLAttributes, ReactNode, useState
 * @output Exports XDSAvatar component, XDSAvatarProps, XDSAvatarSize types
 * @position Core implementation; consumed by index.ts
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Avatar/Avatar.doc.mjs (props table, features, implementation notes)
 * - /packages/core/src/Avatar/XDSAvatar.test.tsx (tests for new/changed behavior)
 * - /packages/core/src/Avatar/index.ts (exports if types change)
 * - /apps/storybook/stories/Avatar.stories.tsx (storybook stories)
 */


import {useState, type ReactNode} from 'react';
import type {XDSBaseProps} from '../XDSBaseProps';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
} from '../theme/tokens.stylex';
import {XDSAvatarSizeContext} from './XDSAvatarSizeContext';
import {xdsClassName, mergeProps} from '../utils';

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
 * Named size options
 */
type XDSAvatarNamedSize = 'tiny' | 'xsmall' | 'small' | 'medium' | 'large';

/**
 * Numeric size options (in pixels)
 */
type XDSAvatarNumericSize =
  | 16
  | 20
  | 24
  | 32
  | 36
  | 40
  | 48
  | 60
  | 64
  | 72
  | 96
  | 128
  | 144
  | 180;

/**
 * Avatar size - can be a named size or a specific pixel value
 */
export type XDSAvatarSize = XDSAvatarNamedSize | XDSAvatarNumericSize;

/**
 * Resolves named sizes to their numeric pixel values
 */
function resolveSize(size: XDSAvatarSize): number {
  if (typeof size === 'number') {
    return size;
  }
  switch (size) {
    case 'tiny':
      return 20;
    case 'xsmall':
      return 24;
    case 'small':
      return 36;
    case 'medium':
      return 48;
    case 'large':
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
    borderRadius: '50%',
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
    backgroundColor: colorVars['--color-muted'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-body'],
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
    // Shift by half the element's size to center it on the circle edge
    transform: 'translate(50%, 50%)',
  }),
});

export interface XDSAvatarProps extends XDSBaseProps<HTMLDivElement> {
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
   * The size of the avatar.
   * @default 'small'
   */
  size?: XDSAvatarSize;
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
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
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
 * <XDSAvatar src="/user.jpg" name="John Doe" />
 * <XDSAvatar name="Jane Smith" size="large" />
 * <XDSAvatar src="/user.jpg" status={<OnlineIndicator />} />
 * ```
 */
export function XDSAvatar({
  alt,
  'data-testid': testId,
  fallbackSrc,
  name,
  size = 'small',
  src,
  status,
  xstyle,
  className,
  style,
  ref,
  ...props
}: XDSAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const showImage = src && !imageError;
  const showFallbackImage = !showImage && fallbackSrc && !fallbackError;
  const showInitials = !showImage && !showFallbackImage && name;
  const showIcon = !showImage && !showFallbackImage && !name;

  const accessibleName = alt || name || 'Avatar';
  const numericSize = resolveSize(size);

  return (
    <XDSAvatarSizeContext.Provider value={numericSize}>
      <div
        ref={ref}
        role="img"
        aria-label={accessibleName}
        data-testid={testId}
        {...mergeProps(
          xdsClassName('avatar', {size}),
          stylex.props(styles.wrapper, xstyle),
          className,
          style,
        )}
        {...props}>
        <div {...stylex.props(styles.content, dynamicStyles.size(numericSize))}>
          {showImage && (
            <img
              src={src}
              alt={accessibleName}
              onError={() => setImageError(true)}
              {...stylex.props(styles.image)}
            />
          )}
          {showFallbackImage && (
            <img
              src={fallbackSrc}
              alt={accessibleName}
              onError={() => setFallbackError(true)}
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
    </XDSAvatarSizeContext.Provider>
  );
}

XDSAvatar.displayName = 'XDSAvatar';
