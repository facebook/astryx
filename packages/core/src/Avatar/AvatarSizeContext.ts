// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file AvatarSizeContext.ts
 * @input Uses React createContext
 * @output Exports AvatarSizeContext
 * @position Internal context; provided by Avatar, consumed by sub-components
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Avatar/Avatar.doc.mjs
 */

import {createContext} from 'react';

/**
 * Context that provides the resolved numeric avatar size (in pixels)
 * to child components like AvatarStatusDot.
 *
 * Default value of 36 matches the default 'md' avatar size.
 */
export const AvatarSizeContext = createContext<number>(36);
AvatarSizeContext.displayName = 'AvatarSizeContext';
