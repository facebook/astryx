// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Kbd.tsx
 * @input Uses KbdView (markup) and PlatformKbd (the `mod` client part)
 * @output Exports Kbd component and KbdProps with canonical shortcut labels
 * @position Core implementation; renders styled keyboard shortcut indicators
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Kbd/index.ts
 * - /packages/cli/assets/templates/blocks/components/Kbd/ (showcase blocks)
 */

import {KbdView, type KbdProps} from './KbdView';
import {PlatformKbd} from './PlatformKbd';

export type {KbdProps};

/**
 * Displays a keyboard shortcut as styled <kbd> elements.
 *
 * A general-purpose component for rendering keyboard shortcuts
 * anywhere in the system — tooltips, menus, documentation, etc.
 *
 * Platform-aware: `mod` renders as ⌘ on macOS and Ctrl elsewhere.
 * Server-safe: a shortcut without `mod` renders on the server with no client
 * JS. One with `mod` renders the PlatformKbd client part, which defers
 * platform detection through useSyncExternalStore to avoid hydration
 * mismatches.
 *
 * @example
 * ```
 * <Kbd keys="mod+k" />
 * ```
 */
export function Kbd(props: KbdProps) {
  // Only `mod` differs by platform, so only a shortcut with `mod` needs the
  // client part.
  const hasMod = props.keys
    .split('+')
    .some(key => key.trim().toLowerCase() === 'mod');
  return hasMod ? (
    <PlatformKbd {...props} />
  ) : (
    <KbdView {...props} isMac={false} />
  );
}

Kbd.displayName = 'Kbd';
