// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file XDSAvatarGroupOverflow.tsx
 * @input Uses React, StyleX, AvatarGroupContext
 * @output Exports XDSAvatarGroupOverflow for overflow indicator
 * @position Slot component used inside XDSAvatarGroup
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
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSAvatarGroup} from './XDSAvatarGroupContext';
import type {XDSBaseProps} from '../XDSBaseProps';

const BORDER_WIDTH = 2;
const OVERFLOW_FONT_RATIO = 0.35;

export interface XDSAvatarGroupOverflowProps extends Omit<
  XDSBaseProps<HTMLElement>,
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
    boxSizing: 'content-box',
    // Neutral tint layer (preserves opaque base underneath)
    backgroundImage: `linear-gradient(${colorVars['--color-neutral']}, ${colorVars['--color-neutral']})`,
  },
  button: {
    cursor: 'pointer',
    padding: 0,
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
    width: s,
    height: s,
  }),
  fontSize: (s: number) => ({
    fontSize: s * OVERFLOW_FONT_RATIO,
  }),
  overlap: (offset: number) => ({
    '--_avatar-group-overlap': `${offset}px`,
  }),
});

/**
 * Overflow indicator for XDSAvatarGroup. Shows a "+N" count and
 * optionally handles clicks.
 *
 * @example
 * ```
 * <XDSAvatarGroup size="medium">
 *   {users.slice(0, 3).map(u => (
 *     <XDSAvatar key={u.id} src={u.src} name={u.name} />
 *   ))}
 *   <XDSAvatarGroupOverflow count={users.length - 3} onClick={showAll} />
 * </XDSAvatarGroup>
 * ```
 */
export function XDSAvatarGroupOverflow({
  ref,
  count,
  onClick,
  children,
  xstyle,
  className,
  style,
}: XDSAvatarGroupOverflowProps): ReactNode {
  const group = useXDSAvatarGroup();
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
        aria-label={label}
        {...mergeProps(
          xdsClassName('avatar-group-overflow'),
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
      aria-label={label}
      {...mergeProps(
        xdsClassName('avatar-group-overflow'),
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

XDSAvatarGroupOverflow.displayName = 'XDSAvatarGroupOverflow';
