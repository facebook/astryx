// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input XDSInteractiveRoleContext
 * @output Exports InteractiveRoleContext module public API
 * @position Entry point for InteractiveRoleContext module
 */

export {
  XDSInteractiveRoleContext,
  useXDSInteractiveRoleContext,
} from './XDSInteractiveRoleContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSInteractiveRoleContext as InteractiveRoleContext,
  useXDSInteractiveRoleContext as useInteractiveRoleContext,
} from '.';
// <compat-aliases:end>
