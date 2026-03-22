'use client';

/**
 * @file XDSAvatarSizeContext.ts
 * @input Uses React createContext
 * @output Exports XDSAvatarSizeContext
 * @position Internal context; provided by XDSAvatar, consumed by sub-components
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Avatar/Avatar.doc.mjs
 */


import {createContext} from 'react';

/**
 * Context that provides the resolved numeric avatar size (in pixels)
 * to child components like XDSAvatarStatusDot.
 *
 * Default value of 36 matches the default 'small' avatar size.
 */
export const XDSAvatarSizeContext = createContext<number>(36);
