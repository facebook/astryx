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

import {useState, useLayoutEffect} from 'react';
import * as stylex from '@stylexjs/stylex';
import type {StyleXStyles} from '@stylexjs/stylex';
import {xdsClassName, mergeProps} from '../utils';
import {
  colorVars,
  spacingVars,
  radiusVars,
  typographyVars,
  fontWeightVars,
  typeScaleVars,
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
    borderRadius: radiusVars['--radius-inner'],
    backgroundColor: colorVars['--color-neutral'],
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border'],
    color: colorVars['--color-text-secondary'],
    fontFamily: typographyVars['--font-family-body'],
    fontSize: typeScaleVars['--text-supporting-size'],
    fontWeight: fontWeightVars['--font-weight-medium'],
    lineHeight: typeScaleVars['--text-supporting-leading'],
    userSelect: 'none',
  },
});

/**
 * Map of modifier key names to display symbols.
 * Note: `mod` is not in this map — it resolves dynamically via platform
 * detection inside the component.
 */
const KEY_DISPLAY: Record<string, string> = {
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
   * StyleX styles created via `stylex.create()`. Merged with the component's
   * base styles inside a single `stylex.props()` call for optimal deduplication.
   *
   * @example
   * ```
   * const overrides = stylex.create({ root: { marginBottom: 8 } });
   * <Component xstyle={overrides.root} />
   * ```
   */
  xstyle?: StyleXStyles;
  /**
   * CSS class name(s) appended to the root element.
   * If you're using StyleX, prefer `xstyle` for optimal style deduplication.
   */
  className?: string;
  /**
   * Inline styles to apply to the root element. Spread after StyleX
   * inline styles, so these values take priority.
   */
  style?: React.CSSProperties;
}

/**
 * Displays a keyboard shortcut as styled <kbd> elements.
 *
 * A general-purpose component for rendering keyboard shortcuts
 * anywhere in the system — tooltips, menus, documentation, etc.
 *
 * Platform-aware: `mod` renders as ⌘ on macOS and Ctrl elsewhere.
 * SSR-safe — defers platform detection to a layout effect to avoid
 * hydration mismatches. Uses useLayoutEffect so the platform-correct
 * symbol is set before the browser paints (no visible flicker).
 *
 * @example
 * ```
 * <XDSKbd keys="mod+k" />
 * ```
 */
export function XDSKbd({keys, xstyle, className, style}: XDSKbdProps) {
  const [isMac, setIsMac] = useState(false);

  useLayoutEffect(() => {
    setIsMac(
      /Mac|iPhone|iPad|iPod/.test(
        navigator.platform ?? navigator.userAgent ?? '',
      ),
    );
  }, []);

  const parts = keys.split('+').map(key => key.trim().toLowerCase());

  function getKeyDisplay(key: string): string {
    if (key === 'mod') {
      return isMac ? '\u2318' : 'Ctrl';
    }
    return KEY_DISPLAY[key] ?? key.toUpperCase();
  }

  return (
    <span
      {...mergeProps(
        xdsClassName('kbd'),
        stylex.props(styles.wrapper, xstyle),
        className,
        style,
      )}
      aria-hidden="true">
      {parts.map((key, i) => (
        <kbd key={i} {...stylex.props(styles.kbd)}>
          {getKeyDisplay(key)}
        </kbd>
      ))}
    </span>
  );
}

XDSKbd.displayName = 'XDSKbd';
