// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme add` leaf — copies a bundled theme's source
 * (`templates/themes/<slug>/`) into the consumer's project so they own it,
 * without needing the theme package. Which theme is resolved by ../_adapter.mjs;
 * this leaf owns the copy I/O + path-safety and returns a `theme.add` receipt.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {assertWithin, PathSafetyError} from '../../../foundation/fs/path-safety.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {THEMES_DIR, listThemes, findTheme} from '../_adapter.mjs';
// Scaffolded files must not carry our repo boilerplate into a consumer's tree.
import {stripCopyrightHeader} from '../../../foundation/text/copyright-header.mjs';

/**
 * @param {string} slug
 * @returns {string}
 */
function defaultTargetDir(slug) {
  return path.join('src', 'themes', slug);
}

/**
 * Copy a bundled theme's files into the consumer's project (defaults to
 * `src/themes/<slug>/`). Writes are staged to temp files then renamed, rolling
 * back partials on failure so a failed write never leaves a half-written theme.
 * Throws AstryxError for an unknown slug, a target that escapes cwd, an existing
 * file (without `overwrite`), a missing bundled file, or a write failure.
 *
 * @param {string} slug
 * @param {{targetPath?: string, overwrite?: boolean, cwd?: string}} [options]
 * @returns {Promise<import('../theme.type.mjs').ThemeAddResponse>}
 */
export async function themeAdd(slug, options = {}) {
  const {targetPath, overwrite = false, cwd = process.cwd()} = options;

  const match = findTheme(slug);
  if (!match) {
    throw new AstryxError(
      `Unknown theme "${slug}"`,
      listThemes().map(t => ({
        name: t.slug,
        reason: t.maintained ? 'maintained theme' : 'example theme',
      })),
      ERROR_CODES.ERR_UNKNOWN_THEME,
    );
  }

  const themeSrcDir = path.join(THEMES_DIR, match.slug);

  // Path-safe destination; reject traversal outside cwd.
  const rawTarget = targetPath || defaultTargetDir(match.slug);
  let resolvedDir;
  try {
    resolvedDir = assertWithin(rawTarget, cwd, {label: 'theme target path'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(
        err.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw err;
  }

  const writes = match.files.map(name => ({
    name,
    src: path.join(themeSrcDir, name),
    dest: path.join(resolvedDir, name),
  }));
  for (const w of writes) {
    if (!fs.existsSync(w.src)) {
      throw new AstryxError(
        `Theme "${match.slug}" is missing bundled file "${w.name}". ` +
          `Re-run \`node scripts/generate-cli-themes.mjs\` to rebuild the bundle.`,
        undefined,
        ERROR_CODES.ERR_NO_SOURCE,
      );
    }
  }

  // Refuse to clobber unless --overwrite.
  if (!overwrite) {
    const existing = writes.find(w => fs.existsSync(w.dest));
    if (existing) {
      const rel = path.relative(cwd, existing.dest) || existing.dest;
      throw new AstryxError(
        `Refusing to overwrite existing file ${rel}. ` +
          `Re-run with --overwrite (or -f) to replace it.`,
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  }

  // Stage to temp files then rename, rolling back partials on failure so a
  // failed write never leaves a half-written theme. mkdir is inside the try so
  // a failure (e.g. an ancestor is a file → EEXIST/ENOTDIR) surfaces as a
  // stable ERR_WRITE_FAILED rather than leaking a raw fs errno + absolute path.
  const staged = [];
  try {
    fs.mkdirSync(resolvedDir, {recursive: true});
    for (const w of writes) {
      const tmp = `${w.dest}.${process.pid}.tmp`;
      const contents = stripCopyrightHeader(fs.readFileSync(w.src, 'utf-8'));
      fs.writeFileSync(tmp, contents);
      staged.push({tmp, dest: w.dest});
    }
    for (const s of staged) {
      fs.renameSync(s.tmp, s.dest);
    }
  } catch (err) {
    for (const s of staged) {
      try {
        fs.rmSync(s.tmp, {force: true});
      } catch {
        /* best-effort */
      }
    }
    throw new AstryxError(
      `Failed to write theme files: ${/** @type {any} */ (err).message}`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }

  const relDir = path.relative(cwd, resolvedDir) || '.';
  return {
    type: 'theme.add',
    data: {
      slug: match.slug,
      displayName: match.displayName,
      maintained: match.maintained,
      outputDir: relDir,
      entry: match.entry,
      exportName: match.exportName,
      files: match.files,
    },
  };
}
