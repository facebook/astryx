/**
 * @file XDSCommandPaletteShortcut.tsx
 * @deprecated Use XDSKbd directly instead.
 *
 * This file re-exports XDSKbd for backward compatibility.
 * XDSCommandPaletteShortcut was extracted to a standalone component
 * because keyboard shortcut display is useful across the system,
 * not just in command palettes.
 */

import {XDSKbd} from '../Kbd';

export interface XDSCommandPaletteShortcutProps {
  /**
   * @deprecated Use XDSKbd with `keys` prop instead.
   */
  keys: string;
}

/**
 * @deprecated Use `<XDSKbd keys="mod+k" />` instead.
 */
export function XDSCommandPaletteShortcut({
  keys,
}: XDSCommandPaletteShortcutProps) {
  return <XDSKbd keys={keys} />;
}

XDSCommandPaletteShortcut.displayName = 'XDSCommandPaletteShortcut';
