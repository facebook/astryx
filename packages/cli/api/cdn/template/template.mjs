// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx cdn template` leaf — writes the annotated no-build-step starter
 * page into the consumer's project.
 *
 * Sibling of `theme template`: both write an annotated file that is a doc which
 * happens to run. This one is the CDN entry point — an HTML page that loads
 * Astryx from jsDelivr + esm.sh with no bundler, no install, and no build.
 *
 * Every CDN URL in the asset carries the `__ASTRYX_VERSION__` placeholder, which
 * is substituted here. An unpinned CDN URL resolves to whatever is latest and is
 * cached hard, so a page written today can break tomorrow without being edited.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT, findCoreDir} from '../../../foundation/fs/paths.mjs';
import {assertWithin, PathSafetyError} from '../../../foundation/fs/path-safety.mjs';
import {stripCopyrightHeader} from '../../../foundation/text/copyright-header.mjs';
import {getXdsVersion} from '../../../foundation/agent-docs/agent-docs.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';

/** The annotated CDN starter that ships with the CLI. */
export const CDN_TEMPLATE_SRC = path.join(CLI_ROOT, 'assets', 'cdn.template.html');

/** Where it lands when the caller does not say. */
export const CDN_TEMPLATE_DEFAULT_PATH = 'cdn.template.html';

/** The token every CDN URL in the asset carries in place of a version. */
export const CDN_VERSION_PLACEHOLDER = '__ASTRYX_VERSION__';

/**
 * Write the annotated CDN starter page into a project.
 *
 * Refuses to overwrite without `overwrite`: an edited copy is the consumer's
 * work, and this command is safe to re-run.
 *
 * @param {{targetPath?: string, overwrite?: boolean, cwd?: string}} [options]
 * @returns {import('../cdn.type.mjs').CdnTemplateResponse}
 */
export function cdnTemplate(options = {}) {
  const {
    targetPath = CDN_TEMPLATE_DEFAULT_PATH,
    overwrite = false,
    cwd = process.cwd(),
  } = options;

  let resolved;
  try {
    resolved = assertWithin(targetPath, cwd, {label: 'cdn template path'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, undefined, ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }

  const relative = path.relative(cwd, resolved) || targetPath;
  // The installed @astryxdesign/core when there is one, else this CLI's own
  // version. core, the themes and the CLI are released as one fixed group, so
  // either answer pins a set of packages that exist together.
  const version = getXdsVersion(findCoreDir(cwd));

  if (fs.existsSync(resolved) && !overwrite) {
    return {
      type: 'cdn.template',
      data: {path: relative, version, written: false, reason: 'exists'},
    };
  }

  const source = stripCopyrightHeader(fs.readFileSync(CDN_TEMPLATE_SRC, 'utf-8'));
  const contents = source.replaceAll(CDN_VERSION_PLACEHOLDER, version);
  fs.mkdirSync(path.dirname(resolved), {recursive: true});
  fs.writeFileSync(resolved, contents);

  return {
    type: 'cdn.template',
    data: {path: relative, version, written: true, reason: null},
  };
}
