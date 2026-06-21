// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file NavMenuItem.tsx
 * @input NavHeadingMenuItem
 * @output Exports deprecated NavMenuItem alias
 * @position Compatibility re-export; prefer NavHeadingMenuItem
 */

import {NavHeadingMenuItem} from './NavHeadingMenuItem';
import type {NavHeadingMenuItemProps} from './NavHeadingMenuItem';

/** @deprecated Use NavHeadingMenuItem instead. */
export type NavMenuItemProps = NavHeadingMenuItemProps;

/** @deprecated Use NavHeadingMenuItem instead. */
export const NavMenuItem = NavHeadingMenuItem;
