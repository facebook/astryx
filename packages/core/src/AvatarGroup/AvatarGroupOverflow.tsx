// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file AvatarGroupOverflow.tsx
 * @input Uses React, StyleX, AvatarGroupContext
 * @output Exports AvatarGroupOverflow for overflow indicator
 * @position Slot component used inside AvatarGroup
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs
 * - /packages/core/src/AvatarGroup/index.ts
 * - /packages/cli/templates/blocks/components/AvatarGroup/ (showcase blocks)
 */

import React, {type ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
  radiusVars,
  spacingVars,
} from '../theme/tokens.stylex';
import {mergeProps} from '../utils';
import {useAvatarGroup} from './AvatarGroupContext';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';

const BORDER_WIDTH = 2;
const OVERFLOW_FONT_RATIO = 0.35;

export interface AvatarGroupOverflowProps extends Omit<
  BaseProps<HTMLElement>,
  'onClick'
> {
  ref?: React.Ref<HTMLElement>;
  /**
   * The overflow count to display.
   */
  count: number;

  /**
   * Callback fired when the overflow indicator is clicked.
   * When provided, the indicator renders as a focusable button.
   */
  onClick?: () => void;

  /**
   * Custom content to render instead of the default "+N" label.
   */
  children?: ReactNode;
}

const styles = stylex.create({
  base: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radiusVars['--radius-full'],
    // Use opaque background to prevent avatar bleed-through
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    userSelect: 'none',
    borderWidth: BORDER_WIDTH,
    borderStyle: 'solid',
    borderColor: colorVars['--color-background-surface'],
    // border-box so the border and inline padding are included in the box
    // size: a short "+N" stays a circle at exactly the avatar size, while
    // longer content pushes past the min width and grows into a pill.
    boxSizing: 'border-box',
    // Horizontal breathing room so multi-digit "+N" counts don't crowd the
    // edges once the indicator grows into a pill.
    paddingInline: spacingVars['--spacing-2'],
    // Neutral tint layer (preserves opaque base underneath)
    backgroundImage: `linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`,
  },
  button: {
    cursor: 'pointer',
    // Reset the UA button's block padding only; the inline padding from `base`
    // provides the pill's breathing room and must be preserved.
    paddingBlock: 0,
    // Interactive overlay states layered on top via backgroundImage
    backgroundImage: {
      default: `linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`,
      ':hover': {
        '@media (hover: hover)': `linear-gradient(${colorVars['--color-overlay-hover']}, ${colorVars['--color-overlay-hover']}), linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`,
      },
      ':active': `linear-gradient(${colorVars['--color-overlay-pressed']}, ${colorVars['--color-overlay-pressed']}), linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`,
    },
    // Focus ring via focus-visible
    outline: {
      default: 'none',
      ':focus-visible': `2px solid ${colorVars['--color-accent']}`,
    },
    outlineOffset: {
      default: null,
      ':focus-visible': '2px',
    },
  },
  overlap: {
    marginInlineStart: 'var(--_avatar-group-overlap)',
  },
});

const dynamicStyles = stylex.create({
  size: (s: number) => ({
    // Pin height to the avatar's rendered size and enforce the same value as a
    // *minimum* width, so short counts (`+5`) render a perfect circle. With
    // border-box, the inline padding lives inside this size; longer content
    // (`+4912`) pushes past the min width and grows into a stadium/pill.
    // The border is added to the declared size (like the avatars' ring, which
    // uses content-box + a 2px border) to keep the indicator the same overall
    // size as its sibling avatars.
    minWidth: s + BORDER_WIDTH * 2,
    height: s + BORDER_WIDTH * 2,
  }),
  fontSize: (s: number) => ({
    fontSize: s * OVERFLOW_FONT_RATIO,
  }),
  overlap: (offset: number) => ({
    '--_avatar-group-overlap': `${offset}px`,
  }),
});

/**
 * Overflow indicator for AvatarGroup. Shows a "+N" count and
 * optionally handles clicks.
 *
 * @example
 * ```
 * <AvatarGroup size="medium">
 *   {users.slice(0, 3).map(u => (
 *     <Avatar key={u.id} src={u.src} name={u.name} />
 *   ))}
 *   <AvatarGroupOverflow count={users.length - 3} onClick={showAll} />
 * </AvatarGroup>
 * ```
 */
export function AvatarGroupOverflow({
  ref,
  count,
  onClick,
  children,
  xstyle,
  className,
  style,
  ...rest
}: AvatarGroupOverflowProps): ReactNode {
  const group = useAvatarGroup();
  const numericSize = group?.numericSize ?? 36;
  const overlap = group?.overlap ?? 0;

  const label = `${count} more`;
  const content = children ?? `+${count}`;

  if (onClick) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        onClick={onClick}
        {...rest}
        aria-label={label}
        {...mergeProps(
          themeProps('avatar-group-overflow'),
          stylex.props(
            styles.base,
            styles.button,
            styles.overlap,
            dynamicStyles.size(numericSize),
            dynamicStyles.fontSize(numericSize),
            dynamicStyles.overlap(-overlap),
            xstyle,
          ),
          className,
          style,
        )}>
        {content}
      </button>
    );
  }

  return (
    <span
      ref={ref}
      {...rest}
      aria-label={label}
      {...mergeProps(
        themeProps('avatar-group-overflow'),
        stylex.props(
          styles.base,
          styles.overlap,
          dynamicStyles.size(numericSize),
          dynamicStyles.fontSize(numericSize),
          dynamicStyles.overlap(-overlap),
          xstyle,
        ),
        className,
        style,
      )}>
      {content}
    </span>
  );
}

AvatarGroupOverflow.displayName = 'AvatarGroupOverflow';
