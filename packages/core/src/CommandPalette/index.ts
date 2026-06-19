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

export {CommandPalette} from './CommandPalette';
export type {CommandPaletteProps} from './CommandPalette';

export {CommandPaletteInput} from './CommandPaletteInput';
export type {CommandPaletteInputProps} from './CommandPaletteInput';

export {CommandPaletteList} from './CommandPaletteList';
export type {CommandPaletteListProps} from './CommandPaletteList';

export {CommandPaletteItem} from './CommandPaletteItem';
export type {CommandPaletteItemProps} from './CommandPaletteItem';

export {CommandPaletteGroup} from './CommandPaletteGroup';
export type {CommandPaletteGroupProps} from './CommandPaletteGroup';

export {CommandPaletteFooter} from './CommandPaletteFooter';
export type {CommandPaletteFooterProps} from './CommandPaletteFooter';

export {CommandPaletteEmpty} from './CommandPaletteEmpty';
export type {CommandPaletteEmptyProps} from './CommandPaletteEmpty';

export {useCommandPaletteContext} from './CommandPaletteContext';
export type {CommandPaletteContextValue} from './CommandPaletteContext';


// <compat-aliases:start> — generated, do not edit by hand
// Legacy XDS-prefixed compatibility aliases (XDS-prefix migration P2380608025).
// Bare names above are canonical + module-augmentation targets.
// These prefixed re-exports reference the SAME values/types and remain
// augmentable (consumer `declare module` augmentations of XDS* flow through).
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  CommandPalette as XDSCommandPalette,
  CommandPaletteEmpty as XDSCommandPaletteEmpty,
  CommandPaletteFooter as XDSCommandPaletteFooter,
  CommandPaletteGroup as XDSCommandPaletteGroup,
  CommandPaletteInput as XDSCommandPaletteInput,
  CommandPaletteItem as XDSCommandPaletteItem,
  CommandPaletteList as XDSCommandPaletteList,
  useCommandPaletteContext as useXDSCommandPaletteContext,
} from '.';
export type {
  CommandPaletteContextValue as XDSCommandPaletteContextValue,
  CommandPaletteEmptyProps as XDSCommandPaletteEmptyProps,
  CommandPaletteFooterProps as XDSCommandPaletteFooterProps,
  CommandPaletteGroupProps as XDSCommandPaletteGroupProps,
  CommandPaletteInputProps as XDSCommandPaletteInputProps,
  CommandPaletteItemProps as XDSCommandPaletteItemProps,
  CommandPaletteListProps as XDSCommandPaletteListProps,
  CommandPaletteProps as XDSCommandPaletteProps,
} from '.';
// <compat-aliases:end>
