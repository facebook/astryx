// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Resolves vanilla HTML assets from the source checkout or the CLI bundle.
 *
 * @input A caller working directory.
 * @output The checkout's packages/vanilla directory when present, otherwise the
 *         generated assets/vanilla copy shipped with @astryxdesign/cli.
 * @position Shared environment adapter used only by the component and template
 *           HTML adapters so installed and source-checkout behavior agree.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {ERROR_CODES} from '../foundation/response/error-codes.mjs';
import {AstryxError} from './error.mjs';

const BUNDLED_VANILLA_DIR = path.resolve(
  import.meta.dirname,
  '../assets/vanilla',
);

/** @param {string} candidate @returns {boolean} */
function isDirectory(candidate) {
  return fs.existsSync(candidate) && fs.statSync(candidate).isDirectory();
}

/** @param {string} cwd @returns {string | null} */
function findCheckoutVanillaDir(cwd) {
  let cursor = path.resolve(cwd);
  while (true) {
    const direct =
      path.basename(cursor) === 'vanilla' &&
      path.basename(path.dirname(cursor)) === 'packages'
        ? cursor
        : path.join(cursor, 'packages', 'vanilla');
    if (isDirectory(direct)) return direct;
    const parent = path.dirname(cursor);
    if (parent === cursor) return null;
    cursor = parent;
  }
}

/**
 * Prefer live checkout assets while developing, then fall back to the generated
 * copy included in the published CLI package.
 * @param {string} cwd
 * @returns {string}
 */
export function requireVanillaAssetsDir(cwd) {
  const checkoutDir = findCheckoutVanillaDir(cwd);
  if (checkoutDir) return checkoutDir;
  if (isDirectory(BUNDLED_VANILLA_DIR)) return BUNDLED_VANILLA_DIR;
  throw new AstryxError(
    `Could not find vanilla HTML assets from "${cwd}" or in the installed CLI`,
    undefined,
    ERROR_CODES.ERR_FILE_NOT_FOUND,
  );
}
