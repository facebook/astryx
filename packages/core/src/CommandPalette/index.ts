'use client';

/**
 * @file index.ts
 * @input Imports CommandPalette components, providers, hooks, and types
 * @output Exports all CommandPalette components, providers, hooks, and types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header
 */

export {XDSCommandPalette} from './XDSCommandPalette';
export type {XDSCommandPaletteProps} from './XDSCommandPalette';

export {
  XDSCommonCommandPaletteProvider,
  createCommandPaletteActionSource,
  useCommandSource,
  useXDSCommonCommandPalette,
} from './XDSCommonCommandPaletteProvider';
export type {
  XDSCommonCommandPaletteAction,
  XDSCommonCommandPaletteContextValue,
  XDSCommonCommandPaletteProviderProps,
  XDSCommonCommandPaletteSource,
  UseCommandSourceInput,
} from './XDSCommonCommandPaletteProvider';

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
