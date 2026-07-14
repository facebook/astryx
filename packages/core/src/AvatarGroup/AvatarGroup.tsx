// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file AvatarGroup.tsx
 * @input Uses React, StyleX, theme tokens, AvatarGroupContext
 * @output Exports AvatarGroup component and AvatarGroupProps
 * @position Core implementation; consumed by index.ts
 *
 * Compositional API: children are Avatar elements (and optionally
 * one AvatarGroupOverflow). The group provides overlap styling via
 * context — no child introspection needed.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs (props table, features)
 * - /packages/core/src/AvatarGroup/index.ts (exports if types change)
 * - /apps/storybook/stories/AvatarGroup.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/AvatarGroup/ (showcase blocks)
 */

import {useMemo, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {resolveSize, type AvatarSize} from '../Avatar';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import {AvatarGroupContext} from './AvatarGroupContext';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';

const OVERLAP_RATIO = 0.25;

export interface AvatarGroupProps extends BaseProps<HTMLDivElement> {
  /** Ref forwarded to the root element. */
  ref?: React.Ref<HTMLDivElement>;
  /**
   * Avatar children, optionally followed by one AvatarGroupOverflow.
   * Consumers are responsible for slicing to the desired visible count.
   */
  children: ReactNode;
  /**
   * Size applied to all avatars via context.
   * @default 'small'
   */
  size?: AvatarSize;
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
});

/**
 * Stacked avatar display showing multiple avatars overlapping with an
 * optional overflow indicator. Uses a compositional children-based API
 * so each avatar can carry its own props (status dots, click handlers, etc.).
 *
 * Consumers handle slicing — pass only the avatars you want visible,
 * then add an AvatarGroupOverflow for the "+N" indicator.
 *
 * @example
 * ```
 * <AvatarGroup size="medium">
 *   {users.slice(0, 3).map(u => (
 *     <Avatar key={u.id} src={u.src} name={u.name} />
 *   ))}
 *   <AvatarGroupOverflow count={users.length - 3} />
 * </AvatarGroup>
 * ```
 */
export function AvatarGroup({
  children,
  size = 'small',
  'data-testid': testId,
  'aria-label': ariaLabelFromProps,
  xstyle,
  className,
  style,
  ref,
  ...props
}: AvatarGroupProps): ReactNode {
  const t = useTranslator();
  const ariaLabel = ariaLabelFromProps ?? t('@astryx.avatarGroup.label');
  const numericSize = resolveSize(size);
  const overlap = Math.round(numericSize * OVERLAP_RATIO);

  const contextValue = useMemo(
    () => ({size, overlap, numericSize}),
    [size, overlap, numericSize],
  );

  return (
    <AvatarGroupContext value={contextValue}>
      <div
        {...props}
        ref={ref}
        role="group"
        aria-label={ariaLabel}
        data-testid={testId}
        {...mergeProps(
          themeProps('avatar-group', {size}),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}>
        {children}
      </div>
    </AvatarGroupContext>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
