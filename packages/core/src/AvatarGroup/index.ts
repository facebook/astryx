// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file index.ts
 * @input Imports from XDSAvatarGroup.tsx, XDSAvatarGroupOverflow.tsx, XDSAvatarGroupContext.ts
 * @output Exports XDSAvatarGroup, XDSAvatarGroupOverflow, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs
 */

export {XDSAvatarGroup} from './XDSAvatarGroup';
export type {XDSAvatarGroupProps} from './XDSAvatarGroup';

export {XDSAvatarGroupOverflow} from './XDSAvatarGroupOverflow';
export type {XDSAvatarGroupOverflowProps} from './XDSAvatarGroupOverflow';

export {useXDSAvatarGroup} from './XDSAvatarGroupContext';
export type {XDSAvatarGroupContextValue} from './XDSAvatarGroupContext';
