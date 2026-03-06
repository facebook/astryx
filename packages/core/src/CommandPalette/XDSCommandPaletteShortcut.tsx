/**
 * @file XDSCommandPaletteShortcut.tsx
 * @input Uses React, StyleX
 * @output Exports XDSCommandPaletteShortcut component
 * @position Sub-component; keyboard shortcut display
 */

import * as stylex from '@stylexjs/stylex';
import {
  colorVars,
  spacingVars,
  radiusVars,
  textSizeVars,
  typographyVars,
  fontWeightVars,
  lineHeightVars,
} from '../theme/tokens.stylex';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
    marginInlineStart: 'auto',
    flexShrink: 0,
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '20px',
    height: '20px',
    paddingInline: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-element'],
    backgroundColor: colorVars['--color-wash'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-body'],
    fontSize: textSizeVars['--text-xsm'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    lineHeight: lineHeightVars['--leading-tight'],
    userSelect: 'none',
  },
});

/**
 * Map of modifier key names to display symbols.
 */
const KEY_DISPLAY: Record<string, string> = {
  mod: '\u2318', // ⌘
  ctrl: '\u2303', // ⌃
  alt: '\u2325', // ⌥
  shift: '\u21E7', // ⇧
  enter: '\u21B5', // ↵
  backspace: '\u232B', // ⌫
  escape: 'Esc',
  tab: '\u21E5', // ⇥
  up: '\u2191',
  down: '\u2193',
  left: '\u2190',
  right: '\u2192',
};

export interface XDSCommandPaletteShortcutProps {
  /**
   * Keyboard shortcut string. Use "+" to separate keys.
   * Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape.
   *
   * @example
   * ```
   * "mod+k", "mod+shift+p", "enter"
   * ```
   */
  keys: string;
}

/**
 * Displays a keyboard shortcut as styled <kbd> elements.
 *
 * @example
 * ```
 * <XDSCommandPaletteShortcut keys="mod+k" />
 * // Renders: ⌘ K
 * ```
 */
export function XDSCommandPaletteShortcut({
  keys,
}: XDSCommandPaletteShortcutProps) {
  const parts = keys.split('+').map(key => key.trim().toLowerCase());

  return (
    <span sx={styles.wrapper} aria-hidden="true">
      {parts.map((key, i) => (
        <kbd key={i} sx={styles.kbd}>
          {KEY_DISPLAY[key] ?? key.toUpperCase()}
        </kbd>
      ))}
    </span>
  );
}

XDSCommandPaletteShortcut.displayName = 'XDSCommandPaletteShortcut';
