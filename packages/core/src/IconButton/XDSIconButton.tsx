'use client';

/**
 * @file XDSIconButton.tsx
 * @input Uses XDSButton, XDSButtonProps
 * @output Exports XDSIconButton component, XDSIconButtonProps type
 * @position Composition wrapper over XDSButton for icon-only buttons
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/IconButton/IconButton.doc.mjs (props table, features)
 * - /packages/core/src/IconButton/XDSIconButton.test.tsx (tests)
 * - /packages/core/src/IconButton/index.ts (exports if types change)
 * - /apps/storybook/stories/IconButton.stories.tsx (storybook stories)
 */

import type {ReactNode} from 'react';
import {XDSButton} from '../Button/XDSButton';
import type {XDSButtonProps} from '../Button/XDSButton';

/**
 * Props for XDSIconButton.
 *
 * Omits `isIconOnly` (always true), `children` and `endContent` (not applicable
 * for icon-only buttons). `icon` is required.
 */
export interface XDSIconButtonProps extends Omit<
  XDSButtonProps,
  'isIconOnly' | 'children' | 'endContent'
> {
  /** Icon element rendered inside the button (required). */
  icon: ReactNode;
}

/**
 * An icon-only button — a thin wrapper around XDSButton with `isIconOnly`
 * always set to true.
 *
 * Use this instead of `<XDSButton isIconOnly>` for explicit, greppable,
 * and codemod-safe icon-only button usage.
 *
 * @example
 * ```
 * <XDSIconButton label="Settings" icon={<GearIcon />} variant="ghost" />
 * <XDSIconButton label="Delete" icon={<TrashIcon />} variant="destructive" />
 * <XDSIconButton label="Emoji" icon={<span>🚀</span>} variant="ghost" size="sm" />
 * ```
 */
export function XDSIconButton({icon, ...props}: XDSIconButtonProps): ReactNode {
  return <XDSButton {...props} icon={icon} isIconOnly />;
}

XDSIconButton.displayName = 'XDSIconButton';
