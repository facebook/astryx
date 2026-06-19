// Copyright (c) Meta Platforms, Inc. and affiliates.
'use client';

/**
 * @file index.ts
 * @input Imports from AvatarGroup.tsx, AvatarGroupOverflow.tsx, AvatarGroupContext.ts
 * @output Exports AvatarGroup, AvatarGroupOverflow, context hook, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/AvatarGroup/AvatarGroup.doc.mjs
 */

export {AvatarGroup} from './AvatarGroup';
export type {AvatarGroupProps} from './AvatarGroup';

export {AvatarGroupOverflow} from './AvatarGroupOverflow';
export type {AvatarGroupOverflowProps} from './AvatarGroupOverflow';

export {useAvatarGroup} from './AvatarGroupContext';
export type {AvatarGroupContextValue} from './AvatarGroupContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  AvatarGroup as XDSAvatarGroup,
  AvatarGroupOverflow as XDSAvatarGroupOverflow,
  useAvatarGroup as useXDSAvatarGroup,
} from '.';
export type {
  AvatarGroupContextValue as XDSAvatarGroupContextValue,
  AvatarGroupOverflowProps as XDSAvatarGroupOverflowProps,
  AvatarGroupProps as XDSAvatarGroupProps,
} from '.';
// <compat-aliases:end>
