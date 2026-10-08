// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx theme add` — copy by default; import built output by opt-in.
 *
 * The released command copies source and returns `theme.add`. `--import` adds
 * the built theme to the generated app module and returns `theme.app`.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {addThemeToApp, findTheme, listAvailableThemes} from '../_adapter.mjs';
import {
  assertWithin,
  PathSafetyError,
} from '../../../foundation/fs/path-safety.mjs';
import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {applyWrites} from '../../integration/add-helpers.mjs';
import {stripCopyrightHeader} from '../../../foundation/text/copyright-header.mjs';

const COPY_DEPRECATION = Object.freeze({
  id: 'DEP-0005',
  replacements: ['theme eject', 'theme add --import'],
});

/** @param {string} slug */
function defaultTargetDir(slug) {
  return path.join('src', 'themes', slug);
}

/**
 * Strip repository boilerplate from UTF-8 text while preserving binary bytes.
 * @param {Buffer} bytes
 * @returns {Buffer|string}
 */
function scaffoldContents(bytes) {
  const text = bytes.toString('utf-8');
  return Buffer.from(text, 'utf-8').equals(bytes)
    ? stripCopyrightHeader(text)
    : bytes;
}

/**
 * Bundled and package themes preserve their released copy inventories. Bundled
 * themes keep their authoring descriptor behind; integration themes copy the
 * complete directory, including the descriptor. Local themes are deliberately
 * excluded: copying `theme add` resolves only bundled and package themes, while
 * `--import` can select a built local theme.
 *
 * @param {string} slug
 * @param {{targetPath?: string, overwrite?: boolean, cwd?: string, package?: string}} options
 * @returns {Promise<import('../theme.type.mjs').ThemeAddResponse>}
 */
async function copyThemeSource(slug, options) {
  const {
    targetPath,
    overwrite = false,
    cwd = process.cwd(),
    package: packageName,
  } = options;

  const match = await findTheme(slug, {
    cwd,
    package: packageName,
    includeLocal: false,
  });
  if (!match) {
    const available = await listAvailableThemes(cwd, {includeLocal: false});
    throw new AstryxError(
      `Unknown theme "${slug}"${packageName ? ` in package "${packageName}"` : ''}`,
      available.map(theme => ({
        name: `${theme.slug} --package ${theme.package}`,
        reason:
          theme.source === 'bundled'
            ? 'bundled theme'
            : `provided by ${theme.package}`,
      })),
      ERROR_CODES.ERR_UNKNOWN_THEME,
    );
  }

  const rawTarget = targetPath || defaultTargetDir(match.slug);
  let resolvedDir;
  try {
    resolvedDir = assertWithin(rawTarget, cwd, {label: 'theme target path'});
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  const descriptor = path
    .relative(match.sourceDir, match.docPath)
    .split(path.sep)
    .join('/');
  const copyFiles = match.bundled
    ? match.files.filter(name => name !== descriptor)
    : [match.entry, ...match.files.filter(name => name !== match.entry).sort()];
  let writes;
  try {
    writes = copyFiles.map(name => ({
      name,
      src: path.join(match.sourceDir, name),
      dest: assertWithin(name, resolvedDir, {
        label: `theme destination for ${name}`,
      }),
    }));
  } catch (error) {
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw error;
  }

  for (const write of writes) {
    if (!fs.existsSync(write.src)) {
      throw new AstryxError(
        `Theme "${match.slug}" is missing bundled file "${write.name}". ` +
          'Re-run `node scripts/generate-cli-themes.mjs` to rebuild the bundle.',
        undefined,
        ERROR_CODES.ERR_NO_SOURCE,
      );
    }
  }

  if (!overwrite) {
    const existing = writes.find(write => fs.existsSync(write.dest));
    if (existing) {
      const rel = path.relative(cwd, existing.dest) || existing.dest;
      throw new AstryxError(
        `Refusing to overwrite existing file ${rel}. ` +
          'Re-run with --overwrite (or -f) to replace it.',
        undefined,
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  }

  try {
    fs.mkdirSync(resolvedDir, {recursive: true});
    const plans = writes.map(write => {
      fs.mkdirSync(path.dirname(write.dest), {recursive: true});
      const dest = assertWithin(write.name, resolvedDir, {
        label: `theme destination for ${write.name}`,
      });
      return {
        path: dest,
        contents: scaffoldContents(fs.readFileSync(write.src)),
        createOnly: !overwrite,
      };
    });
    applyWrites(plans);
  } catch (error) {
    if (error instanceof AstryxError) throw error;
    if (error instanceof PathSafetyError) {
      throw new AstryxError(
        error.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new AstryxError(
      `Failed to write theme files: ${message}`,
      undefined,
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }

  return {
    type: 'theme.add',
    data: {
      slug: match.slug,
      displayName: match.displayName,
      maintained: match.maintained,
      package: match.package,
      outputDir: path.relative(cwd, resolvedDir) || '.',
      entry: match.entry,
      exportName: match.exportName,
      files: copyFiles,
    },
    meta: {deprecations: [COPY_DEPRECATION]},
  };
}

/**
 * Copy one available source theme, or import its built output with `import`.
 * @param {string} slug
 * @param {{targetPath?: string, overwrite?: boolean, cwd?: string, package?: string, import?: boolean}} [options]
 * @returns {Promise<import('../theme.type.mjs').ThemeAddResponse | import('../theme.type.mjs').ThemeAppResponse>}
 */
export async function themeAdd(slug, options = {}) {
  if (!options.import) return copyThemeSource(slug, options);

  if (options.targetPath != null || options.overwrite === true) {
    throw new AstryxError(
      '`theme add --import` cannot be combined with a target path or --overwrite.',
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }
  return addThemeToApp(slug, options);
}
