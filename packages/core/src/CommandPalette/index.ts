// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports CommandPalette components and types
 * @output Exports all CommandPalette components and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {XDSCommandPalette} from './XDSCommandPalette';
export type {XDSCommandPaletteProps} from './XDSCommandPalette';

export {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
export type {XDSCommandPaletteInputProps} from './XDSCommandPaletteInput';

export {XDSCommandPaletteList} from './XDSCommandPaletteList';
export type {XDSCommandPaletteListProps} from './XDSCommandPaletteList';

export {XDSCommandPaletteItem} from './XDSCommandPaletteItem';
export type {XDSCommandPaletteItemProps} from './XDSCommandPaletteItem';

export {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';
export type {XDSCommandPaletteGroupProps} from './XDSCommandPaletteGroup';

export {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
export type {XDSCommandPaletteFooterProps} from './XDSCommandPaletteFooter';

export {XDSCommandPaletteEmpty} from './XDSCommandPaletteEmpty';
export type {XDSCommandPaletteEmptyProps} from './XDSCommandPaletteEmpty';

export {useCommandPaletteContext} from './CommandPaletteContext';
export type {CommandPaletteContextValue} from './CommandPaletteContext';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSCommandPalette as CommandPalette,
  XDSCommandPaletteEmpty as CommandPaletteEmpty,
  XDSCommandPaletteFooter as CommandPaletteFooter,
  XDSCommandPaletteGroup as CommandPaletteGroup,
  XDSCommandPaletteInput as CommandPaletteInput,
  XDSCommandPaletteItem as CommandPaletteItem,
  XDSCommandPaletteList as CommandPaletteList,
} from '.';
export type {
  XDSCommandPaletteEmptyProps as CommandPaletteEmptyProps,
  XDSCommandPaletteFooterProps as CommandPaletteFooterProps,
  XDSCommandPaletteGroupProps as CommandPaletteGroupProps,
  XDSCommandPaletteInputProps as CommandPaletteInputProps,
  XDSCommandPaletteItemProps as CommandPaletteItemProps,
  XDSCommandPaletteListProps as CommandPaletteListProps,
  XDSCommandPaletteProps as CommandPaletteProps,
} from '.';
// <compat-aliases:end>
