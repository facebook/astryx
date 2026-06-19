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


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Avatar as XDSAvatar,
  AvatarStatusDot as XDSAvatarStatusDot,
} from '.';
export type {
  AvatarProps as XDSAvatarProps,
  AvatarSize as XDSAvatarSize,
  AvatarStatusDotProps as XDSAvatarStatusDotProps,
  AvatarStatusDotVariant as XDSAvatarStatusDotVariant,
  AvatarStatusDotVariantMap as XDSAvatarStatusDotVariantMap,
} from '.';
// <compat-aliases:end>
