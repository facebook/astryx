// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input InteractiveRoleContext
 * @output Exports InteractiveRoleContext module public API
 * @position Entry point for InteractiveRoleContext module
 */

export {
  InteractiveRoleContext,
  useInteractiveRoleContext,
} from './InteractiveRoleContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  InteractiveRoleContext as XDSInteractiveRoleContext,
  useInteractiveRoleContext as useXDSInteractiveRoleContext,
} from '.';
// <compat-aliases:end>
