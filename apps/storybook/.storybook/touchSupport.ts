// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touchSupport.ts
 * @input TouchSupport (`@astryxdesign/core/touch-support`) and the preview's
 *   URL
 * @output installTouchSupportForStories: installs TouchSupport once, when the
 *   preview loads and before any story renders, as an app's client entry
 *   does; and isTouchSupportOff, which reads the URL global that turns it off
 * @position Storybook preview setup: preview.tsx calls it first, so every
 *   story, and every interaction proof that opens one, renders with the touch
 *   module installed. A story opened with `globals=touchSupport:off` (the
 *   interaction harness's `openStory(..., {touchSupport: false})`) renders
 *   without it, to check a component's plain behavior. TouchSupport has no
 *   uninstall, so the setting holds for the page: it is read once, at load.
 *   As in an app, the module registers only where some input is a coarse
 *   pointer (architecture:react-component-runtime INV13): a story opened with
 *   a mouse keeps its plain behavior, and one in a touch-emulating browser gets
 *   the touch behavior.
 */

import TouchSupport from '@astryxdesign/core/touch-support';

/** Whether the preview URL's globals turn touch support off. */
export function isTouchSupportOff(search: string): boolean {
  const globals = new URLSearchParams(search).get('globals') ?? '';
  return globals.split(';').some(pair => pair.trim() === 'touchSupport:off');
}

/**
 * Installs TouchSupport for the stories unless the preview URL turns it off.
 * Returns whether it installed.
 */
export function installTouchSupportForStories(
  search: string = typeof window === 'undefined' ? '' : window.location.search,
): boolean {
  if (isTouchSupportOff(search)) {
    return false;
  }
  TouchSupport.install();
  return true;
}
