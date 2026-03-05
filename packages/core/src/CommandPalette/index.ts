/**
 * @file index.ts
 * @input Imports all CommandPalette components, hooks, and types
 * @output Exports public API for @xds/core CommandPalette
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/CommandPalette/README.md
 */

// Layer 1: Composable primitives
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

export {XDSCommandPaletteEmpty} from './XDSCommandPaletteEmpty';
export type {XDSCommandPaletteEmptyProps} from './XDSCommandPaletteEmpty';

export {XDSCommandPaletteLoading} from './XDSCommandPaletteLoading';
export type {XDSCommandPaletteLoadingProps} from './XDSCommandPaletteLoading';

export {XDSCommandPaletteSeparator} from './XDSCommandPaletteSeparator';

export {XDSCommandPaletteShortcut} from './XDSCommandPaletteShortcut';
export type {XDSCommandPaletteShortcutProps} from './XDSCommandPaletteShortcut';

export {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
export type {XDSCommandPaletteFooterProps} from './XDSCommandPaletteFooter';

// Layer 2: Registry provider
export {
  XDSCommandPaletteProvider,
  useXDSCommandPalette,
  useXDSCommandPaletteRegister,
} from './XDSCommandPaletteProvider';
export type {XDSCommandPaletteProviderProps} from './XDSCommandPaletteProvider';

// Layer 3: Optional history
export {useXDSCommandPaletteHistory} from './useXDSCommandPaletteHistory';
export type {
  CommandPaletteHistoryOptions,
  CommandPaletteHistoryEntry,
} from './useXDSCommandPaletteHistory';

// Shared types
export type {
  XDSCommand,
  CommandItemRenderProps,
  CommandPaletteFilterFn,
} from './types';
