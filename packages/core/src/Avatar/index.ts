// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSAvatar component and types from XDSAvatar.tsx, XDSAvatarStatusDot from XDSAvatarStatusDot.tsx
 * @output Exports XDSAvatar, XDSAvatarProps, XDSAvatarSize, XDSAvatarStatusDot, XDSAvatarStatusDotProps, XDSAvatarStatusDotVariant
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/Avatar/Avatar.doc.mjs
 */

export {XDSAvatar, resolveSize} from './XDSAvatar';
export type {XDSAvatarProps, XDSAvatarSize} from './XDSAvatar';
export {XDSAvatarStatusDot} from './XDSAvatarStatusDot';
export type {
  XDSAvatarStatusDotProps,
  XDSAvatarStatusDotVariant,
  XDSAvatarStatusDotVariantMap,
} from './XDSAvatarStatusDot';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSAvatar as Avatar,
  XDSAvatarStatusDot as AvatarStatusDot,
} from '.';
export type {
  XDSAvatarProps as AvatarProps,
  XDSAvatarSize as AvatarSize,
  XDSAvatarStatusDotProps as AvatarStatusDotProps,
  XDSAvatarStatusDotVariant as AvatarStatusDotVariant,
  XDSAvatarStatusDotVariantMap as AvatarStatusDotVariantMap,
} from '.';
// <compat-aliases:end>
