// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file Kbd.tsx
 * @input Uses React, StyleX, theme tokens
 * @output Exports Kbd component and KbdProps
 * @position Core implementation; renders styled keyboard shortcut indicators
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Kbd/index.ts
 * - /packages/cli/templates/blocks/components/Kbd/ (showcase blocks)
 */

import React, {useSyncExternalStore} from 'react';
import * as stylex from '@stylexjs/stylex';
import {mergeProps} from '../utils';
import type {BaseProps} from '../BaseProps';
import {themeProps} from '../utils/themeProps';
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
    minWidth: spacingVars['--spacing-5'],
    height: spacingVars['--spacing-5'],
    paddingInline: spacingVars['--spacing-1'],
    borderRadius: radiusVars['--radius-inner'],
    backgroundColor: colorVars['--color-neutral'],
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: colorVars['--color-border-emphasized'],
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
  plus: '+',
};

/**
 * Resolves a key name to its display string. Handles the platform-aware
 * `mod` key (⌘ on macOS, Ctrl on other platforms) and falls back to
 * KEY_DISPLAY or uppercased key name.
 */
function getKeyDisplay(key: string, isMac: boolean): string {
  if (key === 'mod') {
    return isMac ? '\u2318' : 'Ctrl';
  }
  return KEY_DISPLAY[key] ?? key.toUpperCase();
}

/**
 * Spoken-word labels for screen readers. The visual `KEY_DISPLAY` uses glyphs
 * (⌘, ⇧, ↵, …) that assistive tech cannot announce meaningfully, so the
 * accessible name for the shortcut is built from these words instead.
 */
const KEY_LABEL: Record<string, string> = {
  ctrl: 'Control',
  alt: 'Alt',
  shift: 'Shift',
  enter: 'Enter',
  backspace: 'Backspace',
  escape: 'Escape',
  tab: 'Tab',
  up: 'Up arrow',
  down: 'Down arrow',
  left: 'Left arrow',
  right: 'Right arrow',
  plus: 'Plus',
};

function getKeyLabel(key: string, isMac: boolean): string {
  if (key === 'mod') {
    return isMac ? 'Command' : 'Control';
  }
  return KEY_LABEL[key] ?? key.toUpperCase();
}

function subscribeToPlatformChanges(): () => void {
  return () => {};
}

function getServerPlatformSnapshot(): boolean {
  return false;
}

/**
 * Detects whether the current platform is macOS/iOS.
 * Prefers the User-Agent Client Hints API when available (modern Chrome/Edge),
 * falls back to navigator.platform (deprecated but universally supported).
 */
function detectMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  // Prefer User-Agent Client Hints API (not deprecated)
  const uaData = 'userAgentData' in navigator ? navigator.userAgentData : null;
  if (uaData && typeof uaData === 'object' && 'platform' in uaData) {
    return /mac/i.test((uaData as {platform: string}).platform ?? '');
  }
  // Fallback: navigator.platform (deprecated but still shipped everywhere)
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform ?? '');
}

export interface KbdProps extends BaseProps<HTMLSpanElement> {
  ref?: React.Ref<HTMLSpanElement>;
  /**
   * Keyboard shortcut string. Use "+" to separate keys.
   * Special keys: mod (Cmd on Mac), ctrl, alt, shift, enter, backspace, escape.
   * Use "plus" to render a literal "+" key (e.g. "shift+plus").
   *
   * @example
   * ```
   * "mod+k"
   * "mod+shift+p"
   * "shift+plus"
   * "enter"
   * ```
   */
  keys: string;
}

/**
 * Displays a keyboard shortcut as styled <kbd> elements.
 *
 * A general-purpose component for rendering keyboard shortcuts
 * anywhere in the system — tooltips, menus, documentation, etc.
 *
 * Platform-aware: `mod` renders as ⌘ on macOS and Ctrl elsewhere.
 * SSR-safe — defers platform detection through useSyncExternalStore to avoid
 * hydration mismatches.
 *
 * @example
 * ```
 * <Kbd keys="mod+k" />
 * ```
 */
export function Kbd({keys, ref, xstyle, className, style, ...rest}: KbdProps) {
  const isMac = useSyncExternalStore(
    subscribeToPlatformChanges,
    detectMac,
    getServerPlatformSnapshot,
  );

  const parts = keys.split('+').map(key => key.trim().toLowerCase());

  // Screen-reader name: the joined spoken labels (e.g. "Command + K"), since
  // the visual glyphs below are announced meaninglessly by assistive tech.
  const accessibleName = parts.map(key => getKeyLabel(key, isMac)).join(' + ');

  return (
    <span
      ref={ref}
      role="img"
      aria-label={accessibleName}
      {...rest}
      {...mergeProps(
        themeProps('kbd'),
        stylex.props(styles.wrapper, xstyle),
        className,
        style,
      )}>
      {parts.map(key => (
        <kbd key={key} aria-hidden="true" {...stylex.props(styles.kbd)}>
          {getKeyDisplay(key, isMac)}
        </kbd>
      ))}
    </span>
  );
}

Kbd.displayName = 'Kbd';
