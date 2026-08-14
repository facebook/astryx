// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AvatarStatusLabelContext.ts
 * @input Uses React createContext
 * @output Exports AvatarStatusLabelContext and AvatarStatusLabelContextValue
 * @position Internal context; provided by Avatar, consumed by AvatarStatusDot
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Avatar/Avatar.doc.mjs
 */

import {createContext} from 'react';

export interface AvatarStatusLabelContextValue {
  /**
   * Hands the status element's accessible label to the avatar, which composes
   * it into its own accessible name ("Jane Doe, Online"). Pass `undefined` to
   * withdraw it.
   *
   * Call this from a callback ref, not an Effect: a callback ref runs in the
   * commit phase, so the label is registered and the composed name is applied
   * before the browser paints.
   *
   * The function is stable and idempotent: registering the same label twice
   * is a no-op, so a ref reattach cannot duplicate or clear a live label.
   */
  registerStatusLabel: (label: string | undefined) => void;
}

/**
 * Context that lets a status element hand its accessible label to the
 * enclosing Avatar from any depth.
 *
 * The avatar root is `role="img"`, which prunes all descendant semantics, so
 * composing the label into the avatar's own accessible name is the only way
 * the status reaches assistive tech (WCAG 4.1.2). Reading `status.props.label`
 * off the passed element only works when the consumer passes `AvatarStatusDot`
 * directly; registration works through a consumer's own wrapper component.
 *
 * `null` outside an Avatar, where a standalone dot names itself and has
 * nothing to register with.
 */
export const AvatarStatusLabelContext =
  createContext<AvatarStatusLabelContextValue | null>(null);
AvatarStatusLabelContext.displayName = 'AvatarStatusLabelContext';
