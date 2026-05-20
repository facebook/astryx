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

import type {ReactNode} from 'react';
import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  typographyVars,
  fontWeightVars,
  radiusVars,
} from '../theme/tokens.stylex';
import {xdsClassName, mergeProps} from '../utils';
import {useXDSAvatarGroup} from './XDSAvatarGroupContext';

const BORDER_WIDTH = 2;
const OVERFLOW_FONT_RATIO = 0.35;

export interface XDSAvatarGroupOverflowProps {
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
  button: {
    cursor: 'pointer',
    padding: 0,
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
  count,
  onClick,
  children,
}: XDSAvatarGroupOverflowProps): ReactNode {
  const group = useXDSAvatarGroup();
  const numericSize = group?.numericSize ?? 36;
  const overlap = group?.overlap ?? 0;

  const label = `${count} more`;
  const content = children ?? `+${count}`;

  if (onClick) {
    return (
      <button
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
          ),
        )}>
        {content}
      </button>
    );
  }

  return (
    <span
      aria-label={label}
      {...mergeProps(
        xdsClassName('avatar-group-overflow'),
        stylex.props(
          styles.base,
          styles.overlap,
          dynamicStyles.size(numericSize),
          dynamicStyles.fontSize(numericSize),
          dynamicStyles.overlap(-overlap),
        ),
      )}>
      {content}
    </span>
  );
}

XDSAvatarGroupOverflow.displayName = 'XDSAvatarGroupOverflow';
