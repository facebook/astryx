/**
 * @file index.ts
 * @input Imports from CommandPalette component files
 * @output Exports provider, hooks, and types for the CommandPalette
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/CommandPalette/README.md
 */

export {XDSCommandPaletteProvider} from './XDSCommandPaletteProvider';
export type {XDSCommandPaletteProviderProps} from './XDSCommandPaletteProvider';
export {useXDSCommandPaletteRegister} from './useXDSCommandPaletteRegister';
export {useXDSCommandPalette} from './useXDSCommandPalette';
export type {
  XDSCommand,
  MatchRange,
  ScoredCommand,
  HistoryEntry,
} from './types';
