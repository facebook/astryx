// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme add` — add built theme output to the app.
 *
 * Plain `theme add` and the compatibility `--import` spelling both record the
 * built theme in the generated app module. Source copying belongs only to
 * `theme eject`.
 */

import {addThemeToApp} from '../_adapter.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

/**
 * Add one available built theme to the generated app module. `import` remains
 * accepted as a no-op so callers that opted in before the cleanup keep working.
 *
 * Removed source-copy options are rejected before discovery or any write, and
 * name the command that now owns them.
 *
 * @param {string} slug
 * @param {{import?: boolean, cwd?: string, package?: string}} [options]
 * @returns {Promise<import('../theme.type.mjs').ThemeAppResponse>}
 */
export async function themeAdd(slug, options = {}) {
  const legacy = /** @type {{targetPath?: unknown, overwrite?: unknown}} */ (
    options
  );
  if (legacy.targetPath != null || legacy.overwrite != null) {
    throw new AstryxError(
      '`theme add` no longer copies source or accepts a target path or --overwrite. ' +
        `Run \`theme eject ${slug} [path] [--overwrite] [--package <package>]\` to fork source.`,
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }
  return addThemeToApp(slug, options);
}
