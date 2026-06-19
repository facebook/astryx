// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports Collapsible, CollapsibleGroup, and useCollapsible
 * @output Exports components, hook, and types
 * @position Entry point for @xds/core/Collapsible module
 *
 * SYNC: When modified, update /packages/core/src/Collapsible/Collapsible.doc.mjs
 */

export {Collapsible} from './Collapsible';
export type {CollapsibleProps} from './Collapsible';

export {CollapsibleGroup} from './CollapsibleGroup';
export type {CollapsibleGroupProps} from './CollapsibleGroup';

export {useCollapsible} from './useCollapsible';
export type {
  CollapsibleConfig,
  UseXDSCollapsibleOptions,
  UseXDSCollapsibleReturn,
} from './useCollapsible';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  Collapsible as XDSCollapsible,
  CollapsibleGroup as XDSCollapsibleGroup,
  useCollapsible as useXDSCollapsible,
} from '.';
export type {
  CollapsibleConfig as XDSCollapsibleConfig,
  CollapsibleGroupProps as XDSCollapsibleGroupProps,
  CollapsibleProps as XDSCollapsibleProps,
  UseXDSCollapsibleOptions as XDSUseXDSCollapsibleOptions,
  UseXDSCollapsibleReturn as XDSUseXDSCollapsibleReturn,
} from '.';
// <compat-aliases:end>
