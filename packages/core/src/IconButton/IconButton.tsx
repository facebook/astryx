// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file IconButton.tsx
 * @input Uses Button, ButtonProps
 * @output Exports IconButton component, IconButtonProps type
 * @position Composition wrapper over Button for icon-only buttons
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/IconButton/IconButton.doc.mjs (props table, features)
 * - /packages/core/src/IconButton/IconButton.test.tsx (tests)
 * - /packages/core/src/IconButton/index.ts (exports if types change)
 * - /apps/storybook/stories/IconButton.stories.tsx (storybook stories)
 * - /packages/core/templates/blocks/components/IconButton/ (showcase blocks)
 */

import type {ReactNode} from 'react';
import {Button} from '../Button/Button';
import type {ButtonProps} from '../Button/Button';

/**
 * Props for IconButton.
 *
 * Omits `isIconOnly` (always true), `children` and `endContent` (not applicable
 * for icon-only buttons). `icon` is required.
 */
export interface IconButtonProps extends Omit<
  ButtonProps,
  'isIconOnly' | 'children' | 'endContent'
> {
  /** Icon element rendered inside the button (required). */
  icon: ReactNode;
}

/**
 * An icon-only button — a thin wrapper around Button with `isIconOnly`
 * always set to true.
 *
 * Use this instead of `<Button isIconOnly>` for explicit, greppable,
 * and codemod-safe icon-only button usage.
 *
 * @example
 * ```
 * <IconButton label="Settings" icon={<GearIcon />} variant="ghost" />
 * <IconButton label="Delete" icon={<TrashIcon />} variant="destructive" />
 * <IconButton label="Emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />
 * ```
 */
export function IconButton({icon, ...props}: IconButtonProps): ReactNode {
  return <Button {...props} icon={icon} isIconOnly />;
}

IconButton.displayName = 'IconButton';
