/**
 * @file index.ts
 * @input Imports all CommandPalette components, hooks, and types
 * @output Exports public API for @xds/core CommandPalette
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update /packages/core/src/CommandPalette/README.md
 */

// Layer 1: Composable primitives — the CommandPalette family
export {XDSCommandPalette} from './XDSCommandPalette';
export type {XDSCommandPaletteProps} from './XDSCommandPalette';

export {XDSCommandPaletteInput} from './XDSCommandPaletteInput';
export type {XDSCommandPaletteInputProps} from './XDSCommandPaletteInput';

export {XDSCommandPaletteList} from './XDSCommandPaletteList';
export type {XDSCommandPaletteListProps} from './XDSCommandPaletteList';

// Items: consumers should use XDSListItem directly inside XDSCommandPaletteList.
// XDSCommandPaletteItem is kept for backward compatibility but composes XDSListItem.
export {XDSCommandPaletteItem} from './XDSCommandPaletteItem';
export type {XDSCommandPaletteItemProps} from './XDSCommandPaletteItem';

// Group: kept as a family-specific component (heading + role="group")
export {XDSCommandPaletteGroup} from './XDSCommandPaletteGroup';
export type {XDSCommandPaletteGroupProps} from './XDSCommandPaletteGroup';

// Layer 2: Provider for distributed command registration
export {XDSCommandPaletteProvider} from './XDSCommandPaletteProvider';

// Hooks
export {useXDSCommandPaletteHistory} from './useXDSCommandPaletteHistory';

// Utilities
export {defaultFilter as commandPaletteFilter} from './filter';

// Types
export type {CommandPaletteFilterFn} from './types';

// ---- Deprecated re-exports ----
// These are thin wrappers around existing XDS primitives.
// Use XDSDivider, XDSEmptyState, XDSSpinner, XDSKbd directly instead.

/** @deprecated Use XDSKbd from @xds/core instead */
export {XDSCommandPaletteShortcut} from './XDSCommandPaletteShortcut';

/** @deprecated Use XDSDivider directly */
export {XDSCommandPaletteSeparator} from './XDSCommandPaletteSeparator';

/** @deprecated Use XDSEmptyState or XDSText directly */
export {XDSCommandPaletteEmpty} from './XDSCommandPaletteEmpty';

/** @deprecated Use XDSSpinner + XDSText directly */
export {XDSCommandPaletteLoading} from './XDSCommandPaletteLoading';

/** @deprecated Compose footer content directly */
export {XDSCommandPaletteFooter} from './XDSCommandPaletteFooter';
