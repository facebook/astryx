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


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSAvatarGroup as AvatarGroup,
  XDSAvatarGroupOverflow as AvatarGroupOverflow,
  useXDSAvatarGroup as useAvatarGroup,
} from '.';
export type {
  XDSAvatarGroupContextValue as AvatarGroupContextValue,
  XDSAvatarGroupOverflowProps as AvatarGroupOverflowProps,
  XDSAvatarGroupProps as AvatarGroupProps,
} from '.';
// <compat-aliases:end>
