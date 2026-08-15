// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AvatarStatusLabelContext.ts
 * @input Uses React createContext
 * @output Exports AvatarStatusLabelContext
 * @position Internal context; provided by Avatar, consumed by AvatarStatusDot
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Avatar/Avatar.doc.mjs
 */

import {createContext} from 'react';

/**
 * Lets a status element hand its accessible label to the enclosing Avatar,
 * which composes it into its own accessible name ("Jane Doe, Online").
 *
 * The avatar root is `role="img"`, which prunes all descendant semantics, so
 * composing the label in is the only way the status reaches assistive tech
 * (WCAG 4.1.2). Reading `label` off the passed element only works when the
 * consumer passes `AvatarStatusDot` directly; reporting works through a
 * consumer's own wrapper, at any depth.
 *
 * The value is the Avatar's own state setter, called from a ref callback and
 * passed `undefined` on cleanup. `null` outside an Avatar, where a standalone
 * dot names itself and has nobody to report to.
 */
export const AvatarStatusLabelContext = createContext<
  ((label: string | undefined) => void) | null
>(null);
AvatarStatusLabelContext.displayName = 'AvatarStatusLabelContext';
