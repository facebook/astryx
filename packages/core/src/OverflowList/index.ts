// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file OverflowList component barrel export
 */

export {XDSOverflowList} from './XDSOverflowList';
export type {XDSOverflowListProps, XDSOverflowItem} from './XDSOverflowList';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSOverflowList as OverflowList,
} from '.';
export type {
  XDSOverflowItem as OverflowItem,
  XDSOverflowListProps as OverflowListProps,
} from '.';
// <compat-aliases:end>
