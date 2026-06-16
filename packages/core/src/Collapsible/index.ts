// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSCollapsible, XDSCollapsibleGroup, and useXDSCollapsible
 * @output Exports components, hook, and types
 * @position Entry point for @xds/core/Collapsible module
 *
 * SYNC: When modified, update /packages/core/src/Collapsible/Collapsible.doc.mjs
 */

export {XDSCollapsible} from './XDSCollapsible';
export type {XDSCollapsibleProps} from './XDSCollapsible';

export {XDSCollapsibleGroup} from './XDSCollapsibleGroup';
export type {XDSCollapsibleGroupProps} from './XDSCollapsibleGroup';

export {useXDSCollapsible} from './useXDSCollapsible';
export type {
  XDSCollapsibleConfig,
  UseXDSCollapsibleOptions,
  UseXDSCollapsibleReturn,
} from './useXDSCollapsible';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCollapsible as Collapsible,
  XDSCollapsibleGroup as CollapsibleGroup,
  useXDSCollapsible as useCollapsible,
} from '.';
export type {
  XDSCollapsibleConfig as CollapsibleConfig,
  XDSCollapsibleGroupProps as CollapsibleGroupProps,
  XDSCollapsibleProps as CollapsibleProps,
} from '.';
// <compat-aliases:end>
