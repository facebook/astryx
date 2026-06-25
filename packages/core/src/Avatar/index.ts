// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Avatar component and types from Avatar.tsx, AvatarStatusDot from AvatarStatusDot.tsx
 * @output Exports Avatar, AvatarProps, AvatarSize, AvatarStatusDot, AvatarStatusDotProps, AvatarStatusDotVariant
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Avatar/Avatar.doc.mjs
 */

export {Avatar, resolveSize} from './Avatar';
export type {AvatarProps, AvatarSize} from './Avatar';
export {AvatarStatusDot} from './AvatarStatusDot';
export type {
  AvatarStatusDotProps,
  AvatarStatusDotVariant,
  AvatarStatusDotVariantMap,
} from './AvatarStatusDot';
