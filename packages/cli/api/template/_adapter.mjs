// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Filesystem adapter for vanilla HTML templates.
 *
 * Environment access stays here so the template HTML leaf remains a pure
 * projection over one adapter result.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/** @param {string} cwd @returns {string} */
function requireVanillaDir(cwd) {
  let cursor = path.resolve(cwd);
  while (true) {
    const direct =
      path.basename(cursor) === 'vanilla' &&
      path.basename(path.dirname(cursor)) === 'packages'
        ? cursor
        : path.join(cursor, 'packages', 'vanilla');
    if (fs.existsSync(direct) && fs.statSync(direct).isDirectory())
      return direct;
    const parent = path.dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  throw new AstryxError(
    `Could not find packages/vanilla from "${cwd}"`,
    undefined,
    ERROR_CODES.ERR_FILE_NOT_FOUND,
  );
}

/** @param {string} cwd @returns {{id: string, file: string}[]} */
export function listVanillaTemplateHtml(cwd) {
  const templatesDir = path.join(requireVanillaDir(cwd), 'templates');
  if (!fs.existsSync(templatesDir)) return [];
  return fs
    .readdirSync(templatesDir, {withFileTypes: true})
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => ({
      id: entry.name.slice(0, -'.html'.length),
      file: entry.name,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * @param {string} id
 * @param {string} cwd
 * @returns {{template: string, file: string, source: string}}
 */
export function readVanillaTemplateHtml(id, cwd) {
  const entries = listVanillaTemplateHtml(cwd);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new AstryxError(
      `Invalid vanilla template id "${id}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  const match = entries.find(entry => entry.id === id);
  if (!match) {
    throw new AstryxError(
      `Unknown vanilla HTML template "${id}"`,
      entries.map(entry => ({name: entry.id, reason: 'vanilla HTML template'})),
      ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
    );
  }
  const filePath = path.join(requireVanillaDir(cwd), 'templates', match.file);
  return {
    template: id,
    file: match.file,
    source: fs.readFileSync(filePath, 'utf8'),
  };
}
