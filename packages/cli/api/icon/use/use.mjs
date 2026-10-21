// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `icon.use` leaf (AST-084 FR8): choose the project's icon set by
 * writing `experimental.iconSet` in astryx.config.
 *
 * @output the `icon.use` envelope
 * @position api/icon/use — dispatched by the `experimental icon use` command
 */

import * as path from 'node:path';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {
  iconSetKey,
  loadIconProject,
  refuseOutsideProject,
  setConfigString,
} from '../_adapter.mjs';
import {closest, setsNamed} from '../_records.mjs';

/**
 * Make an installed set the project's icon set.
 * Experimental (spec:AST-017 FR27): may change or be removed in a patch
 * release.
 * @experimental
 * @param {string} selector a set name, or `<package>/<set>`
 * @param {{cwd?: string}} [options]
 * @returns {Promise<import('../icon.type.mjs').IconUseResponse>}
 */
export async function iconUse(selector, {cwd = process.cwd()} = {}) {
  if (typeof selector !== 'string' || selector.trim() === '') {
    throw new AstryxError(
      'Name the icon set to use',
      [
        {
          name: 'astryx experimental icon --list',
          reason: 'list the installed sets',
        },
      ],
      ERROR_CODES.ERR_MISSING_ARGUMENT,
    );
  }
  refuseOutsideProject(cwd, 'experimental icon use', 'the app project');
  const {projectDir, sets} = await loadIconProject(cwd);
  const named = setsNamed(sets, selector);
  if (named.length === 0) {
    throw new AstryxError(
      `No installed icon set is named "${selector}".`,
      closest(
        selector,
        sets.flatMap(set => [set.name, iconSetKey(set)]),
        'an installed icon set',
      ),
      ERROR_CODES.ERR_NOT_FOUND,
    );
  }
  if (named.length > 1) {
    throw new AstryxError(
      `Two installed packages ship an icon set named "${selector}"; name it with its package.`,
      named.map(set => ({
        name: iconSetKey(set),
        reason: `the set in ${set.package}`,
      })),
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  let written;
  try {
    written = setConfigString(projectDir, 'experimental.iconSet', selector);
  } catch (error) {
    throw new AstryxError(
      error instanceof Error ? error.message : String(error),
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }
  return {
    type: 'icon.use',
    data: {
      iconSet: selector,
      set: iconSetKey(named[0]),
      config: path.relative(projectDir, written.file).split(path.sep).join('/'),
      created: written.created,
      previous: written.previous,
      changed: written.changed,
    },
  };
}
