/**
 * @file XDSKbd.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports XDSKbd component and XDSKbdProps
 * @position Core implementation; renders styled keyboard shortcut indicators
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Kbd/README.md
 * - /packages/core/src/Kbd/index.ts
 */

import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
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
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacingVars['--spacing-1'],
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

export interface XDSKbdProps {
  /**
   * Keyboard shortcut string. Use "+" to separate keys.
   * Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape.
   *
   * @example
   * ```
   * "mod+k"
   * "mod+shift+p"
   * "enter"
   * ```
   */
  keys: string;

  /**
   * StyleX overrides for the wrapper element.
   */
  xstyle?: StyleXStyles;
}

/**
 * Displays a keyboard shortcut as styled <kbd> elements.
 *
 * A general-purpose component for rendering keyboard shortcuts
 * anywhere in the system — tooltips, menus, documentation, etc.
 *
 * @example
 * ```
 * <XDSKbd keys="mod+k" />
 * ```
 */
export function XDSKbd({keys, xstyle}: XDSKbdProps) {
  const parts = keys.split('+').map(key => key.trim().toLowerCase());

  return (
    <span {...stylex.props(styles.wrapper, xstyle)} aria-hidden="true">
      {parts.map((key, i) => (
        <kbd key={i} {...stylex.props(styles.kbd)}>
          {KEY_DISPLAY[key] ?? key.toUpperCase()}
        </kbd>
      ))}
    </span>
  );
}

XDSKbd.displayName = 'XDSKbd';
