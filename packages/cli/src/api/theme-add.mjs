// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for `astryx theme add` — copies a bundled theme's
 * source (`templates/themes/`, see scripts/generate-cli-themes.mjs) into the
 * consumer's project so they own it, without needing the theme package.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';
import {assertWithin, PathSafetyError} from '../utils/path-safety.mjs';
import {AstryxError} from './error.mjs';
import {ERROR_CODES} from '../lib/error-codes.mjs';

const THEMES_DIR = path.join(CLI_ROOT, 'templates', 'themes');
const MANIFEST_PATH = path.join(THEMES_DIR, 'manifest.json');

// Stripped from scaffolded files so the consumer's copy doesn't carry our
// repo boilerplate (mirrors the docsite). Preserves a leading BOM/shebang.
const META_COPYRIGHT_HEADER_RE =
  /^(\uFEFF?(?:#![^\r\n]*(?:\r?\n))?)\/\/ Copyright \(c\) Meta Platforms, Inc\. and affiliates\.\r?\n(?:\r?\n)*/;

function stripCopyrightHeader(source) {
  return source.replace(META_COPYRIGHT_HEADER_RE, '$1');
}

/** Parsed `themes` array from the bundle manifest (empty if not generated). */
export function listThemes() {
  if (!fs.existsSync(MANIFEST_PATH)) return [];
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  } catch (err) {
    throw new AstryxError(
      `Theme bundle manifest is unreadable (${MANIFEST_PATH}): ${err.message}`,
      undefined,
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }
  return Array.isArray(manifest.themes) ? manifest.themes : [];
}

function findTheme(slug) {
  if (!slug) return undefined;
  const lc = String(slug).toLowerCase();
  return listThemes().find(t => t.slug.toLowerCase() === lc);
}

function defaultTargetDir(slug) {
  return path.join('src', 'themes', slug);
}

/**
 * Resolve the scaffold plan for `theme add`. Returns the theme list when no
 * slug (or `list`); otherwise copies the theme's files into the destination
 * (defaults to `src/themes/<slug>/`).
 *
 * @param {string} [slug]
 * @param {{list?: boolean, targetPath?: string, overwrite?: boolean, cwd?: string}} [options]
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function themeAdd(slug, options = {}) {
  const {list = false, targetPath, overwrite = false, cwd = process.cwd()} =
    options;
  const themes = listThemes();

  if (list || !slug) {
    return {
      type: 'theme.list',
      data: themes.map(t => ({
        slug: t.slug,
        displayName: t.displayName,
        description: t.description,
        maintained: t.maintained,
      })),
    };
  }

  const match = findTheme(slug);
  if (!match) {
    throw new AstryxError(
      `Unknown theme "${slug}"`,
      themes.map(t => ({
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
  // failed write never leaves a half-written theme.
  fs.mkdirSync(resolvedDir, {recursive: true});
  const staged = [];
  try {
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
      `Failed to write theme files: ${err.message}`,
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
