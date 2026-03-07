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

export {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
export type {XDSCommandPaletteFooterProps} from './XDSCommandPaletteFooter';

// Layer 2: Provider for distributed command registration
export {
  XDSCommandPaletteProvider,
  useXDSCommandPalette,
  useXDSCommandPaletteRegister,
} from './XDSCommandPaletteProvider';
export type {XDSCommandPaletteProviderProps} from './XDSCommandPaletteProvider';

// Hooks
export {useXDSCommandPaletteHistory} from './useXDSCommandPaletteHistory';
export type {
  CommandPaletteHistoryOptions,
  CommandPaletteHistoryEntry,
} from './useXDSCommandPaletteHistory';

// Utilities
export {defaultFilter as commandPaletteFilter} from './filter';

// Types
export type {
  XDSCommand,
  CommandItemRenderProps,
  CommandPaletteFilterFn,
} from './types';
