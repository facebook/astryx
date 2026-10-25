// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file PlatformKbd.tsx
 * @input Uses useSyncExternalStore, isApplePlatform, KbdView
 * @output Exports PlatformKbd: a shortcut whose `mod` key reads ⌘ on Apple
 *   platforms and Ctrl elsewhere
 * @position Client island rendered by Kbd.tsx only for shortcuts that contain
 *   `mod`. On the server, and until hydration, it renders the non-Apple form,
 *   the same markup Kbd renders statically.
 *
 * SYNC: When modified, update:
 * - /packages/core/src/Kbd/Kbd.tsx
 * - /packages/core/src/serverSafeComponents.test.ts (CLIENT_ISLANDS)
 */

import {useSyncExternalStore} from 'react';
import {isApplePlatform} from '../utils/isApplePlatform';
import {KbdView, type KbdProps} from './KbdView';

function subscribeToPlatformChanges(): () => void {
  return () => {};
}

function getServerPlatformSnapshot(): boolean {
  return false;
}

export function PlatformKbd(props: KbdProps) {
  // Deferred through useSyncExternalStore so the server and the hydration
  // render agree (non-Apple), and the Apple glyph follows right after.
  const isMac = useSyncExternalStore(
    subscribeToPlatformChanges,
    isApplePlatform,
    getServerPlatformSnapshot,
  );
  return <KbdView {...props} isMac={isMac} />;
}

PlatformKbd.displayName = 'PlatformKbd';
