/**
 * @file useXDSCommandPaletteRegister.ts
 * @input Uses React useEffect, useContext, CommandPaletteContext
 * @output Exports useXDSCommandPaletteRegister hook
 * @position Hook; consumed by application components to register commands
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

import {useContext, useEffect, type DependencyList} from 'react';
import {CommandPaletteContext} from './XDSCommandPaletteContext';
import type {XDSCommand} from './types';

/**
 * Register commands with the command palette.
 *
 * Commands are registered on mount and automatically deregistered
 * on unmount. Re-registers when `deps` change.
 *
 * @example
 * ```tsx
 * useXDSCommandPaletteRegister([
 *   { id: 'save', label: 'Save', onSelect: handleSave },
 *   { id: 'export', label: 'Export', onSelect: handleExport },
 * ]);
 * ```
 */
export function useXDSCommandPaletteRegister(
  commands: XDSCommand[],
  deps?: DependencyList,
): void {
  const context = useContext(CommandPaletteContext);

  useEffect(
    () => {
      if (!context) return;
      return context.register(commands);
    },
    deps ?? [commands],
  );  
}
