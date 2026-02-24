/**
 * @file XDSCommandPaletteContext.tsx
 * @input Uses React createContext, XDSCommandPaletteContextValue type
 * @output Exports CommandPaletteContext
 * @position Context definition; consumed by provider and hooks
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 */

import {createContext} from 'react';
import type {XDSCommandPaletteContextValue} from './types';

/**
 * Context for the command palette.
 * Null when no provider is present in the tree.
 */
export const CommandPaletteContext =
  createContext<XDSCommandPaletteContextValue | null>(null);
