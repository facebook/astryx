// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Filesystem adapter for vanilla HTML templates.
 *
 * Environment access stays here so the template HTML leaf remains a pure
 * projection over one adapter result. Checkout assets are preferred; installed
 * packages fall back to the generated copy bundled under assets/vanilla.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {AstryxError} from '../error.mjs';
import {requireVanillaAssetsDir} from '../_vanilla-assets.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';

/** @param {string} cwd @returns {{id: string, file: string}[]} */
export function listVanillaTemplateHtml(cwd) {
  const templatesDir = path.join(requireVanillaAssetsDir(cwd), 'templates');
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
  const filePath = path.join(
    requireVanillaAssetsDir(cwd),
    'templates',
    match.file,
  );
  return {
    template: id,
    file: match.file,
    source: fs.readFileSync(filePath, 'utf8'),
  };
}
