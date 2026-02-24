/**
 * @file useXDSCommandPalette.ts
 * @input Uses React useContext, CommandPaletteContext
 * @output Exports useXDSCommandPalette hook
 * @position Hook; consumed by application components for imperative control
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/CommandPalette/README.md
 * - /packages/core/src/CommandPalette/index.ts
 */

import {useContext} from 'react';
import {CommandPaletteContext} from './XDSCommandPaletteContext';

/**
 * Imperative API to control the command palette.
 *
 * @example
 * ```tsx
 * const { open, close, isOpen } = useXDSCommandPalette();
 *
 * return <button onClick={() => open()}>Open Palette</button>;
 * ```
 */
export function useXDSCommandPalette(): {
  open: (page?: string) => void;
  close: () => void;
  isOpen: boolean;
} {
  const context = useContext(CommandPaletteContext);

  if (!context) {
    return {
      open: () => {},
      close: () => {},
      isOpen: false,
    };
  }

  return {
    open: context.open,
    close: context.close,
    isOpen: context.isOpen,
  };
}
