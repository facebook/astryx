// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme add` — add an installed built theme to the app.
 *
 * Records the theme in the generated app module and regenerates that complete
 * module. Theme source is never copied; authors use `theme eject` to fork it.
 */

import {addThemeToApp} from '../_adapter.mjs';

/**
 * Add one available theme to the app.
 * @param {string} slug
 * @param {{cwd?: string, package?: string}} [options]
 * @returns {Promise<import('../theme.type.mjs').ThemeAppResponse>}
 */
export function themeAdd(slug, options = {}) {
  return addThemeToApp(slug, options);
}
