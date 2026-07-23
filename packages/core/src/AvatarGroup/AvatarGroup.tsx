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
 * When the group contains interactive avatars (rendered as links/buttons) or an
 * interactive AvatarGroupOverflow, it becomes a single Tab stop with roving
 * arrow-key focus (via useListFocus with hasRovingTabIndex) and exposes a
 * screen-reader keyboard hint via aria-describedby. A purely static facepile
 * gets neither — it stays a plain non-focusable group.
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs (props table, features)
 * - /packages/core/src/AvatarGroup/index.ts (exports if types change)
 * - /apps/storybook/stories/AvatarGroup.stories.tsx (storybook stories)
 * - /packages/cli/templates/blocks/components/AvatarGroup/ (showcase blocks)
 */

import {useId, useMemo, useState, type ReactNode} from 'react';
import type {BaseProps} from '../BaseProps';
import {resolveSize, type AvatarSize} from '../Avatar';
import * as stylex from '@stylexjs/stylex';
import {mergeProps, mergeRefs} from '../utils';
import {composeEventHandlers} from '../utils/composeEventHandlers';
import {AvatarGroupContext} from './AvatarGroupContext';
import {themeProps} from '../utils/themeProps';
import {useTranslator} from '../i18n';
import {useListFocus} from '../hooks/useListFocus';
import {useIsomorphicLayoutEffect} from '../hooks/useIsomorphicLayoutEffect';
import {VisuallyHidden} from '../VisuallyHidden';

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
   * @default 'md'
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
 * <AvatarGroup size="lg">
 *   {users.slice(0, 3).map(u => (
 *     <Avatar key={u.id} src={u.src} name={u.name} />
 *   ))}
 *   <AvatarGroupOverflow count={users.length - 3} />
 * </AvatarGroup>
 * ```
 */
export function AvatarGroup({
  children,
  size = 'md',
  'data-testid': testId,
  'aria-label': ariaLabelFromProps,
  'aria-describedby': ariaDescribedByFromProps,
  onKeyDown,
  onFocus,
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

  // The keyboard hint and roving tab stop only make sense once the group has
  // interactive children. Detect their presence (and the writing direction for
  // RTL-correct arrow navigation) from the rendered DOM after commit, matching
  // how the codebase reads direction elsewhere (`getComputedStyle(el).direction`).
  const [hasInteractiveItems, setHasInteractiveItems] = useState(false);
  const [isRtl, setIsRtl] = useState(false);

  // Single tab stop + roving arrow focus over the group's interactive items.
  // `itemSelector` targets the shared `[data-avatar-item]` marker stamped on
  // interactive avatars (their rendered <a>/<button>) and on the overflow
  // button — NOT a tag/role selector — so roving never catches a nested button
  // inside a custom status/badge slot (O5).
  const {listRef, handleKeyDown, handleFocus} = useListFocus<HTMLDivElement>({
    itemSelector: '[data-avatar-item]',
    orientation: 'horizontal',
    hasRovingTabIndex: true,
    isRtl,
  });

  useIsomorphicLayoutEffect(() => {
    const root = listRef.current;
    if (!root) {
      return;
    }
    setHasInteractiveItems(root.querySelector('[data-avatar-item]') != null);
    setIsRtl(getComputedStyle(root).direction === 'rtl');
  });

  const hintId = useId();
  const describedBy =
    [ariaDescribedByFromProps, hasInteractiveItems ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <AvatarGroupContext value={contextValue}>
      <div
        {...props}
        ref={mergeRefs(ref, listRef)}
        role="group"
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        data-testid={testId}
        onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
        onFocus={composeEventHandlers(onFocus, handleFocus)}
        {...mergeProps(
          themeProps('avatar-group', {size}),
          stylex.props(styles.root, xstyle),
          className,
          style,
        )}>
        {children}
        {hasInteractiveItems && (
          <VisuallyHidden id={hintId}>
            {t('@astryx.avatarGroup.keyboardHint')}
          </VisuallyHidden>
        )}
      </div>
    </AvatarGroupContext>
  );
}

AvatarGroup.displayName = 'AvatarGroup';
